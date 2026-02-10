from rest_framework import viewsets, permissions, status, generics, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Profile, Project, Task, Message, Payment, UserRole, ProjectApplication, ProjectStatus
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer, 
    ProjectSerializer, TaskSerializer, MessageSerializer, PaymentSerializer, ProjectApplicationSerializer
)
from .permissions import IsAdmin, IsClient, IsDeveloper

# --- Auth & User ---
class RegisterView(generics.CreateAPIView):
    queryset = Profile.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Register request data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"DEBUG: Register exception: {e}")
            raise e

class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile

class UserViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def admin_contact(self, request):
        admin_profile = Profile.objects.filter(role=UserRole.ADMIN).first()
        if not admin_profile:
            return Response({"detail": "No admin found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProfileSerializer(admin_profile).data)

# --- ViewSets ---
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role == UserRole.ADMIN:
            return Project.objects.all()
        elif user.profile.role == UserRole.CLIENT:
            return Project.objects.filter(client=user)
        elif user.profile.role == UserRole.DEVELOPER:
            # Allow developers to see OPEN projects in market OR projects they are working on
            return Project.objects.filter(
                Q(tasks__assigned_to=user) | Q(status=ProjectStatus.OPEN) | Q(status=ProjectStatus.IN_PROGRESS)
            ).distinct()
        return Project.objects.none()

    def perform_create(self, serializer):
        if self.request.user.profile.role != UserRole.CLIENT:
            raise permissions.PermissionDenied("Only Clients can create projects.")
        serializer.save(client=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role == UserRole.ADMIN:
            return Task.objects.all()
        elif user.profile.role == UserRole.DEVELOPER:
            return Task.objects.filter(assigned_to=user)
        elif user.profile.role == UserRole.CLIENT:
             # Tasks belonging to projects owned by the client
            return Task.objects.filter(project__client=user)
        return Task.objects.none()

    def perform_create(self, serializer):
        if self.request.user.profile.role != UserRole.ADMIN:
            raise permissions.PermissionDenied("Only Admin can create tasks.")
        serializer.save()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('created_at')
        
        # Filter for specific conversation
        other_user_id = self.request.query_params.get('user_id')
        if other_user_id:
            queryset = queryset.filter(Q(sender_id=other_user_id) | Q(receiver_id=other_user_id))
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        user = request.user
        # Get all messages involving this user
        messages = Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-created_at')
        
        # Find unique users interacted with
        conversation_partners = set()
        conversations_data = []
        
        for msg in messages:
            partner = msg.receiver if msg.sender == user else msg.sender
            if partner.id not in conversation_partners:
                conversation_partners.add(partner.id)
                conversations_data.append({
                    'user_id': partner.id,
                    'username': partner.username,
                    'last_message': msg.content,
                    'timestamp': msg.created_at,
                    'is_read': msg.is_read or msg.sender == user # Considered read if I sent it
                })
        
        return Response(conversations_data)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role == UserRole.ADMIN:
            return Payment.objects.all()
        # Clients see their payments, Devs see their payouts
        return Payment.objects.filter(Q(payer=user) | Q(payee=user))

# --- Admin Dashboard Stats ---
class AdminDashboardView(generics.GenericAPIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "total_clients": Profile.objects.filter(role=UserRole.CLIENT).count(),
            "total_developers": Profile.objects.filter(role=UserRole.DEVELOPER).count(),
            "pending_projects": Project.objects.filter(status="Pending").count(),
            "completed_projects": Project.objects.filter(status="Completed").count(),
        })

# --- Developer Dashboard ---
class DeveloperDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated] # Should be IsDeveloper but IsAuthenticated is safe enough for now as we filter data

    def get(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
             return Response({"error": "Profile not found"}, status=400)

        # Available Projects (Marketplace)
        # Show all projects that are OPEN or IN_PROGRESS
        projects = Project.objects.filter(
            Q(status=ProjectStatus.OPEN) | Q(status=ProjectStatus.IN_PROGRESS)
        ).distinct()
        
        # My Applications
        applications = ProjectApplication.objects.filter(developer=user)
        
        return Response({
            "profile": ProfileSerializer(user.profile).data,
            "developer": UserSerializer(user).data,
            "availableProjects": ProjectSerializer(projects, many=True).data,
            "myApplications": ProjectApplicationSerializer(applications, many=True).data
        })

# --- Project Applications ---
class ProjectApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role == UserRole.ADMIN:
            # Admins can filter by project_id
            project_id = self.request.query_params.get('project_id')
            if project_id:
                return ProjectApplication.objects.filter(project_id=project_id)
            return ProjectApplication.objects.all()
        elif user.profile.role == UserRole.DEVELOPER:
            return ProjectApplication.objects.filter(developer=user)
        return ProjectApplication.objects.none()

    def perform_create(self, serializer):
        if self.request.user.profile.role != UserRole.DEVELOPER:
            raise permissions.PermissionDenied("Only Developers can apply.")
        # Check if already applied
        project_id = self.request.data.get('project')
        if ProjectApplication.objects.filter(project_id=project_id, developer=self.request.user).exists():
            raise serializers.ValidationError("You have already applied for this project.")
        serializer.save(developer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        application = self.get_object()
        if application.status != 'Pending':
            return Response({"error": "Application already processed"}, status=status.HTTP_400_BAD_REQUEST)
        
        application.status = 'Approved'
        application.save()

        # Create Task for the Developer
        project = application.project
        Task.objects.create(
            project=project,
            assigned_to=application.developer,
            title=f"Development: {project.title}",
            description=f"Task generated from application. Please complete the project: {project.title}",
            budget=project.budget or 0,
            deadline=project.deadline or project.created_at.date() # Fallback
        )
        
        # Update Project Status? Maybe strictly to 'In Progress' if not already?
        # project.status = 'In Progress' # It should be already approved/In Progress for devs to see it.
        
        # Reject other applications? Optional.
        
        return Response({"status": "Application approved and Task assigned"})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'Rejected'
        application.save()
        return Response({"status": "Application rejected"})
