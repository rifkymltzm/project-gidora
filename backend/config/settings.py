from decouple import config
from pathlib import Path
import dj_database_url
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="127.0.0.1,localhost",
    cast=lambda value: [host.strip() for host in value.split(",") if host.strip()],
)


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third Party Packages
    "rest_framework",
    "corsheaders",
    "djoser",
    "rest_framework_simplejwt",
    "django_filters",
    "drf_spectacular",
    # Local apps
    "apps.accounts.apps.AccountsConfig",
    "apps.cart",
    "apps.catalog",
    "apps.checkout",
    "apps.inventory",
    "apps.orders",
    "apps.payments",
    "apps.shipping",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL"),
        conn_max_age=600,
    )
}

# # DEFINE CUSTOM USER MODEL
AUTH_USER_MODEL = "accounts.User"

# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Jakarta"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": ("rest_framework.pagination.PageNumberPagination"),
    "PAGE_SIZE": 12,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=24),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

DJOSER = {
    "LOGIN_FIELD": "email",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "GIDORA API",
    "DESCRIPTION": "Backend API for GIDORA e-commerce",
    "VERSION": "1.0.0",
    "TAGS": [
        {"name": "Authentication", "description": "User authentication and authorization"},
        {"name": "Accounts", "description": "User account and profile management"},
        {"name": "User Addresses", "description": "User Addresses management"},
        {"name": "Catalog", "description": "Customers Catalog endpoints"},
        {"name": "Cart", "description": "Shopping cart management"},
        {"name": "Checkout", "description": "Checkout and order preparation"},
        {"name": "Orders", "description": "Order management"},
        {"name": "Payments", "description": "Payment and transaction management"},
        {"name": "Shipping", "description": "Shipping and delivery management"},
        {"name": "Admin Accounts", "description": "Administrative customer account management"},
        {"name": "Admin Catalog", "description": "Administrative Catalog endpoints"},
        {"name": "Admin Inventory", "description": "Administrative Inventory endpoints"},
        {"name": "Admin Orders", "description": "Administrative Orders endpoints"},
        {"name": "Admin Shipping", "description": "Administrative Shipping endpoints"},
    ],

    "PREPROCESSING_HOOKS": [
        "apps.accounts.openapi.hide_djoser_user_management_endpoints",
    ],

    "SORT_OPERATIONS": False,
}


SWAGGER_UI_SETTINGS = {
    "tagsSorter": "none",
    "operationsSorter": "none",
}


# Midtrans
MIDTRANS_ENVIRONMENT = config(
    "MIDTRANS_ENVIRONMENT",
    default="sandbox",
)

MIDTRANS_SERVER_KEY = config(
    "MIDTRANS_SERVER_KEY",
)


MIDTRANS_GOPAY_CALLBACK_URL = config(
    "MIDTRANS_GOPAY_CALLBACK_URL",
    default="http://localhost:5173/payment/result",
)

MIDTRANS_SHOPEEPAY_CALLBACK_URL = config(
    "MIDTRANS_SHOPEEPAY_CALLBACK_URL",
    default="http://localhost:5173/payment/result",
)


EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
