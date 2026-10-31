from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier for authentication.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MANAGER = 'MANAGER', 'Manager'
        MEMBER = 'MEMBER', 'Member'

    # Authentication credentials
    email = models.EmailField(
        max_length=255,
        unique=True,
        db_index=True,
        verbose_name="Email Address",
        help_text="Primary email address used for login"
    )

    # Personal Information
    first_name = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="First Name"
    )
    last_name = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Last Name"
    )
    bio = models.TextField(
        blank=True,
        default="",
        help_text="Short personal or professional bio"
    )
    avatar = models.URLField(
        max_length=500,
        blank=True,
        default="",
        help_text="Direct URL to user avatar image"
    )

    # Role & Permissions
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
        db_index=True,
        help_text="Designates the user's role within TaskFlow"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user account is active"
    )
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether this user can log into the Django admin"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp when the user account was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the user profile was last updated"
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.full_name} ({self.email})" if self.full_name else self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
