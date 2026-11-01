from django.db.models import Q
from rest_framework import viewsets, permissions, status, filters as drf_filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from projectapp.models import ProjectMember
from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter


@extend_schema_view(
    list=extend_schema(
        summary="List all accessible tasks",
        description="Retrieve a paginated list of tasks across projects accessible to the authenticated user."
    ),
    create=extend_schema(
        summary="Create a new task",
        description="Create a new task within a project. The creator must have edit access to the project."
    ),
    retrieve=extend_schema(
        summary="Retrieve a task",
        description="Get detailed information about a specific task by its ID."
    ),
    update=extend_schema(
        summary="Update a task (full)",
        description="Replace all editable fields of a task. Requires edit permission on the task's project."
    ),
    partial_update=extend_schema(
        summary="Update a task (partial)",
        description="Update specific editable fields of a task (e.g. status, priority, assignee)."
    ),
    destroy=extend_schema(
        summary="Delete a task",
        description="Permanently delete a task by its ID."
    ),
)
class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Tasks in TaskFlow.
    Tasks are strictly scoped to projects and accessible only by project members.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title', 'project']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Task.objects.none()

        base_qs = Task.objects.select_related('project', 'created_by', 'assigned_to')

        if user.is_staff or getattr(user, 'role', None) == 'ADMIN':
            return base_qs.all()

        return base_qs.filter(
            Q(project__owner=user) | Q(project__memberships__user=user)
        ).distinct()

    def check_project_edit_permission(self, project, user):
        """
        Verify that the user is not a read-only VIEWER in the project.
        """
        if user.is_staff or getattr(user, 'role', None) == 'ADMIN':
            return True

        if project.owner_id == user.id:
            return True

        membership = project.memberships.filter(user_id=user.id).first()
        if not membership:
            raise PermissionDenied("You do not have access to this project.")

        if membership.role == ProjectMember.Role.VIEWER:
            raise PermissionDenied("Viewers have read-only access and cannot modify tasks.")

        return True

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        self.check_project_edit_permission(project, self.request.user)
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        project = serializer.validated_data.get('project', serializer.instance.project)
        self.check_project_edit_permission(project, self.request.user)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_project_edit_permission(instance.project, self.request.user)
        instance.delete()
