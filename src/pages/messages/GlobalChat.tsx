import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Message } from '@/types';
import { Send } from 'lucide-react';

interface Conversation {
    user_id: number;
    username: string;
    last_message: string;
    timestamp: string;
}

const GlobalChat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activePartnerId, setActivePartnerId] = useState<number | null>(null);
    const [activePartnerName, setActivePartnerName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Conversations
    const fetchConversations = async () => {
        try {
            const response = await api.get('/messages/conversations/');
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to fetch conversations");
        }
    };

    // Fetch Messages for active chat
    const fetchMessages = async (partnerId: number) => {
        try {
            const response = await api.get(`/messages/?user_id=${partnerId}`);
            setMessages(response.data);
            scrollToBottom();
        } catch (error) {
            toast.error("Failed to load chat");
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        fetchConversations();
        // Auto-refresh conversations periodically
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // Ensure Admin is always available to chat for non-admins
    useEffect(() => {
        const ensureAdminContact = async () => {
            if (user?.role === 'Admin') return; // Admin doesn't need to chat with themselves (or maybe they do to test?)

            try {
                // Fetch admin details
                const response = await api.get('/users/admin_contact/');
                const adminProfile = response.data;
                const adminId = adminProfile.user.id;

                // Check if admin is already in conversations
                const adminInConvo = conversations.find(c => c.user_id === adminId);

                if (!adminInConvo) {
                    // Add Admin to the TOP of the list
                    const adminConversation: Conversation = {
                        user_id: adminId,
                        username: "Support (Admin)",
                        last_message: "Start a new conversation",
                        timestamp: new Date().toISOString()
                    };
                    setConversations(prev => [adminConversation, ...prev]);

                    // If no active chat, select Admin
                    if (!activePartnerId) {
                        setActivePartnerId(adminId);
                        setActivePartnerName("Support (Admin)");
                    }
                }
            } catch (error) {
                console.error("Could not fetch admin contact", error);
            }
        };

        if (user && conversations.length === 0) { // Only force adding if list is empty or check logic inside
            ensureAdminContact();
        } else if (user && conversations.length > 0) {
            // We could still add it if missing, but let's prioritize empty state fix first
            ensureAdminContact();
        }

    }, [user, conversations.length]); // Dep on length to retry if list loads and admin is missing

    useEffect(() => {
        if (activePartnerId) {
            fetchMessages(activePartnerId);
            // Set up polling interval for real-time-ish feel
            const interval = setInterval(() => fetchMessages(activePartnerId), 5000);
            return () => clearInterval(interval);
        }
    }, [activePartnerId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activePartnerId) return;

        try {
            await api.post('/messages/', {
                receiver: activePartnerId,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages(activePartnerId);
            fetchConversations(); // Update last message preview
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleSelectConversation = (conv: Conversation) => {
        setActivePartnerId(conv.user_id);
        setActivePartnerName(conv.username);
    };

    // If Client/Dev, maybe we want to allow starting a chat with Admin even if no conversation exists?
    // For simplicity, let's assume they initiate via a "Contact Admin" button elsewhere or we pre-seed conversations.
    // OR add a "New Chat" button searching for users.
    // For now, let's allow finding Admin easily.

    return (
        <div className="flex h-[calc(100vh-100px)] p-6 gap-6 max-w-7xl mx-auto">
            {/* Sidebar: Conversations */}
            <Card className="w-1/3 min-w-[300px] flex flex-col">
                <CardHeader>
                    <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-2 p-4">
                            {conversations.length === 0 ? (
                                <p className="text-gray-500 text-center text-sm">No conversations yet.</p>
                            ) : (
                                conversations.map(conv => (
                                    <div
                                        key={conv.user_id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activePartnerId === conv.user_id ? 'bg-primary/10' : 'hover:bg-gray-100'}`}
                                    >
                                        <Avatar>
                                            <AvatarFallback>{conv.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <h3 className="font-semibold text-sm">{conv.username}</h3>
                                            <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="flex-1 flex flex-col">
                {activePartnerId ? (
                    <>
                        <CardHeader className="border-b py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{activePartnerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {activePartnerName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 overflow-hidden bg-slate-50 relative">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4">
                                    {messages.map(msg => {
                                        const isMe = msg.sender === user?.user?.id || (user?.id && msg.sender === user.id) || false; // Check user ID structure
                                        // Wait, user object structure in AuthContext is { user: {id, username..}, .. } or just {id, username}?
                                        // Let's check AuthContext. It seems user is Profile which has nested user? No, AuthContext usually stores User/Profile combination.
                                        // Checking types/index.ts: Profile has `user: User`. AuthContext usually returns Profile.
                                        // So `user?.user.id` is correct.
                                        const isMyMessage = msg.sender === user?.user.id;

                                        return (
                                            <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-lg p-3 ${isMyMessage ? 'bg-primary text-white' : 'bg-white border text-gray-800'
                                                    }`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <span className={`text-[10px] block mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <div className="p-4 border-t bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default GlobalChat;
