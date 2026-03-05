"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  ArrowLeft,
  Download,
  Send,
  PenLine,
  Ship,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  getSeafarerEmployments,
  updateSeafarerEmploymentStatus,
  getShipAssignments,
  createShipAssignment,
  endShipAssignment,
  type SeafarerEmploymentDto,
  type SeafarerShipAssignmentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { getShipByImo } from "@/lib/services/imo-ship-lookup-service";
import { getAllRanks, type RankDto } from "@/lib/services/ranks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmployerContractsPage() {
  const router = useRouter();
  const [employments, setEmployments] = useState<SeafarerEmploymentDto[]>([]);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<SeafarerEmploymentDto | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRank, setFilterRank] = useState<string>("__all__");
  const [filterAcceptanceStatus, setFilterAcceptanceStatus] = useState<string>("__all__");
  const [filterContractStatus, setFilterContractStatus] = useState<string>("__all__");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAssignments, setSelectedAssignments] = useState<SeafarerShipAssignmentDto[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignVesselName, setAssignVesselName] = useState("");
  const [assignVesselIMO, setAssignVesselIMO] = useState("");
  const [assignVesselNameFromApi, setAssignVesselNameFromApi] = useState(false);
  const [assignImoLookupLoading, setAssignImoLookupLoading] = useState(false);
  const [assignJoiningPort, setAssignJoiningPort] = useState("");
  const [assignTradingArea, setAssignTradingArea] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isEndingAssignmentId, setIsEndingAssignmentId] = useState<string | null>(null);

  const loadEmployments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSeafarerEmployments({
        pageNumber,
        pageSize,
        acceptanceStatus: filterAcceptanceStatus === "__all__" ? undefined : filterAcceptanceStatus,
        contractStatus: filterContractStatus === "__all__" ? undefined : filterContractStatus,
      });
      setEmployments(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load employments";
      toast.error(msg);
      setEmployments([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, filterAcceptanceStatus, filterContractStatus]);

  const loadRanks = useCallback(async () => {
    try {
      const data = await getAllRanks();
      setRanks(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadEmployments();
  }, [loadEmployments]);

  useEffect(() => {
    loadRanks();
  }, [loadRanks]);

  const handleFilterChange = useCallback((acceptance?: string, contract?: string) => {
    if (acceptance !== undefined) setFilterAcceptanceStatus(acceptance);
    if (contract !== undefined) setFilterContractStatus(contract);
    setPageNumber(1);
  }, []);

  const filteredEmployments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employments.filter((e) => {
      const matchSearch =
        !q ||
        (e.seafarerFullName && e.seafarerFullName.toLowerCase().includes(q)) ||
        (e.seafarerRN && e.seafarerRN.toLowerCase().includes(q)) ||
        (e.rankDescription && e.rankDescription.toLowerCase().includes(q)) ||
        (e.acceptanceStatus && e.acceptanceStatus.toLowerCase().includes(q));
      const matchRank = filterRank === "__all__" || e.rankId === filterRank;
      return matchSearch && matchRank;
    });
  }, [employments, search, filterRank]);

  const handleSelect = useCallback(async (employment: SeafarerEmploymentDto) => {
    setSelected(employment);
    setSelectedAssignments([]);
    if (employment.acceptanceStatus === "Accepted" && employment.seafarerEmploymentId) {
      setIsLoadingAssignments(true);
      try {
        const list = await getShipAssignments(employment.seafarerEmploymentId);
        setSelectedAssignments(list);
      } catch {
        setSelectedAssignments([]);
      } finally {
        setIsLoadingAssignments(false);
      }
    }
  }, []);

  const handleMarkSent = useCallback(async () => {
    if (!selected) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateSeafarerEmploymentStatus(
        selected.seafarerEmploymentId,
        "Sent"
      );
      setSelected(updated);
      loadEmployments();
      toast.success("Contract marked as Sent");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [selected, loadEmployments]);

  const handleMarkSigned = useCallback(async () => {
    if (!selected) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateSeafarerEmploymentStatus(
        selected.seafarerEmploymentId,
        "Signed"
      );
      setSelected(updated);
      loadEmployments();
      toast.success("Contract marked as Signed");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [selected, loadEmployments]);

  const contractPreviewText = useMemo(() => {
    const e = selected;
    if (!e) return "Select an employment from the list to view contract details.";
    return [
      "SEAFARER EMPLOYMENT CONTRACT",
      `Employment ID: ${e.seafarerEmploymentId}`,
      `Contract status: ${e.contractStatus} · Acceptance: ${e.acceptanceStatus ?? "Pending"}`,
      "",
      "PARTIES",
      `Employer: ${e.companyLegalName ?? "—"}`,
      "",
      "SEAFARER",
      `Name: ${e.seafarerFullName ?? "—"}`,
      `RN: ${e.seafarerRN} · SIN: ${e.seafarerSIN ?? "—"}`,
      `Rank: ${e.rankDescription ?? "—"}`,
      "",
      "CONTRACT",
      `Contract type: ${e.contractType ?? "—"}`,
      `Start date: ${e.startDate ? formatDate(e.startDate) : "—"}`,
      `End date: ${e.endDate ? formatDate(e.endDate) : "—"}`,
      "Vessel: Assign after seafarer accepts (see Ship assignments).",
      "",
      "REMUNERATION",
      `Basic wage: ${e.basicWage != null ? e.basicWage : "—"} USD`,
      `Overtime rate: ${e.overtimeRate != null ? e.overtimeRate : "—"}`,
      `Leave pay: ${e.leavePay ?? "—"}`,
      `Repatriation: ${e.repatriation ?? "—"}`,
      `Insurance: ${e.insurance ?? "—"}`,
      "",
      "SPECIAL TERMS",
      e.specialTerms || "—",
    ].join("\n");
  }, [selected]);

  const handleDownloadJson = useCallback(() => {
    if (!selected) return;
    const data = {
      seafarerEmploymentId: selected.seafarerEmploymentId,
      contractStatus: selected.contractStatus,
      acceptanceStatus: selected.acceptanceStatus,
      companyLegalName: selected.companyLegalName,
      seafarerFullName: selected.seafarerFullName,
      seafarerRN: selected.seafarerRN,
      rankDescription: selected.rankDescription,
      contractType: selected.contractType,
      startDate: selected.startDate,
      endDate: selected.endDate,
      dateCreated: selected.dateCreated,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-${selected.seafarerEmploymentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded contract JSON");
  }, [selected]);

  const handleReset = useCallback(() => {
    setSelected(null);
    toast.info("Selection cleared");
  }, []);

  const openAssignDialog = useCallback(async () => {
    setAssignDialogOpen(true);
    setAssignVesselName("");
    setAssignVesselIMO("");
    setAssignVesselNameFromApi(false);
    setAssignJoiningPort("");
    setAssignTradingArea("");
    setAssignStartDate("");
    setAssignEndDate("");
    if (selected?.seafarerEmploymentId) {
      setIsLoadingAssignments(true);
      try {
        const list = await getShipAssignments(selected.seafarerEmploymentId);
        setSelectedAssignments(list);
      } catch {
        setSelectedAssignments([]);
      } finally {
        setIsLoadingAssignments(false);
      }
    }
  }, [selected?.seafarerEmploymentId]);

  const handleAssignImoLookup = useCallback(async () => {
    const imo = assignVesselIMO.trim();
    if (!imo) {
      toast.error("Enter vessel IMO first");
      return;
    }
    setAssignImoLookupLoading(true);
    try {
      const ship = await getShipByImo(imo);
      if (!ship) {
        toast.error("Vessel not found for this IMO number");
        return;
      }
      setAssignVesselName(ship.shipName);
      setAssignVesselNameFromApi(true);
      toast.success("Vessel details filled from registry");
    } catch {
      toast.error("Failed to look up vessel by IMO");
    } finally {
      setAssignImoLookupLoading(false);
    }
  }, [assignVesselIMO]);

  const closeAssignDialog = useCallback(() => {
    setAssignDialogOpen(false);
  }, []);

  const handleCreateAssignment = useCallback(async () => {
    if (!selected?.seafarerEmploymentId) return;
    setIsCreatingAssignment(true);
    try {
      await createShipAssignment(selected.seafarerEmploymentId, {
        vesselName: assignVesselName || undefined,
        vesselIMO: assignVesselIMO || undefined,
        joiningPort: assignJoiningPort || undefined,
        tradingArea: assignTradingArea || undefined,
        assignmentStartDate: assignStartDate || undefined,
        assignmentEndDate: assignEndDate || undefined,
      });
      toast.success("Seafarer assigned to ship");
      setAssignVesselName("");
      setAssignVesselIMO("");
      setAssignJoiningPort("");
      setAssignTradingArea("");
      setAssignStartDate("");
      setAssignEndDate("");
      const list = await getShipAssignments(selected.seafarerEmploymentId);
      setSelectedAssignments(list);
      loadEmployments();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create assignment failed");
    } finally {
      setIsCreatingAssignment(false);
    }
  }, [
    selected,
    assignVesselName,
    assignVesselIMO,
    assignJoiningPort,
    assignTradingArea,
    assignStartDate,
    assignEndDate,
    loadEmployments,
  ]);

  const handleEndAssignment = useCallback(
    async (assignmentId: string) => {
      setIsEndingAssignmentId(assignmentId);
      try {
        await endShipAssignment(assignmentId);
        toast.success("Assignment ended");
        if (selected?.seafarerEmploymentId) {
          const list = await getShipAssignments(selected.seafarerEmploymentId);
          setSelectedAssignments(list);
        }
        loadEmployments();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "End assignment failed");
      } finally {
        setIsEndingAssignmentId(null);
      }
    },
    [selected?.seafarerEmploymentId, loadEmployments]
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8 px-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 sm:text-3xl">
              <Ship className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              <span className="truncate">Contracts</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              View employments and update contract status (Draft → Sent → Signed).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Button variant="outline" size="sm" className="sm:size-default" onClick={handleReset}>
            <PenLine className="h-4 w-4 mr-2" />
            Clear selection
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="sm:size-default"
            onClick={handleDownloadJson}
            disabled={!selected}
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
            <Button
              size="sm"
              className="sm:size-default"
              onClick={() => router.push("/employer/employ")}
            >
              Create offer
            </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,1fr)]">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">My employments</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  Page {pageNumber} of {totalPages || 1} · {totalCount} total
                </Badge>
                <Badge variant="outline" className="text-xs font-medium">
                  {selected ? selected.seafarerFullName ?? selected.seafarerRN : "None selected"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                className="flex-1 min-w-0 sm:min-w-[220px]"
                placeholder="Search by name, RN, rank, acceptance…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                value={filterAcceptanceStatus}
                onValueChange={(v) => handleFilterChange(v, undefined)}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Acceptance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All acceptance</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterContractStatus}
                onValueChange={(v) => handleFilterChange(undefined, v)}
              >
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All contract</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Signed">Signed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRank} onValueChange={setFilterRank}>
                <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
                  <SelectValue placeholder="All ranks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All ranks</SelectItem>
                  {ranks.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.description || r.title || r.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-0">
            <div className="overflow-auto max-h-[520px] lg:max-h-[600px] rounded-lg border bg-muted/20">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Seafarer</TableHead>
                      <TableHead className="min-w-[120px]">Rank</TableHead>
                      <TableHead className="min-w-[100px]">Acceptance</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Created</TableHead>
                      <TableHead className="text-right min-w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-12"
                        >
                          No employments. Create one from the Employ Seafarer page.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployments.map((e) => {
                        const isSel = selected?.seafarerEmploymentId === e.seafarerEmploymentId;
                        return (
                          <TableRow
                            key={e.seafarerEmploymentId}
                            className={isSel ? "bg-primary/5 ring-1 ring-primary/20" : ""}
                          >
                            <TableCell>
                              <div className="font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {e.seafarerFullName ?? "—"}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {e.seafarerRN}
                              </div>
                            </TableCell>
                            <TableCell>{e.rankDescription ?? "—"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  e.acceptanceStatus === "Accepted"
                                    ? "default"
                                    : e.acceptanceStatus === "Rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {e.acceptanceStatus ?? "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  e.contractStatus === "Signed"
                                    ? "default"
                                    : e.contractStatus === "Sent"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {e.contractStatus === "Draft" && <PenLine className="h-3 w-3 mr-1" />}
                                {e.contractStatus === "Sent" && <Send className="h-3 w-3 mr-1" />}
                                {e.contractStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {e.dateCreated ? formatDate(e.dateCreated) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={isSel ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleSelect(e)}
                              >
                                {isSel ? "Selected" : "Select"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pageNumber} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= totalPages || isLoading || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col min-w-0">
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">Contract details</CardTitle>
                {selected && (
                  <Badge
                    variant={selected.contractStatus === "Signed" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {selected.contractStatus === "Draft" && <PenLine className="h-3 w-3 mr-1" />}
                    {selected.contractStatus === "Sent" && <Send className="h-3 w-3 mr-1" />}
                    {selected.contractStatus}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                Select an employment to view details and update status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {selected && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSent}
                    disabled={
                      isUpdatingStatus || selected.contractStatus !== "Draft"
                    }
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Mark as Sent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSigned}
                    disabled={
                      isUpdatingStatus || selected.contractStatus === "Signed"
                    }
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Mark as Signed
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selected?.acceptanceStatus === "Accepted" && (
            <Card className="flex flex-col min-h-0">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Ship assignments</CardTitle>
                    <CardDescription className="text-sm">
                      Vessel assignments for this employment.
                    </CardDescription>
                  </div>
                  {selected?.seafarerEmploymentId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openAssignDialog}
                    >
                      <Ship className="h-3 w-3 mr-1" />
                      Assign to ship
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingAssignments ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : selectedAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No ship assignments yet. Use <strong>Assign to ship</strong> above to add one.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedAssignments.map((a) => (
                      <li
                        key={a.seafarerShipAssignmentId}
                        className="flex items-center justify-between rounded border p-2 text-sm gap-2"
                      >
                        <span>
                          {a.vesselName ?? "—"} {a.vesselIMO ? `(${a.vesselIMO})` : ""} · {a.status}
                          {a.assignmentStartDate && ` · from ${formatDate(a.assignmentStartDate)}`}
                        </span>
                        {a.status === "Active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEndAssignment(a.seafarerShipAssignmentId)}
                            disabled={isEndingAssignmentId === a.seafarerShipAssignmentId}
                          >
                            {isEndingAssignmentId === a.seafarerShipAssignmentId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "End"
                            )}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contract preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border border-dashed border-primary/20 bg-muted/20 p-4 min-h-[200px]">
                <pre className="text-xs sm:text-sm whitespace-pre-wrap font-serif text-foreground overflow-auto max-h-[340px] lg:max-h-[400px]">
                  {contractPreviewText}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={assignDialogOpen && selected != null} onOpenChange={(open) => !open && closeAssignDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign to ship</DialogTitle>
            <DialogDescription>
              {selected && (
                <>Assign {selected.seafarerFullName ?? selected.seafarerRN} to a vessel. One active assignment per seafarer.</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vessel IMO</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. 9123456"
                      value={assignVesselIMO}
                      onChange={(e) => {
                        setAssignVesselIMO(e.target.value);
                        if (assignVesselNameFromApi) setAssignVesselNameFromApi(false);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAssignImoLookup}
                      disabled={!assignVesselIMO.trim() || assignImoLookupLoading}
                    >
                      {assignImoLookupLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Look up"
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vessel name</Label>
                  <Input
                    placeholder="e.g. MV Atlantic Star (or use Look up from IMO)"
                    value={assignVesselName}
                    onChange={(e) => setAssignVesselName(e.target.value)}
                    readOnly={assignVesselNameFromApi}
                    className={assignVesselNameFromApi ? "bg-muted" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Joining port</Label>
                  <Input
                    placeholder="e.g. Apapa, Lagos"
                    value={assignJoiningPort}
                    onChange={(e) => setAssignJoiningPort(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trading area</Label>
                  <Input
                    placeholder="e.g. West Africa"
                    value={assignTradingArea}
                    onChange={(e) => setAssignTradingArea(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Assignment start date</Label>
                  <Input
                    type="date"
                    value={assignStartDate}
                    onChange={(e) => setAssignStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Assignment end date</Label>
                  <Input
                    type="date"
                    value={assignEndDate}
                    onChange={(e) => setAssignEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateAssignment}
                disabled={isCreatingAssignment}
              >
                {isCreatingAssignment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ship className="h-4 w-4 mr-2" />
                )}
                Create assignment
              </Button>
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium">Ship assignments</p>
                {isLoadingAssignments ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : selectedAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignments yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedAssignments.map((a) => (
                      <li
                        key={a.seafarerShipAssignmentId}
                        className="flex items-center justify-between rounded border p-2 text-sm"
                      >
                        <span>
                          {a.vesselName ?? "—"} {a.vesselIMO ? `(${a.vesselIMO})` : ""} · {a.status}
                          {a.assignmentStartDate && ` · from ${formatDate(a.assignmentStartDate)}`}
                        </span>
                        {a.status === "Active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEndAssignment(a.seafarerShipAssignmentId)}
                            disabled={isEndingAssignmentId === a.seafarerShipAssignmentId}
                          >
                            {isEndingAssignmentId === a.seafarerShipAssignmentId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "End"
                            )}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeAssignDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
