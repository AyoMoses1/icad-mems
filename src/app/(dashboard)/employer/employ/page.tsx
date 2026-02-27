"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  ArrowLeft,
  Loader2,
  User,
  Ship,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  searchSeafarer,
  createSeafarerEmployment,
  getSeafarerEmployments,
  createShipAssignment,
  getShipAssignments,
  endShipAssignment,
  type SeafarerSearchResultDto,
  type SeafarerEmploymentDto,
  type SeafarerShipAssignmentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { getAllRanks, type RankDto } from "@/lib/services/ranks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmploySeafarerPage() {
  const router = useRouter();
  const [identification, setIdentification] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [seafarer, setSeafarer] = useState<SeafarerSearchResultDto | null>(null);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [employments, setEmployments] = useState<SeafarerEmploymentDto[]>([]);
  const [isLoadingEmployments, setIsLoadingEmployments] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [poolSearch, setPoolSearch] = useState("");
  const [poolRankFilter, setPoolRankFilter] = useState<string>("__all__");
  const [employmentPageNumber, setEmploymentPageNumber] = useState(1);
  const employmentPageSize = 20;
  const [employmentTotalCount, setEmploymentTotalCount] = useState(0);
  const [employmentTotalPages, setEmploymentTotalPages] = useState(0);

  // Form fields for create employment (offer only; no vessel – assign to ship after seafarer accepts)
  const [rankId, setRankId] = useState("");
  const [contractType, setContractType] = useState("Fixed-term");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [basicWage, setBasicWage] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [leavePay, setLeavePay] = useState("");
  const [repatriation, setRepatriation] = useState("Employer");
  const [insurance, setInsurance] = useState("Employer");
  const [specialTerms, setSpecialTerms] = useState("");
  const [contractStatus, setContractStatus] = useState("Draft");
  const [employmentStatus, setEmploymentStatus] = useState("Active");

  // Assign to ship modal (for Accepted employments only)
  const [assignEmployment, setAssignEmployment] = useState<SeafarerEmploymentDto | null>(null);
  const [assignments, setAssignments] = useState<SeafarerShipAssignmentDto[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isEndingAssignment, setIsEndingAssignment] = useState<string | null>(null);
  const [assignVesselName, setAssignVesselName] = useState("");
  const [assignVesselIMO, setAssignVesselIMO] = useState("");
  const [assignJoiningPort, setAssignJoiningPort] = useState("");
  const [assignTradingArea, setAssignTradingArea] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");

  const loadRanks = useCallback(async () => {
    try {
      const data = await getAllRanks();
      setRanks(data);
    } catch (e) {
      console.error("Failed to load ranks", e);
      toast.error("Failed to load ranks");
    }
  }, []);

  const loadEmployments = useCallback(async () => {
    setIsLoadingEmployments(true);
    try {
      const result = await getSeafarerEmployments({
        pageNumber: employmentPageNumber,
        pageSize: employmentPageSize,
      });
      setEmployments(result.items);
      setEmploymentTotalCount(result.totalCount);
      setEmploymentTotalPages(result.totalPages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load employments";
      toast.error(msg);
      setEmployments([]);
      setEmploymentTotalCount(0);
      setEmploymentTotalPages(0);
    } finally {
      setIsLoadingEmployments(false);
    }
  }, [employmentPageNumber]);

  useEffect(() => {
    loadRanks();
    loadEmployments();
  }, [loadRanks, loadEmployments]);

  const handleSearch = useCallback(async () => {
    if (!identification.trim()) {
      toast.error("Enter Seafarer Identification Number (SIN or RN)");
      return;
    }
    setIsSearching(true);
    setSeafarer(null);
    try {
      const data = await searchSeafarer(identification.trim());
      if (data) {
        setSeafarer(data);
        setRankId(data.currentRankId || "");
        toast.success(`Found: ${data.firstName} ${data.lastName}`);
      } else {
        toast.error("Seafarer not found. Check the identification.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Search failed";
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  }, [identification]);

  const handleCreateEmployment = useCallback(async () => {
    if (!seafarer) {
      toast.error("Search and select a seafarer first");
      return;
    }
    if (!rankId) {
      toast.error("Select a rank");
      return;
    }
    setIsCreating(true);
    try {
      await createSeafarerEmployment({
        seafarerRN: seafarer.rn,
        rankId,
        contractType: contractType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        basicWage: basicWage ? parseFloat(basicWage) : undefined,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        leavePay: leavePay || undefined,
        repatriation: repatriation || undefined,
        insurance: insurance || undefined,
        specialTerms: specialTerms || undefined,
        contractStatus: contractStatus || "Draft",
        employmentStatus: employmentStatus || undefined,
      });
      toast.success("Offer created. The seafarer will be notified and can accept or reject.");
      setSeafarer(null);
      setIdentification("");
      setRankId("");
      setStartDate("");
      setEndDate("");
      setBasicWage("");
      setOvertimeRate("");
      setLeavePay("");
      setSpecialTerms("");
      loadEmployments();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Create employment failed";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  }, [
    seafarer,
    rankId,
    contractType,
    startDate,
    endDate,
    basicWage,
    overtimeRate,
    leavePay,
    repatriation,
    insurance,
    specialTerms,
    contractStatus,
    employmentStatus,
    loadEmployments,
  ]);

  const filteredEmployments = employments.filter((e) => {
    const q = poolSearch.toLowerCase();
    const matchSearch =
      !q ||
      (e.seafarerFullName && e.seafarerFullName.toLowerCase().includes(q)) ||
      (e.seafarerRN && e.seafarerRN.toLowerCase().includes(q)) ||
      (e.rankDescription && e.rankDescription.toLowerCase().includes(q)) ||
      (e.acceptanceStatus && e.acceptanceStatus.toLowerCase().includes(q));
    const matchRank =
      poolRankFilter === "__all__" || e.rankId === poolRankFilter;
    return matchSearch && matchRank;
  });

  const loadAssignmentsForEmployment = useCallback(
    async (employmentId: string) => {
      setIsLoadingAssignments(true);
      try {
        const list = await getShipAssignments(employmentId);
        setAssignments(list);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load assignments");
        setAssignments([]);
      } finally {
        setIsLoadingAssignments(false);
      }
    },
    []
  );

  const openAssignModal = useCallback(
    (employment: SeafarerEmploymentDto) => {
      setAssignEmployment(employment);
      setAssignVesselName("");
      setAssignVesselIMO("");
      setAssignJoiningPort("");
      setAssignTradingArea("");
      setAssignStartDate("");
      setAssignEndDate("");
      setAssignments([]);
      if (employment.seafarerEmploymentId) {
        loadAssignmentsForEmployment(employment.seafarerEmploymentId);
      }
    },
    [loadAssignmentsForEmployment]
  );

  const closeAssignModal = useCallback(() => {
    setAssignEmployment(null);
    setAssignments([]);
  }, []);

  const handleCreateAssignment = useCallback(async () => {
    if (!assignEmployment) return;
    setIsCreatingAssignment(true);
    try {
      await createShipAssignment(assignEmployment.seafarerEmploymentId, {
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
      loadAssignmentsForEmployment(assignEmployment.seafarerEmploymentId);
      loadEmployments();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create assignment failed");
    } finally {
      setIsCreatingAssignment(false);
    }
  }, [
    assignEmployment,
    assignVesselName,
    assignVesselIMO,
    assignJoiningPort,
    assignTradingArea,
    assignStartDate,
    assignEndDate,
    loadAssignmentsForEmployment,
    loadEmployments,
  ]);

  const handleEndAssignment = useCallback(
    async (assignmentId: string) => {
      setIsEndingAssignment(assignmentId);
      try {
        await endShipAssignment(assignmentId);
        toast.success("Assignment ended");
        if (assignEmployment) {
          loadAssignmentsForEmployment(assignEmployment.seafarerEmploymentId);
        }
        loadEmployments();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "End assignment failed");
      } finally {
        setIsEndingAssignment(null);
      }
    },
    [assignEmployment, loadAssignmentsForEmployment, loadEmployments]
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
              <Users className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              Employ Seafarer
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-xl">
              Create an employment offer (terms and duration). The seafarer will accept or reject; you can assign to a ship after acceptance.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="sm:size-default"
          onClick={() => router.push("/employer/contracts")}
        >
          <FileText className="h-4 w-4 mr-2" />
          View contracts
        </Button>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.2fr)]">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-lg">Search &amp; Create Employment</CardTitle>
            <CardDescription className="text-sm">
              Enter SIN or RN and click Search. Then fill contract details and Create offer (vessel assignment is done after the seafarer accepts).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <Label>Seafarer Identification (SIN or RN)</Label>
                <Input
                  placeholder="e.g. SF-1003 or REG-12345"
                  value={identification}
                  onChange={(e) => {
                    setIdentification(e.target.value);
                    setSeafarer(null);
                  }}
                />
              </div>
              <Button
                className="sm:shrink-0 w-full sm:w-auto"
                onClick={handleSearch}
                disabled={isSearching || !identification.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                ) : (
                  <Search className="h-4 w-4 sm:mr-2" />
                )}
                Search
              </Button>
            </div>

            {seafarer && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0" />
                  {seafarer.firstName} {seafarer.lastName}
                  {seafarer.middleName ? ` ${seafarer.middleName}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  RN: {seafarer.rn} · SIN: {seafarer.sin ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rank: {seafarer.currentRankDescription ?? "—"} · Nationality: {seafarer.nationalityDescription ?? "—"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5">
              <div className="space-y-2 min-w-0">
                <Label>Rank on contract *</Label>
                <Select value={rankId} onValueChange={setRankId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.description || r.title || r.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Contract type</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed-term">Fixed-term</SelectItem>
                    <SelectItem value="Voyage">Voyage</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Basic wage (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={basicWage}
                  onChange={(e) => setBasicWage(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Overtime rate</Label>
                <Input
                  type="number"
                  placeholder="e.g. 8"
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0 sm:col-span-2">
                <Label>Leave pay</Label>
                <Input
                  placeholder="e.g. 2.5 days per month"
                  value={leavePay}
                  onChange={(e) => setLeavePay(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Repatriation</Label>
                <Select value={repatriation} onValueChange={setRepatriation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employer">Employer</SelectItem>
                    <SelectItem value="Company provided">Company provided</SelectItem>
                    <SelectItem value="Shared cost">Shared cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Insurance</Label>
                <Select value={insurance} onValueChange={setInsurance}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employer">Employer</SelectItem>
                    <SelectItem value="P&I cover + medical">P&amp;I cover + medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-0 sm:col-span-2">
                <Label>Special terms</Label>
                <Textarea
                  placeholder="Optional notes"
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={handleCreateEmployment}
              disabled={!seafarer || !rankId || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Ship className="h-4 w-4 mr-2" />
                  Create offer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">My employments</CardTitle>
              <Badge variant="secondary">
                Page {employmentPageNumber} of {employmentTotalPages || 1} · {employmentTotalCount} total
              </Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                placeholder="Search by name, RN, rank, acceptance…"
                className="flex-1 min-w-0 sm:min-w-[200px]"
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
              />
              <Select value={poolRankFilter} onValueChange={setPoolRankFilter}>
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
          <CardContent className="flex-1 min-h-0 pt-0 flex flex-col">
            <div className="overflow-x-auto rounded-lg border bg-muted/20 flex-1 min-h-[200px]">
              {isLoadingEmployments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Seafarer</TableHead>
                      <TableHead className="min-w-[100px]">Rank</TableHead>
                      <TableHead className="min-w-[90px]">Acceptance</TableHead>
                      <TableHead className="min-w-[90px]">Contract</TableHead>
                      <TableHead className="min-w-[100px]">Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          No employments yet. Search a seafarer and create an offer.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployments.map((e) => (
                        <TableRow key={e.seafarerEmploymentId}>
                          <TableCell>
                            <div className="font-medium">{e.seafarerFullName ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{e.seafarerRN}</div>
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
                            <Badge variant="secondary">{e.contractStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {e.dateCreated ? formatDate(e.dateCreated) : "—"}
                          </TableCell>
                          <TableCell className="text-right flex gap-1 justify-end flex-wrap">
                            {e.acceptanceStatus === "Accepted" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAssignModal(e)}
                              >
                                <Ship className="h-3 w-3 mr-1" />
                                Assign to ship
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push("/employer/contracts")}
                            >
                              Contract
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmploymentPageNumber((p) => Math.max(1, p - 1))}
                  disabled={employmentPageNumber <= 1 || isLoadingEmployments}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {employmentPageNumber} of {employmentTotalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmploymentPageNumber((p) => p + 1)}
                  disabled={employmentPageNumber >= employmentTotalPages || isLoadingEmployments || employmentTotalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => router.push("/employer/contracts")}
              >
                Manage contracts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!assignEmployment} onOpenChange={(open) => !open && closeAssignModal()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign to ship</DialogTitle>
            <DialogDescription>
              {assignEmployment && (
                <>Assign {assignEmployment.seafarerFullName ?? assignEmployment.seafarerRN} to a vessel. One active assignment per seafarer.</>
              )}
            </DialogDescription>
          </DialogHeader>
          {assignEmployment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vessel name</Label>
                  <Input
                    placeholder="e.g. MV Atlantic Star"
                    value={assignVesselName}
                    onChange={(e) => setAssignVesselName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vessel IMO</Label>
                  <Input
                    placeholder="e.g. 9123456"
                    value={assignVesselIMO}
                    onChange={(e) => setAssignVesselIMO(e.target.value)}
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
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignments yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {assignments.map((a) => (
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
                            disabled={isEndingAssignment === a.seafarerShipAssignmentId}
                          >
                            {isEndingAssignment === a.seafarerShipAssignmentId ? (
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
            <Button variant="outline" onClick={closeAssignModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
