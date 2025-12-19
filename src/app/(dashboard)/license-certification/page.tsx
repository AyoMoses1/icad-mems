"use client";

import { Eye, Download } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LicenseCertificationPage() {
  const certificates = [
    {
      id: "1",
      name: "STCW Basic Safety Training",
      status: "active",
      awardingBody: "Nigerian Maritime Academy",
      issuingInstitute: "NIMASA Training Institute",
      issued: "Jan 15, 2025",
      expires: "Jan 15, 2025",
    },
    {
      id: "2",
      name: "Advanced Fire Fighting",
      status: "active",
      awardingBody: "Nigerian Maritime Academy",
      issuingInstitute: "NIMASA Training Institute",
      issued: "Jan 15, 2025",
      expires: "Jan 15, 2025",
    },
    {
      id: "3",
      name: "Survival Craft and Rescue Boats",
      status: "active",
      awardingBody: "Nigerian Maritime Academy",
      issuingInstitute: "NIMASA Training Institute",
      issued: "Jan 15, 2025",
      expires: "Jan 15, 2025",
    },
    {
      id: "4",
      name: "Medical First Aid",
      status: "expired",
      awardingBody: "Nigerian Maritime Academy",
      issuingInstitute: "NIMASA Training Institute",
      issued: "Jan 15, 2025",
      expires: "Jan 15, 2025",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates & License"
        description="Here's an overview of your seafarer profile and status"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((cert) => (
          <Card key={cert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{cert.name}</CardTitle>
                {getStatusBadge(cert.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Awarding Body: </span>
                  <span className="font-medium">{cert.awardingBody}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Issuing Institute:{" "}
                  </span>
                  <span className="font-medium">{cert.issuingInstitute}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Issued: </span>
                  <span className="font-medium">{cert.issued}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires: </span>
                  <span className="font-medium">{cert.expires}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}




