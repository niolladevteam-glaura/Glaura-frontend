"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Mail,
  Send,
  Inbox,
  SendIcon as Sent,
  Plus,
  Search,
  User,
  Reply,
  Forward,
  Trash2,
  LogOut,
  Anchor,
  Bell,
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  subject: string
  content: string
  sender: string
  senderName: string
  recipient: string
  recipientName: string
  sentAt: string
  isRead: boolean
  priority: "Low" | "Medium" | "High"
  category: "General" | "Port Call" | "Emergency" | "System"
  attachments?: string[]
}

export default function InternalMessaging() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("inbox")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    category: "General" as "General" | "Port Call" | "Emergency" | "System",
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock messages data
    const mockMessages: Message[] = [
      {
        id: "1",
        subject: "Port Call Assignment - MSC Oscar",
        content:
          "You have been assigned as PIC for MSC Oscar arriving at Colombo port on January 15th. Please review the service requirements and coordinate with the crew change team.",
        sender: "sajith.madushan",
        senderName: "Sajith Madushan",
        recipient: user.username,
        recipientName: user.name,
        sentAt: "2024-01-15T09:00:00Z",
        isRead: false,
        priority: "High",
        category: "Port Call",
      },
      {
        id: "2",
        subject: "Document Approval Required",
        content:
          "The PDA for GLPC-2024-001 requires your approval before sending to the client. Please review and approve at your earliest convenience.",
        sender: "kumar.fernando",
        senderName: "Kumar Fernando",
        recipient: user.username,
        recipientName: user.name,
        sentAt: "2024-01-15T08:30:00Z",
        isRead: true,
        priority: "Medium",
        category: "General",
      },
      {
        id: "3",
        subject: "System Maintenance Notice",
        content:
          "The PortCall Pro system will undergo scheduled maintenance on January 20th from 2:00 AM to 4:00 AM. Please plan your work accordingly.",
        sender: "system",
        senderName: "System Administrator",
        recipient: "all",
        recipientName: "All Users",
        sentAt: "2024-01-14T16:00:00Z",
        isRead: true,
        priority: "Low",
        category: "System",
      },
      {
        id: "4",
        subject: "Emergency Contact Update",
        content:
          "Please update your emergency contact information in the system. This is required for all staff members by January 31st.",
        sender: "udith.kalupahana",
        senderName: "Udith Kalupahana",
        recipient: "all",
        recipientName: "All Users",
        sentAt: "2024-01-14T14:00:00Z",
        isRead: false,
        priority: "Medium",
        category: "General",
      },
    ]

    setMessages(mockMessages)
    setFilteredMessages(mockMessages.filter((m) => m.recipient === user.username || m.recipient === "all"))
  }, [router])

  useEffect(() => {
    let filtered = messages.filter(
      (m) =>
        (selectedTab === "inbox" && (m.recipient === currentUser?.username || m.recipient === "all")) ||
        (selectedTab === "sent" && m.sender === currentUser?.username),
    )

    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredMessages(filtered)
  }, [searchTerm, selectedTab, messages, currentUser])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const sendMessage = () => {
    if (newMessage.recipient && newMessage.subject && newMessage.content) {
      const message: Message = {
        id: Date.now().toString(),
        subject: newMessage.subject,
        content: newMessage.content,
        sender: currentUser.username,
        senderName: currentUser.name,
        recipient: newMessage.recipient,
        recipientName: "Recipient Name", // In real app, lookup from user database
        sentAt: new Date().toISOString(),
        isRead: false,
        priority: newMessage.priority,
        category: newMessage.category,
      }

      setMessages([...messages, message])
      setNewMessage({
        recipient: "",
        subject: "",
        content: "",
        priority: "Medium",
        category: "General",
      })
      setIsComposeOpen(false)
    }
  }

  const markAsRead = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Port Call":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Emergency":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "System":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  const unreadCount = messages.filter(
    (m) => !m.isRead && (m.recipient === currentUser.username || m.recipient === "all"),
  ).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Internal Messaging</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Team communication center</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-400" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Compose Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Compose New Message</DialogTitle>
                      <DialogDescription>Send a message to team members</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recipient">Recipient</Label>
                          <Select
                            value={newMessage.recipient}
                            onValueChange={(value) => setNewMessage({ ...newMessage, recipient: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="udith.kalupahana">Udith Kalupahana</SelectItem>
                              <SelectItem value="kumar.fernando">Kumar Fernando</SelectItem>
                              <SelectItem value="sajith.madushan">Sajith Madushan</SelectItem>
                              <SelectItem value="sewwandi.rupasinghe">Sewwandi Rupasinghe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={newMessage.priority}
                            onValueChange={(value: "Low" | "Medium" | "High") =>
                              setNewMessage({ ...newMessage, priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newMessage.category}
                          onValueChange={(value: "General" | "Port Call" | "Emergency" | "System") =>
                            setNewMessage({ ...newMessage, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Port Call">Port Call</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="System">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={newMessage.subject}
                          onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                          placeholder="Enter message subject"
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Message</Label>
                        <Textarea
                          id="content"
                          value={newMessage.content}
                          onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                          placeholder="Type your message here..."
                          rows={6}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={sendMessage}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Unread Messages</span>
                  <span className="font-medium text-red-600">{unreadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Inbox</span>
                  <span className="font-medium">
                    {messages.filter((m) => m.recipient === currentUser.username || m.recipient === "all").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sent Messages</span>
                  <span className="font-medium">
                    {messages.filter((m) => m.sender === currentUser.username).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Messages</span>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList>
                    <TabsTrigger value="inbox" className="flex items-center space-x-2">
                      <Inbox className="h-4 w-4" />
                      <span>Inbox</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs ml-1">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center space-x-2">
                      <Sent className="h-4 w-4" />
                      <span>Sent</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="inbox" className="space-y-4 mt-6">
                    <div className="space-y-3">
                      {filteredMessages.map((message) => (
                        <Card
                          key={message.id}
                          className={`hover:shadow-md transition-shadow cursor-pointer ${
                            !message.isRead ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                          }`}
                          onClick={() => {
                            setSelectedMessage(message)
                            if (!message.isRead) markAsRead(message.id)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{message.senderName}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(message.sentAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getPriorityColor(message.priority)}>{message.priority}</Badge>
                                <Badge className={getCategoryColor(message.category)}>{message.category}</Badge>
                                {!message.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                              </div>
                            </div>
                            <h3 className="font-semibold mb-2">{message.subject}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{message.content}</p>
                          </CardContent>
                        </Card>
                      ))}

                      {filteredMessages.length === 0 && (
                        <div className="text-center py-12">
                          <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No messages found
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? "Try adjusting your search criteria" : "Your inbox is empty"}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="sent" className="space-y-4 mt-6">
                    <div className="space-y-3">
                      {filteredMessages.map((message) => (
                        <Card key={message.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                  <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium">To: {message.recipientName}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(message.sentAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getPriorityColor(message.priority)}>{message.priority}</Badge>
                                <Badge className={getCategoryColor(message.category)}>{message.category}</Badge>
                              </div>
                            </div>
                            <h3 className="font-semibold mb-2">{message.subject}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{message.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                    <Badge className={getPriorityColor(selectedMessage.priority)}>{selectedMessage.priority}</Badge>
                    <Badge className={getCategoryColor(selectedMessage.category)}>{selectedMessage.category}</Badge>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">From: {selectedMessage.senderName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">To: {selectedMessage.recipientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(selectedMessage.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
