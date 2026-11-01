from django.db import migrations, models
import django.db.models.deletion


def populate_default_project(apps, schema_editor):
    User = apps.get_model('userapp', 'User')
    Project = apps.get_model('projectapp', 'Project')
    Task = apps.get_model('taskapp', 'Task')

    # Only run if there are tasks missing a project
    if Task.objects.filter(project__isnull=True).exists():
        default_user = User.objects.filter(role='ADMIN').first()
        if not default_user:
            default_user = User.objects.filter(is_superuser=True).first()

        if not default_user:
            default_user = User.objects.create(
                email='admin@taskflow.dev',
                first_name='Admin',
                last_name='TaskFlow',
                role='ADMIN',
                is_active=True,
                is_staff=True,
                is_superuser=True,
            )

        default_project = Project.objects.filter(owner=default_user).first()
        if not default_project:
            default_project = Project.objects.create(
                name='Default Workspace',
                description='Workspace for existing tasks',
                owner=default_user,
                status='ACTIVE',
                color='#3B82F6',
            )

        Task.objects.filter(project__isnull=True).update(
            project=default_project,
            created_by=default_user
        )


def reverse_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('taskapp', '0003_task_assigned_to_task_created_by_task_project_and_more'),
        ('projectapp', '0001_initial'),
        ('userapp', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(populate_default_project, reverse_func),
        migrations.AlterField(
            model_name='task',
            name='project',
            field=models.ForeignKey(
                help_text='Project this task belongs to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tasks',
                to='projectapp.project'
            ),
        ),
    ]
