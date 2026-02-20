"use client";

import { useState, useCallback, useMemo } from "react";
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
  FileText,
  ArrowLeft,
  RotateCcw,
  Download,
  Send,
  PenLine,
  Copy,
  Ship,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

// Demo pool – in real app would come from context/API or employer/employ pool
const DEMO_POOL = [
  {
    id: "SF-1001",
    name: "Okafor Chinedu",
    nationality: "Nigerian",
    rank: "AB",
    availability: "2026-02-25",
    experienceYears: 5,
    vesselTypes: ["Tanker", "Supply"],
    docs: { stcw: true, medicalExp: "2026-08-10", passportExp: "2027-01-18" },
    compliance: "ok" as const,
  },
  {
    id: "SF-1002",
    name: "Amina Yusuf",
    nationality: "Nigerian",
    rank: "Second Officer",
    availability: "2026-03-05",
    experienceYears: 4,
    vesselTypes: ["Container", "Bulk"],
    docs: { stcw: true, medicalExp: "2026-02-28", passportExp: "2026-10-02" },
    compliance: "warn" as const,
  },
  {
    id: "SF-1003",
    name: "Eze Kelechi",
    nationality: "Nigerian",
    rank: "Chief Engineer",
    availability: "2026-02-20",
    experienceYears: 11,
    vesselTypes: ["Bulk", "Tanker"],
    docs: { stcw: true, medicalExp: "2026-12-11", passportExp: "2028-04-21" },
    compliance: "ok" as const,
  },
];

type ContractStatus = "Draft" | "Sent" | "Signed";

export default function EmployerContractsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterRank, setFilterRank] = useState<string>("__all__");
  const [filterAvailability, setFilterAvailability] = useState<string>("__all__");
  const [selected, setSelected] = useState<(typeof DEMO_POOL)[0] | null>(null);
  const [contractStatus, setContractStatus] = useState<ContractStatus>("Draft");
  const [contractId] = useState(
    () => "CTR-" + Math.floor(100000 + Math.random() * 900000)
  );

  const [employerName, setEmployerName] = useState("Oceanic Manning Services Ltd.");
  const [employerAddress, setEmployerAddress] = useState("10 Marina Road, Lagos, Nigeria");
  const [employerContact, setEmployerContact] = useState("HR Manager");
  const [employerContactInfo, setEmployerContactInfo] = useState(
    "hr@oceanicmanning.example | +234 000 000 0000"
  );
  const [vesselName, setVesselName] = useState("MV Atlantic Star");
  const [vesselIMO, setVesselIMO] = useState("IMO 9123456");
  const [contractType, setContractType] = useState("Fixed-term");
  const [contractRank, setContractRank] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [joiningPort, setJoiningPort] = useState("Apapa, Lagos");
  const [tradingArea, setTradingArea] = useState("West Africa");
  const [basicWage, setBasicWage] = useState("2500");
  const [overtimeRate, setOvertimeRate] = useState("8");
  const [leavePay, setLeavePay] = useState("2.5 days per month");
  const [probation, setProbation] = useState("N/A");
  const [repatriation, setRepatriation] = useState("Company provided");
  const [insurance, setInsurance] = useState(
    "P&I cover + basic medical insurance"
  );
  const [specialTerms, setSpecialTerms] = useState(
    "Seafarer must maintain valid STCW certificates and medical fitness throughout the contract period."
  );

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEMO_POOL.filter((s) => {
      const hay = [
        s.name,
        s.id,
        s.rank,
        s.nationality,
        (s.vesselTypes || []).join(" "),
      ].join(" ").toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (filterRank !== "__all__" && s.rank !== filterRank) return false;
      if (filterAvailability !== "__all__") {
        const d = new Date(s.availability + "T00:00:00");
        const today = new Date();
        const diff = (d.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / (1000 * 60 * 60 * 24);
        if (filterAvailability === "available" && diff > 0) return false;
        if (filterAvailability === "soon" && diff > 14) return false;
      }
      return true;
    });
  }, [search, filterRank, filterAvailability]);

  const handleSelectSeafarer = useCallback((id: string) => {
    const s = DEMO_POOL.find((x) => x.id === id) || null;
    setSelected(s);
    if (s) setContractRank(s.rank);
  }, []);

  const contractText = useMemo(() => {
    const s = selected;
    const emp = [
      `Employer: ${employerName}`,
      `Address: ${employerAddress}`,
      `Contact: ${employerContact} | ${employerContactInfo}`,
    ].join("\n");
    const seafarerBlock = s
      ? [
          "SEAFARER DETAILS",
          `Name: ${s.name}`,
          `Seafarer ID: ${s.id}`,
          `Nationality: ${s.nationality}`,
          `Agreed Rank: ${contractRank || s.rank}`,
          `Availability: ${formatDate(s.availability)}`,
          `Experience: ${s.experienceYears} year(s)`,
          `Vessel Experience: ${(s.vesselTypes || []).join(", ") || "—"}`,
        ].join("\n")
      : "SEAFARER DETAILS\n(Select a seafarer from the list to populate details.)";
    return [
      "SEAFARER EMPLOYMENT CONTRACT",
      `Contract ID: ${contractId}`,
      `Status: ${contractStatus}`,
      "",
      "PARTIES",
      emp,
      "",
      seafarerBlock,
      "",
      `Vessel: ${vesselName} (${vesselIMO})`,
      `Contract Type: ${contractType}`,
      `Trading Area: ${tradingArea}`,
      "",
      "ENGAGEMENT",
      `Joining Port: ${joiningPort}`,
      `Start Date: ${startDate ? formatDate(startDate) : "—"}`,
      `End Date: ${endDate ? formatDate(endDate) : "—"}`,
      "",
      "REMUNERATION & BENEFITS",
      `Monthly Basic Wage (USD): ${basicWage || "—"}`,
      `Overtime Rate (USD/hour): ${overtimeRate || "—"}`,
      `Leave Pay: ${leavePay || "—"}`,
      `Probation: ${probation || "—"}`,
      `Repatriation: ${repatriation || "—"}`,
      `Medical & Insurance: ${insurance || "—"}`,
      "",
      "SPECIAL TERMS",
      specialTerms || "—",
    ].join("\n");
  }, [
    selected,
    employerName,
    employerAddress,
    employerContact,
    employerContactInfo,
    vesselName,
    vesselIMO,
    contractType,
    contractRank,
    joiningPort,
    tradingArea,
    startDate,
    endDate,
    basicWage,
    overtimeRate,
    leavePay,
    probation,
    repatriation,
    insurance,
    specialTerms,
    contractId,
    contractStatus,
  ]);

  const handleMarkSent = () => {
    setContractStatus("Sent");
    toast.success("Contract marked as Sent");
  };
  const handleMarkSigned = () => {
    setContractStatus("Signed");
    toast.success("Contract marked as Signed");
  };
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(contractText);
      toast.success("Contract text copied");
    } catch {
      toast.error("Copy failed");
    }
  };
  const handleFinalize = () => {
    if (!selected) {
      toast.error("Select a seafarer first");
      return;
    }
    toast.success("Finalize & Print (print would open here)");
    window.print?.();
  };
  const handleDownloadJson = () => {
    const data = {
      contractId,
      status: contractStatus,
      employer: { name: employerName, address: employerAddress, contactName: employerContact, contactInfo: employerContactInfo },
      seafarer: selected ? { id: selected.id, name: selected.name, rank: selected.rank } : null,
      vessel: { name: vesselName, imo: vesselIMO },
      contract: { type: contractType, rankOnContract: contractRank, startDate, endDate },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contractId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded contract JSON");
  };
  const handleReset = () => {
    setSelected(null);
    setContractStatus("Draft");
    setContractRank("");
    setSpecialTerms("Seafarer must maintain valid STCW certificates and medical fitness throughout the contract period.");
    toast.info("Reset complete");
  };

  const ranks = ["Master", "Chief Officer", "Second Officer", "Chief Engineer", "Second Engineer", "AB", "OS"];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8 px-1">
      {/* Page header: stacks on narrow desktop */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 sm:text-3xl">
              <Ship className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              <span className="truncate">Employer Portal – Employ Seafarers</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Pick a seafarer from the list, fill contract details, preview and save/print.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Button variant="outline" size="sm" className="sm:size-default" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" className="sm:size-default" onClick={handleDownloadJson}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Download Contract JSON</span>
            <span className="xl:hidden">Download JSON</span>
          </Button>
          <Button size="sm" className="sm:size-default" onClick={handleFinalize} disabled={!selected}>
            <FileText className="h-4 w-4 mr-2" />
            Finalize &amp; Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,1fr)]">
        {/* Left: Seafarer pool */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">Seafarer Pool</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">{DEMO_POOL.length} listed</Badge>
                <Badge variant="secondary" className="text-xs">{filteredPool.length} shown</Badge>
                <Badge variant="outline" className="text-xs font-medium">
                  Selected: {selected ? selected.name : "None"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                className="flex-1 min-w-0 sm:min-w-[220px]"
                placeholder="Search by name, rank, certificate, experience…"
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
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
                  <SelectValue placeholder="All availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All availability</SelectItem>
                  <SelectItem value="available">Available now</SelectItem>
                  <SelectItem value="soon">Available ≤ 14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-0">
            <div className="overflow-auto max-h-[520px] lg:max-h-[600px] rounded-lg border bg-muted/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">Seafarer</TableHead>
                    <TableHead className="min-w-[120px]">Rank</TableHead>
                    <TableHead className="min-w-[140px]">Availability</TableHead>
                    <TableHead className="min-w-[160px]">Compliance</TableHead>
                    <TableHead className="text-right min-w-[110px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPool.map((s) => {
                    const isSel = selected?.id === s.id;
                    return (
                      <TableRow
                        key={s.id}
                        className={isSel ? "bg-primary/5 ring-1 ring-primary/20" : ""}
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {s.name}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {s.id}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {s.nationality}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Exp: {s.experienceYears}y
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{s.rank}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(s.availability)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.compliance === "ok"
                                ? "default"
                                : s.compliance === "warn"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {s.compliance === "ok"
                              ? "OK"
                              : s.compliance === "warn"
                                ? "Attention"
                                : "Missing"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isSel ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleSelectSeafarer(s.id)}
                          >
                            {isSel ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredPool.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No seafarers match your filters.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right: Contract details + preview */}
        <div className="space-y-6 lg:space-y-6 flex flex-col min-w-0">
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">Employer &amp; Contract Details</CardTitle>
                <Badge
                  variant={contractStatus === "Signed" ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {contractStatus === "Draft" && <PenLine className="h-3 w-3 mr-1" />}
                  {contractStatus === "Sent" && <Send className="h-3 w-3 mr-1" />}
                  {contractStatus}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Select a seafarer from the left. The contract preview updates automatically. Finalize to print.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4">
                <div className="space-y-2">
                  <Label>Employer / Company Name</Label>
                  <Input value={employerName} onChange={(e) => setEmployerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Employer Address</Label>
                  <Input value={employerAddress} onChange={(e) => setEmployerAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Employer Contact (Name)</Label>
                  <Input value={employerContact} onChange={(e) => setEmployerContact(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Employer Email / Phone</Label>
                  <Input value={employerContactInfo} onChange={(e) => setEmployerContactInfo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Vessel Name</Label>
                  <Input value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Vessel IMO / ID</Label>
                  <Input value={vesselIMO} onChange={(e) => setVesselIMO(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed-term">Fixed-term</SelectItem>
                      <SelectItem value="Voyage">Voyage</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rank on Contract</Label>
                  <Input
                    placeholder="Auto-filled from seafarer…"
                    value={contractRank}
                    onChange={(e) => setContractRank(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Joining Port</Label>
                  <Input value={joiningPort} onChange={(e) => setJoiningPort(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Work / Trading Area</Label>
                  <Input value={tradingArea} onChange={(e) => setTradingArea(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Basic Wage (USD)</Label>
                  <Input type="number" value={basicWage} onChange={(e) => setBasicWage(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Overtime Rate (USD/hour)</Label>
                  <Input type="number" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Leave Pay / Days</Label>
                  <Input value={leavePay} onChange={(e) => setLeavePay(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Probation (if any)</Label>
                  <Input value={probation} onChange={(e) => setProbation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Repatriation</Label>
                  <Select value={repatriation} onValueChange={setRepatriation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company provided">Company provided</SelectItem>
                      <SelectItem value="Shared cost">Shared cost</SelectItem>
                      <SelectItem value="Not included">Not included</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Medical &amp; Insurance</Label>
                  <Input value={insurance} onChange={(e) => setInsurance(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special Terms / Notes</Label>
                <Textarea
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={handleMarkSent}>
                  Mark as Sent
                </Button>
                <Button variant="outline" size="sm" onClick={handleMarkSigned}>
                  Mark as Signed
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopyText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Contract Text
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contract Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border border-dashed border-primary/20 bg-muted/20 p-4 min-h-[200px]">
                <pre className="text-xs sm:text-sm whitespace-pre-wrap font-serif text-foreground overflow-auto max-h-[340px] lg:max-h-[400px]">
                  {contractText}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
