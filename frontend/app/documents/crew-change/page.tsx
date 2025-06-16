"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Download, Users, Plane } from "lucide-react"
import Link from "next/link"

interface CrewMember {
  id: string
  name: string
  nationality: string
  rank: string
  passportNo: string
  passportExpiry: string
  seamanBookNo: string
  signOnOff: "Sign On" | "Sign Off"
  date?: string
  flightNo?: string
  airport?: string
  time?: string
}

export default function CrewChangeDocument() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [vesselInfo, setVesselInfo] = useState({
    vesselName: "MSC Oscar",
    imo: "9876543",
    flag: "Panama",
    port: "Colombo",
    agent: "Greek Lanka Shipping",
  })
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([])
  const [newCrew, setNewCrew] = useState<Partial<CrewMember>>({
    signOnOff: "Sign On",
  })
  const [documentFormat, setDocumentFormat] = useState("pdf")
  const [includeLetterhead, setIncludeLetterhead] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Sample crew data
    const sampleCrew: CrewMember[] = [
      {
        id: "1",
        name: "John Smith",
        nationality: "Philippines",
        rank: "Chief Engineer",
        passportNo: "P1234567",
        passportExpiry: "2025-06-15",
        seamanBookNo: "SB789123",
        signOnOff: "Sign Off",
        date: "2024-01-15",
        flightNo: "UL308",
        airport: "Bandaranaike International",
        time: "14:30",
      },
      {
        id: "2",
        name: "Maria Santos",
        nationality: "Philippines",
        rank: "2nd Officer",
        passportNo: "P2345678",
        passportExpiry: "2025-08-20",
        seamanBookNo: "SB456789",
        signOnOff: "Sign On",
        date: "2024-01-15",
        flightNo: "UL307",
        airport: "Bandaranaike International",
        time: "16:45",
      },
    ]

    setCrewMembers(sampleCrew)
  }, [router])

  const addCrewMember = () => {
    if (newCrew.name && newCrew.nationality && newCrew.rank && newCrew.passportNo) {
      const crew: CrewMember = {
        id: Date.now().toString(),
        name: newCrew.name!,
        nationality: newCrew.nationality!,
        rank: newCrew.rank!,
        passportNo: newCrew.passportNo!,
        passportExpiry: newCrew.passportExpiry || "",
        seamanBookNo: newCrew.seamanBookNo || "",
        signOnOff: newCrew.signOnOff as "Sign On" | "Sign Off",
        date: newCrew.date,
        flightNo: newCrew.flightNo,
        airport: newCrew.airport,
        time: newCrew.time,
      }

      setCrewMembers([...crewMembers, crew])
      setNewCrew({ signOnOff: "Sign On" })
    }
  }

  const removeCrewMember = (id: string) => {
    setCrewMembers(crewMembers.filter((crew) => crew.id !== id))
  }

  const generateDocument = () => {
    const docData = {
      vessel: vesselInfo,
      crew: crewMembers,
      format: documentFormat,
      letterhead: includeLetterhead,
      generatedBy: currentUser?.name,
      generatedAt: new Date().toISOString(),
    }

    console.log("Generating crew change document:", docData)

    // Simulate document generation
    alert(
      `Crew Change Document Generated!\n\nFormat: ${documentFormat.toUpperCase()}\nLetterhead: ${includeLetterhead ? "Yes" : "No"}\nCrew Members: ${crewMembers.length}\n\nDocument will be available for download shortly.`,
    )
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Crew Change Documentation</h1>
              <p className="text-sm text-gray-500">Generate crew sign on/off letters</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {currentUser.name} - Communication Dept
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vessel Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Vessel Information</span>
                </CardTitle>
                <CardDescription>Basic vessel details for the document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vesselName">Vessel Name</Label>
                    <Input
                      id="vesselName"
                      value={vesselInfo.vesselName}
                      onChange={(e) => setVesselInfo({ ...vesselInfo, vesselName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imo">IMO Number</Label>
                    <Input
                      id="imo"
                      value={vesselInfo.imo}
                      onChange={(e) => setVesselInfo({ ...vesselInfo, imo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="flag">Flag</Label>
                    <Input
                      id="flag"
                      value={vesselInfo.flag}
                      onChange={(e) => setVesselInfo({ ...vesselInfo, flag: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={vesselInfo.port}
                      onChange={(e) => setVesselInfo({ ...vesselInfo, port: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent">Agent</Label>
                    <Input
                      id="agent"
                      value={vesselInfo.agent}
                      onChange={(e) => setVesselInfo({ ...vesselInfo, agent: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Crew Member */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Add Crew Member</span>
                </CardTitle>
                <CardDescription>Enter crew member details for sign on/off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crewName">Seafarer Name</Label>
                    <Input
                      id="crewName"
                      value={newCrew.name || ""}
                      onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={newCrew.nationality || ""}
                      onChange={(e) => setNewCrew({ ...newCrew, nationality: e.target.value })}
                      placeholder="e.g., Philippines"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rank">Rank</Label>
                    <Select
                      value={newCrew.rank || ""}
                      onValueChange={(value) => setNewCrew({ ...newCrew, rank: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Captain">Captain</SelectItem>
                        <SelectItem value="Chief Officer">Chief Officer</SelectItem>
                        <SelectItem value="2nd Officer">2nd Officer</SelectItem>
                        <SelectItem value="3rd Officer">3rd Officer</SelectItem>
                        <SelectItem value="Chief Engineer">Chief Engineer</SelectItem>
                        <SelectItem value="2nd Engineer">2nd Engineer</SelectItem>
                        <SelectItem value="3rd Engineer">3rd Engineer</SelectItem>
                        <SelectItem value="Bosun">Bosun</SelectItem>
                        <SelectItem value="AB Seaman">AB Seaman</SelectItem>
                        <SelectItem value="Ordinary Seaman">Ordinary Seaman</SelectItem>
                        <SelectItem value="Cook">Cook</SelectItem>
                        <SelectItem value="Messman">Messman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="signOnOff">Sign On/Off</Label>
                    <Select
                      value={newCrew.signOnOff || "Sign On"}
                      onValueChange={(value) => setNewCrew({ ...newCrew, signOnOff: value as "Sign On" | "Sign Off" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sign On">Sign On</SelectItem>
                        <SelectItem value="Sign Off">Sign Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passportNo">Passport Number</Label>
                    <Input
                      id="passportNo"
                      value={newCrew.passportNo || ""}
                      onChange={(e) => setNewCrew({ ...newCrew, passportNo: e.target.value })}
                      placeholder="Passport number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportExpiry">Passport Expiry</Label>
                    <Input
                      id="passportExpiry"
                      type="date"
                      value={newCrew.passportExpiry || ""}
                      onChange={(e) => setNewCrew({ ...newCrew, passportExpiry: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="seamanBookNo">Seaman's Book Number</Label>
                  <Input
                    id="seamanBookNo"
                    value={newCrew.seamanBookNo || ""}
                    onChange={(e) => setNewCrew({ ...newCrew, seamanBookNo: e.target.value })}
                    placeholder="Seaman's book number"
                  />
                </div>

                {/* Flight Details (for Sign On) */}
                {newCrew.signOnOff === "Sign On" && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Plane className="h-4 w-4" />
                      <span>Flight Details</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newCrew.date || ""}
                          onChange={(e) => setNewCrew({ ...newCrew, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newCrew.time || ""}
                          onChange={(e) => setNewCrew({ ...newCrew, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="flightNo">Flight Number</Label>
                        <Input
                          id="flightNo"
                          value={newCrew.flightNo || ""}
                          onChange={(e) => setNewCrew({ ...newCrew, flightNo: e.target.value })}
                          placeholder="e.g., UL308"
                        />
                      </div>
                      <div>
                        <Label htmlFor="airport">Airport</Label>
                        <Input
                          id="airport"
                          value={newCrew.airport || ""}
                          onChange={(e) => setNewCrew({ ...newCrew, airport: e.target.value })}
                          placeholder="e.g., Bandaranaike International"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={addCrewMember} className="w-full">
                  Add Crew Member
                </Button>
              </CardContent>
            </Card>

            {/* Crew List */}
            {crewMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Crew Members ({crewMembers.length})</CardTitle>
                  <CardDescription>Review crew members before generating document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {crewMembers.map((crew) => (
                      <div key={crew.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{crew.name}</h3>
                            <p className="text-sm text-gray-500">
                              {crew.rank} • {crew.nationality}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={crew.signOnOff === "Sign On" ? "default" : "secondary"}>
                              {crew.signOnOff}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => removeCrewMember(crew.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Passport</p>
                            <p className="font-medium">{crew.passportNo}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Expiry</p>
                            <p className="font-medium">{crew.passportExpiry || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Seaman's Book</p>
                            <p className="font-medium">{crew.seamanBookNo || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Flight</p>
                            <p className="font-medium">{crew.flightNo || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Document Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Options</CardTitle>
                <CardDescription>Configure document format and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="format">Document Format</Label>
                  <Select value={documentFormat} onValueChange={setDocumentFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="word">Microsoft Word</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="letterhead"
                    checked={includeLetterhead}
                    onChange={(e) => setIncludeLetterhead(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="letterhead">Include Company Letterhead</Label>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Document Preview</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Vessel:</span>
                      <span className="font-medium">{vesselInfo.vesselName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Port:</span>
                      <span className="font-medium">{vesselInfo.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crew Members:</span>
                      <span className="font-medium">{crewMembers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sign On:</span>
                      <span className="font-medium">{crewMembers.filter((c) => c.signOnOff === "Sign On").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sign Off:</span>
                      <span className="font-medium">
                        {crewMembers.filter((c) => c.signOnOff === "Sign Off").length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={generateDocument}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={crewMembers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Document
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Load from Previous
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
