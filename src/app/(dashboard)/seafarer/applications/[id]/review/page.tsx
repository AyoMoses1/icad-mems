"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Check,
  X,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function DocumentVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("documents");
  const [note, setNote] = useState("");

  const documents = [
    {
      id: "1",
      name: "Passport",
      status: "verified",
      verifiedBy: "Registrar John",
      date: "15 Jan 2024",
    },
    {
      id: "2",
      name: "Training Certificate - STCW",
      status: "verified",
      verifiedBy: "Registrar John",
      date: "15 Jan 2024",
    },
    {
      id: "3",
      name: "Medical Certificate",
      status: "verified",
      verifiedBy: "Registrar John",
      date: "15 Jan 2024",
    },
    {
      id: "4",
      name: "Sea Service Record",
      status: "pending",
      verifiedBy: "N/A",
      date: "N/A",
    },
    {
      id: "5",
      name: "Exam Results",
      status: "pending",
      verifiedBy: "N/A",
      date: "N/A",
    },
    {
      id: "6",
      name: "Payment Receipt",
      status: "pending",
      verifiedBy: "N/A",
      date: "N/A",
    },
    {
      id: "7",
      name: "Previous CoC (if renewal)",
      status: "not-uploaded",
      verifiedBy: "N/A",
      date: "N/A",
    },
    {
      id: "8",
      name: "Passport Photo",
      status: "not-uploaded",
      verifiedBy: "N/A",
      date: "N/A",
    },
  ];

  const verificationHistory = [
    {
      id: "1",
      action: "Document verified: Passport",
      officer: "Officer Musa",
      time: "2 hours ago",
    },
    {
      id: "2",
      action: "Document verified: Training Certificate",
      officer: "Officer Musa",
      time: "2 hours ago",
    },
    {
      id: "3",
      action: "Application assigned",
      officer: "Officer Musa",
      time: "2 hours ago",
    },
    {
      id: "4",
      action: "Application submitted",
      officer: "Officer Musa",
      time: "2 hours ago",
    },
  ];

  const notes = [
    {
      id: "1",
      content: "Sea service record needs to be verified with shipping company.",
      author: "Officer Musa",
      time: "1 day ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="info" className="gap-1">
            Pending
          </Badge>
        );
      case "not-uploaded":
        return (
          <span className="text-sm text-muted-foreground">not uploaded</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Document Verification - John Doe
            </h1>
            <p className="text-sm text-muted-foreground">
              Application: VRF-2024-003 | Type: New Certificate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Reject Application
          </Button>
          <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve & Pass
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">Verification History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Checkbox />
                        <div className="flex-1">
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div>{getStatusBadge(doc.status)}</div>
                            <span className="text-sm text-muted-foreground">
                              Verified by: {doc.verifiedBy}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {doc.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {doc.status === "not-uploaded" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing 1-20 of 40 Users</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {verificationHistory.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.officer} • {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter full address"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
                  Add Note
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                {notes.map((noteItem) => (
                  <div key={noteItem.id} className="p-4 rounded-lg border">
                    <p className="text-sm">{noteItem.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {noteItem.author} • {noteItem.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}





