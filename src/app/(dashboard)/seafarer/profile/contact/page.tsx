"use client";

import { useState, useEffect } from "react";
import { Save, Mail, Phone, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getContactDetails,
  createOrUpdateContactDetails,
  type ContactDetailsDto,
  type CreateContactDetailsRequest,
} from "@/lib/services/profile-service";

export default function ContactDetailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateContactDetailsRequest>({
    email: "",
    phone: "",
    altPhone: "",
    whatsapp: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    address: "",
  });

  useEffect(() => {
    loadContactDetails();
  }, []);

  const loadContactDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getContactDetails();
      const ok = response.success ?? (response as any).successful;
      
      if (ok && response.data) {
        const contact = response.data;
        setFormData({
          email: contact.email || "",
          phone: contact.phone || "",
          altPhone: contact.altPhone || "",
          whatsapp: contact.whatsapp || "",
          city: contact.city || "",
          state: contact.state || "",
          country: contact.country || "",
          postalCode: contact.postalCode || "",
          address: contact.address || "",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch contact details:", error);
      // Don't show error if it's just that contact details don't exist yet
      if (!error.message?.includes("404")) {
        toast.error(error.message || "Failed to fetch contact details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email && !formData.phone) {
      toast.error("Email or Phone is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrUpdateContactDetails(formData);
      const ok = response.success ?? (response as any).successful;
      
      if (ok) {
        toast.success("Contact details saved successfully");
        await loadContactDetails();
      } else {
        toast.error(response.message || "Failed to save contact details");
      }
    } catch (error: any) {
      console.error("Error saving contact details:", error);
      toast.error(error.message || "Failed to save contact details");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading contact details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Details"
        description="Manage your contact information"
      />

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+234 801 234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altPhone">Alternative Phone Number</Label>
                <Input
                  id="altPhone"
                  value={formData.altPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, altPhone: e.target.value })
                  }
                  placeholder="+234 802 345 6789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder="+234 803 456 7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="Lagos State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="Nigeria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="101001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="inline h-4 w-4 mr-2" />
                Residential Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter your full residential address"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
