from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field

from userapp.serializers import UserSummarySerializer
from projectapp.models import Project
from .models import Task

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Tasks in TaskFlow.
    Enforces project scoping and validates that assignees belong to the project.
    """
    title = serializers.CharField(
        max_length=255,
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        help_text="Short summary of the task"
    )
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        required=True,
        help_text="ID of the project this task belongs to"
    )
    project_name = serializers.CharField(
        source='project.name',
        read_only=True
    )
    project_color = serializers.CharField(
        source='project.color',
        read_only=True
    )
    created_by = UserSummarySerializer(
        read_only=True
    )
    assigned_to = UserSummarySerializer(
        read_only=True
    )
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        required=False,
        allow_null=True,
        write_only=True,
        help_text="ID of the assigned user"
    )

    class Meta:
        model = Task
        fields = [
            'id',
            'project',
            'project_name',
            'project_color',
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'created_by',
            'assigned_to',
            'assigned_to_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'project_name',
            'project_color',
            'created_by',
            'assigned_to',
            'created_at',
            'updated_at',
        ]

    def to_internal_value(self, data):
        # Support both 'assigned_to': <id> and 'assigned_to_id': <id>
        if isinstance(data, dict):
            mutable_data = data.copy()
            if 'assigned_to' in mutable_data and 'assigned_to_id' not in mutable_data:
                mutable_data['assigned_to_id'] = mutable_data.pop('assigned_to')
            data = mutable_data
        return super().to_internal_value(data)

    def validate_title(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Task title cannot be blank or whitespace only.")
        return trimmed

    def validate(self, attrs):
        project = attrs.get('project') or (self.instance.project if self.instance else None)
        assigned_to = attrs.get('assigned_to') if 'assigned_to' in attrs else (self.instance.assigned_to if self.instance else None)

        if project and assigned_to:
            is_owner = project.owner_id == assigned_to.id
            is_member = project.memberships.filter(user_id=assigned_to.id).exists()
            if not (is_owner or is_member):
                raise serializers.ValidationError({
                    'assigned_to': f"User '{assigned_to.email}' is not a member or owner of project '{project.name}'."
                })

        return attrs
