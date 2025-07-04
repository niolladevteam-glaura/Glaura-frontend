"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  MessageCircle,
  Send,
  Phone,
  Search,
  LogOut,
  Check,
  CheckCheck,
  ImageIcon,
  Mic,
} from "lucide-react";
import Link from "next/link";

interface WhatsAppMessage {
  id: string;
  contactId: string;
  contactName: string;
  contactNumber: string;
  message: string;
  timestamp: string;
  type: "sent" | "received";
  status: "sent" | "delivered" | "read";
  messageType: "text" | "image" | "document";
}

interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  company?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function WhatsAppIntegration() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedContact, setSelectedContact] =
    useState<WhatsAppContact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

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
    ];

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
        message:
          "The vessel is currently in progress. All crew changes have been completed successfully.",
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
    ];

    setContacts(mockContacts);
    setMessages(mockMessages);
    setSelectedContact(mockContacts[0]);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

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
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      // Update contact's last message
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString(),
              }
            : contact
        )
      );
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.number.includes(searchTerm) ||
      (contact.company &&
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedContactMessages = messages.filter(
    (msg) => msg.contactId === selectedContact?.id
  );

  if (!currentUser) {
    return <div>Loading...</div>;
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    GL Chat
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    GLAURA Messaging Platform
                  </p>
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
        <iframe
          src="https://http://gl-chat-demo.niolla.lk"
          className="w-full h-[calc(100vh-80px)]"
          frameBorder="0"
        />
      </header>
    </div>
  );
}
