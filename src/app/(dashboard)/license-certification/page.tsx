"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApplications, type ApplicationDto } from "@/lib/services/application-service";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Active: { label: "Active", variant: "default" },
  Approved: { label: "Approved", variant: "default" },
  Pending: { label: "Pending", variant: "secondary" },
  Rejected: { label: "Rejected", variant: "destructive" },
  Expired: { label: "Expired", variant: "destructive" },
  Draft: { label: "Draft", variant: "outline" },
};

export default function LicenseCertificationPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Get current user's applications (certificates/licenses)
      const response = await getApplications({
        pageNumber: 1,
        pageSize: 100, // Get all for overview
      });

      if (response.success && response.data) {
        setApplications(response.data.items);
      } else {
        toast.error(response.message || "Failed to fetch certificates");
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const statusKey = status || "Pending";
    const config = statusConfig[statusKey] || statusConfig.Pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Certificates & License"
          description="Here's an overview of your seafarer profile and status"
        />
        <Button
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
          onClick={() => router.push("/license-certification/apply")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Apply for New Certificate/License
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No certificates found"
          description="You haven't applied for any certificates yet. Click the button above to get started."
          action={{
            label: "Apply for New Certificate/License",
            onClick: () => router.push("/license-certification/apply"),
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.id || app.applicationId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {app.serviceName || "Certificate"}
                  </CardTitle>
                  {getStatusBadge(
                    app.applicationStatus || app.status || "Pending",
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {(app.rn || app.id || app.applicationId) && (
                    <div>
                      <span className="text-muted-foreground">
                        Application Number:{" "}
                      </span>
                      <span className="font-medium">
                        {app.rn || `APP-${app.id || app.applicationId}`}
                      </span>
                    </div>
                  )}
                  {(app.applicationDate || app.createdAt) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created: </span>
                      <span className="font-medium">
                        {formatDate(app.applicationDate || app.createdAt || "")}
                      </span>
                    </div>
                  )}
                  {app.approvalDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Approved: </span>
                      <span className="font-medium">
                        {formatDate(app.approvalDate)}
                      </span>
                    </div>
                  )}
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
      )}
    </div>
  );
}
