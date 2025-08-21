import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send, 
  User, 
  Minimize2, 
  Maximize2,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  message: string;
  messageType: 'text' | 'image' | 'system';
  isSupport: boolean;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface ChatRoom {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isSupport: boolean;
}

interface ChatSupportProps {
  orderId?: string;
  farmerId?: string;
}

export default function ChatSupport({ orderId, farmerId }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat rooms
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/chat/rooms'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });
  
  const chatRoomsArray = Array.isArray(chatRooms) ? chatRooms as ChatRoom[] : [];

  // Get messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', selectedRoom],
    enabled: !!selectedRoom,
    retry: false,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  const messagesArray = Array.isArray(messages) ? messages as ChatMessage[] : [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, message, isSupport }: { 
      receiverId?: string; 
      message: string; 
      isSupport: boolean; 
    }) => {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          orderId,
          message,
          isSupport,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedRoom] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Start support chat mutation
  const startSupportChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/chat/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start support chat');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedRoom(data.roomId);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms'] });
      toast({
        title: "Support Chat Started",
        description: "A support agent will assist you shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start support chat",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesArray]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const room = chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom);
    if (!room) return;

    sendMessageMutation.mutate({
      receiverId: room.isSupport ? undefined : room.participantId,
      message: newMessage.trim(),
      isSupport: room.isSupport,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Chat trigger button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg z-50"
            data-testid="chat-trigger"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <div className="flex h-full">
            
            {/* Chat rooms sidebar */}
            <div className="w-1/3 border-r bg-gray-50">
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-lg">Messages</h3>
                <Button
                  onClick={() => startSupportChatMutation.mutate()}
                  disabled={startSupportChatMutation.isPending}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700"
                  data-testid="start-support-chat"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Get Help & Support
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                {roomsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : chatRoomsArray.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a chat to get help!</p>
                  </div>
                ) : (
                  chatRoomsArray.map((room: ChatRoom) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                        selectedRoom === room.id ? 'bg-green-50 border-green-200' : ''
                      }`}
                      data-testid={`chat-room-${room.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={room.participantImage} />
                          <AvatarFallback>
                            {room.isSupport ? 'S' : room.participantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium truncate">
                              {room.isSupport ? 'Support Team' : room.participantName}
                            </h4>
                            {room.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {room.lastMessage || 'No messages yet'}
                          </p>
                          {room.lastMessageTime && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatMessageTime(room.lastMessageTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat messages area */}
            <div className="flex-1 flex flex-col">
              {selectedRoom ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b bg-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom)?.participantImage} />
                        <AvatarFallback>
                          {chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom)?.isSupport ? 'S' : 
                           chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom)?.participantName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom)?.isSupport 
                            ? 'Support Team' 
                            : chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom)?.participantName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {chatRoomsArray.find((r: ChatRoom) => r.id === selectedRoom)?.isSupport 
                            ? 'We\'re here to help!' 
                            : 'Online'}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Phone className="w-4 h-4 mr-2" />
                          Call Support
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Video className="w-4 h-4 mr-2" />
                          Video Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      </div>
                    ) : messagesArray.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messagesArray.map((message: ChatMessage) => {
                        const isOwnMessage = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={message.sender.profileImageUrl} />
                                <AvatarFallback className="text-xs">
                                  {message.sender.firstName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className={`rounded-lg px-3 py-2 ${
                                isOwnMessage 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-white border shadow-sm'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${
                                  isOwnMessage ? 'text-green-100' : 'text-gray-500'
                                }`}>
                                  {formatMessageTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                        data-testid="message-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Welcome to Chat Support</h3>
                    <p>Select a conversation or start a new one</p>
                    <p className="text-sm mt-2">Our support team is here to help!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}