# ==============================================================================
# Name:        Philipp Fischer
# Kontakt:     p.fischer@itconex.de
# Version:     2026.01.30.13.30.00
# Beschreibung: LogBot v2026.01.30.13.30.00 - Routes Package
# ==============================================================================

from .auth import router as auth_router
from .health import router as health_router
from .users import router as users_router
from .agents import router as agents_router
from .logs import router as logs_router
from .webhooks import router as webhooks_router
from .settings import router as settings_router

__all__ = ["auth_router", "health_router", "users_router", "agents_router", 
           "logs_router", "webhooks_router", "settings_router"]
