from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Task


class TaskAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.task1 = Task.objects.create(
            title="Design system setup",
            description="Setup shadcn and tailwind",
            status=Task.Status.TODO,
            priority=Task.Priority.HIGH,
        )
        self.task2 = Task.objects.create(
            title="Backend Task API",
            description="Build DRF endpoints for tasks",
            status=Task.Status.IN_PROGRESS,
            priority=Task.Priority.URGENT,
        )
        self.task3 = Task.objects.create(
            title="Docker compose config",
            description="Configure SQLite backend container",
            status=Task.Status.DONE,
            priority=Task.Priority.LOW,
        )

    # 1. Create Task Tests
    def test_create_task_success(self):
        url = reverse('task-list')
        payload = {
            "title": "New feature branch",
            "description": "Start implementing V0.1",
            "status": "TODO",
            "priority": "MEDIUM",
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], payload['title'])
        self.assertEqual(response.data['status'], "TODO")
        self.assertEqual(response.data['priority'], "MEDIUM")
        self.assertIn('id', response.data)
        self.assertIn('created_at', response.data)
        self.assertIn('updated_at', response.data)

    def test_create_task_with_defaults(self):
        url = reverse('task-list')
        payload = {
            "title": "Minimal task only with title"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], Task.Status.TODO)
        self.assertEqual(response.data['priority'], Task.Priority.MEDIUM)
        self.assertEqual(response.data['description'], "")

    def test_create_task_empty_title_fails(self):
        url = reverse('task-list')
        payload = {
            "title": "   "
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    # 2. Read & Filter Task Tests
    def test_list_tasks(self):
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['results']), 3)

    def test_retrieve_single_task(self):
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.task1.title)
        self.assertEqual(response.data['id'], self.task1.id)

    def test_filter_tasks_by_status(self):
        url = reverse('task-list')
        response = self.client.get(url, {'status': 'IN_PROGRESS'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task2.id)

    def test_filter_tasks_by_priority(self):
        url = reverse('task-list')
        response = self.client.get(url, {'priority': 'HIGH'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task1.id)

    def test_search_tasks(self):
        url = reverse('task-list')
        response = self.client.get(url, {'search': 'shadcn'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.task1.id)

    # 3. Update Task Tests
    def test_partial_update_task(self):
        url = reverse('task-detail', args=[self.task1.id])
        payload = {
            "status": "DONE"
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "DONE")
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, Task.Status.DONE)

    def test_read_only_fields_cannot_be_overwritten(self):
        url = reverse('task-detail', args=[self.task1.id])
        original_created_at = self.task1.created_at.isoformat()
        payload = {
            "id": 9999,
            "created_at": "2020-01-01T00:00:00Z",
            "title": "Updated Title",
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task1.id)
        self.assertNotEqual(response.data['id'], 9999)
        self.assertEqual(response.data['title'], "Updated Title")

    # 4. Delete Task Tests
    def test_delete_task(self):
        url = reverse('task-detail', args=[self.task3.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task3.id).exists())

    def test_retrieve_deleted_task_returns_404(self):
        url = reverse('task-detail', args=[99999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
