from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserDetailView, AdminDashboardView, DeveloperDashboardView, UserViewSet,
    ProjectViewSet, TaskViewSet, MessageViewSet, PaymentViewSet, ProjectApplicationViewSet
)

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("tasks", TaskViewSet, basename="task")
router.register("messages", MessageViewSet, basename="message")
router.register("payments", PaymentViewSet, basename="payment")
router.register("users", UserViewSet, basename="user")
router.register("applications", ProjectApplicationViewSet, basename="application")


urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/me/", UserDetailView.as_view(), name="user_me"),
    
    # Admin
    path("admin/stats/", AdminDashboardView.as_view(), name="admin_stats"),
    path("developers/dashboard/", DeveloperDashboardView.as_view(), name="developer_dashboard"),

    # ViewSets
    path("", include(router.urls)),
]
