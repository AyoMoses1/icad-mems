"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreVertical, Search } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function SeafarerApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const applications = [
    {
      id: "1",
      applicant: "John Doe",
      applicationId: "APP-2024-0156",
      serviceType: "CoC Class II",
      date: "15 Jan 2024",
      status: "pending",
    },
    {
      id: "2",
      applicant: "John Doe",
      applicationId: "APP-2024-0157",
      serviceType: "Medical Certificate",
      date: "15 Jan 2024",
      status: "pending",
    },
    {
      id: "3",
      applicant: "John Doe",
      applicationId: "APP-2024-0158",
      serviceType: "STCW Basic Safety",
      date: "15 Jan 2024",
      status: "pending",
    },
    {
      id: "4",
      applicant: "John Doe",
      applicationId: "APP-2024-0159",
      serviceType: "Endorsement - Rating",
      date: "15 Jan 2024",
      status: "pending",
    },
    {
      id: "5",
      applicant: "John Doe",
      applicationId: "APP-2024-0160",
      serviceType: "CoC Revalication",
      date: "15 Jan 2024",
      status: "pending",
    },
  ];

  const tabs = [
    { id: "all", label: "All Applications" },
    { id: "pending", label: "Pending Review" },
    { id: "certified", label: "Certified" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="All applications awaiting initial review and assignment"
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              onClick={() => setSelectedTab(tab.id)}
              className={cn(
                selectedTab === tab.id &&
                  "bg-[#3EADC0] hover:bg-[#35a0b3] text-white"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="captain">Captain</SelectItem>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="officer">Officer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="divide-y">
            {applications.map((application) => (
              <div
                key={application.id}
                className="p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{application.applicant}</p>
                        <span className="text-sm text-muted-foreground">
                          {application.applicationId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {application.serviceType}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {application.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/seafarer/applications/${application.id}/review`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review Application
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Assign Reviewer</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Reject Application
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 1-20 of 40 Users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
