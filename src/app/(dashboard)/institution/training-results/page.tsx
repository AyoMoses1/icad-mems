"use client";

import { useState, useEffect } from "react";
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
  GraduationCap,
  Search,
  Upload,
  Download,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface TrainingResult {
  id: string;
  seafarerName: string;
  seafarerRn: string;
  courseCode: string;
  courseName: string;
  result: "PASS" | "FAIL" | "PENDING";
  score?: number;
  examDate: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Mock data for demonstration - replace with actual API call
const mockTrainingResults: TrainingResult[] = [
  {
    id: "1",
    seafarerName: "John Doe",
    seafarerRn: "SEA-2026-0001",
    courseCode: "STCW-PST",
    courseName: "Personal Survival Techniques",
    result: "PASS",
    score: 85,
    examDate: "2026-01-15",
    uploadedAt: "2026-01-20T10:30:00Z",
    uploadedBy: "Admin User",
  },
  {
    id: "2",
    seafarerName: "Jane Smith",
    seafarerRn: "SEA-2026-0002",
    courseCode: "STCW-FF",
    courseName: "Fire Fighting",
    result: "PASS",
    score: 92,
    examDate: "2026-01-16",
    uploadedAt: "2026-01-20T10:30:00Z",
    uploadedBy: "Admin User",
  },
  {
    id: "3",
    seafarerName: "Michael Johnson",
    seafarerRn: "SEA-2026-0003",
    courseCode: "STCW-EFA",
    courseName: "Elementary First Aid",
    result: "FAIL",
    score: 45,
    examDate: "2026-01-17",
    uploadedAt: "2026-01-21T14:00:00Z",
    uploadedBy: "Admin User",
  },
  {
    id: "4",
    seafarerName: "Sarah Williams",
    seafarerRn: "SEA-2026-0004",
    courseCode: "STCW-PSCRB",
    courseName: "Personal Safety and Social Responsibilities",
    result: "PENDING",
    examDate: "2026-01-18",
    uploadedAt: "2026-01-22T09:15:00Z",
    uploadedBy: "Admin User",
  },
];

export default function TrainingResultsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState<string>("all");

  useEffect(() => {
    loadTrainingResults();
  }, []);

  const loadTrainingResults = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getTrainingResults();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
      setResults(mockTrainingResults);
    } catch (error) {
      console.error("Error loading training results:", error);
      toast.error("Failed to load training results");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.seafarerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.seafarerRn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterResult === "all" || result.result === filterResult;

    return matchesSearch && matchesFilter;
  });

  const getResultBadge = (result: TrainingResult["result"]) => {
    switch (result) {
      case "PASS":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Pass
          </Badge>
        );
      case "FAIL":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Fail
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const stats = {
    total: results.length,
    passed: results.filter((r) => r.result === "PASS").length,
    failed: results.filter((r) => r.result === "FAIL").length,
    pending: results.filter((r) => r.result === "PENDING").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Training Results
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage training results for seafarers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadTrainingResults}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/institution/training-results/upload")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Results</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Passed</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.passed}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by seafarer name, RN, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="PASS">Passed</SelectItem>
                <SelectItem value="FAIL">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Training Results</CardTitle>
          <CardDescription>
            {filteredResults.length} result(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No training results found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  router.push("/institution/training-results/upload")
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Results
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seafarer</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-muted">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{result.seafarerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.seafarerRn}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.courseCode}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.courseName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(result.examDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.score !== undefined ? (
                          <span className="font-medium">{result.score}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getResultBadge(result.result)}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(result.uploadedAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
