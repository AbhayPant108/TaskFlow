from rest_framework import viewsets, filters as drf_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter


@extend_schema_view(
    list=extend_schema(
        summary="List all tasks",
        description="Retrieve a paginated list of tasks with support for filtering, searching, and ordering."
    ),
    create=extend_schema(
        summary="Create a new task",
        description="Create a new task with title, description, status, priority, and optional due date."
    ),
    retrieve=extend_schema(
        summary="Retrieve a task",
        description="Get detailed information about a specific task by its ID."
    ),
    update=extend_schema(
        summary="Update a task (full)",
        description="Replace all editable fields of a task. Read-only fields (id, created_at, updated_at) are protected."
    ),
    partial_update=extend_schema(
        summary="Update a task (partial)",
        description="Update specific editable fields of a task (e.g. status or priority). Read-only fields cannot be altered."
    ),
    destroy=extend_schema(
        summary="Delete a task",
        description="Permanently delete a task by its ID."
    ),
)
class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Tasks in TaskFlow.
    Supports:
    - Create: POST /api/tasks/
    - Read/List: GET /api/tasks/
    - Read/Detail: GET /api/tasks/{id}/
    - Update: PUT/PATCH /api/tasks/{id}/
    - Delete: DELETE /api/tasks/{id}/
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title']
    ordering = ['-created_at']
