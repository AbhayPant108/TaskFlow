from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets, filters as drf_filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view

from .serializers import (
    UserSerializer,
    UserSummarySerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


def set_jwt_cookies(response, access_token=None, refresh_token=None):
    """
    Helper function to set HttpOnly cookies for access and refresh JWT tokens.
    """
    cookie_secure = getattr(settings, 'AUTH_COOKIE_SECURE', not settings.DEBUG)
    cookie_samesite = getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax')
    cookie_path = getattr(settings, 'AUTH_COOKIE_PATH', '/')

    if access_token:
        # Access token cookie lifetime (e.g., 15 minutes)
        access_lifetime = settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds()
        response.set_cookie(
            key=getattr(settings, 'AUTH_COOKIE_ACCESS', 'access_token'),
            value=access_token,
            max_age=int(access_lifetime),
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            path=cookie_path,
        )

    if refresh_token:
        # Refresh token cookie lifetime (e.g., 7 days)
        refresh_lifetime = settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds()
        response.set_cookie(
            key=getattr(settings, 'AUTH_COOKIE_REFRESH', 'refresh_token'),
            value=refresh_token,
            max_age=int(refresh_lifetime),
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            path=cookie_path,
        )


def clear_jwt_cookies(response):
    """
    Helper function to delete JWT cookies on logout.
    """
    cookie_path = getattr(settings, 'AUTH_COOKIE_PATH', '/')
    response.delete_cookie(
        getattr(settings, 'AUTH_COOKIE_ACCESS', 'access_token'),
        path=cookie_path,
    )
    response.delete_cookie(
        getattr(settings, 'AUTH_COOKIE_REFRESH', 'refresh_token'),
        path=cookie_path,
    )


@extend_schema(
    summary="Register a new user",
    description="Registers a new user account, issues JWT cookies, and returns the created user profile.",
    responses={201: UserSummarySerializer}
)
class RegisterView(generics.GenericAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()

        # Email already exists check handled explicitly in the view
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"email": ["A user with this email address already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens and attach to HttpOnly cookies
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "user": UserSummarySerializer(user).data,
                "message": "User registered successfully.",
            },
            status=status.HTTP_201_CREATED,
        )
        set_jwt_cookies(response, access_token=access_token, refresh_token=refresh_token)
        return response


@extend_schema(
    summary="Login user",
    description="Authenticates credentials and sets access and refresh tokens in HttpOnly cookies.",
    responses={200: CustomTokenObtainPairSerializer}
)
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            set_jwt_cookies(response, access_token=access_token, refresh_token=refresh_token)
        return response


@extend_schema(
    summary="Refresh access token",
    description="Refreshes the access token using the refresh token stored in HttpOnly cookie or request body.",
)
class RefreshTokenView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Extract refresh token from cookie if not present in request body
        refresh_cookie_name = getattr(settings, 'AUTH_COOKIE_REFRESH', 'refresh_token')
        if 'refresh' not in request.data and refresh_cookie_name in request.COOKIES:
            data = request.data.copy()
            data['refresh'] = request.COOKIES[refresh_cookie_name]
            serializer = self.get_serializer(data=data)
        else:
            serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        access_token = response.data.get('access')
        refresh_token = response.data.get('refresh')  # If token rotation is enabled
        set_jwt_cookies(response, access_token=access_token, refresh_token=refresh_token)
        return response


@extend_schema(
    summary="Logout user",
    description="Blacklists the refresh token and clears JWT HttpOnly cookies.",
    request=None,
    responses={200: dict}
)
class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_cookie_name = getattr(settings, 'AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.data.get('refresh') or request.COOKIES.get(refresh_cookie_name)

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, InvalidToken):
                # Token might already be blacklisted or invalid, proceed to clear cookies
                pass

        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        clear_jwt_cookies(response)
        return response


@extend_schema(
    summary="Current user profile",
    description="Retrieve or update the currently authenticated user's profile.",
)
class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


@extend_schema(
    summary="Change password",
    description="Verify current password and update to a new password.",
    request=ChangePasswordSerializer,
    responses={200: dict}
)
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        # 1. Verify old password in view
        if not user.check_password(old_password):
            return Response(
                {"old_password": ["Current password is not correct."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Update password in view
        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


@extend_schema_view(
    list=extend_schema(
        summary="List active team members",
        description="Retrieve a paginated or filterable list of active users for task assignment.",
    ),
    retrieve=extend_schema(
        summary="Retrieve user profile",
        description="Retrieve public profile details of a specific user by ID.",
    ),
)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for listing and retrieving team members.
    Used for task assignment and teammate directory.
    """
    queryset = User.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    filterset_fields = ['role']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['first_name', 'last_name', 'email', 'created_at']
    ordering = ['first_name', 'last_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return UserSummarySerializer
        return UserSerializer
