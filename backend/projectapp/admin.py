from django.contrib import admin
from .models import Project, ProjectMember


class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 1
    autocomplete_fields = ['user']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'status', 'start_date', 'end_date', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'description', 'owner__email', 'owner__first_name', 'owner__last_name')
    date_hierarchy = 'created_at'
    inlines = [ProjectMemberInline]


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'user', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('project__name', 'user__email', 'user__first_name', 'user__last_name')
