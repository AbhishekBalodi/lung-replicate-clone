import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, MessageSquare, Users, Clock, Pin, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  id: number;
  sender: string;
  sender_role: string;
  content: string;
  created_at: string;
  is_own: boolean;
}

interface Chat {
  id: number;
  name: string;
  role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Note {
  id: number;
  recipient: string;
  subject: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
}

export default function Communication() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ recipient: "", subject: "", content: "" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch chats
      try {
        const chatsRes = await apiGet("/api/dashboard/communication/chats");
        if (chatsRes.ok) {
          const data = await chatsRes.json();
          setChats(data.chats || []);
        }
      } catch { /* endpoint may not exist yet */ }

      // Fetch notes
      try {
        const notesRes = await apiGet("/api/dashboard/communication/notes");
        if (notesRes.ok) {
          const data = await notesRes.json();
          setNotes(data.notes || []);
        }
      } catch { /* endpoint may not exist yet */ }
    } catch (error) {
      console.error("Error fetching communication data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchMessages = useCallback(async (chatId: number) => {
    try {
      const res = await apiGet(`/api/dashboard/communication/messages?chat_id=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const selectChat = (chat: Chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    
    try {
      const res = await apiPost("/api/dashboard/communication/messages", {
        chat_id: activeChat.id,
        content: newMessage
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
        setNewMessage("");
      }
    } catch (error) {
      // Fallback: add message locally for demo
      const message: Message = {
        id: Date.now(),
        sender: "You",
        sender_role: "Doctor",
        content: newMessage,
        created_at: new Date().toISOString(),
        is_own: true,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.subject || !noteForm.content) {
      toast.error("Subject and content are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/communication/notes", noteForm);
      if (res.ok) {
        const data = await res.json();
        toast.success("Note sent");
        setIsNoteDialogOpen(false);
        setNoteForm({ recipient: "", subject: "", content: "" });
        if (data.note) {
          setNotes(prev => [data.note, ...prev]);
        } else {
          fetchData();
        }
      }
    } catch (error) {
      toast.error("Failed to send note");
    }
  };

  const filteredChats = chats.filter(chat =>
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
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading...</div>
                    ) : filteredChats.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">No conversations yet</div>
                    ) : (
                      filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${activeChat?.id === chat.id ? 'bg-muted' : ''}`}
                          onClick={() => selectChat(chat)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{chat.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(chat.last_message_time).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate">{chat.last_message}</p>
                              {chat.unread_count > 0 && (
                                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                                  {chat.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                            className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.is_own ? 'order-2' : ''}`}>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.is_own
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <div className={`text-xs text-muted-foreground mt-1 ${message.is_own ? 'text-right' : ''}`}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a conversation to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="flex justify-end mb-4">
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Staff Note</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>To</Label>
                      <Input value={noteForm.recipient} onChange={(e) => setNoteForm({ ...noteForm, recipient: e.target.value })} placeholder="e.g., Nursing Staff, Lab Team" />
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input value={noteForm.subject} onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })} placeholder="Note subject" />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} placeholder="Note content..." rows={4} />
                    </div>
                    <Button onClick={handleAddNote} className="w-full">Send Note</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4">
              {loading ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
              ) : notes.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No notes yet</CardContent></Card>
              ) : (
                notes.map((note) => (
                  <Card key={note.id} className={note.is_pinned ? 'border-emerald-300 bg-emerald-50/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {note.is_pinned && <Pin className="h-4 w-4 text-emerald-600" />}
                            <h3 className="font-medium">{note.subject}</h3>
                            <Badge variant="outline">To: {note.recipient}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(note.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Pin className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
