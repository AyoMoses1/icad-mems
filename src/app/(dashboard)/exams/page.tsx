"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  Trophy,
  List,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        description="Manage your NIMASA certification examinations"
      />

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/exams/schedule" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 w-fit mb-3">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Exam Schedule</h3>
                  <p className="text-sm text-muted-foreground">
                    View upcoming examination dates
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/exams/register" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 rounded-lg bg-green-50 text-green-600 w-fit mb-3">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Register for Exam</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply for new examination
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/exams/history" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 rounded-lg bg-purple-50 text-purple-600 w-fit mb-3">
                    <List className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Exam History</h3>
                  <p className="text-sm text-muted-foreground">
                    View past examinations
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <Link href="/exams/results" className="block">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600 w-fit mb-3">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your exam results
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Examinations */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Examinations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Navigation Officer Grade II - Written
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>NIMASA Training Institute</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Issued: Jan 15, 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Expires: Jan 15, 2025</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




