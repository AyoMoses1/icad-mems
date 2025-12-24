"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createSeafarer } from "@/lib/services/seafarers";
import {
  getNationalities,
  type NationalityDto,
} from "@/lib/services/nationalities";
import { getRanks, type RankDto } from "@/lib/services/ranks";
import { useAuthStore } from "@/store";

const addSeafarerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  alternativePhoneNumber: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  residentialAddress: z.string().optional(),
  meansOfIdentification: z.string().optional(),
  idNumber: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  ninNumber: z.string().optional(),
  sidNumber: z.string().optional(),
  dischargeBookNo: z.string().optional(),
  currentRankId: z.string().optional(),
  homeAddress: z.string().optional(),
  isActive: z.boolean().optional(),
  walletAddress: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  nationalityId: z.string().optional(),
  authUserId: z.string().optional(),
});

type AddSeafarerFormData = z.infer<typeof addSeafarerSchema>;

export default function AddSeafarerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [nationalities, setNationalities] = useState<NationalityDto[]>([]);
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(false);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(false);
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddSeafarerFormData>({
    resolver: zodResolver(addSeafarerSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      alternativePhoneNumber: "",
      country: "",
      state: "",
      city: "",
      residentialAddress: "",
      meansOfIdentification: "",
      idNumber: "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      ninNumber: "",
      sidNumber: "",
      dischargeBookNo: "",
      currentRankId: "",
      homeAddress: "",
      isActive: true,
      walletAddress: "",
      profilePictureUrl: "",
      nationalityId: "",
      authUserId: "",
    },
  });

  useEffect(() => {
    const loadNationalities = async () => {
      setIsLoadingNationalities(true);
      try {
        const data = await getNationalities();
        setNationalities(data || []);
      } catch (error) {
        console.error("Failed to load nationalities", error);
      } finally {
        setIsLoadingNationalities(false);
      }
    };
    loadNationalities();

    const loadRanks = async () => {
      setIsLoadingRanks(true);
      try {
        const res = await getRanks({
          pageNumber: 1,
          pageSize: 50,
          sortDirection: "asc",
        });
        const items = res.items || [];
        console.log(res.items)
        setRanks(items);
      } catch (error) {
        console.error("Failed to load ranks", error);
      } finally {
        setIsLoadingRanks(false);
      }
    };
    loadRanks();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setValue("authUserId", user.id);
    }
  }, [user?.id, setValue]);

  const onSubmit = async (data: AddSeafarerFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: data.firstName.trim(),
        middleName: data.middleName?.trim() || undefined,
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phoneNumber: data.phoneNumber.trim(),
        alternativePhoneNumber:
          data.alternativePhoneNumber?.trim() || undefined,
        country: data.country?.trim() || undefined,
        state: data.state?.trim() || undefined,
        city: data.city?.trim() || undefined,
        residentialAddress: data.residentialAddress?.trim() || undefined,
        meansOfIdentification: data.meansOfIdentification?.trim() || undefined,
        idNumber: data.idNumber?.trim() || undefined,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender?.trim() || undefined,
        nationality: data.nationality?.trim() || undefined,
        ninNumber: data.ninNumber?.trim() || undefined,
        sidNumber: data.sidNumber?.trim() || undefined,
        dischargeBookNo: data.dischargeBookNo?.trim() || undefined,
        currentRankId: data.currentRankId,
        homeAddress: data.homeAddress?.trim() || undefined,
        isActive: data.isActive,
        walletAddress: data.walletAddress?.trim() || undefined,
        profilePictureUrl: data.profilePictureUrl?.trim() || undefined,
        nationalityId: data.nationalityId?.trim() || undefined,
        authUserId: user?.id || data.authUserId?.trim() || undefined,
      };

      const response = await createSeafarer(payload);
      const ok = response.success ?? (response as any).successful;
      if (!ok) {
        toast.error(response.message || "Failed to create seafarer");
      } else {
        toast.success("Seafarer created successfully");
        router.push("/seafarer/registry");
      }
    } catch (error) {
      toast.error("Failed to create seafarer", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add Seafarer User" />

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* First Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    error={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    error={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    error={!!errors.phoneNumber}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={watch("country")}
                    onValueChange={(value) => setValue("country", value)}
                  >
                    <SelectTrigger error={!!errors.country}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-destructive">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    error={!!errors.city}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ninNumber">NIN Number</Label>
                  <Input
                    id="ninNumber"
                    {...register("ninNumber")}
                    error={!!errors.ninNumber}
                  />
                  {errors.ninNumber && (
                    <p className="text-sm text-destructive">
                      {errors.ninNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Second Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...register("middleName")}
                    error={!!errors.middleName}
                  />
                  {errors.middleName && (
                    <p className="text-sm text-destructive">
                      {errors.middleName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternativePhoneNumber">
                    Alternative Phone Number
                  </Label>
                  <Input
                    id="alternativePhoneNumber"
                    {...register("alternativePhoneNumber")}
                    error={!!errors.alternativePhoneNumber}
                  />
                  {errors.alternativePhoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.alternativePhoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    error={!!errors.dateOfBirth}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meansOfIdentification">
                    Means of Identification
                  </Label>
                  <Select
                    value={watch("meansOfIdentification")}
                    onValueChange={(value) =>
                      setValue("meansOfIdentification", value)
                    }
                  >
                    <SelectTrigger error={!!errors.meansOfIdentification}>
                      <SelectValue placeholder="Select means of identification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Driver License">
                        Driver License
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.meansOfIdentification && (
                    <p className="text-sm text-destructive">
                      {errors.meansOfIdentification.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register("state")}
                    error={!!errors.state}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Residential Address */}
            <div className="space-y-2">
              <Label htmlFor="residentialAddress">Residential Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="residentialAddress"
                  className="pl-10"
                  {...register("residentialAddress")}
                  error={!!errors.residentialAddress}
                />
              </div>
              {errors.residentialAddress && (
                <p className="text-sm text-destructive">
                  {errors.residentialAddress.message}
                </p>
              )}
            </div>

            {/* Additional Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" {...register("gender")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select
                    value={watch("nationalityId")}
                    onValueChange={(value) => {
                      setValue("nationalityId", value);
                      const selected = nationalities.find(
                        (n) => n.id === value,
                      );
                      setValue(
                        "nationality",
                        selected?.countryName || selected?.isoCode3 || value,
                      );
                    }}
                    disabled={isLoadingNationalities}
                  >
                    <SelectTrigger error={!!errors.nationalityId}>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.countryName || n.isoCode3 || n.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.nationalityId && (
                    <p className="text-sm text-destructive">
                      {errors.nationalityId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sidNumber">SID Number</Label>
                  <Input id="sidNumber" {...register("sidNumber")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dischargeBookNo">Discharge Book No</Label>
                  <Input
                    id="dischargeBookNo"
                    {...register("dischargeBookNo")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentRankId">Current Rank</Label>
                  <Select
                    value={watch("currentRankId")}
                    onValueChange={(value) => setValue("currentRankId", value)}
                    disabled={isLoadingRanks}
                  >
                    <SelectTrigger error={!!errors.currentRankId}>
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {ranks.map((rank) => (
                        <SelectItem key={rank.id} value={rank.id}>
                          {rank.title || rank.category || rank.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currentRankId && (
                    <p className="text-sm text-destructive">
                      {errors.currentRankId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input id="idNumber" {...register("idNumber")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeAddress">Home Address</Label>
                  <Input id="homeAddress" {...register("homeAddress")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input id="walletAddress" {...register("walletAddress")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
                  <Input
                    id="profilePictureUrl"
                    {...register("profilePictureUrl")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalityId">Nationality</Label>
                  <Select
                    value={watch("nationalityId")}
                    onValueChange={(value) => {
                      setValue("nationalityId", value);
                      const selected = nationalities.find(
                        (n) => n.id === value,
                      );
                      if (selected?.countryName) {
                        setValue("nationality", selected.countryName);
                      }
                    }}
                    disabled={isLoadingNationalities}
                  >
                    <SelectTrigger error={!!errors.nationalityId}>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.countryName || n.isoCode3 || n.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.nationalityId && (
                    <p className="text-sm text-destructive">
                      {errors.nationalityId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authUserId">Auth User ID</Label>
                  <Input id="authUserId" {...register("authUserId")} />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={watch("isActive")}
                    onChange={(e) => setValue("isActive", e.target.checked)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                loading={isLoading}
              >
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
