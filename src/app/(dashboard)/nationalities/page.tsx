"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  DataTable,
  DataTableColumn,
} from "@/components/shared";
import {
  NationalityDto,
  getNationalities,
} from "@/lib/services/nationalities";

export default function NationalitiesPage() {
  const [nationalities, setNationalities] = useState<NationalityDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNationalities();
  }, []);

  const loadNationalities = async () => {
    setIsLoading(true);
    try {
      const result = await getNationalities();
      setNationalities(result || []);
    } catch (error) {
      console.error("Failed to load nationalities:", error);
      toast.error("Failed to load nationalities");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<NationalityDto>[] = [
    {
      id: "countryName",
      header: "Country Name",
      accessorKey: "countryName",
      cell: ({ row }) => (
        <div className="font-medium">{row.countryName || "-"}</div>
      ),
    },
    {
      id: "isoCode2",
      header: "ISO Code 2",
      accessorKey: "isoCode2",
      cell: ({ row }) => <div>{row.isoCode2 || "-"}</div>,
    },
    {
      id: "isoCode3",
      header: "ISO Code 3",
      accessorKey: "isoCode3",
      cell: ({ row }) => <div>{row.isoCode3 || "-"}</div>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nationalities"
        description="View available nationalities and country codes"
      />

      <DataTable
        columns={columns}
        data={nationalities}
        isLoading={isLoading}
        emptyMessage="No nationalities found"
        emptyDescription="No nationality data available."
        searchPlaceholder="Search nationalities..."
        getRowId={(row) => row.id}
      />
    </div>
  );
}

