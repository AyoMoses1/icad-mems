"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ship, GraduationCap, Building2, Shield, ArrowRight } from "lucide-react";

const ROLE_OPTIONS: Array<{
  value: "SEAFARER" | "AGENT" | "TRAINING_INSTITUTION";
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "SEAFARER",
    label: "Seafarer",
    description: "Register as a seafarer and submit your profile, documents, and voyage history.",
    icon: <Ship className="h-6 w-6" />,
  },
  {
    value: "AGENT",
    label: "Seafarer Employer",
    description: "Register as a seafarer employer to manage seafarer applications and services.",
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    value: "TRAINING_INSTITUTION",
    label: "Training Institution",
    description: "Register your training institution to offer courses and certifications.",
    icon: <GraduationCap className="h-6 w-6" />,
  },
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "SEAFARER" | "AGENT" | "TRAINING_INSTITUTION" | ""
  >("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      if (selectedRole === "SEAFARER") {
        router.push("/onboarding/seafarer/setup");
        return;
      }
      if (selectedRole === "AGENT" || selectedRole === "TRAINING_INSTITUTION") {
        router.push(`/onboarding/verify-identity?role=${selectedRole}`);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* About the app */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome to the SEAFARER Workspace</CardTitle>
                <CardDescription className="text-base mt-1">
                  of the Maritime Electronic Management System(MEMS)
                </CardDescription>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This platform helps seafarers, employers, and training institutions
              manage registrations, certificates, and compliance. Choose your
              role below to start the onboarding process.
            </p>
          </CardHeader>
        </Card>

        {/* Role selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose your role</CardTitle>
            <CardDescription>
              Since this is your first time accessing the SEAFARER Workspace, please select your role below for the system to setup your environmment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Select
                value={selectedRole}
                onValueChange={(v) =>
                  setSelectedRole(
                    v as "SEAFARER" | "AGENT" | "TRAINING_INSTITUTION" | ""
                  )
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="rounded-lg bg-muted/50 p-4 border">
                <div className="flex items-start gap-3">
                  {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.icon}
                  <div>
                    <p className="font-medium">
                      {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ROLE_OPTIONS.find((r) => r.value === selectedRole)
                        ?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? "Continuing..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
