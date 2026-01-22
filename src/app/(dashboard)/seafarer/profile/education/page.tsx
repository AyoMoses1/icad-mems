"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getEducationDetails,
  createEducationDetails,
  updateEducationDetails,
  deleteEducationDetails,
  type EducationDetailsDto,
  type CreateEducationDetailsRequest,
  type UpdateEducationDetailsRequest,
} from "@/lib/services/profile-service";
import { formatDate } from "@/lib/utils";

export default function EducationPage() {
  const [educationList, setEducationList] = useState<EducationDetailsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationDetailsDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEducationDetailsRequest>({
    institution: "",
    certificateObtained: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadEducation();
  }, []);

  const loadEducation = async () => {
    setIsLoading(true);
    try {
      const response = await getEducationDetails();
      const ok = response.success ?? (response as any).successful;
      
      if (ok && response.data) {
        const items = Array.isArray(response.data) ? response.data : [];
        setEducationList(items);
      } else {
        toast.error(response.message || "Failed to fetch education details");
        setEducationList([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch education:", error);
      toast.error(error.message || "Failed to fetch education details");
      setEducationList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (education?: EducationDetailsDto) => {
    if (education) {
      setEditingEducation(education);
      setFormData({
        institution: education.institution || "",
        certificateObtained: education.certificateObtained || "",
        startDate: education.startDate ? education.startDate.split("T")[0] : "",
        endDate: education.endDate ? education.endDate.split("T")[0] : "",
      });
    } else {
      setEditingEducation(null);
      setFormData({
        institution: "",
        certificateObtained: "",
        startDate: "",
        endDate: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEducation(null);
    setFormData({
      institution: "",
      certificateObtained: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.institution || !formData.certificateObtained) {
      toast.error("Institution and Certificate Obtained are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEducation) {
        // Update existing
        const response = await updateEducationDetails(
          editingEducation.educationId,
          formData as UpdateEducationDetailsRequest
        );
        const ok = response.success ?? (response as any).successful;
        
        if (ok) {
          toast.success("Education updated successfully");
          handleCloseDialog();
          loadEducation();
        } else {
          toast.error(response.message || "Failed to update education");
        }
      } else {
        // Create new
        const response = await createEducationDetails(formData);
        const ok = response.success ?? (response as any).successful;
        
        if (ok) {
          toast.success("Education added successfully");
          handleCloseDialog();
          loadEducation();
        } else {
          toast.error(response.message || "Failed to add education");
        }
      }
    } catch (error: any) {
      console.error("Error saving education:", error);
      toast.error(error.message || "Failed to save education");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (educationId: string) => {
    if (!confirm("Are you sure you want to delete this education record?")) {
      return;
    }

    try {
      const response = await deleteEducationDetails(educationId);
      const ok = response.success ?? (response as any).successful;
      
      if (ok) {
        toast.success("Education deleted successfully");
        loadEducation();
      } else {
        toast.error(response.message || "Failed to delete education");
      }
    } catch (error: any) {
      console.error("Error deleting education:", error);
      toast.error(error.message || "Failed to delete education");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education Details"
        description="Manage your education history and qualifications"
      />

      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="bg-[#3EADC0] hover:bg-[#35a0b3]">
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading education details...</p>
        </div>
      ) : educationList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No education records found</p>
            <p className="text-sm text-muted-foreground">
              Click "Add Education" to add your first education record
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {educationList.map((education) => (
            <Card key={education.educationId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {education.certificateObtained || "Education Record"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(education)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(education.educationId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{education.institution}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {education.startDate ? formatDate(education.startDate) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {education.endDate ? formatDate(education.endDate) : "N/A"}
                    </p>
                  </div>
                </div>
                {education.documents && education.documents.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-sm">{education.documents.length} document(s) attached</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? "Edit Education" : "Add Education"}
            </DialogTitle>
            <DialogDescription>
              {editingEducation
                ? "Update your education details"
                : "Add a new education record to your profile"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">
                  Institution <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="institution"
                  value={formData.institution || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificateObtained">
                  Certificate Obtained <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="certificateObtained"
                  value={formData.certificateObtained || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateObtained: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingEducation
                    ? "Update"
                    : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
