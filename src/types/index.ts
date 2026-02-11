export enum UserRole {
    CLIENT = 'Client',
    DEVELOPER = 'Developer',
    ADMIN = 'Admin'
}

export enum ProjectStatus {
    PENDING = 'Pending',
    OPEN = 'Open',
    IN_PROGRESS = 'In Progress',
    REVIEW = 'Review',
    COMPLETED = 'Completed',
    REJECTED = 'Rejected'
}

export enum TaskStatus {
    ASSIGNED = 'Assigned',
    IN_PROGRESS = 'In Progress',
    READY_FOR_REVIEW = 'Ready For Review',
    COMPLETED = 'Completed',
    CHANGES_REQUESTED = 'Changes Requested'
}

export interface User {
    id: string; // UUID
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface Profile {
    id: string; // UUID
    username: string; // Flattened from user
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    skills?: string;
    experience?: string;
    portfolio?: string;
    github_link?: string;
    is_approved: boolean;
    phone?: string;
    created_at: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    service_type: string;
    budget?: string; // Decimal comes as string from API usually
    deadline?: string;
    status: ProjectStatus;
    client: string; // UUID
    client_name: string;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    project: number;
    project_title: string;
    assigned_to: string; // UUID
    assigned_to_name: string;
    budget: string;
    deadline: string;
    status: TaskStatus;
    submission_git_link?: string;
    submission_notes?: string;
    created_at: string;
}

export interface Message {
    id: number;
    sender: string; // UUID
    sender_name: string;
    receiver: string; // UUID
    receiver_name: string;
    content: string;
    created_at: string;
}

export interface Payment {
    id: number;
    payer: string; // UUID
    payer_name: string;
    payee?: string; // UUID
    payee_name?: string;
    amount: string;
    payment_type: 'Incoming' | 'Payout';
    status: 'Pending' | 'Paid' | 'Failed';
    created_at: string;
}
export interface ProjectApplication {
    id: number;
    project: number;
    project_title: string;
    developer: string; // UUID
    developer_name: string;
    cover_letter?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
}
