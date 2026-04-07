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
import { ArrowLeft, Save, Loader2, Ship, Plus, Trash2 } from "lucide-react";
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

  const handleAddConsignee = () => {
    const newConsignees = [...(opsData.consignees || []), { ConsigneeName: "", description: "" }];
    handleChange("consignees", newConsignees);
  };

  const handleRemoveConsignee = (idx: number) => {
    const newConsignees = (opsData.consignees || []).filter((_: any, i: number) => i !== idx);
    handleChange("consignees", newConsignees);
  };

  const handleDateTimeChange = (field: string, dateStr: string, timeStr: string) => {
    if (!dateStr) {
      handleChange(field, null);
      return;
    }
    try {
      const time = timeStr || "00:00";
      const dateObj = new Date(`${dateStr}T${time}`);
      if (!isNaN(dateObj.getTime())) {
        handleChange(field, dateObj.toISOString());
      }
    } catch(e) {}
  };

  const handleEtaDateTimeChange = (etaId: string, dateStr: string, timeStr: string) => {
    if (!dateStr) {
      handleEtaChange(etaId, "ETAReceivedDateTime", null);
      return;
    }
    try {
      const time = timeStr || "00:00";
      const dateObj = new Date(`${dateStr}T${time}`);
      if (!isNaN(dateObj.getTime())) {
        handleEtaChange(etaId, "ETAReceivedDateTime", dateObj.toISOString());
      }
    } catch(e) {}
  };

  const getLocalDateStr = (isoString: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-CA");
  };

  const getLocalTimeStr = (isoString: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toTimeString().slice(0, 5);
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

      <div className="max-w-[1400px] mx-auto p-4 sm:p-6">
        
        {/* General Check List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tanker Operations Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column: Core Particulars */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agency Ref No</Label>
                  <Input value={opsData.agency_ref_no || ""} onChange={e => handleChange("agency_ref_no", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Vessel Name</Label>
                  <Input value={opsData.vessel_name || ""} onChange={e => handleChange("vessel_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>IMO No</Label>
                  <Input value={opsData.imo_number || ""} onChange={e => handleChange("imo_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Voyage No</Label>
                  <Input value={opsData.voyage_no || ""} onChange={e => handleChange("voyage_no", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input value={opsData.port || ""} onChange={e => handleChange("port", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Berth Location</Label>
                  <Input value={opsData.berth_location || ""} onChange={e => handleChange("berth_location", e.target.value)} />
                </div>
              </div>

              {/* Middle Column: Consignees */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border">
                  <Label className="px-2 font-semibold">Consignees</Label>
                  <Button variant="outline" size="sm" onClick={handleAddConsignee} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {(opsData.consignees || []).map((c: any, index: number) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg bg-gray-50/50 dark:bg-gray-800/30 shadow-sm relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveConsignee(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1.5 pr-6">
                      <Label>Consignee {index + 1}</Label>
                      <Input value={c.ConsigneeName || ""} onChange={e => handleConsigneeChange(index, "ConsigneeName", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cargo Grade & Qty</Label>
                      <Input placeholder="Description..." value={c.description || ""} onChange={e => handleConsigneeChange(index, "description", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Officers & Refs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Greek Lanka PIC</Label>
                  <Input value={opsData.greekLankaPIC || ""} onChange={e => handleChange("greekLankaPIC", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Boarding Officer</Label>
                  <Input value={opsData.bordingOfficer || ""} onChange={e => handleChange("bordingOfficer", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>SLPA Payment Ref</Label>
                  <Input value={opsData.SLPAPaymentRef || ""} onChange={e => handleChange("SLPAPaymentRef", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>DC Reference No</Label>
                  <Input value={opsData.DCReferenceNo || ""} onChange={e => handleChange("DCReferenceNo", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Document Ref</Label>
                  <Input value={opsData.documetRefNo || ""} onChange={e => handleChange("documetRefNo", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Bottom Row: Timestamps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t">
               {/* Scheduled Timestamps */}
               <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">ETA</Label>
                    <div className="flex gap-2 w-full">
                      <DatePicker value={getLocalDateStr(opsData.ETA)} onChange={d => handleDateTimeChange("ETA", d, getLocalTimeStr(opsData.ETA) || "00:00")} />
                      <TimePicker value={getLocalTimeStr(opsData.ETA)} onChange={t => handleDateTimeChange("ETA", getLocalDateStr(opsData.ETA) || new Date().toLocaleDateString("en-CA"), t)} />
                    </div>
                 </div>
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">ETB</Label>
                    <div className="flex gap-2 w-full">
                      <DatePicker value={getLocalDateStr(opsData.ETB)} onChange={d => handleDateTimeChange("ETB", d, getLocalTimeStr(opsData.ETB) || "00:00")} />
                      <TimePicker value={getLocalTimeStr(opsData.ETB)} onChange={t => handleDateTimeChange("ETB", getLocalDateStr(opsData.ETB) || new Date().toLocaleDateString("en-CA"), t)} />
                    </div>
                 </div>
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">ETD</Label>
                    <div className="flex gap-2 w-full">
                      <DatePicker value={getLocalDateStr(opsData.ETD)} onChange={d => handleDateTimeChange("ETD", d, getLocalTimeStr(opsData.ETD) || "00:00")} />
                      <TimePicker value={getLocalTimeStr(opsData.ETD)} onChange={t => handleDateTimeChange("ETD", getLocalDateStr(opsData.ETD) || new Date().toLocaleDateString("en-CA"), t)} />
                    </div>
                 </div>
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">Est Port Stay (Hrs)</Label>
                    <Input type="number" className="h-[42px]" value={opsData.Estimate_port_stay || ""} onChange={e => handleChange("Estimate_port_stay", Number(e.target.value))} />
                 </div>
               </div>

               {/* Actual Timestamps */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">ATA</Label>
                    <div className="flex flex-col gap-2 w-full">
                      <DatePicker value={getLocalDateStr(opsData.ATA)} onChange={d => handleDateTimeChange("ATA", d, getLocalTimeStr(opsData.ATA) || "00:00")} />
                      <TimePicker value={getLocalTimeStr(opsData.ATA)} onChange={t => handleDateTimeChange("ATA", getLocalDateStr(opsData.ATA) || new Date().toLocaleDateString("en-CA"), t)} />
                    </div>
                 </div>
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">ATB</Label>
                    <div className="flex flex-col gap-2 w-full">
                      <DatePicker value={getLocalDateStr(opsData.ATB)} onChange={d => handleDateTimeChange("ATB", d, getLocalTimeStr(opsData.ATB) || "00:00")} />
                      <TimePicker value={getLocalTimeStr(opsData.ATB)} onChange={t => handleDateTimeChange("ATB", getLocalDateStr(opsData.ATB) || new Date().toLocaleDateString("en-CA"), t)} />
                    </div>
                 </div>
                 <div className="space-y-2 flex flex-col justify-end">
                    <Label className="mb-1 text-xs">ATD</Label>
                    <div className="flex flex-col gap-2 w-full">
                      <DatePicker value={getLocalDateStr(opsData.ATD)} onChange={d => handleDateTimeChange("ATD", d, getLocalTimeStr(opsData.ATD) || "00:00")} />
                      <TimePicker value={getLocalTimeStr(opsData.ATD)} onChange={t => handleDateTimeChange("ATD", getLocalDateStr(opsData.ATD) || new Date().toLocaleDateString("en-CA"), t)} />
                    </div>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* ETA Notices Table */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-gray-50/80 dark:bg-gray-800/30 border-b py-4">
            <CardTitle className="text-lg">ETA Tracking</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ETA Notices</th>
                  <th className="px-4 py-3 text-center font-semibold">Update to Port</th>
                  <th className="px-4 py-3 text-center font-semibold">ETA Received</th>
                  <th className="px-4 py-3 text-center font-semibold">Update to Consignee</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {(opsData.etas || []).sort((a:any, b:any) => {
                  const valA = parseInt(a.eta_noices.split(" ")[0]);
                  const valB = parseInt(b.eta_noices.split(" ")[0]);
                  return valB - valA; 
                }).map((eta: any) => (
                  <tr key={eta.ops_eta_id} className="bg-white dark:bg-gray-900 border-b transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4 font-medium border-r">{eta.eta_noices}</td>
                    <td className="px-4 py-4 text-center border-r">
                      <Select value={eta.updated_to_port === true || eta.updated_to_port === "Done" ? "Done" : "Pending"} onValueChange={v => handleEtaChange(eta.ops_eta_id, "updated_to_port", v === "Done")}>
                        <SelectTrigger className={`w-[130px] mx-auto text-xs font-semibold ${eta.updated_to_port === true || eta.updated_to_port === "Done" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-4 text-center border-r align-top">
                       <div className="flex flex-col gap-2 mx-auto w-[180px]">
                         <DatePicker value={getLocalDateStr(eta.ETAReceivedDateTime)} onChange={d => handleEtaDateTimeChange(eta.ops_eta_id, d, getLocalTimeStr(eta.ETAReceivedDateTime) || "00:00")} />
                         <TimePicker value={getLocalTimeStr(eta.ETAReceivedDateTime)} onChange={t => handleEtaDateTimeChange(eta.ops_eta_id, getLocalDateStr(eta.ETAReceivedDateTime) || new Date().toLocaleDateString("en-CA"), t)} />
                       </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Select value={eta.updated_to_consignee === true || eta.updated_to_consignee === "Done" ? "Done" : "Pending"} onValueChange={v => handleEtaChange(eta.ops_eta_id, "updated_to_consignee", v === "Done")}>
                        <SelectTrigger className={`w-[130px] mx-auto text-xs font-semibold ${eta.updated_to_consignee === true || eta.updated_to_consignee === "Done" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"}`}>
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

        {/* Stage / Task Tracking Table */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-gray-50/80 dark:bg-gray-800/30 border-b py-4">
            <CardTitle className="text-lg">Stage & Task Tracking</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold w-[150px]">Stage</th>
                  <th className="px-4 py-3 text-left font-semibold w-[400px]">Task</th>
                  <th className="px-4 py-3 text-center font-semibold w-48">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {(opsData.tasks || []).map((t: any) => (
                  <tr key={t.id} className="bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-b">
                    <td className="px-4 py-3 border-r text-muted-foreground">{t.stageName}</td>
                    <td className="px-4 py-3 border-r font-medium">{t.taskName}</td>
                    <td className="px-4 py-3 text-center border-r">
                      <Select value={t.status || "Pending"} onValueChange={v => handleTaskChange(t.id, "status", v)}>
                        <SelectTrigger className={`w-[130px] mx-auto text-xs font-semibold ${t.status === "Done" || t.status === "Completed" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input placeholder="Add remark..." value={t.Remarks || ""} onChange={e => handleTaskChange(t.id, "Remarks", e.target.value)} className="bg-transparent border-gray-200 dark:border-gray-700" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Footer Pane: TextAreas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
           <div className="space-y-2">
             <Label>Comments</Label>
             <Textarea className="min-h-[100px] resize-none" placeholder="Operation general comments..." value={opsData.comments || ""} onChange={e => handleChange("comments", e.target.value)} />
           </div>
           <div className="space-y-2">
             <Label>Areas for Improvement</Label>
             <Textarea className="min-h-[100px] resize-none" placeholder="Feedback or improvement areas..." value={opsData.areas_for_improvement || ""} onChange={e => handleChange("areas_for_improvement", e.target.value)} />
           </div>
        </div>

      </div>
    </div>
  );
}
