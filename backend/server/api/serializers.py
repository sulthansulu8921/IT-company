from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Project, Task, Message, Payment, UserRole, ProjectApplication

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.CLIENT)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role', UserRole.CLIENT)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Profile is created by signal, update it
        profile = user.profile
        profile.role = role
        profile.save()
        user.role = role
        return user

class ProjectApplicationSerializer(serializers.ModelSerializer):
    developer_name = serializers.ReadOnlyField(source='developer.username')
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = ProjectApplication
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'developer']

class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.username')
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['client', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username', default=None)
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['status', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    receiver_name = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    payer_name = serializers.ReadOnlyField(source='payer.username')
    payee_name = serializers.ReadOnlyField(source='payee.username', default=None)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status', 'created_at']
