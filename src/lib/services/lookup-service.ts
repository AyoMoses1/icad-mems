/**
 * Lookup Service - Fetches dropdown and reference data for forms
 * Based on MASTER_DATA_API_REFERENCE.md
 */

import { apiGetMain, type ApiResponse } from "@/lib/api-client";

const API_BASE = "/api/seafarer/MasterData";

// ============================================================================
// MASTER DATA TYPE DEFINITIONS
// ============================================================================

export interface DocumentTypeDto {
  documentTypesId: string;
  description: string;
}

export interface GenderDto {
  genderId: string;
  code: string;
  description: string;
}

export interface NationalityDto {
  nationalityId: string;
  name: string;
  isoCode: string;
}

export interface CivilStatusDto {
  civilStatusId: string;
  description: string;
}

export interface RankDto {
  ranksId: string;
  rankId: number;
  description: string;
}

export interface UserTypeDto {
  userTypeId: string;
  description: string;
}

export interface AccreditationStatusDto {
  accreditationStatusId: string;
  description: string;
}

export interface TrainingStatusDto {
  trainingStatusId: string;
  description: string;
}

export interface OrganisationTypeDto {
  organisationTypeId: string;
  description: string;
}

export interface VesselTypeDto {
  vesselTypesId: string;
  description: string;
}

export interface TradingAreaDto {
  tradingAreaId: string;
  description: string;
}

export interface ServiceTypeDto {
  serviceTypeId: string;
  description: string;
}

export interface CurrencyDto {
  currencyId: string; // UUID
  code?: string | null;
  name?: string | null;
  symbol?: string | null;
}

export interface WorkTypeDto {
  workTypeId: string;
  description: string;
}

export interface WatchShiftDto {
  watchShiftId: string;
  description: string;
}

export interface ApplicationStatusDto {
  applicationStatusId: string;
  description: string;
}

export interface STCWStandardDto {
  stcwRef: string;
  regulationCode: string;
  competenceArea: string;
  level: string;
}

export interface AccreditedInstitutionDto {
  accreditedInstitutionsId: string;
  accreditedInstitutionName: string;
  accreditedInstitutionAddress?: string;
  institutionTypeId?: string;
  institutionTypeDescription?: string;
  isApproved: boolean;
  accreditationStatusId?: string;
  accreditationStatus?: string;
  accreditedInstitutionEmail: string;
  accreditedInstitutionPhone: string;
  expiryDate?: string;
  stcwAccreditations?: STCWAccreditationDto[];
}

export interface STCWAccreditationDto {
  institutionSTCWAccreditationId: string;
  accreditedInstitutionId: string;
  institutionName: string;
  stcwRef: string;
  regulationCode: string;
  competenceArea: string;
  accreditationStatusId?: string;
  accreditationStatus?: string;
  isApproved: boolean;
  effectiveDate: string;
  expiryDate: string;
  remarks?: string;
}

export interface AllMasterDataDto {
  documentTypes: DocumentTypeDto[];
  accreditedInstitutions: AccreditedInstitutionDto[];
  stcwAccreditations: STCWAccreditationDto[];
  genders: GenderDto[];
  nationalities: NationalityDto[];
  civilStatuses: CivilStatusDto[];
  ranks: RankDto[];
  accreditationStatuses: AccreditationStatusDto[];
  userTypes: UserTypeDto[];
  trainingStatuses: TrainingStatusDto[];
  organisationTypes: OrganisationTypeDto[];
  vesselTypes: VesselTypeDto[];
  tradingAreas: TradingAreaDto[];
  serviceTypes: ServiceTypeDto[];
  stcwStandards: STCWStandardDto[];
  workTypes: WorkTypeDto[];
  watchShifts: WatchShiftDto[];
  applicationStatuses: ApplicationStatusDto[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all master data in a single call (recommended for app initialization)
 * GET /api/seafarer/MasterData/all
 */
export async function getAllMasterData(): Promise<ApiResponse<AllMasterDataDto>> {
  return apiGetMain<AllMasterDataDto>(`${API_BASE}/all`);
}

/**
 * Document Types
 * GET /api/seafarer/MasterData/document-types
 */
export async function getDocumentTypes(): Promise<ApiResponse<DocumentTypeDto[]>> {
  return apiGetMain<DocumentTypeDto[]>(`${API_BASE}/document-types`);
}

/**
 * Genders
 * GET /api/seafarer/MasterData/genders
 */
export async function getGenders(): Promise<ApiResponse<GenderDto[]>> {
  return apiGetMain<GenderDto[]>(`${API_BASE}/genders`);
}

/**
 * Nationalities
 * GET /api/seafarer/MasterData/nationalities
 */
export async function getNationalities(): Promise<ApiResponse<NationalityDto[]>> {
  return apiGetMain<NationalityDto[]>(`${API_BASE}/nationalities`);
}

/**
 * Civil Statuses
 * GET /api/seafarer/MasterData/civil-statuses
 */
export async function getCivilStatuses(): Promise<ApiResponse<CivilStatusDto[]>> {
  return apiGetMain<CivilStatusDto[]>(`${API_BASE}/civil-statuses`);
}

/**
 * Ranks
 * GET /api/seafarer/MasterData/ranks
 */
export async function getRanks(): Promise<ApiResponse<RankDto[]>> {
  return apiGetMain<RankDto[]>(`${API_BASE}/ranks`);
}

/**
 * User Types
 * GET /api/seafarer/MasterData/user-types
 */
export async function getUserTypes(): Promise<ApiResponse<UserTypeDto[]>> {
  return apiGetMain<UserTypeDto[]>(`${API_BASE}/user-types`);
}

/**
 * Accreditation Statuses
 * GET /api/seafarer/MasterData/accreditation-statuses
 */
export async function getAccreditationStatuses(): Promise<ApiResponse<AccreditationStatusDto[]>> {
  return apiGetMain<AccreditationStatusDto[]>(`${API_BASE}/accreditation-statuses`);
}

/**
 * Training Statuses (CRITICAL - used in seafarer trainings)
 * GET /api/seafarer/MasterData/training-statuses
 */
export async function getTrainingStatuses(): Promise<ApiResponse<TrainingStatusDto[]>> {
  return apiGetMain<TrainingStatusDto[]>(`${API_BASE}/training-statuses`);
}

/**
 * Organisation Types
 * GET /api/seafarer/MasterData/organisation-types
 */
export async function getOrganisationTypes(): Promise<ApiResponse<OrganisationTypeDto[]>> {
  return apiGetMain<OrganisationTypeDto[]>(`${API_BASE}/organisation-types`);
}

/**
 * Vessel Types
 * GET /api/seafarer/MasterData/vessel-types
 */
export async function getVesselTypes(): Promise<ApiResponse<VesselTypeDto[]>> {
  return apiGetMain<VesselTypeDto[]>(`${API_BASE}/vessel-types`);
}

/**
 * Trading Areas
 * GET /api/seafarer/MasterData/trading-areas
 */
export async function getTradingAreas(): Promise<ApiResponse<TradingAreaDto[]>> {
  return apiGetMain<TradingAreaDto[]>(`${API_BASE}/trading-areas`);
}

/**
 * Service Types
 * GET /api/seafarer/MasterData/service-types
 */
export async function getServiceTypes(): Promise<ApiResponse<ServiceTypeDto[]>> {
  return apiGetMain<ServiceTypeDto[]>(`${API_BASE}/service-types`);
}

/**
 * Currencies
 * GET /api/seafarer/MasterData/currencies
 */
export async function getCurrencies(): Promise<ApiResponse<CurrencyDto[]>> {
  return apiGetMain<CurrencyDto[]>(`${API_BASE}/currencies`);
}

/**
 * Work Types
 * GET /api/seafarer/MasterData/work-types
 */
export async function getWorkTypes(): Promise<ApiResponse<WorkTypeDto[]>> {
  return apiGetMain<WorkTypeDto[]>(`${API_BASE}/work-types`);
}

/**
 * Watch Shifts
 * GET /api/seafarer/MasterData/watch-shifts
 */
export async function getWatchShifts(): Promise<ApiResponse<WatchShiftDto[]>> {
  return apiGetMain<WatchShiftDto[]>(`${API_BASE}/watch-shifts`);
}

/**
 * Application Statuses
 * GET /api/seafarer/MasterData/application-statuses
 */
export async function getApplicationStatuses(): Promise<ApiResponse<ApplicationStatusDto[]>> {
  return apiGetMain<ApplicationStatusDto[]>(`${API_BASE}/application-statuses`);
}

/**
 * STCW Standards
 * GET /api/seafarer/MasterData/stcw-standards
 */
export async function getSTCWStandards(): Promise<ApiResponse<STCWStandardDto[]>> {
  return apiGetMain<STCWStandardDto[]>(`${API_BASE}/stcw-standards`);
}

/**
 * Accredited Institutions
 * GET /api/seafarer/MasterData/accredited-institutions
 */
export async function getAccreditedInstitutions(
  type?: string
): Promise<ApiResponse<AccreditedInstitutionDto[]>> {
  const queryParams = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiGetMain<AccreditedInstitutionDto[]>(
    `${API_BASE}/accredited-institutions${queryParams}`
  );
}

/**
 * STCW Accreditations
 * GET /api/seafarer/MasterData/stcw-accreditations
 */
export async function getSTCWAccreditations(
  institutionId?: string
): Promise<ApiResponse<STCWAccreditationDto[]>> {
  const queryParams = institutionId
    ? `?institutionId=${encodeURIComponent(institutionId)}`
    : "";
  return apiGetMain<STCWAccreditationDto[]>(
    `${API_BASE}/stcw-accreditations${queryParams}`
  );
}
