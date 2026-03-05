/**
 * IMO vessel search – fetches ship details by IMO number from MEMS IAM ThirdParty API.
 * See imo serarch.md (project root) for endpoint details.
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const BY_IMO_PATH = "/iam/api/v1/ThirdParty/search/by-imo";

/** One ship record from GET /iam/api/v1/ThirdParty/search/by-imo (data array item) */
export interface ShipByImoDto {
  shipName: string;
  mmsi: string | null;
  imo: string;
  shipId: string | null;
  callSign: string | null;
  eni: string | null;
  typeName: string | null;
  dwt: string | null;
  flag: string | null;
  country: string | null;
  yearBuilt: string | null;
  grossTonnage: number | null;
  teu: number | null;
  length: number | null;
  breadth: number | null;
  draughtAvg: number | null;
  draughtMax: number | null;
  speedAvg: number | null;
  speedMax: number | null;
  homePort: string | null;
  nameAis?: string | null;
  mtUrl?: string | null;
  management?: unknown;
  associatedCompanies?: unknown;
  particulars?: unknown;
  isNavaid?: boolean;
}

/** Fields we expose for form population (readonly after lookup) */
export interface ShipLookupResult {
  shipName: string;
  imo: string;
  flag: string | null;
  country: string | null;
  typeName: string | null;
  yearBuilt: string | null;
  grossTonnage: number | null;
  homePort: string | null;
  mmsi: string | null;
  callSign: string | null;
}

function mapShipToLookup(dto: ShipByImoDto): ShipLookupResult {
  return {
    shipName: dto.shipName ?? "",
    imo: dto.imo ?? "",
    flag: dto.flag ?? null,
    country: dto.country ?? null,
    typeName: dto.typeName ?? null,
    yearBuilt: dto.yearBuilt ?? null,
    grossTonnage: dto.grossTonnage ?? null,
    homePort: dto.homePort ?? null,
    mmsi: dto.mmsi ?? null,
    callSign: dto.callSign ?? null,
  };
}

/**
 * Look up a vessel by IMO number.
 * GET /iam/api/v1/ThirdParty/search/by-imo?imo={imo}
 * Returns the first ship from the response data array, or null if not found / error.
 */
export async function getShipByImo(imo: string): Promise<ShipLookupResult | null> {
  const trimmed = (imo ?? "").trim().replace(/^IMO\s*-?\s*/i, "");
  if (!trimmed) return null;

  const endpoint = `${BY_IMO_PATH}?imo=${encodeURIComponent(trimmed)}`;
  const response: ApiResponse<ShipByImoDto[]> = await apiGetMain(endpoint);

  const ok = response.success ?? (response as { success?: boolean }).success;
  const data = response.data ?? (response as { data?: ShipByImoDto[] }).data;
  if (!ok || !Array.isArray(data) || data.length === 0) return null;

  return mapShipToLookup(data[0]);
}
