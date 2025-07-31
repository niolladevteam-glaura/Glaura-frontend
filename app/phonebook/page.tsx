"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { Phone, Search, Plus, Edit, Trash2, LogOut, Anchor, Building, User, Mail, MapPin } from "lucide-react"
import Link from "next/link"

interface Contact {
  id: string
  name: string
  company?: string
  department?: string
  position?: string
  phoneNumbers: string[]
  emails: string[]
  address?: string
  category: "Client" | "Vendor" | "Internal" | "Authority" | "Other"
  notes?: string
  createdAt: string
  lastUpdated: string
}

export default function PhoneBookManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    company: "",
    department: "",
    position: "",
    phoneNumbers: [""],
    emails: [""],
    address: "",
    category: "Client",
    notes: "",
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

    // Mock contacts data
    const mockContacts: Contact[] = [
      {
        id: "1",
        name: "John Smith",
        company: "Mediterranean Shipping Company",
        department: "Operations",
        position: "Port Captain",
        phoneNumbers: ["+94771234567", "+94112345678"],
        emails: ["john.smith@msc.com", "operations@msc.com"],
        address: "World Trade Center, Colombo 01",
        category: "Client",
        notes: "Primary contact for MSC vessels",
        createdAt: "2023-01-15T10:00:00Z",
        lastUpdated: "2024-01-15T14:30:00Z",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        company: "Maersk Line",
        department: "Vessel Operations",
        position: "Operations Manager",
        phoneNumbers: ["+94772345678"],
        emails: ["sarah.johnson@maersk.com"],
        address: "Maersk House, Colombo 02",
        category: "Client",
        notes: "Handles all Maersk vessel operations",
        createdAt: "2023-02-20T09:00:00Z",
        lastUpdated: "2024-01-16T11:15:00Z",
      },
      {
        id: "3",
        name: "Pradeep Silva",
        company: "Lanka Marine Services",
        department: "Operations",
        position: "Fleet Manager",
        phoneNumbers: ["+94773456789", "+94113456789"],
        emails: ["pradeep@lankamarine.lk"],
        address: "Marine Drive, Colombo 03",
        category: "Vendor",
        notes: "Launch boat services provider",
        createdAt: "2023-03-10T16:00:00Z",
        lastUpdated: "2024-01-17T18:00:00Z",
      },
      {
        id: "4",
        name: "Nimal Fernando",
        company: "Port Clearance Experts",
        department: "Customs",
        position: "Senior Agent",
        phoneNumbers: ["+94774567890"],
        emails: ["nimal@portexperts.lk", "customs@portexperts.lk"],
        address: "Fort, Colombo 01",
        category: "Vendor",
        notes: "Customs clearance specialist",
        createdAt: "2023-04-05T12:00:00Z",
        lastUpdated: "2024-01-18T10:15:00Z",
      },
      {
        id: "5",
        name: "Sandalu Nawarathne",
        company: "Greek Lanka Shipping",
        department: "Operations",
        position: "PIC",
        phoneNumbers: ["+94775678901"],
        emails: ["sandalu@greeklanka.lk"],
        category: "Internal",
        notes: "Senior PIC for port operations",
        createdAt: "2023-01-01T08:00:00Z",
        lastUpdated: "2024-01-19T16:30:00Z",
      },
      {
        id: "6",
        name: "Port Authority Officer",
        company: "Sri Lanka Ports Authority",
        department: "Port Control",
        position: "Harbor Master",
        phoneNumbers: ["+94776789012", "+94114567890"],
        emails: ["portcontrol@slpa.lk"],
        address: "Port of Colombo",
        category: "Authority",
        notes: "Port authority contact for clearances",
        createdAt: "2023-05-12T14:00:00Z",
        lastUpdated: "2024-01-20T12:45:00Z",
      },
    ]

    setContacts(mockContacts)
    setFilteredContacts(mockContacts)
  }, [router])

  useEffect(() => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
          contact.phoneNumbers.some((phone) => phone.includes(searchTerm)) ||
          contact.emails.some((email) => email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((contact) => contact.category.toLowerCase() === categoryFilter)
    }

    setFilteredContacts(filtered)
  }, [searchTerm, categoryFilter, contacts])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const addPhoneNumber = () => {
    setNewContact((prev) => ({
      ...prev,
      phoneNumbers: [...(prev.phoneNumbers || []), ""],
    }))
  }

  const addEmail = () => {
    setNewContact((prev) => ({
      ...prev,
      emails: [...(prev.emails || []), ""],
    }))
  }

  const updatePhoneNumber = (index: number, value: string) => {
    setNewContact((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers?.map((phone, i) => (i === index ? value : phone)) || [],
    }))
  }

  const updateEmail = (index: number, value: string) => {
    setNewContact((prev) => ({
      ...prev,
      emails: prev.emails?.map((email, i) => (i === index ? value : email)) || [],
    }))
  }

  const removePhoneNumber = (index: number) => {
    setNewContact((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers?.filter((_, i) => i !== index) || [],
    }))
  }

  const removeEmail = (index: number) => {
    setNewContact((prev) => ({
      ...prev,
      emails: prev.emails?.filter((_, i) => i !== index) || [],
    }))
  }

  const saveContact = () => {
    if (newContact.name && newContact.phoneNumbers?.some((phone) => phone.trim())) {
      const contact: Contact = {
        id: editingContact?.id || Date.now().toString(),
        name: newContact.name!,
        company: newContact.company,
        department: newContact.department,
        position: newContact.position,
        phoneNumbers: newContact.phoneNumbers?.filter((phone) => phone.trim()) || [],
        emails: newContact.emails?.filter((email) => email.trim()) || [],
        address: newContact.address,
        category: newContact.category as Contact["category"],
        notes: newContact.notes,
        createdAt: editingContact?.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }

      if (editingContact) {
        setContacts((prev) => prev.map((c) => (c.id === editingContact.id ? contact : c)))
      } else {
        setContacts((prev) => [...prev, contact])
      }

      setIsAddContactOpen(false)
      setEditingContact(null)
      setNewContact({
        name: "",
        company: "",
        department: "",
        position: "",
        phoneNumbers: [""],
        emails: [""],
        address: "",
        category: "Client",
        notes: "",
      })
    }
  }

  const editContact = (contact: Contact) => {
    setEditingContact(contact)
    setNewContact(contact)
    setIsAddContactOpen(true)
  }

  const deleteContact = (contactId: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId))
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Client":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Vendor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Internal":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Authority":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

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
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Phone Book</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage contacts and phone numbers</p>
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contact Directory</span>
              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                    <DialogDescription>
                      {editingContact ? "Update contact information" : "Add a new contact to the phone book"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={newContact.name || ""}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newContact.category}
                          onValueChange={(value) =>
                            setNewContact({ ...newContact, category: value as Contact["category"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Client">Client</SelectItem>
                            <SelectItem value="Vendor">Vendor</SelectItem>
                            <SelectItem value="Internal">Internal</SelectItem>
                            <SelectItem value="Authority">Authority</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={newContact.company || ""}
                          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={newContact.department || ""}
                          onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                          placeholder="Department"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newContact.position || ""}
                        onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                        placeholder="Job position"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Phone Numbers *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addPhoneNumber}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Phone
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newContact.phoneNumbers?.map((phone, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={phone}
                              onChange={(e) => updatePhoneNumber(index, e.target.value)}
                              placeholder="+94771234567"
                            />
                            {newContact.phoneNumbers!.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePhoneNumber(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Email Addresses</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addEmail}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Email
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newContact.emails?.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={email}
                              onChange={(e) => updateEmail(index, e.target.value)}
                              placeholder="email@example.com"
                              type="email"
                            />
                            {newContact.emails!.length > 1 && (
                              <Button type="button" variant="outline" size="sm" onClick={() => removeEmail(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newContact.address || ""}
                        onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                        placeholder="Physical address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newContact.notes || ""}
                        onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                        placeholder="Additional notes"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveContact}>{editingContact ? "Update Contact" : "Add Contact"}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Manage all your business contacts in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, company, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="authority">Authority</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      {contact.position && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.position}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getCategoryColor(contact.category)}>{contact.category}</Badge>
                </div>

                {contact.company && (
                  <div className="flex items-center space-x-2 mb-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{contact.company}</p>
                      {contact.department && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{contact.department}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {contact.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{phone}</span>
                    </div>
                  ))}
                  {contact.emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{email}</span>
                    </div>
                  ))}
                  {contact.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{contact.address}</span>
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{contact.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {new Date(contact.lastUpdated).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => editContact(contact)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteContact(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredContacts.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Phone className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No contacts found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm || categoryFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "No contacts added yet"}
                  </p>
                  <Button onClick={() => setIsAddContactOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Contact
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
