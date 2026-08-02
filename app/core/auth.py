import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.core.config import settings

security = HTTPBasic()


def get_current_admin(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    is_admin_1 = (
        secrets.compare_digest(credentials.username, settings.ADMIN_1_USERNAME)
        and secrets.compare_digest(credentials.password, settings.ADMIN_1_PASSWORD)
    )
    is_admin_2 = (
        secrets.compare_digest(credentials.username, settings.ADMIN_2_USERNAME)
        and secrets.compare_digest(credentials.password, settings.ADMIN_2_PASSWORD)
    )

    if is_admin_1:
        return settings.ADMIN_1_USERNAME
    if is_admin_2:
        return settings.ADMIN_2_USERNAME

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Basic"},
    )
