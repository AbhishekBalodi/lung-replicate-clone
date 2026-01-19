import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Clock, Paperclip } from "lucide-react";


interface Message {
  id: string;
  sender: string;
  senderType: "patient" | "doctor" | "hospital";
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participant: string;
  participantType: "doctor" | "hospital";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const PatientMessages = () => {
  const [conversations] = useState<Conversation[]>([
    { id: "1", participant: "Dr. Smith", participantType: "doctor", lastMessage: "Your next appointment is confirmed for Jan 20th", lastMessageTime: "2026-01-12 10:30 AM", unreadCount: 1 },
    { id: "2", participant: "City Hospital", participantType: "hospital", lastMessage: "Your lab reports are ready for collection", lastMessageTime: "2026-01-11 03:45 PM", unreadCount: 0 },
    { id: "3", participant: "Dr. Patel", participantType: "doctor", lastMessage: "Continue the exercises as discussed", lastMessageTime: "2026-01-05 11:00 AM", unreadCount: 0 },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const [messages] = useState<Message[]>([
    { id: "1", sender: "Dr. Smith", senderType: "doctor", content: "Hello! How are you feeling after the last consultation?", timestamp: "2026-01-10 09:00 AM", read: true },
    { id: "2", sender: "You", senderType: "patient", content: "Hi Doctor, I'm feeling much better. The new medication is working well.", timestamp: "2026-01-10 09:15 AM", read: true },
    { id: "3", sender: "Dr. Smith", senderType: "doctor", content: "That's great to hear! Please continue with the prescribed dosage and let me know if you experience any side effects.", timestamp: "2026-01-10 09:30 AM", read: true },
    { id: "4", sender: "You", senderType: "patient", content: "Will do. Also, I wanted to confirm my next appointment date.", timestamp: "2026-01-11 02:00 PM", read: true },
    { id: "5", sender: "Dr. Smith", senderType: "doctor", content: "Your next appointment is confirmed for Jan 20th at 10:00 AM. See you then!", timestamp: "2026-01-12 10:30 AM", read: false },
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message to backend
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with your doctors and hospital</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 text-left hover:bg-muted transition-colors ${selectedConversation === conv.id ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{conv.participant.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{conv.participant}</span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">{conv.unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.lastMessageTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conversations.find(c => c.id === selectedConversation)?.participant.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {conversations.find(c => c.id === selectedConversation)?.participant}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {conversations.find(c => c.id === selectedConversation)?.participantType === "doctor" ? "Doctor" : "Hospital"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.senderType === "patient" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderType === "patient" 
                          ? "bg-blue-600 text-white" 
                          : "bg-muted"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderType === "patient" ? "text-blue-100" : "text-muted-foreground"
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
    </div>
  );
};

export default PatientMessages;
