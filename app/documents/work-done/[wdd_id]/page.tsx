"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, Eye } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function WorkDonePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const { wdd_id } = params as { wdd_id: string };
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchPdf() {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/documents/work-done/${wdd_id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        blobUrlRef.current = url;
      } else {
        setPdfUrl(null);
      }
      setLoading(false);
    }
    if (wdd_id) fetchPdf();
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
    // eslint-disable-next-line
  }, [wdd_id]);

  const handlePrint = () => {
    if (pdfUrl) {
      const win = window.open(pdfUrl, "_blank");
      if (win) {
        win.focus();
        win.onload = () => {
          win.print();
        };
      }
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `WorkDone-${wdd_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) return <div>Loading PDF preview...</div>;
  if (!pdfUrl) return <div>Unable to load PDF preview.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="w-full h-[700px] border rounded overflow-hidden bg-white">
            <iframe
              src={pdfUrl}
              title="Work Done Certificate PDF Preview"
              width="100%"
              height="100%"
              style={{ minHeight: 600, border: "none" }}
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(pdfUrl, "_blank")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
