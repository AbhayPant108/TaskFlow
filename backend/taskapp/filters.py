from django_filters import rest_framework as filters
from .models import Task


class TaskFilter(filters.FilterSet):
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
            'status',
            'priority',
            'due_date',
        ]
