// ============================================================================
// Seafarer Portal Types - Comprehensive type definitions
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ============================================================================
// Organization Types (MTIs/Institutions)
// ============================================================================

export interface UserOrganizationDto {
  id: number;
  name?: string | null;
  registrationNumber?: string | null;
  taxIdentificationNumber?: string | null;
  organizationTypeId?: number;
  organizationTypeName?: string | null;
  userProfileId?: number;
  ownerEmail?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface ContactDetailsDto {
  id?: number;
  organizationId?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  position?: string | null;
  isPrimary?: boolean;
  [key: string]: unknown;
}

export interface OrganizationFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  organizationTypeId?: number;
  isActive?: boolean;
}

// ============================================================================
// Program Types
// ============================================================================

export interface ProgramDto {
  id: number;
  programName?: string | null;
  description?: string | null;
  duration?: string | null;
  eligibilityCriteria?: string | null;
  applicationDeadline?: string | null;
  tuitionFee?: string | null;
  currency?: string | null;
  programType?: string | null;
  department?: string | null;
  degreeAwarded?: string | null;
  courseCount?: number;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface ProgramFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  programType?: string;
  department?: string;
}

export interface CreateProgramDto {
  programName?: string | null;
  description?: string | null;
  duration?: string | null;
  eligibilityCriteria?: string | null;
  applicationDeadline?: string | null;
  tuitionFee?: string | null;
  currency?: string | null;
  programType?: string | null;
  department?: string | null;
  degreeAwarded?: string | null;
  [key: string]: unknown;
}

export interface UpdateProgramDto {
  programName?: string | null;
  description?: string | null;
  duration?: string | null;
  eligibilityCriteria?: string | null;
  applicationDeadline?: string | null;
  tuitionFee?: string | null;
  currency?: string | null;
  programType?: string | null;
  department?: string | null;
  degreeAwarded?: string | null;
  [key: string]: unknown;
}

// ============================================================================
// Course Types
// ============================================================================

export interface CourseDto {
  id: number;
  courseCode?: string | null;
  courseName?: string | null;
  description?: string | null;
  credits?: number;
  semesterOffered?: string | null;
  department?: string | null;
  programId?: number;
  programName?: string | null;
  enrollmentCount?: number;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface CourseFilters {
  pageNumber?: number;
  pageSize?: number;
  programId?: number;
  searchTerm?: string;
  department?: string;
  semesterOffered?: string;
}

export interface CreateCourseDto {
  courseCode?: string | null;
  courseName?: string | null;
  description?: string | null;
  credits?: number;
  semesterOffered?: string | null;
  department?: string | null;
  programId: number;
  [key: string]: unknown;
}

export interface UpdateCourseDto {
  courseCode?: string | null;
  courseName?: string | null;
  description?: string | null;
  credits?: number;
  semesterOffered?: string | null;
  department?: string | null;
  programId?: number;
  [key: string]: unknown;
}

// ============================================================================
// Enrollment Types
// ============================================================================

export interface EnrollmentDto {
  id: number;
  enrollmentDate?: string;
  status?: string | null;
  completionDate?: string | null;
  grade?: string | null;
  applicantId?: number;
  applicantName?: string | null;
  courseId?: number;
  courseCode?: string | null;
  courseName?: string | null;
  programId?: number;
  programName?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface CreateEnrollmentDto {
  courseId: number;
  applicantId?: number;
  enrollmentDate?: string;
  [key: string]: unknown;
}

export interface EnrollmentFilters {
  pageNumber?: number;
  pageSize?: number;
  applicantId?: number;
  courseId?: number;
  programId?: number;
  status?: string;
  searchTerm?: string;
}

// ============================================================================
// User Profile Types (Seafarer)
// ============================================================================

export interface UserProfileDto {
  externalUserId: string;
  id?: number;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  country?: string | null;
  placeOfBirth?: string | null;
  genderId?: number | null;
  genderName?: string | null;
  address?: IamAddressDto | null;
  userTypeId?: number;
  userTypeName?: string | null;
  isActive?: boolean;
  currentStatus?: string | null;
  lastLoginAt?: string | null;
  registrationNumber?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface IamAddressDto {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  [key: string]: unknown;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  placeOfBirth?: string;
  genderId?: number;
  address?: IamAddressDto;
  [key: string]: unknown;
}

export interface UserStatusHistoryDto {
  id?: number;
  userId?: number;
  status?: string | null;
  changedAt?: string;
  changedBy?: string | null;
  reason?: string | null;
  [key: string]: unknown;
}

export interface UserFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  userTypeId?: number;
  status?: string;
  isActive?: boolean;
}

// ============================================================================
// Applicant Types
// ============================================================================

export interface ApplicantDto {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  nationalityId?: number;
  nationalityName?: string | null;
  genderId?: number;
  genderName?: string | null;
  address?: IamAddressDto | null;
  userProfileId?: number;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface CreateApplicantDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationalityId?: number;
  genderId?: number;
  address?: IamAddressDto;
  [key: string]: unknown;
}

export interface UpdateApplicantDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationalityId?: number;
  genderId?: number;
  address?: IamAddressDto;
  [key: string]: unknown;
}

export interface ApplicantFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  nationalityId?: number;
  genderId?: number;
}

// ============================================================================
// Service Types
// ============================================================================

export interface ServiceDto {
  id: number;
  serviceName?: string | null;
  serviceCode?: string | null;
  description?: string | null;
  serviceCategoryId?: number;
  serviceCategoryName?: string | null;
  fee?: number;
  currency?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface ServiceRequirementDto {
  id?: number;
  serviceId?: number;
  requirementId?: number;
  requirementName?: string | null;
  isMandatory?: boolean;
  order?: number;
  [key: string]: unknown;
}

export interface ServiceFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  serviceCategoryId?: number;
  isActive?: boolean;
}

// ============================================================================
// Requirement Types
// ============================================================================

export interface RequirementDto {
  id: number;
  requirementName?: string | null;
  requirementCode?: string | null;
  description?: string | null;
  requirementTypeId?: number;
  requirementTypeName?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface RequirementFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  requirementTypeId?: number;
  isActive?: boolean;
}

// ============================================================================
// Application Requirement Types
// ============================================================================

export interface ApplicationRequirementDto {
  id?: number;
  applicationId?: number;
  requirementId?: number;
  requirementName?: string | null;
  status?: string | null;
  statusName?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface ReviewRequirementDto {
  status: string;
  notes?: string;
  [key: string]: unknown;
}

