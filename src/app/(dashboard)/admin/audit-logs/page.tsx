"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared";
import { formatDateTime } from "@/lib/utils";
import {
  getAdminAuditLogs,
  type AuditLogAdminDto,
  type AuditLogsAdminFilters,
} from "@/lib/services/audit-log-service";
import { toast } from "sonner";
import { ScrollText, CheckCircle, XCircle, Search, Filter } from "lucide-react";

const PAGE_SIZE = 25;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogAdminDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogsAdminFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [userIdInput, setUserIdInput] = useState("");
  const [entityTypeInput, setEntityTypeInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [successFilter, setSuccessFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminAuditLogs({
        ...filters,
        page,
        pageSize: PAGE_SIZE,
      });
      const ok = response.success ?? (response as { success?: boolean }).success;
      if (ok && response.data) {
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

  const applyFilters = () => {
    setFilters({
      ...filters,
      userId: userIdInput.trim() || undefined,
      entityType: entityTypeInput.trim() || undefined,
      action: actionInput.trim() || undefined,
      fromDate: fromDateInput || undefined,
      toDate: toDateInput || undefined,
      success:
        successFilter === "all"
          ? undefined
          : successFilter === "true"
            ? true
            : false,
    });
    setPage(1);
  };

  const clearFilters = () => {
    setUserIdInput("");
    setEntityTypeInput("");
    setActionInput("");
    setFromDateInput("");
    setToDateInput("");
    setSuccessFilter("all");
    setFilters({ page: 1, pageSize: PAGE_SIZE });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="View system-wide audit logs (all users). Filter by user, entity, action, and date."
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide filters" : "Show filters"}
            </Button>
            {showFilters && (
              <>
                <Input
                  placeholder="User ID (UUID)"
                  className="w-48"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                />
                <Input
                  placeholder="Entity type"
                  className="w-40"
                  value={entityTypeInput}
                  onChange={(e) => setEntityTypeInput(e.target.value)}
                />
                <Input
                  placeholder="Action"
                  className="w-32"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  placeholder="From date"
                  className="w-48"
                  value={fromDateInput}
                  onChange={(e) => setFromDateInput(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  placeholder="To date"
                  className="w-48"
                  value={toDateInput}
                  onChange={(e) => setToDateInput(e.target.value)}
                />
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={successFilter}
                  onChange={(e) => setSuccessFilter(e.target.value)}
                >
                  <option value="all">All status</option>
                  <option value="true">Success only</option>
                  <option value="false">Failed only</option>
                </select>
                <Button size="sm" onClick={applyFilters}>
                  <Search className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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
                Try adjusting filters or check back later
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Time</th>
                    <th className="text-left py-3 px-2 font-medium">User ID</th>
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
                      <td
                        className="py-3 px-2 font-mono text-xs truncate max-w-[120px]"
                        title={log.userId}
                      >
                        {log.userId ?? "—"}
                      </td>
                      <td className="py-3 px-2">
                        {log.action ?? log.httpMethod ?? "—"}
                      </td>
                      <td className="py-3 px-2">
                        {log.entityType ?? log.auditType ?? "—"}
                      </td>
                      <td
                        className="py-3 px-2 max-w-[240px] truncate"
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
              <span className="text-sm text-muted-foreground">
                Page {page}
                {logs.length >= PAGE_SIZE && " (more available)"}
              </span>
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
