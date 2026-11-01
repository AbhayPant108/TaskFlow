import re
from django.contrib.auth import get_user_model
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from userapp.serializers import UserSummarySerializer
from .models import Project, ProjectMember

User = get_user_model()
HEX_COLOR_REGEX = re.compile(r'^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$')


class ProjectMemberSerializer(serializers.ModelSerializer):
    """
    Serializer to represent a project membership.
    """
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = [
            'id',
            'user',
            'role',
            'joined_at',
        ]
        read_only_fields = ['id', 'user', 'joined_at']


class ProjectMemberAddSerializer(serializers.Serializer):
    """
    Serializer for inviting/adding a user to a project.
    Accepts either user_id or email, plus a role.
    """
    user_id = serializers.IntegerField(required=False)
    email = serializers.EmailField(required=False)
    role = serializers.ChoiceField(
        choices=ProjectMember.Role.choices,
        default=ProjectMember.Role.MEMBER
    )

    def validate(self, attrs):
        user_id = attrs.get('user_id')
        email = attrs.get('email')

        if not user_id and not email:
            raise serializers.ValidationError("Either user_id or email must be provided to add a member.")

        user = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise serializers.ValidationError({"user_id": f"User with ID {user_id} does not exist."})
        elif email:
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"email": f"User with email '{email}' does not exist."})

        if not user.is_active:
            raise serializers.ValidationError("Cannot add an inactive user to a project.")

        project = self.context.get('project')
        if project:
            if project.owner_id == user.id:
                raise serializers.ValidationError("The project owner is already an admin of this project.")
            if ProjectMember.objects.filter(project=project, user=user).exists():
                raise serializers.ValidationError(f"User '{user.email}' is already a member of this project.")

        attrs['resolved_user'] = user
        return attrs


class ProjectMemberUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for changing a member's role within a project.
    """
    class Meta:
        model = ProjectMember
        fields = ['role']


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing projects in overview/dashboard.
    """
    owner = UserSummarySerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    current_user_role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'status',
            'color',
            'owner',
            'members_count',
            'tasks_count',
            'current_user_role',
            'start_date',
            'end_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.IntegerField())
    def get_members_count(self, obj) -> int:
        count = getattr(obj, 'members_count_annotated', None)
        if count is not None:
            return count
        return obj.members.count()

    @extend_schema_field(serializers.IntegerField())
    def get_tasks_count(self, obj) -> int:
        count = getattr(obj, 'tasks_count_annotated', None)
        if count is not None:
            return count
        return obj.tasks.count()

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_current_user_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if obj.owner_id == request.user.id:
            return 'OWNER'
        # Check through prefetched memberships or database query
        membership = obj.memberships.filter(user_id=request.user.id).first()
        if membership:
            return membership.role
        return None


class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for retrieving a single project with its members.
    """
    owner = UserSummarySerializer(read_only=True)
    memberships = ProjectMemberSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    current_user_role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'status',
            'color',
            'owner',
            'memberships',
            'members_count',
            'tasks_count',
            'completed_tasks_count',
            'current_user_role',
            'start_date',
            'end_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.IntegerField())
    def get_members_count(self, obj) -> int:
        count = getattr(obj, 'members_count_annotated', None)
        if count is not None:
            return count
        return obj.members.count()

    @extend_schema_field(serializers.IntegerField())
    def get_tasks_count(self, obj) -> int:
        count = getattr(obj, 'tasks_count_annotated', None)
        if count is not None:
            return count
        return obj.tasks.count()

    @extend_schema_field(serializers.IntegerField())
    def get_completed_tasks_count(self, obj) -> int:
        count = getattr(obj, 'completed_tasks_count_annotated', None)
        if count is not None:
            return count
        return obj.tasks.filter(status='DONE').count()

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_current_user_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if obj.owner_id == request.user.id:
            return 'OWNER'
        membership = obj.memberships.filter(user_id=request.user.id).first()
        if membership:
            return membership.role
        return None


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating project details.
    """
    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'status',
            'color',
            'start_date',
            'end_date',
        ]
        read_only_fields = ['id']

    def validate_name(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Project name cannot be empty or blank.")
        return trimmed

    def validate_color(self, value):
        if value and not HEX_COLOR_REGEX.match(value):
            raise serializers.ValidationError("Color must be a valid hex code (e.g. #3B82F6 or #FFF).")
        return value

    def validate(self, attrs):
        # Handle start_date and end_date consistency
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        # Fallback to existing instance values during partial update
        if self.instance:
            if 'start_date' not in attrs:
                start_date = self.instance.start_date
            if 'end_date' not in attrs:
                end_date = self.instance.end_date

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be earlier than start date."
            })

        return attrs
