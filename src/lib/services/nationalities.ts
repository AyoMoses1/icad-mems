import { apiGetMain } from "@/lib/api-client";

export interface NationalityDto {
  id: string;
  isoCode2?: string;
  isoCode3?: string;
  countryName?: string;
}

export async function getNationalities(): Promise<NationalityDto[]> {
  const response = await apiGetMain<NationalityDto[]>("/api/Nationalities");

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch nationalities");
  }

  return response.data || [];
}
