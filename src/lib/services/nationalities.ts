import { apiGetMain } from "@/lib/api-client";

export interface NationalityDto {
  id: string;
  isoCode2?: string;
  isoCode3?: string;
  countryName?: string;
}

type RawNationalityDto = {
  nationalityId?: string;
  name?: string;
  isoCode?: string;
};

export async function getNationalities(): Promise<NationalityDto[]> {
  const response = await apiGetMain<RawNationalityDto[]>(
    "/api/seafarer/MasterData/nationalities"
  );

  const ok = response.success ?? (response as any).successful;
  if (!ok || !response.data) {
    throw new Error(response.error?.message || "Failed to fetch nationalities");
  }

  // Map backend shape { nationalityId, name, isoCode } to UI shape
  return (
    response.data?.map((n) => ({
      id: n.nationalityId || n.isoCode || n.name || "",
      countryName: n.name,
      isoCode2: n.isoCode?.slice(0, 2),
      isoCode3: n.isoCode,
    })) || []
  );
}
