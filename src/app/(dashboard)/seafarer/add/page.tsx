"use client";

import { useState } from "react";
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

const addSeafarerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  alternativePhoneNumber: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  residentialAddress: z.string().min(1, "Residential address is required"),
  meansOfIdentification: z
    .string()
    .min(1, "Means of identification is required"),
  idNumber: z.string().min(1, "ID number is required"),
});

type AddSeafarerFormData = z.infer<typeof addSeafarerSchema>;

export default function AddSeafarerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddSeafarerFormData>({
    resolver: zodResolver(addSeafarerSchema),
    defaultValues: {
      firstName: "David",
      middleName: "David",
      lastName: "David",
      email: "your@email.com",
      phoneNumber: "+234 800 000 0000",
      alternativePhoneNumber: "+234 000 000 0000",
      country: "Nigeria",
      state: "Lagos",
      city: "Lagos",
      residentialAddress: "15 Marina Road, Victoria Island, Lagos",
      meansOfIdentification: "Passport",
      idNumber: "Nigeria",
    },
  });

  const onSubmit = async (data: AddSeafarerFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call
      console.log("Form data:", data);
      toast.success("Seafarer created successfully");
      router.push("/seafarer/registry");
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
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    {...register("idNumber")}
                    error={!!errors.idNumber}
                  />
                  {errors.idNumber && (
                    <p className="text-sm text-destructive">
                      {errors.idNumber.message}
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
