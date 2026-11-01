from django.db.models import Q
from django_filters import rest_framework as filters
from .models import Project


class ProjectFilter(filters.FilterSet):
    name = filters.CharFilter(
        field_name='name',
        lookup_expr='icontains',
        help_text="Search in project name (case-insensitive contains)"
    )
    status = filters.ChoiceFilter(
        choices=Project.Status.choices,
        help_text="Filter by exact project status (PLANNING, ACTIVE, COMPLETED, ARCHIVED)"
    )
    role = filters.CharFilter(
        method='filter_by_role',
        help_text="Filter by user's relationship: 'owner', 'member', or 'all'"
    )
    created_after = filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte',
        help_text="Filter projects created on or after this timestamp"
    )
    created_before = filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte',
        help_text="Filter projects created on or before this timestamp"
    )

    class Meta:
        model = Project
        fields = ['status', 'name']

    def filter_by_role(self, queryset, name, value):
        user = getattr(self.request, 'user', None)
        if not user or not user.is_authenticated:
            return queryset

        val = value.lower().strip()
        if val == 'owner':
            return queryset.filter(owner=user)
        elif val == 'member':
            return queryset.filter(memberships__user=user).exclude(owner=user)
        return queryset
    

