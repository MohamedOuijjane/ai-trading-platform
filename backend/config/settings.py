from pathlib import Path
import os



BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-tradingbot-admin-2024'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
   ## 'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'administration',
     'trading', 
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],   # ← ajouter ceci
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'config.wsgi.application'

import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.environ.get('DB_NAME', 'trading_bot_db'),
        'USER':     os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', '123'),
        'HOST':     os.environ.get('DB_HOST', 'localhost'),
        'PORT':     os.environ.get('DB_PORT', '5432'),
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAdminUser',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

CORS_ALLOW_ALL_ORIGINS = True

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE     = 'Africa/Casablanca'
USE_I18N      = True
USE_TZ        = True

STATIC_URL       = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
MEDIA_URL        = '/media/'
MEDIA_ROOT       = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

JAZZMIN_SETTINGS = {
    "site_title"           : "TradingBot Admin",
    "site_header"          : "TradingBot AI",
    "site_brand"           : "TradingBot AI",
    "site_logo"            : None,
    "site_logo_classes"    : "img-circle",
    "site_icon"            : None,
    "welcome_sign"         : "Bienvenue Mariam — Panel Admin",
    "copyright"            : "TradingBot AI 2026",
    "show_sidebar"         : True,
    "navigation_expanded"  : True,
    "hide_apps"            : [],
    "hide_models"          : [],

    "order_with_respect_to": [
        "administration",
        "administration.Trade",
        "administration.Prediction",
        "administration.StockPrice",
        "administration.BotConfig",
        "auth",
    ],

    "icons": {
        "auth"                      : "fas fa-shield-alt",
        "auth.user"                 : "fas fa-user",
        "auth.Group"                : "fas fa-users",
        "administration"            : "fas fa-chart-line",
        "administration.Trade"      : "fas fa-exchange-alt",
        "administration.Prediction" : "fas fa-brain",
        "administration.StockPrice" : "fas fa-dollar-sign",
        "administration.BotConfig"  : "fas fa-robot",
    },

    "default_icon_parents" : "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    "topmenu_links": [
        {
            "name"       : "Dashboard",
            "url"        : "admin:index",
            "permissions": ["auth.view_user"],
        },
        {
            "name"      : "Site",
            "url"       : "/",
            "new_window": True,
        },
        {
            "name"       : "Utilisateurs",
            "url"        : "admin:auth_user_changelist",
            "permissions": ["auth.view_user"],
        },
    ],

    "usermenu_links": [
        {
            "name"      : "Support",
            "url"       : "https://github.com",
            "new_window": True,
            "icon"      : "fas fa-circle",
        },
    ],

    "show_ui_builder"   : True,
    "changeform_format" : "horizontal_tabs",
    "language_chooser"  : False,
}

JAZZMIN_UI_TWEAKS = {
    "theme"                    : "darkly",
    "default_theme_mode"       : "dark",
    "navbar"                   : "navbar-dark",
    "no_navbar_border"         : True,
    "sidebar"                  : "sidebar-dark-success",
    "sidebar_nav_small_text"   : False,
    "sidebar_disable_expand"   : False,
    "sidebar_nav_child_indent" : True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style" : False,
    "sidebar_nav_flat_style"   : False,
    "button_classes": {
        "primary"  : "btn-primary",
        "secondary": "btn-secondary",
        "info"     : "btn-outline-info",
        "warning"  : "btn-warning",
        "danger"   : "btn-danger",
        "success"  : "btn-success",
    },
    "actions_sticky_top": False,
}