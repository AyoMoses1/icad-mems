"use client";

import { useState, useCallback } from "react";
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
  UserPlus,
  Download,
  Trash2,
  ArrowLeft,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface PoolEntry {
  id: string;
  seafarerId: string;
  seafarerName: string;
  rank: string;
  employerName: string;
  employmentStatus: string;
  preferredRank?: string;
  availability?: string;
  notes?: string;
  addedAt: string;
}

// Mock retrieve – replace with API
const mockRetrieveSeafarer = async (id: string) => {
  await new Promise((r) => setTimeout(r, 600));
  const mock: Record<string, { name: string; rank: string; availability: string }> = {
    "SF-1001": { name: "Okafor Chinedu", rank: "AB", availability: "2026-02-25" },
    "SF-1002": { name: "Amina Yusuf", rank: "Second Officer", availability: "2026-03-05" },
    "SF-1003": { name: "Eze Kelechi", rank: "Chief Engineer", availability: "2026-02-20" },
  };
  return mock[id] || null;
};

export default function EmploySeafarerPage() {
  const router = useRouter();
  const [seafarerId, setSeafarerId] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievedSeafarer, setRetrievedSeafarer] = useState<{
    name: string;
    rank: string;
    availability: string;
  } | null>(null);
  const [employerName, setEmployerName] = useState("Oceanic Manning Services Ltd.");
  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [preferredRank, setPreferredRank] = useState("");
  const [availability, setAvailability] = useState("");
  const [notes, setNotes] = useState("");
  const [pool, setPool] = useState<PoolEntry[]>([]);
  const [poolSearch, setPoolSearch] = useState("");
  const [poolRankFilter, setPoolRankFilter] = useState<string>("__all__");

  const handleRetrieve = useCallback(async () => {
    if (!seafarerId.trim()) {
      toast.error("Enter Seafarer Identification Number");
      return;
    }
    setIsRetrieving(true);
    setRetrievedSeafarer(null);
    try {
      const data = await mockRetrieveSeafarer(seafarerId.trim());
      if (data) {
        setRetrievedSeafarer(data);
        setPreferredRank(data.rank);
        setAvailability(data.availability);
        toast.success(`Found: ${data.name}`);
      } else {
        toast.error("Seafarer not found. Check the ID.");
      }
    } catch {
      toast.error("Retrieve failed");
    } finally {
      setIsRetrieving(false);
    }
  }, [seafarerId]);

  const handleEmployAndAdd = useCallback(() => {
    if (!retrievedSeafarer) {
      toast.error("Retrieve a seafarer first");
      return;
    }
    const alreadyInPool = pool.some(
      (p) => p.seafarerId.toLowerCase() === seafarerId.trim().toLowerCase()
    );
    if (alreadyInPool) {
      toast.error("This seafarer is already in your pool");
      return;
    }
    const entry: PoolEntry = {
      id: "pool-" + Date.now(),
      seafarerId: seafarerId.trim(),
      seafarerName: retrievedSeafarer.name,
      rank: retrievedSeafarer.rank,
      employerName,
      employmentStatus,
      preferredRank: preferredRank || retrievedSeafarer.rank,
      availability: availability || retrievedSeafarer.availability,
      notes,
      addedAt: new Date().toISOString(),
    };
    setPool((prev) => [entry, ...prev]);
    setRetrievedSeafarer(null);
    setSeafarerId("");
    setPreferredRank("");
    setAvailability("");
    setNotes("");
    toast.success("Seafarer added to pool");
  }, [
    retrievedSeafarer,
    seafarerId,
    pool,
    employerName,
    employmentStatus,
    preferredRank,
    availability,
    notes,
  ]);

  const handleExportPool = useCallback(() => {
    if (pool.length === 0) {
      toast.error("Pool is empty");
      return;
    }
    const blob = new Blob([JSON.stringify(pool, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employer-pool.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Pool exported as JSON");
  }, [pool]);

  const handleClearPool = useCallback(() => {
    setPool([]);
    setRetrievedSeafarer(null);
    setSeafarerId("");
    toast.info("Pool cleared");
  }, []);

  const filteredPool = pool.filter((p) => {
    const q = poolSearch.toLowerCase();
    const matchSearch =
      !q ||
      p.seafarerName.toLowerCase().includes(q) ||
      p.seafarerId.toLowerCase().includes(q) ||
      (p.rank && p.rank.toLowerCase().includes(q));
    const matchRank = poolRankFilter === "__all__" || p.rank === poolRankFilter;
    return matchSearch && matchRank;
  });

  const ranks = ["Master", "Chief Officer", "Second Officer", "Chief Engineer", "Second Engineer", "AB", "OS"];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8 px-1">
      {/* Page header: responsive stacking */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 sm:text-3xl">
              <Users className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              Employ Seafarer
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-xl">
              Retrieve seafarer details by Identification Number, then add to your employer pool.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Button variant="outline" size="sm" className="sm:size-default" onClick={handleExportPool} disabled={pool.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Export Pool (JSON)</span>
            <span className="xl:hidden">Export JSON</span>
          </Button>
          <Button variant="outline" size="sm" className="sm:size-default" onClick={handleClearPool}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button size="sm" className="sm:size-default" onClick={handleEmployAndAdd} disabled={!retrievedSeafarer}>
            <UserPlus className="h-4 w-4 mr-2" />
            Employ &amp; Add to Pool
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(320px,1fr)_minmax(0,1.2fr)]">
        {/* Left: Retrieve + employment details */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">Retrieve Seafarer</CardTitle>
              <Badge variant="secondary" className="shrink-0">Pool: {pool.length}</Badge>
            </div>
            <CardDescription className="text-sm">
              Enter the Seafarer ID (e.g. SF-1003) and click Retrieve. In real use, this will call your backend/API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <Label>Seafarer Identification Number</Label>
                <Input
                  placeholder="e.g. SF-1003"
                  value={seafarerId}
                  onChange={(e) => {
                    setSeafarerId(e.target.value);
                    setRetrievedSeafarer(null);
                  }}
                />
              </div>
              <Button
                className="sm:shrink-0 w-full sm:w-auto"
                onClick={handleRetrieve}
                disabled={isRetrieving || !seafarerId.trim()}
              >
                {isRetrieving ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                ) : (
                  <Search className="h-4 w-4 sm:mr-2" />
                )}
                <span className="sm:inline">Retrieve</span>
              </Button>
            </div>

            {isRetrieving && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Retrieving…
              </p>
            )}

            {!retrievedSeafarer && !isRetrieving && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
                No seafarer loaded yet. Retrieve a seafarer to see details here.
              </div>
            )}

            {retrievedSeafarer && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0" />
                  {retrievedSeafarer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rank: {retrievedSeafarer.rank} · Availability: {retrievedSeafarer.availability}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5">
              <div className="space-y-2 min-w-0">
                <Label>Employer Name</Label>
                <Input
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Employment Status</Label>
                <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Preferred Rank (optional)</Label>
                <Input
                  placeholder="Auto-filled from seafarer…"
                  value={preferredRank}
                  onChange={(e) => setPreferredRank(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label>Availability Date (auto)</Label>
                <Input value={availability} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes (optional)</Label>
              <Textarea
                placeholder="Notes about this seafarer…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <p className="text-xs text-muted-foreground border-t pt-4">
              Duplicate protection: If the seafarer is already in your pool, &quot;Employ &amp; Add&quot; will be blocked.
            </p>
          </CardContent>
        </Card>

        {/* Right: Employer pool */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">Employer Pool</CardTitle>
              <Badge variant="secondary">{filteredPool.length} shown</Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Input
                placeholder="Search pool by name, ID, rank…"
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
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-0 flex flex-col">
            <div className="overflow-x-auto rounded-lg border bg-muted/20 flex-1 min-h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Seafarer</TableHead>
                    <TableHead className="min-w-[100px]">Rank</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[110px]">Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPool.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-12"
                      >
                        {pool.length === 0
                          ? "No seafarers in pool. Retrieve and add above."
                          : "No matches for current filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPool.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.seafarerName}</div>
                          <div className="text-xs text-muted-foreground">{p.seafarerId}</div>
                        </TableCell>
                        <TableCell>{p.rank}</TableCell>
                        <TableCell>{p.employmentStatus}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.availability || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => router.push("/employer/contracts")}
                disabled={pool.length === 0}
              >
                Assign to Ship / Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
