"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceManagementApi, requirementListsApi } from "@/lib/services/service-management-api";
import { getRanks } from "@/lib/services/lookup-service";
import type { RankDto } from "@/lib/services/lookup-service";
import type {
  ServiceRequirementDto,
  UpdateServiceRequirementRequest,
  RequirementListDto,
} from "@/types/service-management";

const formSchema = z.object({
  requirementListId: z.string().min(1, "Requirement is required"),
  rankId: z.string().min(1, "Rank is required"),
  requiredValue: z.string().min(1, "Required value is required"),
});

type FormData = z.infer<typeof formSchema>;

interface EditRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  requirement: ServiceRequirementDto;
  onSuccess: () => void;
}

export function EditRequirementDialog({
  open,
  onOpenChange,
  serviceId,
  requirement,
  onSuccess,
}: EditRequirementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [requirementLists, setRequirementLists] = useState<RequirementListDto[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirementListId: requirement.requirementListId,
      rankId: requirement.rankId,
      requiredValue: requirement.requiredValue,
    },
  });

  useEffect(() => {
    if (open) {
      loadData();
      reset({
        requirementListId: requirement.requirementListId,
        rankId: requirement.rankId,
        requiredValue: requirement.requiredValue,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requirement]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // Load ranks and requirement lists in parallel
      const [ranksRes, requirementListsData] = await Promise.all([
        getRanks(),
        requirementListsApi.getRequirementLists(),
      ]);

      if (ranksRes.success && ranksRes.data) {
        setRanks(ranksRes.data);
      } else {
        // Handle case where data might be directly in response
        const ranksData = Array.isArray(ranksRes.data) ? ranksRes.data : [];
        setRanks(ranksData);
      }

      // Filter to show only active requirement lists
      setRequirementLists(requirementListsData.filter(req => req.isActive));
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load form data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const request: UpdateServiceRequirementRequest = {
        requirementListId: data.requirementListId,
        rankId: data.rankId,
        requiredValue: data.requiredValue,
      };

      await serviceManagementApi.updateServiceRequirement(
        serviceId,
        requirement.serviceRequirementId,
        request
      );
      toast.success("Requirement updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update requirement:", error);
      toast.error(error.message || "Failed to update requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Requirement</DialogTitle>
          <DialogDescription>
            Update requirement details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Requirement List */}
            <div className="space-y-2">
              <Label htmlFor="requirementListId">
                Requirement <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("requirementListId")}
                onValueChange={(value) => setValue("requirementListId", value)}
                disabled={isLoadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requirement" />
                </SelectTrigger>
                <SelectContent>
                  {requirementLists.map((req) => (
                    <SelectItem key={req.requirementListId} value={req.requirementListId}>
                      {req.description} {req.metricDescription && `(${req.metricDescription})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.requirementListId && (
                <p className="text-sm text-destructive">
                  {errors.requirementListId.message}
                </p>
              )}
            </div>

            {/* Rank */}
            <div className="space-y-2">
              <Label htmlFor="rankId">
                Rank <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("rankId")}
                onValueChange={(value) => setValue("rankId", value)}
                disabled={isLoadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {ranks.map((rank) => (
                    <SelectItem key={rank.ranksId} value={rank.ranksId}>
                      {rank.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rankId && (
                <p className="text-sm text-destructive">
                  {errors.rankId.message}
                </p>
              )}
            </div>

            {/* Required Value */}
            <div className="space-y-2">
              <Label htmlFor="requiredValue">
                Required Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="requiredValue"
                {...register("requiredValue")}
                placeholder="e.g., 18, 2 years, Yes"
                disabled={isLoadingData}
              />
              {errors.requiredValue && (
                <p className="text-sm text-destructive">
                  {errors.requiredValue.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingData}>
              {isSubmitting ? "Updating..." : "Update Requirement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
