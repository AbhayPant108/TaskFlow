from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that extracts the JWT access token from HttpOnly cookies first,
    falling back to the standard Authorization header (Bearer <token>).
    """

    def authenticate(self, request):
        # 1. Try to read access token from HttpOnly cookie
        cookie_name = getattr(settings, 'AUTH_COOKIE_ACCESS', 'access_token')
        raw_token = request.COOKIES.get(cookie_name)

        # 2. Fall back to standard Authorization header if cookie not present
        if raw_token is None:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token


class CookieJWTScheme(OpenApiAuthenticationExtension):
    """
    OpenAPI schema extension for CookieJWTAuthentication.
    Documents cookie-based authentication in Swagger / OpenAPI docs.
    """
    target_class = 'userapp.authentication.CookieJWTAuthentication'
    name = 'cookieAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': getattr(settings, 'AUTH_COOKIE_ACCESS', 'access_token'),
            'description': 'HttpOnly JWT access token sent in cookies.',
        }
