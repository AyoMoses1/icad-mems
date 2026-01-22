"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared";
import { useCanManageServices } from "@/utils/permissions";
import { servicesApi, serviceManagementApi } from "@/lib/services/service-management-api";
import { getServiceTypes, getCurrencies } from "@/lib/services/lookup-service";
import type { ServiceTypeDto, CurrencyDto } from "@/lib/services/lookup-service";
import type { UpdateServiceRequest } from "@/types/service-management";

const formSchema = z.object({
  serviceTypeId: z.string().min(1, "Service type is required"),
  currencyId: z.string().min(1, "Currency is required"),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  const canManage = useCanManageServices();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDto[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceTypeId: "",
      currencyId: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!canManage) {
      router.push(`/admin/services/${serviceId}`);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, serviceId]);

  const loadData = async () => {
    setIsLoading(true);
    setIsLoadingData(true);
    try {
      // Load service types and currencies in parallel
      const [serviceTypesRes, currenciesRes] = await Promise.all([
        getServiceTypes(),
        getCurrencies(),
      ]);

      if (serviceTypesRes.success && serviceTypesRes.data) {
        setServiceTypes(serviceTypesRes.data);
      }

      if (currenciesRes.success && currenciesRes.data) {
        setCurrencies(currenciesRes.data);
      }

      // Load service
      const service = await servicesApi.getServiceById(serviceId);
      
      // Set form values
      setValue("serviceTypeId", service.serviceTypeId);
      setValue("description", service.description || null);
      setValue("isActive", service.isActive);
      
      // Note: ServiceDto doesn't include currencyId in the response
      // We'll need to set it from the service if available, or leave it empty
      // The user will need to select a currency if not set
      // For now, we'll leave it empty and let the user select
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error(error.message || "Failed to load service data");
      router.push("/admin/services");
    } finally {
      setIsLoading(false);
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const request: UpdateServiceRequest = {
        serviceTypeId: data.serviceTypeId,
        currencyId: data.currencyId,
        description: data.description?.trim() || null,
        isActive: data.isActive,
      };

      await serviceManagementApi.updateService(serviceId, request);
      toast.success("Service updated successfully");
      router.push(`/admin/services/${serviceId}`);
    } catch (error: any) {
      console.error("Failed to update service:", error);
      toast.error(error.message || "Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) {
    return null;
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Service" />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Service"
        description="Update service information"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceTypeId">
                Service Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("serviceTypeId")}
                onValueChange={(value) => setValue("serviceTypeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem
                      key={type.serviceTypeId}
                      value={type.serviceTypeId}
                    >
                      {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceTypeId && (
                <p className="text-sm text-destructive">
                  {errors.serviceTypeId.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currencyId">
                Currency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("currencyId")}
                onValueChange={(value) => setValue("currencyId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.currencyId} value={currency.currencyId}>
                      {currency.code} - {currency.name || currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currencyId && (
                <p className="text-sm text-destructive">
                  {errors.currencyId.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter service description (optional)"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive services will not be available for applications
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Service
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
