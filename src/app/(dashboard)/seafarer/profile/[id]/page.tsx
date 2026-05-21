"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit,
  Download,
  Ship,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  Loader2,
  MoreVertical,
  History,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared";
import {
  searchSeafarer,
  getSeafarerEmployments,
  getShipAssignments,
  createShipAssignment,
  endShipAssignment,
  type SeafarerSearchResultDto,
  type SeafarerEmploymentDto,
  type SeafarerShipAssignmentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { getShipByImo } from "@/lib/services/imo-ship-lookup-service";
import { formatDate, getInitials } from "@/lib/utils";

interface AssignmentWithEmployment extends SeafarerShipAssignmentDto {
  employmentId: string;
}

export default function SeafarerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const identification = Array.isArray(rawId) ? rawId[0] : (rawId ?? "");

  const [activeTab, setActiveTab] = useState("overview");

  // Real seafarer + employment data (fetched from API).
  const [seafarer, setSeafarer] = useState<SeafarerSearchResultDto | null>(null);
  const [isLoadingSeafarer, setIsLoadingSeafarer] = useState(true);
  const [employments, setEmployments] = useState<SeafarerEmploymentDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithEmployment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Dialog state for the three employer actions.
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isTripHistoryDialogOpen, setIsTripHistoryDialogOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  // Assign-to-ship form state.
  const [vesselName, setVesselName] = useState("");
  const [vesselIMO, setVesselIMO] = useState("");
  const [vesselNameFromApi, setVesselNameFromApi] = useState(false);
  const [imoLookupLoading, setImoLookupLoading] = useState(false);
  const [joiningPort, setJoiningPort] = useState("");
  const [tradingArea, setTradingArea] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Derive the active employment (Accepted offer for this employer).
  const activeEmployment = useMemo<SeafarerEmploymentDto | null>(() => {
    if (employments.length === 0) return null;
    const accepted = employments.find((e) => e.acceptanceStatus === "Accepted");
    if (accepted) return accepted;
    // Fallback to the most recently created employment.
    return [...employments].sort((a, b) => {
      const ad = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
      const bd = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      return bd - ad;
    })[0];
  }, [employments]);

  // Derive the active ship assignment (the seafarer's current onboard vessel).
  const currentAssignment = useMemo<AssignmentWithEmployment | null>(() => {
    return (
      assignments.find(
        (a) => a.status === "Active" && a.employmentId === activeEmployment?.seafarerEmploymentId,
      ) ?? null
    );
  }, [assignments, activeEmployment]);

  const loadSeafarer = useCallback(async () => {
    if (!identification) {
      setIsLoadingSeafarer(false);
      return;
    }
    setIsLoadingSeafarer(true);
    try {
      const data = await searchSeafarer(identification);
      if (!data) {
        toast.error("Seafarer not found");
        setSeafarer(null);
      } else {
        setSeafarer(data);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load seafarer");
      setSeafarer(null);
    } finally {
      setIsLoadingSeafarer(false);
    }
  }, [identification]);

  const loadEmploymentsAndAssignments = useCallback(async () => {
    if (!seafarer?.rn) {
      setEmployments([]);
      setAssignments([]);
      setIsLoadingAssignments(false);
      return;
    }
    setIsLoadingAssignments(true);
    try {
      const result = await getSeafarerEmployments({
        seafarerRn: seafarer.rn,
        pageNumber: 1,
        pageSize: 50,
      });
      const items = result.items ?? [];
      setEmployments(items);
      // Aggregate ship assignments across all employments for this seafarer in
      // this employer's pool. Trip history needs to span all employments.
      const flat: AssignmentWithEmployment[] = [];
      for (const emp of items) {
        try {
          const list = await getShipAssignments(emp.seafarerEmploymentId);
          for (const a of list) {
            flat.push({
              ...a,
              employmentId: emp.seafarerEmploymentId,
              rankDescription: emp.rankDescription,
            });
          }
        } catch (e) {
          // Non-fatal: skip an employment whose assignments fail to load.
          console.error("Failed to load ship assignments", emp.seafarerEmploymentId, e);
        }
      }
      setAssignments(flat);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load employments");
      setEmployments([]);
      setAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [seafarer?.rn]);

  useEffect(() => {
    loadSeafarer();
  }, [loadSeafarer]);

  useEffect(() => {
    loadEmploymentsAndAssignments();
  }, [loadEmploymentsAndAssignments]);

  const seafarerDisplayName = useMemo(() => {
    if (!seafarer) return identification || "Seafarer";
    const parts = [seafarer.firstName, seafarer.middleName, seafarer.lastName].filter(
      (v) => v && String(v).trim() !== "",
    );
    return parts.join(" ") || identification;
  }, [seafarer, identification]);

  const handleOpenAssignDialog = useCallback(() => {
    if (!activeEmployment) {
      toast.info(
        "No accepted employment yet. Create an offer first, then assign to a vessel after the seafarer accepts.",
      );
      router.push("/employer/employ");
      return;
    }
    if (activeEmployment.acceptanceStatus !== "Accepted") {
      toast.info(
        `Employment is ${activeEmployment.acceptanceStatus ?? "Pending"}. The seafarer must accept the offer before being assigned to a vessel.`,
      );
      return;
    }
    if (currentAssignment) {
      toast.info("This seafarer already has an active assignment. End it first.");
      return;
    }
    setVesselName("");
    setVesselIMO("");
    setVesselNameFromApi(false);
    setJoiningPort("");
    setTradingArea("");
    setAssignStartDate("");
    setAssignEndDate("");
    setIsAssignDialogOpen(true);
  }, [activeEmployment, currentAssignment, router]);

  const handleImoLookup = useCallback(async () => {
    const imo = vesselIMO.trim();
    if (!imo) {
      toast.error("Enter vessel IMO first");
      return;
    }
    setImoLookupLoading(true);
    try {
      const ship = await getShipByImo(imo);
      if (!ship) {
        toast.error("Vessel not found for this IMO number");
        return;
      }
      setVesselName(ship.shipName);
      setVesselNameFromApi(true);
      toast.success("Vessel details filled from registry");
    } catch {
      toast.error("Failed to look up vessel by IMO");
    } finally {
      setImoLookupLoading(false);
    }
  }, [vesselIMO]);

  const handleCreateAssignment = useCallback(async () => {
    if (!activeEmployment) return;
    if (!vesselName.trim() && !vesselIMO.trim()) {
      toast.error("Provide a vessel name or IMO");
      return;
    }
    setIsCreatingAssignment(true);
    try {
      await createShipAssignment(activeEmployment.seafarerEmploymentId, {
        vesselName: vesselName || undefined,
        vesselIMO: vesselIMO || undefined,
        joiningPort: joiningPort || undefined,
        tradingArea: tradingArea || undefined,
        assignmentStartDate: assignStartDate || undefined,
        assignmentEndDate: assignEndDate || undefined,
      });
      toast.success("Seafarer assigned to vessel");
      setIsAssignDialogOpen(false);
      loadEmploymentsAndAssignments();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create assignment failed");
    } finally {
      setIsCreatingAssignment(false);
    }
  }, [
    activeEmployment,
    vesselName,
    vesselIMO,
    joiningPort,
    tradingArea,
    assignStartDate,
    assignEndDate,
    loadEmploymentsAndAssignments,
  ]);

  const handleRemoveFromCompany = useCallback(async () => {
    if (!currentAssignment) {
      toast.info("No active assignment to end.");
      setIsRemoveConfirmOpen(false);
      return;
    }
    setIsRemoving(true);
    try {
      await endShipAssignment(currentAssignment.seafarerShipAssignmentId);
      toast.success("Seafarer removed from current vessel");
      setIsRemoveConfirmOpen(false);
      loadEmploymentsAndAssignments();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove from company");
    } finally {
      setIsRemoving(false);
    }
  }, [currentAssignment, loadEmploymentsAndAssignments]);

  // The rest of the page (licenses, STCW, employment history, documents tabs) still uses placeholder
  // data — replacing those with API-driven content is tracked separately and is not part of this fix.
  const licenses = [
    {
      id: "1",
      name: "Certificate of Competency",
      type: "Master Mariner (Unlimited)",
      issuedBy: "NIMASA",
      validUntil: "15 Jun 2025",
      status: "valid",
    },
    {
      id: "2",
      name: "GMDSS Radio Operator",
      type: "GOC",
      issuedBy: "NIMASA",
      validUntil: "15 Jun 2025",
      status: "valid",
    },
    {
      id: "3",
      name: "Medical Certificate",
      type: "ENG 1",
      issuedBy: "Approved Medical Examiner",
      validUntil: "15 Jun 2025",
      status: "valid",
    },
  ];

  const stcwCertificates = [
    {
      id: "1",
      name: "STCW Basic Safety Training",
      issued: "15 Feb 2019",
      expiry: "15 Feb 2024",
      status: "expired",
    },
    {
      id: "2",
      name: "Medical First Aid",
      issued: "22 Aug 2021",
      expiry: "15 Feb 2024",
      status: "valid",
    },
    {
      id: "3",
      name: "Proficiency in Survival Craft",
      issued: "25 Aug 2021",
      expiry: "15 Feb 2024",
      status: "valid",
    },
    {
      id: "4",
      name: "Ship Security Officer",
      issued: "10 Mar 2022",
      expiry: "15 Feb 2024",
      status: "valid",
    },
  ];

  const documents = [
    { id: "1", name: "Passport Copy", type: "PDF", uploadedDate: "15 Jan 2023" },
    { id: "2", name: "CDC Document", type: "PDF", uploadedDate: "15 Jan 2023" },
    { id: "3", name: "Medical Certificate", type: "PDF", uploadedDate: "15 Jan 2023" },
    { id: "4", name: "STCW Certificates Bundle", type: "PDF", uploadedDate: "15 Jan 2023" },
    { id: "5", name: "COC Certificate", type: "PDF", uploadedDate: "15 Jan 2023" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(seafarerDisplayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {isLoadingSeafarer ? "Loading…" : seafarerDisplayName}
                  </h1>
                  {seafarer?.isApprove && (
                    <Badge variant="success" className="gap-1">
                      <User className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">
                  {seafarer?.currentRankDescription ?? "—"} ·{" "}
                  {seafarer?.rn ?? identification}
                  {seafarer?.sin ? ` · SIN ${seafarer.sin}` : ""}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licenses">Licenses & Certificates</TabsTrigger>
          <TabsTrigger value="employment">Employment History</TabsTrigger>
          <TabsTrigger value="documents">Document</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {isLoadingSeafarer ? "—" : seafarerDisplayName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {seafarer?.dob ? formatDate(seafarer.dob) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">
                    {seafarer?.nationalityDescription ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                  <p className="font-medium">
                    {seafarer?.currentRankDescription ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-medium">{seafarer?.rn ?? identification}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SIN</p>
                  <p className="font-medium">{seafarer?.sin ?? "—"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Employment summary card */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAssignments ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : activeEmployment ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Rank on contract</p>
                      <p className="font-medium">
                        {activeEmployment.rankDescription ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contract type</p>
                      <p className="font-medium">
                        {activeEmployment.contractType ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Acceptance status</p>
                      <Badge
                        variant={
                          activeEmployment.acceptanceStatus === "Accepted"
                            ? "default"
                            : activeEmployment.acceptanceStatus === "Rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {activeEmployment.acceptanceStatus ?? "Pending"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start date</p>
                      <p className="font-medium">
                        {activeEmployment.startDate
                          ? formatDate(activeEmployment.startDate)
                          : "—"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not currently employed by your company.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Assignment */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Assignment</CardTitle>
                <Button
                  className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  onClick={handleOpenAssignDialog}
                  disabled={isLoadingAssignments}
                >
                  {isLoadingAssignments ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Ship className="mr-2 h-4 w-4" />
                  )}
                  Assign to Shipping Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="flex items-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading current assignment…
                </div>
              ) : currentAssignment ? (
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4 flex-1">
                    <Ship className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {currentAssignment.vesselName ?? "Unnamed vessel"}
                        </p>
                        <Badge variant="success">Currently Onboard</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activeEmployment?.companyLegalName ?? "—"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                        <span className="text-muted-foreground">
                          Rank: {activeEmployment?.rankDescription ?? "—"}
                        </span>
                        {currentAssignment.vesselIMO && (
                          <span className="text-muted-foreground">
                            IMO: {currentAssignment.vesselIMO}
                          </span>
                        )}
                        {currentAssignment.joiningPort && (
                          <span className="text-muted-foreground">
                            Port: {currentAssignment.joiningPort}
                          </span>
                        )}
                        <span className="text-muted-foreground inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sign On:{" "}
                          {currentAssignment.assignmentStartDate
                            ? formatDate(currentAssignment.assignmentStartDate)
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsTripHistoryDialogOpen(true)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        See Trip History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsRemoveConfirmOpen(true)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove from Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                  <Ship className="h-10 w-10 opacity-50" />
                  <p className="text-sm">
                    {activeEmployment
                      ? "No active vessel assignment yet."
                      : "Not currently employed by your company."}
                  </p>
                  {assignments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTripHistoryDialogOpen(true)}
                    >
                      <History className="mr-2 h-4 w-4" />
                      See Trip History ({assignments.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licenses & Certificates Tab */}
        <TabsContent value="licenses" className="space-y-6">
          {/* Licenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {licenses.map((license) => (
                  <div
                    key={license.id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{license.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {license.type} • Issued by {license.issuedBy}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Valid Until {license.validUntil}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Valid</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* STCW Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                STCW Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stcwCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Issued: {cert.issued}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {cert.status === "valid" ? (
                            <>
                              <Badge variant="success">Valid</Badge>
                              <span className="text-sm text-muted-foreground">
                                Exp: {cert.expiry}
                              </span>
                            </>
                          ) : (
                            <>
                              <Badge variant="destructive">Expired</Badge>
                              <span className="text-sm text-muted-foreground">
                                Exp: {cert.expiry}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment History Tab */}
        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sea Service Record</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="flex items-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No vessel assignments yet under your company.
                </p>
              ) : (
                <div className="space-y-4">
                  {assignments
                    .slice()
                    .sort((a, b) => {
                      const ad = a.assignmentStartDate
                        ? new Date(a.assignmentStartDate).getTime()
                        : 0;
                      const bd = b.assignmentStartDate
                        ? new Date(b.assignmentStartDate).getTime()
                        : 0;
                      return bd - ad;
                    })
                    .map((a) => (
                      <div
                        key={a.seafarerShipAssignmentId}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Ship className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {a.vesselName ?? "Unnamed vessel"}
                              </p>
                              {a.status === "Active" && (
                                <Badge variant="success">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {a.vesselIMO ? `IMO: ${a.vesselIMO}` : ""}
                              {a.tradingArea ? ` • ${a.tradingArea}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{a.rankDescription ?? "—"}</p>
                          <p className="text-sm text-muted-foreground">
                            {a.assignmentStartDate
                              ? formatDate(a.assignmentStartDate)
                              : "—"}{" "}
                            -{" "}
                            {a.assignmentEndDate
                              ? formatDate(a.assignmentEndDate)
                              : "Present"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • Uploaded {doc.uploadedDate}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign-to-ship dialog */}
      <Dialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          if (!isCreatingAssignment) setIsAssignDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign to Shipping Company</DialogTitle>
            <DialogDescription>
              Assign {seafarerDisplayName} to a vessel under your company. Only one active
              assignment per seafarer is allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vessel IMO</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 9123456"
                  value={vesselIMO}
                  onChange={(e) => {
                    setVesselIMO(e.target.value);
                    if (vesselNameFromApi) setVesselNameFromApi(false);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImoLookup}
                  disabled={!vesselIMO.trim() || imoLookupLoading}
                >
                  {imoLookupLoading ? (
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
                placeholder="e.g. MV Atlantic Star"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                readOnly={vesselNameFromApi}
                className={vesselNameFromApi ? "bg-muted" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label>Joining port</Label>
              <Input
                placeholder="e.g. Apapa, Lagos"
                value={joiningPort}
                onChange={(e) => setJoiningPort(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Trading area</Label>
              <Input
                placeholder="e.g. West Africa"
                value={tradingArea}
                onChange={(e) => setTradingArea(e.target.value)}
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={isCreatingAssignment}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              onClick={handleCreateAssignment}
              disabled={isCreatingAssignment}
            >
              {isCreatingAssignment ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ship className="mr-2 h-4 w-4" />
              )}
              Create assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trip history dialog */}
      <Dialog
        open={isTripHistoryDialogOpen}
        onOpenChange={setIsTripHistoryDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trip History</DialogTitle>
            <DialogDescription>
              All vessel assignments for {seafarerDisplayName} under your company.
            </DialogDescription>
          </DialogHeader>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No trips recorded yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {assignments
                .slice()
                .sort((a, b) => {
                  const ad = a.assignmentStartDate
                    ? new Date(a.assignmentStartDate).getTime()
                    : 0;
                  const bd = b.assignmentStartDate
                    ? new Date(b.assignmentStartDate).getTime()
                    : 0;
                  return bd - ad;
                })
                .map((a) => (
                  <li
                    key={a.seafarerShipAssignmentId}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Ship className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">
                          {a.vesselName ?? "Unnamed vessel"}
                        </span>
                        {a.vesselIMO && (
                          <span className="text-muted-foreground">
                            (IMO {a.vesselIMO})
                          </span>
                        )}
                      </div>
                      <Badge
                        variant={a.status === "Active" ? "success" : "secondary"}
                      >
                        {a.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>Rank: {a.rankDescription ?? "—"}</span>
                      {a.joiningPort && <span>Port: {a.joiningPort}</span>}
                      {a.tradingArea && <span>Area: {a.tradingArea}</span>}
                      <span>
                        {a.assignmentStartDate
                          ? formatDate(a.assignmentStartDate)
                          : "—"}{" "}
                        -{" "}
                        {a.assignmentEndDate
                          ? formatDate(a.assignmentEndDate)
                          : "Present"}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTripHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove-from-company confirmation */}
      <ConfirmDialog
        open={isRemoveConfirmOpen}
        onOpenChange={setIsRemoveConfirmOpen}
        title="Remove from company"
        description={
          currentAssignment
            ? `End ${seafarerDisplayName}'s active assignment on ${
                currentAssignment.vesselName ?? "this vessel"
              }? This marks the assignment as ended.`
            : "No active assignment to end."
        }
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleRemoveFromCompany}
      />
    </div>
  );
}
