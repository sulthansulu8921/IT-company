import os
import django
import sys
import json
from django.db.models import Q

sys.path.append('/Users/sulthanshafeer/Desktop/startup/backend/server')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from api.models import ProjectApplication, UserRole, Project, Task, Payment, Profile
from api.serializers import ProjectApplicationSerializer, ProjectSerializer, TaskSerializer, PaymentSerializer
from django.contrib.auth.models import User

# Test ALL data for serialization issues
try:
    print("\n--- Testing All Data ---")
    
    all_projects = Project.objects.all()
    print(f"Total Projects: {all_projects.count()}")
    for p in all_projects:
        print(f"Project: {p.title}, Status: {p.status}, Client: {p.client.username}")
        try:
            print(ProjectSerializer(p).data)
        except Exception as e:
            print(f"ERROR serializing Project {p.id}: {e}")

    all_tasks = Task.objects.all()
    print(f"Total Tasks: {all_tasks.count()}")
    for t in all_tasks:
        print(f"Task: {t.title}, Status: {t.status}, Assigned: {t.assigned_to.username if t.assigned_to else 'None'}")
        try:
             print(TaskSerializer(t).data)
        except Exception as e:
             print(f"ERROR serializing Task {t.id}: {e}")

    # ... applications and payments are 0 so skip printing details for them
    print("--- End Test ---")

except Exception as e:
    print(f"Global FAILED: {e}")
    import traceback
    traceback.print_exc()
