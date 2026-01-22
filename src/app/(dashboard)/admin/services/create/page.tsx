"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared";
import { useCanManageServices } from "@/utils/permissions";
import { serviceManagementApi } from "@/lib/services/service-management-api";
import { getServiceTypes, getCurrencies } from "@/lib/services/lookup-service";
import { getRanks } from "@/lib/services/lookup-service";
import type { ServiceTypeDto, RankDto, CurrencyDto } from "@/lib/services/lookup-service";
import type { CreateServiceRequest } from "@/types/service-management";

const formSchema = z.object({
  serviceTypeId: z.string().min(1, "Service type is required"),
  currencyId: z.string().min(1, "Currency is required"),
  description: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateServicePage() {
  const router = useRouter();
  const canManage = useCanManageServices();

  const [isSubmitting, setIsSubmitting] = useState(false);
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
    },
  });

  useEffect(() => {
    if (!canManage) {
      router.push("/admin/services");
      return;
    }
    loadFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const loadFormData = async () => {
    setIsLoadingData(true);
    try {
      // Load service types
      const serviceTypesRes = await getServiceTypes();
      if (serviceTypesRes.success && serviceTypesRes.data) {
        setServiceTypes(serviceTypesRes.data);
      }

      // Load currencies from API
      const currenciesRes = await getCurrencies();
      if (currenciesRes.success && currenciesRes.data) {
        setCurrencies(currenciesRes.data);
      }
    } catch (error: any) {
      console.error("Failed to load form data:", error);
      toast.error("Failed to load form data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const request: CreateServiceRequest = {
        serviceTypeId: data.serviceTypeId,
        currencyId: data.currencyId,
        description: data.description?.trim() || null,
      };

      const createdService = await serviceManagementApi.createService(request);
      toast.success("Service created successfully");
      router.push(`/admin/services/${createdService.serviceId}`);
    } catch (error: any) {
      console.error("Failed to create service:", error);
      toast.error(error.message || "Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManage) {
    return null;
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Create Service" />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Service"
        description="Create a new service with its requirements"
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
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Service
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
