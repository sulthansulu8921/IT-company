from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- Enums ---
class UserRole(models.TextChoices):
    CLIENT = 'Client', 'Client'
    DEVELOPER = 'Developer', 'Developer'
    ADMIN = 'Admin', 'Admin'

class ProjectStatus(models.TextChoices):
    PENDING = 'Pending', 'Pending'
    OPEN = 'Open', 'Open'  # Approved by Admin, visible to Developers
    IN_PROGRESS = 'In Progress', 'In Progress'
    REVIEW = 'Review', 'Review'
    COMPLETED = 'Completed', 'Completed'
    REJECTED = 'Rejected', 'Rejected'

class TaskStatus(models.TextChoices):
    ASSIGNED = 'Assigned', 'Assigned'
    IN_PROGRESS = 'In Progress', 'In Progress'
    READY_FOR_REVIEW = 'Ready For Review', 'Ready For Review'
    COMPLETED = 'Completed', 'Completed'
    CHANGES_REQUESTED = 'Changes Requested', 'Changes Requested'

class PaymentStatus(models.TextChoices):
    PENDING = 'Pending', 'Pending'
    PAID = 'Paid', 'Paid'
    FAILED = 'Failed', 'Failed'

# --- Profile Model ---
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.CLIENT)
    
    # Developer specific
    skills = models.TextField(blank=True, null=True, help_text="Comma separated skills")
    experience = models.TextField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    github_link = models.URLField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)  # Admin approval for developers
    
    # Common
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class ServiceType(models.TextChoices):
    LOGO_BRANDING = 'Logo & Branding', 'Logo & Branding'
    POSTER_DESIGN = 'Poster / Banner Design', 'Poster / Banner Design'
    WEBSITE_DEV = 'Website Development', 'Website Development'
    WEB_APP = 'Web Application', 'Web Application'
    MOBILE_APP = 'Mobile App', 'Mobile App'
    DIGITAL_MARKETING = 'Digital Marketing', 'Digital Marketing'
    SEO = 'SEO', 'SEO'
    MAINTENANCE = 'Maintenance & Support', 'Maintenance & Support'
    HOSTING = 'Hosting & Deployment', 'Hosting & Deployment'

# --- Project Model (Client Request) ---
class Project(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    service_type = models.CharField(max_length=100, choices=ServiceType.choices)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=ProjectStatus.choices, default=ProjectStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.status})"


# --- Task Model (Admin assigns to Developer) ---
class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2, help_text="Payment amount for this task")
    deadline = models.DateField()
    status = models.CharField(max_length=50, choices=TaskStatus.choices, default=TaskStatus.ASSIGNED)
    
    # Submission
    submission_git_link = models.URLField(blank=True, null=True)
    submission_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.assigned_to.username if self.assigned_to else 'Unassigned'}"

class ProjectApplication(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='applications')
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending') # Pending, Approved, Rejected
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.developer.username} applied for {self.project.title}"

# --- Message Model (Chat) ---
class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender} to {self.receiver} at {self.created_at}"

# --- Payment Model (WMT) ---
class Payment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made') # Client or Admin (for payout)
    payee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_received', null=True) # Admin or Developer
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=50, default='Incoming') # Incoming (Client->Admin), Payout (Admin->Dev)
    status = models.CharField(max_length=50, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} - {self.payment_type} ({self.status})"

# --- Signals to create Profile automatically ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

