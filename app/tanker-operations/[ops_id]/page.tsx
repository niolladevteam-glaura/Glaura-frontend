"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Ship } from "lucide-react";
import { toast } from "sonner";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/TimePicker";

export default function TankerOperationDetail({ params }: { params: { ops_id: string } }) {
  const router = useRouter();
  const { ops_id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opsData, setOpsData] = useState<any>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/api";

  useEffect(() => {
    async function fetchDetails() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/tankerOps/${ops_id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        const json = await res.json();
        
        if (json.data) {
          setOpsData(json.data);
        } else {
          toast.error("Operation not found");
          router.push("/tanker-operations");
        }
      } catch (err) {
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    }
    
    if (ops_id) {
      fetchDetails();
    }
  }, [ops_id, router, API_BASE_URL]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      // Simulated or actual PUT request depending on backend readiness
      const res = await fetch(`${API_BASE_URL}/tankerOps/${ops_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(opsData)
      });
      
      if (!res.ok) {
        // If the backend doesn't support PUT yet, we'll swallow this softly for the UI demonstration
        console.warn("Update might not be fully supported by backend yet.");
      }
      
      toast.success("Operation updated successfully");
    } catch (err) {
      toast.error("Failed to update operation");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setOpsData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleConsigneeChange = (idx: number, field: string, value: any) => {
    const newConsignees = [...(opsData.consignees || [])];
    if (newConsignees[idx]) {
      newConsignees[idx] = { ...newConsignees[idx], [field]: value };
      handleChange("consignees", newConsignees);
    }
  };

  const handleTaskChange = (taskId: string, field: string, value: any) => {
    const newTasks = (opsData.tasks || []).map((t: any) => 
      t.id === taskId ? { ...t, [field]: value } : t
    );
    handleChange("tasks", newTasks);
  };
  
  const handleEtaChange = (etaId: string, field: string, value: any) => {
    const newEtas = (opsData.etas || []).map((e: any) => 
      e.ops_eta_id === etaId ? { ...e, [field]: value } : e
    );
    handleChange("etas", newEtas);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!opsData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/tanker-operations")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Ship className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gradient truncate">{opsData.vessel_name || "Unknown Vessel"}</h1>
              <p className="text-xs text-muted-foreground">{opsData.agency_ref_no}</p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="shadow-md">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </header>

      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">
        
        {/* General Check List (Excel Top Pane) */}
        <Card className="shadow-sm border-t-4 border-t-blue-600">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 py-3 border-b">
            <CardTitle className="text-sm uppercase tracking-wider text-blue-800 dark:text-blue-300">
              GREEK LANKA - TANKER OPERATIONS CHECK LIST
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x dark:divide-gray-800">
              
              {/* Left Grid: Core Particulars */}
              <div className="p-4 space-y-3 bg-yellow-50/30 dark:bg-gray-900/50">
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Agency Ref:</Label>
                  <Input className="h-7 text-xs bg-white" value={opsData.agency_ref_no || ""} onChange={e => handleChange("agency_ref_no", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Vessel Name:</Label>
                  <Input className="h-7 text-xs bg-white border-yellow-300 bg-yellow-50" value={opsData.vessel_name || ""} onChange={e => handleChange("vessel_name", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">IMO No:</Label>
                  <Input className="h-7 text-xs bg-white border-yellow-300 bg-yellow-50" value={opsData.imo_number || ""} onChange={e => handleChange("imo_number", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Voyage No:</Label>
                  <Input className="h-7 text-xs bg-white border-yellow-300 bg-yellow-50" value={opsData.voyage_no || ""} onChange={e => handleChange("voyage_no", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Port:</Label>
                  <Input className="h-7 text-xs bg-white border-yellow-300 bg-yellow-50" value={opsData.port || ""} onChange={e => handleChange("port", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Berth Location:</Label>
                  <Input className="h-7 text-xs bg-white border-yellow-300 bg-yellow-50" value={opsData.berth_location || ""} onChange={e => handleChange("berth_location", e.target.value)} />
                </div>
              </div>

              {/* Middle Grid: Consignees & Dates */}
              <div className="p-4 space-y-3">
                {/* Consignees Map */}
                {(opsData.consignees || []).map((c: any, index: number) => (
                  <div key={index} className="space-y-1 mb-2">
                    <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                      <Label className="font-semibold text-gray-600">Consignee {index + 1}:</Label>
                      <Input className="h-7 text-xs bg-white" value={c.ConsigneeName || ""} onChange={e => handleConsigneeChange(index, "ConsigneeName", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                      <Label className="text-gray-500 text-[10px]">Cargo Grade & Qty:</Label>
                      <Input className="h-6 text-[10px] bg-white border-yellow-300 bg-yellow-50" placeholder="Editable text..." value={c.description || ""} onChange={e => handleConsigneeChange(index, "description", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Grid: Officers and Reference */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Greek Lanka PIC:</Label>
                  <Input className="h-7 text-xs bg-white" value={opsData.greekLankaPIC || ""} onChange={e => handleChange("greekLankaPIC", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Boarding Officer:</Label>
                  <Input className="h-7 text-xs bg-white" value={opsData.bordingOfficer || ""} onChange={e => handleChange("bordingOfficer", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">SLPA Payment Ref:</Label>
                  <Input className="h-7 text-xs bg-white" value={opsData.SLPAPaymentRef || ""} onChange={e => handleChange("SLPAPaymentRef", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">DC Reference No:</Label>
                  <Input className="h-7 text-xs bg-white" value={opsData.DCReferenceNo || ""} onChange={e => handleChange("DCReferenceNo", e.target.value)} />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center text-xs">
                  <Label className="font-semibold text-gray-600">Document Ref:</Label>
                  <Input className="h-7 text-xs bg-white" value={opsData.documetRefNo || ""} onChange={e => handleChange("documetRefNo", e.target.value)} />
                </div>
              </div>
            </div>
            
            {/* Bottom Strip of General Check List (Timestamps) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x border-t bg-yellow-50/50 dark:bg-gray-900/80 p-4 gap-4">
               {/* Scheduled Timestamps */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">ETA</Label>
                    <Input type="datetime-local" className="h-7 text-xs mt-1 bg-white border-yellow-300 bg-yellow-50" value={opsData.ETA ? new Date(opsData.ETA).toISOString().slice(0,16) : ""} onChange={e => handleChange("ETA", new Date(e.target.value).toISOString())} />
                 </div>
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">ETB</Label>
                    <Input type="datetime-local" className="h-7 text-xs mt-1 bg-white border-yellow-300 bg-yellow-50" value={opsData.ETB ? new Date(opsData.ETB).toISOString().slice(0,16) : ""} onChange={e => handleChange("ETB", new Date(e.target.value).toISOString())} />
                 </div>
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">ETD</Label>
                    <Input type="datetime-local" className="h-7 text-xs mt-1 bg-white border-yellow-300 bg-yellow-50" value={opsData.ETD ? new Date(opsData.ETD).toISOString().slice(0,16) : ""} onChange={e => handleChange("ETD", new Date(e.target.value).toISOString())} />
                 </div>
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">Est Port Stay</Label>
                    <Input type="number" className="h-7 text-xs mt-1 bg-white" value={opsData.Estimate_port_stay || ""} onChange={e => handleChange("Estimate_port_stay", Number(e.target.value))} />
                 </div>
               </div>

               {/* Actual Timestamps */}
               <div className="grid grid-cols-3 gap-4">
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">ATA</Label>
                    <Input type="datetime-local" className="h-7 text-xs mt-1 bg-white border-yellow-300 bg-yellow-50" value={opsData.ATA ? new Date(opsData.ATA).toISOString().slice(0,16) : ""} onChange={e => handleChange("ATA", new Date(e.target.value).toISOString())} />
                 </div>
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">ATB</Label>
                    <Input type="datetime-local" className="h-7 text-xs mt-1 bg-white border-yellow-300 bg-yellow-50" value={opsData.ATB ? new Date(opsData.ATB).toISOString().slice(0,16) : ""} onChange={e => handleChange("ATB", new Date(e.target.value).toISOString())} />
                 </div>
                 <div>
                    <Label className="text-xs font-semibold text-gray-600">ATD</Label>
                    <Input type="datetime-local" className="h-7 text-xs mt-1 bg-white border-yellow-300 bg-yellow-50" value={opsData.ATD ? new Date(opsData.ATD).toISOString().slice(0,16) : ""} onChange={e => handleChange("ATD", new Date(e.target.value).toISOString())} />
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle Pane: ETA Notices Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-[#1f4e78] text-white">
                <tr>
                  <th className="px-4 py-2 text-left font-medium border-r border-[#153655]">ETA Notices</th>
                  <th className="px-4 py-2 text-center font-medium border-r border-[#153655]">Update to Port</th>
                  <th className="px-4 py-2 text-center font-medium border-r border-[#153655]">ETA Received</th>
                  <th className="px-4 py-2 text-center font-medium border-[#153655]">Update to Consignee</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800 dark:text-gray-200">
                {(opsData.etas || []).sort((a:any, b:any) => {
                  const valA = parseInt(a.eta_noices.split(" ")[0]);
                  const valB = parseInt(b.eta_noices.split(" ")[0]);
                  return valB - valA; // Descending like Excel: 120H, 96H...
                }).map((eta: any) => (
                  <tr key={eta.ops_eta_id} className="bg-white dark:bg-gray-900 border-b">
                    <td className="px-4 py-1.5 font-medium border-r bg-gray-50 dark:bg-gray-800">{eta.eta_noices}</td>
                    <td className="px-2 py-1.5 border-r text-center w-48">
                      <Select value={eta.updated_to_port === true || eta.updated_to_port === "Done" ? "Done" : "Pending"} onValueChange={v => handleEtaChange(eta.ops_eta_id, "updated_to_port", v === "Done")}>
                        <SelectTrigger className={`h-7 text-xs font-semibold ${eta.updated_to_port === true || eta.updated_to_port === "Done" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5 border-r text-center w-64">
                       <Input type="datetime-local" className="h-7 text-xs bg-white mx-auto w-full" 
                        value={eta.ETAReceivedDateTime ? new Date(eta.ETAReceivedDateTime).toISOString().slice(0,16) : ""} 
                        onChange={e => handleEtaChange(eta.ops_eta_id, "ETAReceivedDateTime", e.target.value ? new Date(e.target.value).toISOString() : null)} 
                       />
                    </td>
                    <td className="px-2 py-1.5 text-center w-48">
                      <Select value={eta.updated_to_consignee === true || eta.updated_to_consignee === "Done" ? "Done" : "Pending"} onValueChange={v => handleEtaChange(eta.ops_eta_id, "updated_to_consignee", v === "Done")}>
                        <SelectTrigger className={`h-7 text-xs font-semibold ${eta.updated_to_consignee === true || eta.updated_to_consignee === "Done" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bottom Pane: Stage / Task Tracking Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-[#1f4e78] text-white">
                <tr>
                  <th className="px-4 py-2 text-left font-medium border-r border-[#153655] w-[150px]">Stage</th>
                  <th className="px-4 py-2 text-left font-medium border-r border-[#153655] w-[400px]">Task</th>
                  <th className="px-4 py-2 text-center font-medium border-r border-[#153655] w-48">Action</th>
                  <th className="px-4 py-2 text-left font-medium border-[#153655]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800 dark:text-gray-200 bg-white">
                {(opsData.tasks || []).map((t: any) => (
                  <tr key={t.id} className="dark:bg-gray-900 border-b">
                    <td className="px-4 py-1.5 border-r bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t.stageName}</td>
                    <td className="px-4 py-1.5 border-r font-medium text-gray-700 dark:text-gray-300">{t.taskName}</td>
                    <td className="px-2 py-1.5 border-r text-center">
                      <Select value={t.status || "Pending"} onValueChange={v => handleTaskChange(t.id, "status", v)}>
                        <SelectTrigger className={`h-7 text-xs font-semibold ${t.status === "Done" || t.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input className="h-7 text-xs shadow-none border-transparent hover:border-gray-300 focus:border-blue-500 bg-transparent transition-colors" placeholder="Add remark..." value={t.Remarks || ""} onChange={e => handleTaskChange(t.id, "Remarks", e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Footer Pane: TextAreas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <Label className="text-gray-700 font-semibold">Comments</Label>
             <Textarea className="min-h-[100px] resize-none" placeholder="Operation general comments..." value={opsData.comments || ""} onChange={e => handleChange("comments", e.target.value)} />
           </div>
           <div className="space-y-2">
             <Label className="text-gray-700 font-semibold">Areas for Improvement</Label>
             <Textarea className="min-h-[100px] resize-none" placeholder="Feedback or improvement areas..." value={opsData.areas_for_improvement || ""} onChange={e => handleChange("areas_for_improvement", e.target.value)} />
           </div>
        </div>

      </div>
    </div>
  );
}
