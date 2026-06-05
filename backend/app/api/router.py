from fastapi import APIRouter
from app.api.routes import auth, transactions, goals, profile, advisor, projections, import_routes

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(transactions.router)
api_router.include_router(goals.router)
api_router.include_router(profile.router)
api_router.include_router(advisor.router)
api_router.include_router(projections.router)
api_router.include_router(import_routes.router)
