"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  GraduationCap, 
  ArrowRight,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleOption {
  id: "seafarer" | "agent" | "training-institution";
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: "seafarer",
    title: "Seafarer Onboarding",
    description: "Complete your profile as a seafarer to access seafarer services and applications",
    icon: <User className="h-8 w-8" />,
    route: "/onboarding/seafarer",
    color: "bg-blue-500",
  },
  {
    id: "agent",
    title: "Agent Onboarding",
    description: "Register as an agent to manage seafarer applications and services",
    icon: <Building2 className="h-8 w-8" />,
    route: "/onboarding/institution?type=agent",
    color: "bg-green-500",
  },
  {
    id: "training-institution",
    title: "Training Institution Onboarding",
    description: "Register your training institution to offer courses and certifications",
    icon: <GraduationCap className="h-8 w-8" />,
    route: "/onboarding/institution?type=training",
    color: "bg-purple-500",
  },
];

export function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption["id"] | null>(null);

  const handleSelectRole = (option: RoleOption) => {
    setSelectedRole(option.id);
    router.push(option.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome, Owner
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            As an owner, you can complete onboarding for any role. Please select
            the type of onboarding you would like to complete.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((option) => (
            <Card
              key={option.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
                selectedRole === option.id && "ring-2 ring-primary"
              )}
              onClick={() => handleSelectRole(option)}
            >
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div
                    className={cn(
                      "rounded-lg p-3 text-white",
                      option.color
                    )}
                  >
                    {option.icon}
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole(option);
                  }}
                >
                  Start Onboarding
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <Card className="bg-muted/50 border-muted">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">About Owner Onboarding</h3>
                <p className="text-sm text-muted-foreground">
                  As an owner, you have the flexibility to complete onboarding
                  for multiple roles. You can complete onboarding for Seafarer,
                  Agent, or Training Institution roles. Each onboarding process
                  is independent and can be completed at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

