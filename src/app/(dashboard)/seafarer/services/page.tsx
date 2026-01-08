"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Loader2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState } from "@/components/shared";
import {
  getAvailableServices,
  type ServiceDto,
} from "@/lib/services/application-service";

export default function ServicesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await getAvailableServices();
      const ok = response.success ?? (response as any).successful;
      
      if (ok && response.data) {
        const items = Array.isArray(response.data) ? response.data : [];
        setServices(items); // Show all services regardless of isActive status
      } else {
        toast.error(response.message || "Failed to load services");
      }
    } catch (error: any) {
      console.error("Error loading services:", error);
      toast.error(error.message || "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const name = service.serviceName || service.name || "";
    const description = service.description || "";
    const searchLower = searchQuery.toLowerCase();
    
    return (
      name.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower)
    );
  });

  const handleApply = (serviceId: string) => {
    router.push(`/seafarer/services/${serviceId}/apply`);
  };

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
        title="Available Services"
        description="Browse and apply for maritime services"
        action={
          <Button variant="outline" onClick={loadServices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No services found"
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "No services are currently available"
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card 
              key={service.serviceId || service.id} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleApply(service.serviceId || service.id || "")}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={service.isActive 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {service.isActive ? "Active" : "Available"}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">
                  {service.serviceName || service.name || "Service"}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description || "Apply for this maritime service"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {(service.serviceTypeDescription || service.serviceType) && (
                    <Badge variant="secondary">
                      {service.serviceTypeDescription || service.serviceType}
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    Apply Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

