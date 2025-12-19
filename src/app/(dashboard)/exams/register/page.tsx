"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterExamPage() {
  const router = useRouter();
  const [examType, setExamType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [examCenter, setExamCenter] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Exam registration submitted");
    router.push("/exams");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register for Exam"
        description="Select an examination and complete registration"
      />

      <Card>
        <CardHeader>
          <CardTitle>Exam Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="examType">Examination Type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger id="examType">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="navigation-grade-ii">
                    Navigation Officer Grade II - Written
                  </SelectItem>
                  <SelectItem value="basic-safety">
                    STCW Basic Safety
                  </SelectItem>
                  <SelectItem value="fire-fighting">
                    Advanced Fire Fighting
                  </SelectItem>
                  <SelectItem value="medical-first-aid">
                    Medical First Aid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Select value={preferredDate} onValueChange={setPreferredDate}>
                <SelectTrigger id="preferredDate">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dec-20">Dec 20, 2024</SelectItem>
                  <SelectItem value="jan-5">Jan 5, 2025</SelectItem>
                  <SelectItem value="jan-15">Jan 15, 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examCenter">Exam Center</Label>
              <Select value={examCenter} onValueChange={setExamCenter}>
                <SelectTrigger id="examCenter">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oron">Oron, Akwa Ibom</SelectItem>
                  <SelectItem value="lagos">Lagos HQ</SelectItem>
                  <SelectItem value="apapa">Apapa, Lagos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                disabled={!examType || !preferredDate || !examCenter}
              >
                Proceed to Payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




