from datetime import date
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Project, ProjectMember

User = get_user_model()


class ProjectModelTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
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

    def test_create_project_successful(self):
        """Test creating a project with owner and default status."""
        project = Project.objects.create(
            name="Alpha Project",
            description="Testing project creation",
            owner=self.owner,
            color="#10B981"
        )
        self.assertEqual(project.name, "Alpha Project")
        self.assertEqual(project.owner, self.owner)
        self.assertEqual(project.status, Project.Status.ACTIVE)
        self.assertEqual(str(project), "Alpha Project")

    def test_project_member_unique_constraint(self):
        """Test that a user cannot be added twice to the same project."""
        project = Project.objects.create(name="Beta Project", owner=self.owner)
        ProjectMember.objects.create(project=project, user=self.member, role=ProjectMember.Role.MEMBER)

        with self.assertRaises(IntegrityError):
            ProjectMember.objects.create(project=project, user=self.member, role=ProjectMember.Role.ADMIN)


class ProjectAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
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

        self.project = Project.objects.create(
            name="TaskFlow Core",
            description="Core service implementation",
            owner=self.owner,
            status=Project.Status.ACTIVE
        )
        ProjectMember.objects.create(
            project=self.project,
            user=self.member,
            role=ProjectMember.Role.MEMBER
        )

        self.list_url = reverse('project-list')
        self.detail_url = reverse('project-detail', kwargs={'pk': self.project.pk})

    def test_list_projects_unauthenticated(self):
        """Unauthenticated requests cannot list projects."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_projects_scoped_to_user(self):
        """User only sees projects where they are owner or member."""
        # Create unrelated project for outsider
        Project.objects.create(name="Secret Project", owner=self.outsider)

        # Alice (owner) sees TaskFlow Core
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.project.id)

        # Charlie (outsider) sees Secret Project, not TaskFlow Core
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(self.list_url)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], "Secret Project")

    def test_create_project(self):
        """Authenticated user can create a project and is set as owner."""
        self.client.force_authenticate(user=self.owner)
        payload = {
            "name": "New Initiative",
            "description": "Planning 2027 roadmaps",
            "status": "PLANNING",
            "color": "#6366F1",
            "start_date": "2027-01-01",
            "end_date": "2027-06-30"
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "New Initiative")
        self.assertEqual(response.data['owner']['id'], self.owner.id)
        self.assertEqual(response.data['current_user_role'], "OWNER")

    def test_create_project_invalid_dates(self):
        """Start date after end date should return validation error."""
        self.client.force_authenticate(user=self.owner)
        payload = {
            "name": "Invalid Project",
            "start_date": "2027-12-01",
            "end_date": "2027-01-01"
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("end_date", response.data)

    def test_create_project_invalid_color(self):
        """Invalid hex color code returns validation error."""
        self.client.force_authenticate(user=self.owner)
        payload = {
            "name": "Invalid Color Project",
            "color": "not-a-color"
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("color", response.data)

    def test_retrieve_project_details(self):
        """Retrieve returns detailed data with memberships and current_user_role."""
        self.client.force_authenticate(user=self.member)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.project.id)
        self.assertEqual(response.data['current_user_role'], "MEMBER")
        self.assertEqual(len(response.data['memberships']), 1)
        self.assertEqual(response.data['memberships'][0]['user']['id'], self.member.id)

    def test_outsider_cannot_retrieve_project(self):
        """Outsider receives 404/403 when trying to access private project."""
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_project_by_owner(self):
        """Project owner can update project details."""
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(self.detail_url, {"name": "Updated Core Name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Updated Core Name")

    def test_update_project_by_member_forbidden(self):
        """Regular project member cannot update project details."""
        self.client.force_authenticate(user=self.member)
        response = self.client.patch(self.detail_url, {"name": "Hacked Name"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_project_by_owner(self):
        """Project owner can delete project."""
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())

    def test_delete_project_by_member_forbidden(self):
        """Project member cannot delete project."""
        self.client.force_authenticate(user=self.member)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProjectMemberAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            email="owner@example.com",
            password="Password123!",
            first_name="Alice",
            last_name="Owner"
        )
        self.admin_member = User.objects.create_user(
            email="admin_m@example.com",
            password="Password123!",
            first_name="Dan",
            last_name="AdminMember"
        )
        self.regular_member = User.objects.create_user(
            email="regular_m@example.com",
            password="Password123!",
            first_name="Eva",
            last_name="Regular"
        )
        self.new_user = User.objects.create_user(
            email="newbie@example.com",
            password="Password123!",
            first_name="Frank",
            last_name="Newbie"
        )

        self.project = Project.objects.create(name="Team Workspace", owner=self.owner)
        ProjectMember.objects.create(
            project=self.project,
            user=self.admin_member,
            role=ProjectMember.Role.ADMIN
        )
        self.membership_regular = ProjectMember.objects.create(
            project=self.project,
            user=self.regular_member,
            role=ProjectMember.Role.MEMBER
        )

        self.members_url = reverse('project-members', kwargs={'pk': self.project.pk})

    def test_list_project_members(self):
        """Project member can list all project members."""
        self.client.force_authenticate(user=self.regular_member)
        response = self.client.get(self.members_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_add_member_by_email(self):
        """Owner can add a member by email."""
        self.client.force_authenticate(user=self.owner)
        payload = {"email": "newbie@example.com", "role": "MEMBER"}
        response = self.client.post(self.members_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], "newbie@example.com")
        self.assertEqual(response.data['role'], "MEMBER")

    def test_add_member_by_user_id(self):
        """Admin member can add another member by user_id."""
        self.client.force_authenticate(user=self.admin_member)
        payload = {"user_id": self.new_user.id, "role": "VIEWER"}
        response = self.client.post(self.members_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], "VIEWER")

    def test_regular_member_cannot_add_member(self):
        """Regular member cannot add members."""
        self.client.force_authenticate(user=self.regular_member)
        payload = {"email": "newbie@example.com", "role": "MEMBER"}
        response = self.client.post(self.members_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_add_owner_as_member(self):
        """Cannot add the project owner as a member."""
        self.client.force_authenticate(user=self.owner)
        payload = {"email": self.owner.email, "role": "MEMBER"}
        response = self.client.post(self.members_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_add_duplicate_member(self):
        """Cannot add a user who is already a member."""
        self.client.force_authenticate(user=self.owner)
        payload = {"email": self.regular_member.email, "role": "ADMIN"}
        response = self.client.post(self.members_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_can_update_member_role(self):
        """Project owner can change a member's role."""
        self.client.force_authenticate(user=self.owner)
        url = reverse('project-update-member-role', kwargs={'pk': self.project.pk, 'user_id': self.regular_member.pk})
        response = self.client.patch(url, {"role": "ADMIN"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], "ADMIN")

    def test_member_can_leave_project(self):
        """Member can remove themselves (leave project)."""
        self.client.force_authenticate(user=self.regular_member)
        url = reverse('project-update-member-role', kwargs={'pk': self.project.pk, 'user_id': self.regular_member.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ProjectMember.objects.filter(project=self.project, user=self.regular_member).exists())

    def test_owner_can_remove_member(self):
        """Project owner can remove any member."""
        self.client.force_authenticate(user=self.owner)
        url = reverse('project-update-member-role', kwargs={'pk': self.project.pk, 'user_id': self.regular_member.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


    def test_list_project_tasks(self):
        """Member or owner can list all tasks in a project."""
        from taskapp.models import Task
        Task.objects.create(project=self.project, title="Task A", created_by=self.owner)
        Task.objects.create(project=self.project, title="Task B", status=Task.Status.DONE, created_by=self.owner)
        self.client.force_authenticate(user=self.regular_member)
        url = reverse('project-tasks', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
