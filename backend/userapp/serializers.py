from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Complete serializer for the User model (used for profile view / details).
    """
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'bio',
            'avatar',
            'role',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'email',
            'role',
            'is_active',
            'created_at',
            'updated_at',
            'full_name',
        ]


class UserSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight user serializer for team member dropdowns, task assignees, and login payloads.
    """
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'role',
        ]
        read_only_fields = fields


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for public user registration.
    Validates email uniqueness and password strength.
    """
    email = serializers.EmailField(
        required=True,
        validators=[],  # Uniqueness is checked explicitly in the view
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Account password meeting standard security requirements"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Confirmation of the password"
    )

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')

        if password != password_confirm:
            raise serializers.ValidationError({
                "password_confirm": "Password fields do not match."
            })

        # Validate password against Django's configured auth password validators
        validate_password(password)
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT TokenObtainPairSerializer.
    Generates access and refresh tokens (which views set as HttpOnly cookies),
    and attaches user profile metadata in the response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add basic user profile details for frontend client state
        data['user'] = UserSummarySerializer(self.user).data
        data['message'] = "Login successful"
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating the authenticated user's own profile.
    Sensitive fields (email, role, permissions) cannot be edited here.
    """
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'bio',
            'avatar',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for validating password change payloads.
    Only checks that new_password and new_password_confirm match.
    Old password check and password update are handled directly in the view.
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('new_password_confirm'):
            raise serializers.ValidationError({
                "new_password_confirm": "New passwords do not match."
            })
        user = self.context.get('request').user if 'request' in self.context else None
        validate_password(attrs.get('new_password'), user=user)
        return attrs
