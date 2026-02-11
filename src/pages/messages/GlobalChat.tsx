import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Message, UserRole } from '@/types';
import { Send } from 'lucide-react';

interface Conversation {
    user_id: string; // UUID
    username: string;
    last_message: string;
    timestamp: string;
}

import { supabase } from "@/lib/supabase";

const GlobalChat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
    const [activePartnerName, setActivePartnerName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Conversations (group messages by partner)
    const fetchConversations = async () => {
        try {
            if (!user) return;

            // Fetch all messages where user is sender OR receiver
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, username, first_name, last_name),
                    receiver:profiles!receiver_id(id, username, first_name, last_name)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const partnerMap = new Map<string, Conversation>();

            data?.forEach((msg: any) => {
                const isSender = msg.sender_id === user.id;
                const partner = isSender ? msg.receiver : msg.sender;
                const partnerId = partner?.id;

                if (partnerId && !partnerMap.has(partnerId)) {
                    partnerMap.set(partnerId, {
                        user_id: partnerId,
                        username: partner.first_name ? `${partner.first_name} ${partner.last_name}` : partner.username,
                        last_message: msg.content,
                        timestamp: msg.created_at
                    });
                }
            });

            setConversations(Array.from(partnerMap.values()));
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    // Fetch Messages for active chat
    const fetchMessages = async (partnerId: string) => {
        try {
            if (!user) return;

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
            scrollToBottom();
        } catch (error: any) {
            toast.error("Failed to load chat: " + error.message);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Ensure Admin is always available to chat
    useEffect(() => {
        const ensureAdminContact = async () => {
            if (!user || user.role === UserRole.ADMIN) return;

            try {
                // Fetch admin details
                const { data: adminProfile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', UserRole.ADMIN)
                    .limit(1)
                    .single();

                if (error || !adminProfile) return; // No admin found

                const adminId = adminProfile.id;

                // Check if admin is already in conversations
                const adminInConvo = conversations.find(c => c.user_id === adminId);

                if (!adminInConvo) {
                    const adminConversation: Conversation = {
                        user_id: adminId,
                        username: "Support (Admin)",
                        last_message: "Start a new conversation",
                        timestamp: new Date().toISOString()
                    };
                    setConversations(prev => [adminConversation, ...prev]);

                    if (!activePartnerId) {
                        setActivePartnerId(adminId);
                        setActivePartnerName("Support (Admin)");
                    }
                }
            } catch (error) {
                console.error("Could not fetch admin contact", error);
            }
        };

        if (user && conversations.length === 0) {
            ensureAdminContact();
        } else if (user && conversations.length > 0) {
            ensureAdminContact();
        }

    }, [user, conversations.length]);

    useEffect(() => {
        if (activePartnerId) {
            fetchMessages(activePartnerId);
            const interval = setInterval(() => fetchMessages(activePartnerId), 5000);
            return () => clearInterval(interval);
        }
    }, [activePartnerId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activePartnerId || !user) return;

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: activePartnerId,
                    content: newMessage
                });

            if (error) throw error;

            setNewMessage('');
            fetchMessages(activePartnerId);
            fetchConversations();
        } catch (error: any) {
            toast.error("Failed to send message: " + error.message);
        }
    };

    const handleSelectConversation = (conv: Conversation) => {
        setActivePartnerId(conv.user_id);
        setActivePartnerName(conv.username);
    };

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
                                        const isMyMessage = msg.sender === user?.id; // Flattened check

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
