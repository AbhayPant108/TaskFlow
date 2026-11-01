from django_filters import rest_framework as filters
from .models import Task


class TaskFilter(filters.FilterSet):
    project = filters.NumberFilter(
        field_name='project_id',
        help_text="Filter tasks by project ID"
    )
    assigned_to = filters.NumberFilter(
        field_name='assigned_to_id',
        help_text="Filter tasks by assigned user ID"
    )
    created_by = filters.NumberFilter(
        field_name='created_by_id',
        help_text="Filter tasks by creator user ID"
    )
    is_assigned = filters.BooleanFilter(
        field_name='assigned_to',
        lookup_expr='isnull',
        exclude=True,
        help_text="Filter tasks that are assigned (true) or unassigned (false)"
    )
    title = filters.CharFilter(
        field_name='title',
        lookup_expr='icontains',
        help_text="Search in title (case-insensitive contains)"
    )
    status = filters.ChoiceFilter(
        choices=Task.Status.choices,
        help_text="Filter by exact task status (TODO, IN_PROGRESS, DONE)"
    )
    priority = filters.ChoiceFilter(
        choices=Task.Priority.choices,
        help_text="Filter by exact priority (LOW, MEDIUM, HIGH, URGENT)"
    )
    due_date = filters.DateFilter(
        field_name='due_date',
        lookup_expr='date',
        help_text="Filter by exact due date (YYYY-MM-DD)"
    )
    due_date_after = filters.DateTimeFilter(
        field_name='due_date',
        lookup_expr='gte',
        help_text="Filter tasks due on or after this timestamp"
    )
    due_date_before = filters.DateTimeFilter(
        field_name='due_date',
        lookup_expr='lte',
        help_text="Filter tasks due on or before this timestamp"
    )
    created_after = filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text="Filter tasks created on or after this timestamp"
    )
    created_before = filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte',
        help_text="Filter tasks created on or before this timestamp"
    )

    class Meta:
        model = Task
        fields = [
            'project',
            'assigned_to',
            'created_by',
            'status',
            'priority',
            'due_date',
        ]
