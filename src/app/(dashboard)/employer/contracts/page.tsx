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
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  getSeafarerEmployments,
  updateSeafarerEmploymentStatus,
  type SeafarerEmploymentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { getAllRanks, type RankDto } from "@/lib/services/ranks";

export default function EmployerContractsPage() {
  const router = useRouter();
  const [employments, setEmployments] = useState<SeafarerEmploymentDto[]>([]);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<SeafarerEmploymentDto | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRank, setFilterRank] = useState<string>("__all__");

  const loadEmployments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSeafarerEmployments();
      setEmployments(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load employments";
      toast.error(msg);
      setEmployments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    loadRanks();
  }, [loadEmployments, loadRanks]);

  const filteredEmployments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employments.filter((e) => {
      const matchSearch =
        !q ||
        (e.seafarerFullName && e.seafarerFullName.toLowerCase().includes(q)) ||
        (e.seafarerRN && e.seafarerRN.toLowerCase().includes(q)) ||
        (e.rankDescription && e.rankDescription.toLowerCase().includes(q)) ||
        (e.vesselName && e.vesselName.toLowerCase().includes(q));
      const matchRank = filterRank === "__all__" || e.rankId === filterRank;
      return matchSearch && matchRank;
    });
  }, [employments, search, filterRank]);

  const handleSelect = useCallback((employment: SeafarerEmploymentDto) => {
    setSelected(employment);
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
      `Status: ${e.contractStatus}`,
      "",
      "PARTIES",
      `Employer: ${e.companyLegalName ?? "—"}`,
      "",
      "SEAFARER",
      `Name: ${e.seafarerFullName ?? "—"}`,
      `RN: ${e.seafarerRN} · SIN: ${e.seafarerSIN ?? "—"}`,
      `Rank: ${e.rankDescription ?? "—"}`,
      "",
      "VESSEL & CONTRACT",
      `Vessel: ${e.vesselName ?? "—"} (${e.vesselIMO ?? "—"})`,
      `Contract type: ${e.contractType ?? "—"}`,
      `Trading area: ${e.tradingArea ?? "—"}`,
      `Joining port: ${e.joiningPort ?? "—"}`,
      `Start date: ${e.startDate ? formatDate(e.startDate) : "—"}`,
      `End date: ${e.endDate ? formatDate(e.endDate) : "—"}`,
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
      companyLegalName: selected.companyLegalName,
      seafarerFullName: selected.seafarerFullName,
      seafarerRN: selected.seafarerRN,
      rankDescription: selected.rankDescription,
      vesselName: selected.vesselName,
      vesselIMO: selected.vesselIMO,
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
            Create employment
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
                  {employments.length} total
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {filteredEmployments.length} shown
                </Badge>
                <Badge variant="outline" className="text-xs font-medium">
                  {selected ? selected.seafarerFullName ?? selected.seafarerRN : "None selected"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                className="flex-1 min-w-0 sm:min-w-[220px]"
                placeholder="Search by name, RN, rank, vessel…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                      <TableHead className="min-w-[120px]">Vessel</TableHead>
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
                            <TableCell>{e.vesselName ?? "—"}</TableCell>
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
    </div>
  );
}
