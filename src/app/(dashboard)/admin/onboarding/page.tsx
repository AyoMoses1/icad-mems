"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Building2,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getAllOnboardings,
  getPendingOnboardings,
  updateOnboardingStatus,
  type UserSeafarerOnboardingDto,
  OnboardingStatus,
} from "@/lib/services/onboarding-service";

// Use the correct type
type OnboardingDto = UserSeafarerOnboardingDto & {
  id: string;
  status: string;
  role: string;
  sin?: string;
  rn?: string;
  notes?: string;
  createdAt?: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  SEAFARER: <User className="h-4 w-4" />,
  TRAINING_INSTITUTION: <Building2 className="h-4 w-4" />,
  AGENT: <Building2 className="h-4 w-4" />,
  ADMIN: <Shield className="h-4 w-4" />,
  OFFICER: <Shield className="h-4 w-4" />,
  INSPECTOR: <Shield className="h-4 w-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  SEAFARER: "bg-blue-100 text-blue-800",
  TRAINING_INSTITUTION: "bg-purple-100 text-purple-800",
  AGENT: "bg-indigo-100 text-indigo-800",
  ADMIN: "bg-red-100 text-red-800",
  OFFICER: "bg-orange-100 text-orange-800",
  INSPECTOR: "bg-teal-100 text-teal-800",
};

export default function OnboardingAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [onboardings, setOnboardings] = useState<OnboardingDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingDto | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | "SUSPENDED">("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOnboardings();
  }, [statusFilter]);

  const loadOnboardings = async () => {
    try {
      setIsLoading(true);
      let response;
      if (statusFilter === "PENDING") {
        response = await getPendingOnboardings();
      } else {
        response = await getAllOnboardings();
      }
      
      if (response.success) {
        let data = (response.data || []).map((o: UserSeafarerOnboardingDto) => ({
          ...o,
          id: o.userSeafarerOnboardingId || o.id || "",
          createdAt: o.dateCreated || o.createdAt,
        })) as OnboardingDto[];
        // Filter by status if not pending
        if (statusFilter && statusFilter !== "PENDING") {
          data = data.filter((o) => o.status === statusFilter);
        }
        setOnboardings(data);
      }
    } catch (error) {
      console.error("Failed to load onboardings:", error);
      toast.error("Failed to load onboarding requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewOnboarding = async () => {
    if (!selectedOnboarding) return;
    
    if (reviewAction === "APPROVED" && !registrationNumber.trim()) {
      toast.error("Please enter a registration number for approval");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateOnboardingStatus(selectedOnboarding.id, {
        status: reviewAction as OnboardingStatus,
        rn: reviewAction === "APPROVED" ? registrationNumber : undefined,
        notes: reviewNotes || undefined,
      });
      
      if (response.success) {
        toast.success(`Onboarding ${reviewAction.toLowerCase()} successfully`);
        setIsReviewDialogOpen(false);
        setSelectedOnboarding(null);
        setReviewNotes("");
        setRegistrationNumber("");
        loadOnboardings();
      } else {
        toast.error(response.message || "Failed to update onboarding");
      }
    } catch (error) {
      console.error("Failed to update onboarding:", error);
      toast.error("Failed to update onboarding status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewDialog = (onboarding: OnboardingDto, action: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    setSelectedOnboarding(onboarding);
    setReviewAction(action);
    setReviewNotes("");
    setRegistrationNumber("");
    setIsReviewDialogOpen(true);
  };

  const viewOnboardingDetails = (id: string) => {
    router.push(`/admin/onboarding/${id}`);
  };

  const filteredOnboardings = onboardings.filter((onboarding) => {
    const matchesSearch =
      !searchTerm ||
      onboarding.sin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.rn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || roleFilter === "all" || onboarding.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const pendingCount = onboardings.filter((o) => o.status === "PENDING").length;
  const approvedCount = onboardings.filter((o) => o.status === "APPROVED").length;
  const rejectedCount = onboardings.filter((o) => o.status === "REJECTED").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Management"
        description="Review and manage user onboarding requests"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SIN or RN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <User className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SEAFARER">Seafarer</SelectItem>
            <SelectItem value="TRAINING_INSTITUTION">Training Institution</SelectItem>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="OFFICER">Officer</SelectItem>
            <SelectItem value="INSPECTOR">Inspector</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVED" ? "Approve" : reviewAction === "REJECTED" ? "Reject" : "Suspend"} Onboarding
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "APPROVED"
                ? "Approve this onboarding request and assign a registration number"
                : "Provide a reason for this decision"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOnboarding && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={ROLE_COLORS[selectedOnboarding.role] || "bg-gray-100"}>
                    {ROLE_ICONS[selectedOnboarding.role]}
                    <span className="ml-1">{selectedOnboarding.role}</span>
                  </Badge>
                </div>
                {selectedOnboarding.sin && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">SIN:</span> {selectedOnboarding.sin}
                  </p>
                )}
              </div>
            )}
            {reviewAction === "APPROVED" && (
              <div className="space-y-2">
                <Label htmlFor="rn">Registration Number (RN) *</Label>
                <Input
                  id="rn"
                  placeholder="e.g., SEAF001234"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments..."
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewOnboarding}
              disabled={isSubmitting}
              className={
                reviewAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : reviewAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {isSubmitting
                ? "Processing..."
                : reviewAction === "APPROVED"
                ? "Approve"
                : reviewAction === "REJECTED"
                ? "Reject"
                : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboardings List */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Requests ({filteredOnboardings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOnboardings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No onboarding requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOnboardings.map((onboarding) => (
                <div
                  key={onboarding.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      {ROLE_ICONS[onboarding.role] || <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={ROLE_COLORS[onboarding.role] || "bg-gray-100"}>
                          {onboarding.role}
                        </Badge>
                        <Badge className={STATUS_COLORS[onboarding.status]}>
                          {onboarding.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {onboarding.sin && (
                          <span>SIN: {onboarding.sin}</span>
                        )}
                        {onboarding.rn && (
                          <span className="font-medium text-green-600">RN: {onboarding.rn}</span>
                        )}
                        {onboarding.createdAt && (
                          <span>
                            Created: {format(new Date(onboarding.createdAt), "PPP")}
                          </span>
                        )}
                      </div>
                      {onboarding.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {onboarding.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewOnboardingDetails(onboarding.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {onboarding.status === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => openReviewDialog(onboarding, "APPROVED")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => openReviewDialog(onboarding, "REJECTED")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {onboarding.status === "APPROVED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-600"
                        onClick={() => openReviewDialog(onboarding, "SUSPENDED")}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

