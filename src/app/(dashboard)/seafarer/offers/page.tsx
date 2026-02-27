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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, FileCheck, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  getMyEmploymentOffers,
  acceptEmploymentOffer,
  rejectEmploymentOffer,
  type SeafarerEmploymentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { ApiError } from "@/lib/api-client";

export default function SeafarerOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<SeafarerEmploymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyEmploymentOffers(pendingOnly);
      setOffers(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load offers";
      toast.error(msg);
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [pendingOnly]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleAccept = useCallback(
    async (id: string) => {
      setActionId(id);
      try {
        await acceptEmploymentOffer(id);
        toast.success("Offer accepted. The employer has been notified.");
        loadOffers();
      } catch (e) {
        const err = e instanceof ApiError ? e : (e as Error);
        const code = e instanceof ApiError ? e.code : undefined;
        if (code === "ALREADY_EMPLOYED") {
          toast.error("You already have an active employment. You cannot accept another until it ends.");
        } else if (code === "INVALID_STATUS") {
          toast.error("This offer is no longer pending.");
        } else {
          toast.error(err?.message ?? "Accept failed.");
        }
      } finally {
        setActionId(null);
      }
    },
    [loadOffers]
  );

  const handleReject = useCallback(
    async (id: string) => {
      setActionId(id);
      try {
        await rejectEmploymentOffer(id);
        toast.success("Offer rejected. The employer has been notified.");
        loadOffers();
      } catch (e) {
        const err = e as Error;
        toast.error(err?.message ?? "Reject failed.");
      } finally {
        setActionId(null);
      }
    },
    [loadOffers]
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6 px-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              <FileCheck className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              Employment offers
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              View and respond to employment offers from employers. Accept or reject pending offers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2">
            <input
              type="checkbox"
              checked={pendingOnly}
              onChange={(e) => setPendingOnly(e.target.checked)}
              className="rounded border-input"
            />
            Pending only
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My offers</CardTitle>
          <CardDescription className="text-sm">
            {pendingOnly
              ? "Showing only pending offers. Uncheck “Pending only” to see all (accepted/rejected)."
              : "Showing all offers."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-lg border bg-muted/20">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Employer</TableHead>
                    <TableHead className="min-w-[100px]">Rank</TableHead>
                    <TableHead className="min-w-[90px]">Contract</TableHead>
                    <TableHead className="min-w-[80px]">Dates</TableHead>
                    <TableHead className="min-w-[90px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-12"
                      >
                        {pendingOnly
                          ? "No pending offers."
                          : "No employment offers yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((o) => (
                      <TableRow key={o.seafarerEmploymentId}>
                        <TableCell>
                          <div className="font-medium">
                            {o.companyLegalName ?? "—"}
                          </div>
                        </TableCell>
                        <TableCell>{o.rankDescription ?? "—"}</TableCell>
                        <TableCell>{o.contractType ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {o.startDate && o.endDate
                            ? `${formatDate(o.startDate)} – ${formatDate(o.endDate)}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              o.acceptanceStatus === "Accepted"
                                ? "default"
                                : o.acceptanceStatus === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {o.acceptanceStatus ?? "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {o.dateCreated ? formatDate(o.dateCreated) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {o.acceptanceStatus === "Pending" && (
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleAccept(o.seafarerEmploymentId)
                                }
                                disabled={actionId !== null}
                              >
                                {actionId === o.seafarerEmploymentId ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReject(o.seafarerEmploymentId)
                                }
                                disabled={actionId !== null}
                              >
                                {actionId === o.seafarerEmploymentId ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3 mr-1" />
                                )}
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
