from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters as drf_filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes

from taskapp.serializers import TaskSerializer
from .models import Project, ProjectMember
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateUpdateSerializer,
    ProjectMemberSerializer,
    ProjectMemberAddSerializer,
    ProjectMemberUpdateSerializer,
)
from .permissions import (
    IsProjectMemberOrOwner,
    IsProjectAdminOrOwner,
    IsProjectOwnerOnly,
)
from .filters import ProjectFilter


@extend_schema_view(
    list=extend_schema(
        summary="List accessible projects",
        description="Retrieve a paginated list of projects owned by or shared with the authenticated user."
    ),
    create=extend_schema(
        summary="Create a new project",
        description="Create a new project. The authenticated user is automatically set as the project owner.",
        responses={201: ProjectDetailSerializer}
    ),
    retrieve=extend_schema(
        summary="Retrieve project details",
        description="Get complete project details including members, owner information, and current user role."
    ),
    update=extend_schema(
        summary="Update project (full)",
        description="Replace editable fields of a project (name, description, status, color, dates). Requires Owner or Project Admin.",
        responses={200: ProjectDetailSerializer}
    ),
    partial_update=extend_schema(
        summary="Update project (partial)",
        description="Update specific fields of a project. Requires Owner or Project Admin.",
        responses={200: ProjectDetailSerializer}
    ),
    destroy=extend_schema(
        summary="Delete project",
        description="Permanently delete a project. Only the project owner or system admin can perform this."
    ),
)
class ProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Project management in TaskFlow.
    Enforces project-scoped access and team membership RBAC.
    """
    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    filterset_class = ProjectFilter
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name', 'status', 'end_date']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Project.objects.none()

        base_qs = Project.objects.select_related('owner').prefetch_related(
            'memberships',
            'memberships__user'
        ).annotate(
            members_count_annotated=Count('members', distinct=True),
            tasks_count_annotated=Count('tasks', distinct=True)
        )

        # System admins and staff have global access
        if user.is_staff or getattr(user, 'role', None) == 'ADMIN':
            return base_qs.all()

        # Normal users see projects they own or belong to
        return base_qs.filter(
            Q(owner=user) | Q(memberships__user=user)
        ).distinct()

    def get_permissions(self):
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsProjectOwnerOnly()]
        elif self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsProjectAdminOrOwner()]
        return [permissions.IsAuthenticated(), IsProjectMemberOrOwner()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'retrieve':
            return ProjectDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectDetailSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return full detail serializer for consistent client state
        detail_serializer = ProjectDetailSerializer(
            serializer.instance,
            context=self.get_serializer_context()
        )
        headers = self.get_success_headers(serializer.data)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Return full detail serializer
        detail_serializer = ProjectDetailSerializer(
            instance,
            context=self.get_serializer_context()
        )
        return Response(detail_serializer.data)

    # -------------------------------------------------------------
    # Team Membership Actions
    # -------------------------------------------------------------

    @extend_schema(
        methods=['GET'],
        summary="List project members",
        description="Retrieve all team members assigned to this project.",
        responses={200: ProjectMemberSerializer(many=True)}
    )
    @extend_schema(
        methods=['POST'],
        summary="Add member to project",
        description="Invite or add a user as a member to this project by user_id or email. Requires Owner or Admin.",
        request=ProjectMemberAddSerializer,
        responses={201: ProjectMemberSerializer}
    )
    @action(detail=True, methods=['get', 'post'], url_path='members')
    def members(self, request, pk=None):
        project = self.get_object()

        if request.method == 'GET':
            memberships = project.memberships.select_related('user').all()
            serializer = ProjectMemberSerializer(memberships, many=True)
            return Response(serializer.data)

        # POST: Add member
        is_owner = project.owner_id == request.user.id
        is_admin = project.memberships.filter(
            user_id=request.user.id,
            role=ProjectMember.Role.ADMIN
        ).exists()
        is_system_admin = request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN'

        if not (is_owner or is_admin or is_system_admin):
            raise PermissionDenied("Only the project owner or project admin can add members.")

        serializer = ProjectMemberAddSerializer(
            data=request.data,
            context={'project': project, 'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['resolved_user']
        role = serializer.validated_data.get('role', ProjectMember.Role.MEMBER)

        membership = ProjectMember.objects.create(
            project=project,
            user=user,
            role=role
        )
        return Response(
            ProjectMemberSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        summary="Update member role",
        description="Change the role of an existing project member. Requires Project Owner.",
        request=ProjectMemberUpdateSerializer,
        responses={200: ProjectMemberSerializer},
        parameters=[
            OpenApiParameter('user_id', OpenApiTypes.INT, OpenApiParameter.PATH, description="ID of the user to update")
        ]
    )
    @action(detail=True, methods=['patch'], url_path=r'members/(?P<user_id>\d+)')
    def update_member_role(self, request, pk=None, user_id=None):
        project = self.get_object()

        # Only the project owner or system staff can change member roles
        is_owner = project.owner_id == request.user.id
        is_system_admin = request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN'
        if not (is_owner or is_system_admin):
            raise PermissionDenied("Only the project owner can change member roles.")

        membership = get_object_or_404(
            ProjectMember.objects.select_related('user'),
            project=project,
            user_id=user_id
        )

        serializer = ProjectMemberUpdateSerializer(
            membership,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(ProjectMemberSerializer(membership).data)

    @extend_schema(
        summary="Remove member from project",
        description="Remove a member from the project or leave the project. Owners can remove anyone, members can remove themselves.",
        responses={204: None},
        parameters=[
            OpenApiParameter('user_id', OpenApiTypes.INT, OpenApiParameter.PATH, description="ID of the user to remove")
        ]
    )
    @update_member_role.mapping.delete
    def remove_member(self, request, pk=None, user_id=None):
        project = self.get_object()
        user_id_int = int(user_id)

        membership = get_object_or_404(
            ProjectMember,
            project=project,
            user_id=user_id_int
        )

        is_self_removal = request.user.id == user_id_int
        is_owner = project.owner_id == request.user.id
        is_admin = project.memberships.filter(
            user_id=request.user.id,
            role=ProjectMember.Role.ADMIN
        ).exists()
        is_system_admin = request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN'

        # Check permission to remove:
        # - Any member can remove themselves (leave)
        # - Owner and System Admin can remove any member
        # - Project Admin can remove normal members and viewers
        if is_self_removal or is_owner or is_system_admin:
            membership.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        if is_admin and membership.role in [ProjectMember.Role.MEMBER, ProjectMember.Role.VIEWER]:
            membership.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        raise PermissionDenied("You do not have permission to remove this member.")

    @extend_schema(
        summary="List project tasks",
        description="Retrieve all tasks belonging to this project.",
        responses={200: TaskSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='tasks')
    def tasks(self, request, pk=None):
        project = self.get_object()
        tasks_qs = project.tasks.select_related('project', 'created_by', 'assigned_to').all()
        serializer = TaskSerializer(tasks_qs, many=True)
        return Response(serializer.data)
