"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared";
import { formatDateTime } from "@/lib/utils";
import {
  getMyAuditLogs,
  type AuditLogDto,
} from "@/lib/services/audit-log-service";
import { toast } from "sonner";
import { ScrollText, CheckCircle, XCircle } from "lucide-react";

const PAGE_SIZE = 20;

export default function SeafarerAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await getMyAuditLogs(page, PAGE_SIZE);
      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        toast.error(response.message || "Failed to load audit logs");
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Audit Logs"
        description="View your account activity and audit trail"
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm mt-2">
                Your recent actions will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Time</th>
                    <th className="text-left py-3 px-2 font-medium">Action</th>
                    <th className="text-left py-3 px-2 font-medium">Type</th>
                    <th className="text-left py-3 px-2 font-medium">Details</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.auditLogId}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                        {log.timestamp ? formatDateTime(log.timestamp) : "—"}
                      </td>
                      <td className="py-3 px-2">
                        {log.action ?? log.httpMethod ?? "—"}
                      </td>
                      <td className="py-3 px-2">
                        {log.entityType ?? log.auditType ?? "—"}
                      </td>
                      <td
                        className="py-3 px-2 max-w-[280px] truncate"
                        title={log.details ?? undefined}
                      >
                        {log.details ?? log.requestPath ?? "—"}
                      </td>
                      <td className="py-3 px-2">
                        {log.success === true ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1 inline" />
                            Success
                          </Badge>
                        ) : log.success === false ? (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            <XCircle className="h-3 w-3 mr-1 inline" />
                            Failed
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && logs.length > 0 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={logs.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
