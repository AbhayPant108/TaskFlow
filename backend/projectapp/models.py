from django.db import models
from django.conf import settings


class Project(models.Model):
    class Status(models.TextChoices):
        PLANNING = 'PLANNING', 'Planning'
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        ARCHIVED = 'ARCHIVED', 'Archived'

    name = models.CharField(
        max_length=200,
        help_text="Name of the project",
        blank=False
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Detailed project description/objectives"
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects',
        help_text="User who created and owns this project"
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='ProjectMember',
        related_name='joined_projects',
        blank=True,
        help_text="Members assigned to this project"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
        help_text="Current lifecycle state of the project"
    )
    start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Optional project start date"
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Optional project target end date"
    )
    color = models.CharField(
        max_length=7,
        default="#3B82F6",
        help_text="Hex color code for UI badging (e.g. #3B82F6)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp when the project was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the project was last updated"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return self.name


class ProjectMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MEMBER = 'MEMBER', 'Member'
        VIEWER = 'VIEWER', 'Viewer'

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
        help_text="Member's access role within the project"
    )
    joined_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the user joined the project"
    )

    class Meta:
        unique_together = ('project', 'user')
        ordering = ['joined_at']
        verbose_name = 'Project Member'
        verbose_name_plural = 'Project Members'

    def __str__(self):
        return f"{self.user} - {self.project.name} ({self.role})"
