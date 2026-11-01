from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from projectapp.models import Project, ProjectMember
from .models import Task

User = get_user_model()


class TaskAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.user = User.objects.create_user(
            email="owner@example.com",
            password="Password123!",
            first_name="Alice",
            last_name="Owner"
        )
        self.member = User.objects.create_user(
            email="member@example.com",
            password="Password123!",
            first_name="Bob",
            last_name="Member"
        )
        self.outsider = User.objects.create_user(
            email="outsider@example.com",
            password="Password123!",
            first_name="Charlie",
            last_name="Outsider"
        )

        # Projects
        self.project = Project.objects.create(
            name="Main Project",
            description="Core workspace",
            owner=self.user
        )
        ProjectMember.objects.create(
            project=self.project,
            user=self.member,
            role=ProjectMember.Role.MEMBER
        )

        self.outsider_project = Project.objects.create(
            name="Outsider Workspace",
            owner=self.outsider
        )

        # Tasks
        self.task1 = Task.objects.create(
            project=self.project,
            created_by=self.user,
            assigned_to=self.member,
            title="Design system setup",
            description="Setup shadcn and tailwind",
            status=Task.Status.TODO,
            priority=Task.Priority.HIGH,
        )
        self.task2 = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Backend Task API",
            description="Build DRF endpoints for tasks",
            status=Task.Status.IN_PROGRESS,
            priority=Task.Priority.URGENT,
        )
        self.task3 = Task.objects.create(
            project=self.project,
            created_by=self.member,
            title="Docker compose config",
            description="Configure SQLite backend container",
            status=Task.Status.DONE,
            priority=Task.Priority.LOW,
        )

        # Default auth as project owner
        self.client.force_authenticate(user=self.user)

    # 1. Create Task Tests
    def test_create_task_success(self):
        url = reverse('task-list')
        payload = {
            "project": self.project.id,
            "title": "New feature branch",
            "description": "Start implementing V0.1",
            "status": "TODO",
            "priority": "MEDIUM",
            "assigned_to": self.member.id,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], payload['title'])
        self.assertEqual(response.data['project'], self.project.id)
        self.assertEqual(response.data['project_name'], self.project.name)
        self.assertEqual(response.data['created_by']['id'], self.user.id)
        self.assertEqual(response.data['assigned_to']['id'], self.member.id)

    def test_create_task_without_project_fails(self):
        """Strict requirement: A task cannot exist without a project."""
        url = reverse('task-list')
        payload = {
            "title": "Orphan Task",
            "description": "Missing project"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('project', response.data)

    def test_create_task_assign_to_outsider_fails(self):
        """Cannot assign a task to a user who does not belong to the project."""
        url = reverse('task-list')
        payload = {
            "project": self.project.id,
            "title": "Task for Outsider",
            "assigned_to": self.outsider.id,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('assigned_to', response.data)

    def test_create_task_empty_title_fails(self):
        url = reverse('task-list')
        payload = {
            "project": self.project.id,
            "title": "   "
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    # 2. Read & Filter Task Tests
    def test_list_tasks_scoped_to_user(self):
        """Outsider cannot see tasks belonging to self.project."""
        self.client.force_authenticate(user=self.outsider)
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Outsider has no tasks yet
        self.assertEqual(response.data['count'], 0)

    def test_retrieve_single_task(self):
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.task1.title)
        self.assertEqual(response.data['id'], self.task1.id)
        self.assertEqual(response.data['project'], self.project.id)

    def test_outsider_cannot_retrieve_task(self):
        self.client.force_authenticate(user=self.outsider)
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_tasks_by_status(self):
        url = reverse('task-list')
        response = self.client.get(url, {'status': 'IN_PROGRESS'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task2.id)

    def test_filter_tasks_by_project(self):
        url = reverse('task-list')
        response = self.client.get(url, {'project': self.project.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_filter_tasks_by_assigned_to(self):
        url = reverse('task-list')
        response = self.client.get(url, {'assigned_to': self.member.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task1.id)

    # 3. Update Task Tests
    def test_partial_update_task_status(self):
        url = reverse('task-detail', args=[self.task1.id])
        payload = {"status": "DONE"}
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "DONE")
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, Task.Status.DONE)

    def test_update_task_reassign_to_outsider_fails(self):
        url = reverse('task-detail', args=[self.task1.id])
        payload = {"assigned_to": self.outsider.id}
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 4. Delete Task Tests
    def test_delete_task(self):
        url = reverse('task-detail', args=[self.task3.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task3.id).exists())

    def test_outsider_cannot_delete_task(self):
        self.client.force_authenticate(user=self.outsider)
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
