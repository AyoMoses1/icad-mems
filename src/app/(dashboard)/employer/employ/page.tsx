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
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  searchSeafarer,
  createSeafarerEmployment,
  getSeafarerEmployments,
  type SeafarerSearchResultDto,
  type SeafarerEmploymentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { getAllRanks, type RankDto } from "@/lib/services/ranks";

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

  // Form fields for create employment
  const [rankId, setRankId] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [vesselIMO, setVesselIMO] = useState("");
  const [contractType, setContractType] = useState("Fixed-term");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [joiningPort, setJoiningPort] = useState("");
  const [tradingArea, setTradingArea] = useState("");
  const [basicWage, setBasicWage] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [leavePay, setLeavePay] = useState("");
  const [repatriation, setRepatriation] = useState("Employer");
  const [insurance, setInsurance] = useState("Employer");
  const [specialTerms, setSpecialTerms] = useState("");
  const [contractStatus, setContractStatus] = useState("Draft");
  const [employmentStatus, setEmploymentStatus] = useState("Active");

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
      const data = await getSeafarerEmployments();
      setEmployments(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load employments";
      toast.error(msg);
      setEmployments([]);
    } finally {
      setIsLoadingEmployments(false);
    }
  }, []);

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
        vesselName: vesselName || undefined,
        vesselIMO: vesselIMO || undefined,
        contractType: contractType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        joiningPort: joiningPort || undefined,
        tradingArea: tradingArea || undefined,
        basicWage: basicWage ? parseFloat(basicWage) : undefined,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        leavePay: leavePay || undefined,
        repatriation: repatriation || undefined,
        insurance: insurance || undefined,
        specialTerms: specialTerms || undefined,
        contractStatus: contractStatus || "Draft",
        employmentStatus: employmentStatus || undefined,
      });
      toast.success("Employment created");
      setSeafarer(null);
      setIdentification("");
      setRankId("");
      setVesselName("");
      setVesselIMO("");
      setStartDate("");
      setEndDate("");
      setJoiningPort("");
      setTradingArea("");
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
    vesselName,
    vesselIMO,
    contractType,
    startDate,
    endDate,
    joiningPort,
    tradingArea,
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
      (e.vesselName && e.vesselName.toLowerCase().includes(q));
    const matchRank =
      poolRankFilter === "__all__" || e.rankId === poolRankFilter;
    return matchSearch && matchRank;
  });

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
              Search seafarer by SIN or RN, then create an employment (assign to vessel).
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
              Enter SIN or RN and click Search. Then fill contract details and Create Employment.
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
                <Label>Vessel name</Label>
                <Input
                  placeholder="e.g. MV Atlantic Star"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Vessel IMO</Label>
                <Input
                  placeholder="e.g. 9123456"
                  value={vesselIMO}
                  onChange={(e) => setVesselIMO(e.target.value)}
                />
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
                <Label>Joining port</Label>
                <Input
                  placeholder="e.g. Apapa, Lagos"
                  value={joiningPort}
                  onChange={(e) => setJoiningPort(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Trading area</Label>
                <Input
                  placeholder="e.g. West Africa"
                  value={tradingArea}
                  onChange={(e) => setTradingArea(e.target.value)}
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
                  Create employment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">My employments</CardTitle>
              <Badge variant="secondary">{filteredEmployments.length} shown</Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                placeholder="Search by name, RN, rank, vessel…"
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
                      <TableHead className="min-w-[100px]">Vessel</TableHead>
                      <TableHead className="min-w-[90px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          No employments yet. Search a seafarer and create an employment.
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
                          <TableCell>{e.vesselName ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{e.contractStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {e.dateCreated ? formatDate(e.dateCreated) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
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
            <div className="mt-4 pt-4 border-t">
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
    </div>
  );
}
