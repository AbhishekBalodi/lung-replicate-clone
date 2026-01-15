import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MessageSquare, Users, User, Clock, Pin, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  sender: string;
  senderRole: string;
  content: string;
  time: string;
  isOwn: boolean;
}

interface Chat {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

interface Note {
  id: number;
  to: string;
  subject: string;
  content: string;
  time: string;
  isPinned: boolean;
}

const mockChats: Chat[] = [
  { id: 1, name: "Nurse Priya", role: "Nurse", lastMessage: "Patient in Room 5 needs attention", time: "2 min ago", unread: 2 },
  { id: 2, name: "Dr. Amit Verma", role: "Doctor", lastMessage: "Can you review the case file?", time: "15 min ago", unread: 0 },
  { id: 3, name: "Reception", role: "Staff", lastMessage: "New walk-in patient waiting", time: "1 hour ago", unread: 1 },
  { id: 4, name: "Lab Team", role: "Lab", lastMessage: "Reports ready for Rahul Sharma", time: "2 hours ago", unread: 0 },
];

const mockMessages: Message[] = [
  { id: 1, sender: "Nurse Priya", senderRole: "Nurse", content: "Doctor, the patient in Room 5 is complaining of severe headache.", time: "10:30 AM", isOwn: false },
  { id: 2, sender: "You", senderRole: "Doctor", content: "Please check vitals and administer Paracetamol 500mg. I'll be there in 10 minutes.", time: "10:32 AM", isOwn: true },
  { id: 3, sender: "Nurse Priya", senderRole: "Nurse", content: "BP is 140/90. Pulse 82. Temperature normal.", time: "10:35 AM", isOwn: false },
  { id: 4, sender: "You", senderRole: "Doctor", content: "Monitor for 15 minutes. If BP doesn't come down, prepare for ECG.", time: "10:36 AM", isOwn: true },
  { id: 5, sender: "Nurse Priya", senderRole: "Nurse", content: "Patient in Room 5 needs attention", time: "10:45 AM", isOwn: false },
];

const mockNotes: Note[] = [
  { id: 1, to: "Nursing Staff", subject: "Morning Rounds", content: "Please prepare all patient files for morning rounds at 9 AM.", time: "Today, 8:00 AM", isPinned: true },
  { id: 2, to: "Lab Team", subject: "Urgent Test Request", content: "Priority processing needed for patient Amit Kumar - CBC and LFT.", time: "Today, 9:30 AM", isPinned: false },
  { id: 3, to: "Reception", subject: "Appointment Blocking", content: "Block my 2-3 PM slot for today. Emergency surgery.", time: "Yesterday", isPinned: false },
];

export default function Communication() {
  const [activeChat, setActiveChat] = useState<Chat | null>(mockChats[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [searchTerm, setSearchTerm] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message: Message = {
      id: messages.length + 1,
      sender: "You",
      senderRole: "Doctor",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Communication</h1>
            <p className="text-muted-foreground">Secure internal chat and staff notes</p>
          </div>
        </div>

        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Internal Chat
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4">
            <Card className="h-[600px] flex">
              {/* Chat List */}
              <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${activeChat?.id === chat.id ? 'bg-muted' : ''}`}
                        onClick={() => setActiveChat(chat)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{chat.name}</span>
                            <span className="text-xs text-muted-foreground">{chat.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                            {chat.unread > 0 && (
                              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                                {chat.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {activeChat ? (
                  <>
                    <div className="p-4 border-b flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{activeChat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{activeChat.name}</div>
                        <div className="text-xs text-muted-foreground">{activeChat.role}</div>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : ''}`}>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.isOwn
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <div className={`text-xs text-muted-foreground mt-1 ${message.isOwn ? 'text-right' : ''}`}>
                                {message.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} className="bg-emerald-600 hover:bg-emerald-700">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a conversation to start chatting
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
            <div className="grid gap-4">
              {notes.map((note) => (
                <Card key={note.id} className={note.isPinned ? 'border-emerald-300 bg-emerald-50/50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {note.isPinned && <Pin className="h-4 w-4 text-emerald-600" />}
                          <h3 className="font-medium">{note.subject}</h3>
                          <Badge variant="outline">To: {note.to}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {note.time}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Pin className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
