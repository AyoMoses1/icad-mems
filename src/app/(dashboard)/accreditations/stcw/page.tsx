"use client";

import { useEffect, useState } from "react";
import { Search, Award, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import { getStcwStandards, type StcwStandardDto } from "@/lib/services/accreditation-service";

export default function STCWStandardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [standards, setStandards] = useState<StcwStandardDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      setIsLoading(true);
      const response = await getStcwStandards();
      if (response.success) {
        setStandards(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load STCW standards:", error);
      toast.error("Failed to load STCW standards");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStandards = standards.filter((standard) => {
    const matchesSearch =
      !searchTerm ||
      standard.stcwRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        title="STCW Standards"
        description="Standards of Training, Certification and Watchkeeping for Seafarers"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search STCW standards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Standards List */}
      <Card>
        <CardHeader>
          <CardTitle>STCW Standards ({filteredStandards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStandards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No STCW standards found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStandards.map((standard) => (
                <div
                  key={standard.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{standard.stcwRef}</p>
                        {standard.isActive && (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {standard.description}
                      </p>
                    </div>
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





