"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { MessageCircle, Send, Phone, Search, LogOut, Check, CheckCheck, ImageIcon } from "lucide-react"
import Link from "next/link"

interface WhatsAppMessage {
  id: string
  contactId: string
  contactName: string
  contactNumber: string
  message: string
  timestamp: string
  type: "sent" | "received"
  status: "sent" | "delivered" | "read"
  messageType: "text" | "image" | "document"
}

interface WhatsAppContact {
  id: string
  name: string
  number: string
  company?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline: boolean
}

export default function WhatsAppIntegration() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock WhatsApp contacts
    const mockContacts: WhatsAppContact[] = [
      {
        id: "1",
        name: "John Smith",
        number: "+94771234567",
        company: "Mediterranean Shipping",
        lastMessage: "Thanks for the update on MSC Oscar",
        lastMessageTime: "2024-01-20T10:30:00Z",
        unreadCount: 2,
        isOnline: true,
      },
      {
        id: "2",
        name: "Sarah Johnson",
        number: "+94772345678",
        company: "Maersk Line",
        lastMessage: "Can you confirm the ETA?",
        lastMessageTime: "2024-01-20T09:15:00Z",
        unreadCount: 0,
        isOnline: false,
      },
      {
        id: "3",
        name: "Mike Chen",
        number: "+94773456789",
        company: "COSCO Shipping",
        lastMessage: "Documents received",
        lastMessageTime: "2024-01-19T16:45:00Z",
        unreadCount: 1,
        isOnline: true,
      },
      {
        id: "4",
        name: "Pradeep Silva",
        number: "+94774567890",
        company: "Lanka Marine Services",
        lastMessage: "Launch boat ready for tomorrow",
        lastMessageTime: "2024-01-19T14:20:00Z",
        unreadCount: 0,
        isOnline: false,
      },
    ]

    // Mock WhatsApp messages
    const mockMessages: WhatsAppMessage[] = [
      {
        id: "1",
        contactId: "1",
        contactName: "John Smith",
        contactNumber: "+94771234567",
        message: "Hi, can you provide an update on the MSC Oscar port call?",
        timestamp: "2024-01-20T10:00:00Z",
        type: "received",
        status: "read",
        messageType: "text",
      },
      {
        id: "2",
        contactId: "1",
        contactName: "John Smith",
        contactNumber: "+94771234567",
        message: "The vessel is currently in progress. All crew changes have been completed successfully.",
        timestamp: "2024-01-20T10:15:00Z",
        type: "sent",
        status: "read",
        messageType: "text",
      },
      {
        id: "3",
        contactId: "1",
        contactName: "John Smith",
        contactNumber: "+94771234567",
        message: "Thanks for the update on MSC Oscar",
        timestamp: "2024-01-20T10:30:00Z",
        type: "received",
        status: "read",
        messageType: "text",
      },
    ]

    setContacts(mockContacts)
    setMessages(mockMessages)
    setSelectedContact(mockContacts[0])
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const sendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const message: WhatsAppMessage = {
        id: Date.now().toString(),
        contactId: selectedContact.id,
        contactName: selectedContact.name,
        contactNumber: selectedContact.number,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: "sent",
        status: "sent",
        messageType: "text",
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Update contact's last message
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString(),
              }
            : contact,
        ),
      )
    }
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.number.includes(searchTerm) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const selectedContactMessages = messages.filter((msg) => msg.contactId === selectedContact?.id)

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-green-600 p-2 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">WhatsApp Business</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Integrated messaging platform</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Contacts Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedContact?.id === contact.id ? "bg-blue-50 dark:bg-blue-900" : ""
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{contact.name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(contact.lastMessageTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.number}</p>
                    {contact.company && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{contact.company}</p>
                    )}
                    {contact.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{contact.lastMessage}</p>
                    )}
                  </div>
                  {contact.unreadCount > 0 && (
                    <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {contact.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedContact.number} • {selectedContact.isOnline ? "Online" : "Last seen recently"}
                    </p>
                    {selectedContact.company && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{selectedContact.company}</p>
                    )}
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {selectedContactMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "sent"
                          ? "bg-green-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.type === "sent" && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                  </div>
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a conversation</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
