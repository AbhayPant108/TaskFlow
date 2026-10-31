from django.db import models


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    title = models.CharField(
        max_length=255,
        help_text="Short summary of the task"
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Detailed description of the task"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
        db_index=True,
        help_text="Current state of the task"
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
        help_text="Urgency/priority level of the task"
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Target completion date/time"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp when the task was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the task was last updated"
    )

    class Meta:
        ordering = ['-created_at']
        # verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return self.title
