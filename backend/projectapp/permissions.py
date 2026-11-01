from rest_framework import permissions
from .models import ProjectMember


class IsProjectMemberOrOwner(permissions.BasePermission):
    """
    Object-level permission allowing access only to the project owner or members.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff / Superuser has full access
        if request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN':
            return True

        # Owner has full access
        if obj.owner_id == request.user.id:
            return True

        # Project members have access
        return obj.memberships.filter(user_id=request.user.id).exists()


class IsProjectAdminOrOwner(permissions.BasePermission):
    """
    Object-level permission allowing modification only to the owner or project admin.
    Viewers and regular members get read-only access (SAFE_METHODS).
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN':
            return True

        is_owner = obj.owner_id == request.user.id
        if is_owner:
            return True

        membership = obj.memberships.filter(user_id=request.user.id).first()
        if not membership:
            return False

        # SAFE_METHODS (GET, HEAD, OPTIONS) allowed for any member
        if request.method in permissions.SAFE_METHODS:
            return True

        # Unsafe methods require ADMIN role
        return membership.role == ProjectMember.Role.ADMIN


class IsProjectOwnerOnly(permissions.BasePermission):
    """
    Object-level permission strictly for the project owner or system staff.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN':
            return True

        return obj.owner_id == request.user.id
