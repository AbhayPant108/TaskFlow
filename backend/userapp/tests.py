from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_successful(self):
        """Test creating a regular user with email and password."""
        email = "test@example.com"
        password = "Password123!"
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name="Jane",
            last_name="Doe",
        )

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertEqual(user.first_name, "Jane")
        self.assertEqual(user.last_name, "Doe")
        self.assertEqual(user.role, User.Role.MEMBER)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_user_email_normalized(self):
        """Test that email addresses are properly lowercased on domain."""
        email = "user@EXAMPLE.COM"
        user = User.objects.create_user(email=email, password="Password123!")
        self.assertEqual(user.email, "user@example.com")

    def test_create_user_no_email_raises_error(self):
        """Test that creating a user with no email raises a ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="Password123!")

    def test_create_superuser_successful(self):
        """Test creating a superuser with admin privileges and ADMIN role."""
        email = "admin@example.com"
        password = "AdminPassword123!"
        admin_user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name="Admin",
            last_name="Super",
        )

        self.assertEqual(admin_user.email, email)
        self.assertTrue(admin_user.check_password(password))
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertEqual(admin_user.role, User.Role.ADMIN)

    def test_create_superuser_invalid_staff_flag(self):
        """Test that creating a superuser with is_staff=False raises ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="admin@example.com",
                password="AdminPassword123!",
                is_staff=False
            )

    def test_create_superuser_invalid_superuser_flag(self):
        """Test that creating a superuser with is_superuser=False raises ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="admin@example.com",
                password="AdminPassword123!",
                is_superuser=False
            )

    def test_user_full_name_and_str(self):
        """Test full_name property and __str__ output."""
        user = User.objects.create_user(
            email="alex@example.com",
            password="Password123!",
            first_name="Alex",
            last_name="Smith"
        )
        self.assertEqual(user.full_name, "Alex Smith")
        self.assertEqual(str(user), "Alex Smith (alex@example.com)")

        # Case with blank first/last name
        user_anon = User.objects.create_user(
            email="anon@example.com",
            password="Password123!"
        )
        self.assertEqual(user_anon.full_name, "")
        self.assertEqual(str(user_anon), "anon@example.com")

    def test_email_unique_constraint(self):
        """Test that duplicate emails violate unique constraint."""
        email = "duplicate@example.com"
        User.objects.create_user(email=email, password="Password123!")
        with self.assertRaises(IntegrityError):
            User.objects.create_user(email=email, password="Password456!")


from rest_framework.test import APIRequestFactory
from .serializers import (
    UserSerializer,
    UserSummarySerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)


class SerializerTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(
            email="serializer_test@example.com",
            password="SecurePassword123!",
            first_name="Jane",
            last_name="Doe",
            bio="Software Engineer",
            avatar="https://example.com/avatar.png",
        )

    def test_user_serializer_output(self):
        serializer = UserSerializer(instance=self.user)
        data = serializer.data
        self.assertEqual(data['email'], self.user.email)
        self.assertEqual(data['first_name'], "Jane")
        self.assertEqual(data['last_name'], "Doe")
        self.assertEqual(data['full_name'], "Jane Doe")
        self.assertEqual(data['role'], User.Role.MEMBER)
        self.assertEqual(data['bio'], "Software Engineer")
        self.assertEqual(data['avatar'], "https://example.com/avatar.png")
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)
        self.assertNotIn('password', data)

    def test_user_summary_serializer_output(self):
        serializer = UserSummarySerializer(instance=self.user)
        data = serializer.data
        self.assertEqual(set(data.keys()), {'id', 'email', 'first_name', 'last_name', 'full_name', 'avatar', 'role'})
        self.assertEqual(data['full_name'], "Jane Doe")

    def test_user_register_serializer_success(self):
        data = {
            "email": "new_register@example.com",
            "password": "StrongPassword999!",
            "password_confirm": "StrongPassword999!",
            "first_name": "New",
            "last_name": "User",
        }
        serializer = UserRegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        created_user = serializer.save()
        self.assertEqual(created_user.email, "new_register@example.com")
        self.assertTrue(created_user.check_password("StrongPassword999!"))
        self.assertEqual(created_user.role, User.Role.MEMBER)

    def test_user_register_serializer_mismatched_passwords(self):
        data = {
            "email": "mismatch@example.com",
            "password": "StrongPassword999!",
            "password_confirm": "DifferentPassword123!",
            "first_name": "Mismatch",
            "last_name": "User",
        }
        serializer = UserRegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)

    def test_user_register_serializer_duplicate_email_db_integrity(self):
        """Serializer itself permits format validation, but DB raises IntegrityError if duplicate is saved."""
        data = {
            "email": "serializer_test@example.com",  # Already exists in setUp
            "password": "StrongPassword999!",
            "password_confirm": "StrongPassword999!",
        }
        serializer = UserRegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        with self.assertRaises(IntegrityError):
            serializer.save()

    def test_custom_token_serializer(self):
        data = {
            "email": "serializer_test@example.com",
            "password": "SecurePassword123!",
        }
        serializer = CustomTokenObtainPairSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        res = serializer.validated_data
        self.assertIn('access', res)
        self.assertIn('refresh', res)
        self.assertIn('user', res)
        self.assertEqual(res['user']['email'], "serializer_test@example.com")
        self.assertEqual(res['message'], "Login successful")

    def test_user_update_serializer(self):
        update_data = {
            "first_name": "Janet",
            "last_name": "Smith",
            "bio": "Lead Architect",
            "avatar": "https://example.com/new_avatar.jpg",
        }
        serializer = UserUpdateSerializer(instance=self.user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()
        self.assertEqual(updated_user.first_name, "Janet")
        self.assertEqual(updated_user.bio, "Lead Architect")

    def test_change_password_serializer_matching_passwords(self):
        data = {
            "old_password": "SecurePassword123!",
            "new_password": "BrandNewPassword456!",
            "new_password_confirm": "BrandNewPassword456!",
        }
        serializer = ChangePasswordSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['new_password'], "BrandNewPassword456!")

    def test_change_password_serializer_mismatched_passwords(self):
        data = {
            "old_password": "SecurePassword123!",
            "new_password": "BrandNewPassword456!",
            "new_password_confirm": "DifferentPassword789!",
        }
        serializer = ChangePasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('new_password_confirm', serializer.errors)


from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken


class AuthRoutingAndViewsTests(APITestCase):
    def setUp(self):
        self.user_password = "SecurePassword123!"
        self.user = User.objects.create_user(
            email="api_test@example.com",
            password=self.user_password,
            first_name="Alice",
            last_name="Tester",
        )
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.refresh_url = reverse('auth-refresh')
        self.logout_url = reverse('auth-logout')
        self.me_url = reverse('auth-me')
        self.change_password_url = reverse('auth-change-password')
        self.users_url = reverse('user-list')

    def test_register_success_sets_cookies(self):
        payload = {
            "email": "brand_new@example.com",
            "password": "StrongPassword888!",
            "password_confirm": "StrongPassword888!",
            "first_name": "Bob",
            "last_name": "Builder",
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['user']['email'], "brand_new@example.com")
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        self.assertTrue(response.cookies['access_token']['httponly'])
        self.assertTrue(response.cookies['refresh_token']['httponly'])

    def test_register_duplicate_email_handled_in_view(self):
        payload = {
            "email": "api_test@example.com",  # Already exists
            "password": "StrongPassword888!",
            "password_confirm": "StrongPassword888!",
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'], ["A user with this email address already exists."])

    def test_login_success_sets_cookies(self):
        payload = {
            "email": "api_test@example.com",
            "password": self.user_password,
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        self.assertEqual(response.data['user']['email'], "api_test@example.com")

    def test_login_invalid_credentials_fails(self):
        payload = {
            "email": "api_test@example.com",
            "password": "WrongPassword!",
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, 401)

    def test_get_me_with_cookie_auth(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        # Set cookie in test client
        self.client.cookies['access_token'] = access_token
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], "api_test@example.com")
        self.assertEqual(response.data['full_name'], "Alice Tester")

    def test_get_me_unauthenticated_fails(self):
        self.client.cookies.clear()
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, 401)

    def test_update_me_profile(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        payload = {
            "first_name": "Alicia",
            "bio": "Updated bio text",
        }
        response = self.client.patch(self.me_url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['first_name'], "Alicia")
        self.assertEqual(response.data['bio'], "Updated bio text")

    def test_change_password_success(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        payload = {
            "old_password": self.user_password,
            "new_password": "SuperNewPassword999!",
            "new_password_confirm": "SuperNewPassword999!",
        }
        response = self.client.post(self.change_password_url, payload, format='json')
        self.assertEqual(response.status_code, 200)

        # Verify password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("SuperNewPassword999!"))

    def test_change_password_wrong_old_password_in_view(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        payload = {
            "old_password": "IncorrectPassword!",
            "new_password": "SuperNewPassword999!",
            "new_password_confirm": "SuperNewPassword999!",
        }
        response = self.client.post(self.change_password_url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('old_password', response.data)
        self.assertEqual(response.data['old_password'], ["Current password is not correct."])

    def test_refresh_token_via_cookie(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['refresh_token'] = str(refresh)

        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.cookies)

    def test_logout_clears_cookies(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['access_token'] = str(refresh.access_token)
        self.client.cookies['refresh_token'] = str(refresh)

        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, 200)
        # Cookies marked for deletion have empty value
        self.assertEqual(response.cookies['access_token'].value, '')
        self.assertEqual(response.cookies['refresh_token'].value, '')

    def test_users_list_authenticated(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.cookies['access_token'] = str(refresh.access_token)

        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data['results']), 1)
