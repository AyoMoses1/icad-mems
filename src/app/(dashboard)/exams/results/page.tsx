"use client";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

export default function ExamResultsPage() {
  const results = [
    {
      id: "1",
      examName: "Navigation Officer Grade II - Written",
      score: 85,
      status: "passed",
      date: "15 Jan 2024",
      center: "NIMASA HQ, Lagos",
    },
    {
      id: "2",
      examName: "Basic Safety Training",
      score: 92,
      status: "passed",
      date: "10 Jan 2024",
      center: "Maritime Academy, Oron",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge variant="success">Passed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Results"
        description="View your examination results and certificates"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{result.examName}</CardTitle>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-3xl font-bold">{result.score}%</p>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="font-medium">{result.date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Center: </span>
                  <span className="font-medium">{result.center}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}




