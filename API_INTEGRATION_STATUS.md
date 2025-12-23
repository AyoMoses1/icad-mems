# API Integration Status

This document provides a comprehensive overview of API endpoint integrations for the Seafarer frontend application.

## ✅ Completed Services

### Core Services Created

1. **Payment Service** (`payment-service.ts`)
   - ✅ GET /api/v1/Payments (list with filters)
   - ✅ GET /api/v1/Payments/{paymentId}
   - ✅ POST /api/v1/Payments/invoices/{invoiceId}/pay (initiate payment)
   - ✅ GET /api/v1/Payments/verify/{paymentReference}
   - ✅ POST /api/v1/Payments (record manual payment)

2. **Invoice Service** (`invoice-service.ts`)
   - ✅ GET /api/v1/Invoices (list with filters)
   - ✅ GET /api/v1/Invoices/{invoiceId}
   - ✅ GET /api/v1/Invoices/applications/{appId}/invoice
   - ✅ POST /api/v1/Invoices (create)
   - ✅ PATCH /api/v1/Invoices/{invoiceId} (update)
   - ✅ DELETE /api/v1/Invoices/{invoiceId}

3. **Application Service** (`application-service.ts`)
   - ✅ GET /api/v1/Applications (list with filters)
   - ✅ GET /api/v1/Applications/{appId}
   - ✅ POST /api/v1/Applications/{appId}/approve
   - ✅ POST /api/v1/Applications/{appId}/reject
   - ✅ POST /api/v1/Applications/{appId}/request-more-info
   - ✅ POST /api/v1/Applications/{appId}/submit
   - ✅ GET /api/v1/Applications/{appId}/requirements
   - ✅ GET /api/v1/Applications/{appId}/requirements/{reqId}
   - ✅ POST /api/v1/Applications/{appId}/requirements/{reqId}/review

4. **Accreditation Service** (`accreditation-service.ts`)
   - ✅ GET /api/v1/Accreditations (list with filters)
   - ✅ GET /api/v1/Accreditations/{accredId}
   - ✅ POST /api/v1/Accreditations/{accredId}/approve
   - ✅ POST /api/v1/Accreditations/{accredId}/reject
   - ✅ POST /api/v1/Accreditations/{accredId}/suspend

5. **Organization Service** (`organization-service.ts`)
   - ✅ GET /api/v1/Organizations (list with filters)
   - ✅ GET /api/v1/Organizations/{orgId}
   - ✅ GET /api/v1/Organizations/{orgId}/accreditations
   - ✅ GET /api/v1/Organizations/{orgId}/contacts
   - ✅ GET /api/v1/Organizations/{orgId}/contacts/{contactId}
   - ✅ POST /api/v1/Organizations/{orgId}/contacts
   - ✅ PUT /api/v1/Organizations/{orgId}/contacts/{contactId}
   - ✅ DELETE /api/v1/Organizations/{orgId}/contacts/{contactId}

6. **Program Service** (`program-service.ts`)
   - ✅ GET /api/v1/Programs (list with filters)
   - ✅ GET /api/v1/Programs/{id}

7. **Course Service** (`course-service.ts`)
   - ✅ GET /api/v1/Courses (list with filters)
   - ✅ GET /api/v1/Courses/program/{programId}
   - ✅ GET /api/v1/Courses/{id}

8. **Enrollment Service** (`enrollment-service.ts`)
   - ✅ GET /api/v1/Enrollments (list with filters)
   - ✅ GET /api/v1/Enrollments/{id}
   - ✅ POST /api/v1/Enrollments (create)
   - ✅ PUT /api/v1/Enrollments/{id} (update)

9. **User Service** (`user-service.ts`)
   - ✅ GET /api/v1/Users (list with filters)
   - ✅ GET /api/v1/Users/me
   - ✅ GET /api/v1/Users/me/profile
   - ✅ PUT /api/v1/Users/me/profile (update current user)
   - ✅ GET /api/v1/Users/me/status-history
   - ✅ GET /api/v1/Users/{userId}
   - ✅ PATCH /api/v1/Users/{userId}/status (update user status)

10. **Applicant Service** (`applicant-service.ts`)
    - ✅ GET /api/v1/Applicants (list with filters)
    - ✅ GET /api/v1/Applicants/{id}
    - ✅ POST /api/v1/Applicants (create)
    - ✅ PUT /api/v1/Applicants/{id} (update)

11. **Service Service** (`service-service.ts`)
    - ✅ GET /api/v1/Services (list with filters)
    - ✅ GET /api/v1/Services/{serviceId}
    - ✅ GET /api/v1/Services/{serviceId}/requirements
    - ✅ GET /api/v1/Services/{serviceId}/requirements/{requirementId}

12. **Requirement Service** (`requirement-service.ts`)
    - ✅ GET /api/v1/Requirements (list with filters)
    - ✅ GET /api/v1/Requirements/{requirementId}

## ✅ Updated UI Pages

### Fully Integrated Pages

1. **Payments Page** (`/invoices/payments/page.tsx`)
   - ✅ Full CRUD operations
   - ✅ Payment verification
   - ✅ Manual payment recording
   - ✅ Pagination, filtering, search

2. **Invoice Management Page** (`/invoices/management/page.tsx`)
   - ✅ Full CRUD operations
   - ✅ Pagination, filtering, search
   - ✅ Create, edit, delete invoices

3. **Applications Page** (`/seafarer/applications/page.tsx`)
   - ✅ List applications with API
   - ✅ Filtering and search
   - ✅ Pagination

4. **Seafarer Registry Page** (`/seafarer/registry/page.tsx`)
   - ✅ List users/seafarers with API
   - ✅ Filtering by status
   - ✅ Suspend user functionality
   - ✅ Pagination and search

5. **Accredited MTIs Page** (`/seafarer/miis/page.tsx`)
   - ✅ List organizations with API
   - ✅ Filtering and search
   - ✅ Suspend institution functionality
   - ✅ Stats from accreditations

6. **Training Page** (`/training/page.tsx`)
   - ✅ List programs with API
   - ✅ Filtering by category
   - ✅ Search functionality

7. **Training Enrollments Page** (`/training/enrollments/page.tsx`)
   - ✅ List enrollments with API
   - ✅ Display enrollment status and progress

## 📋 TypeScript Types Created

1. **Payment Types** (`types/payment.ts`)
   - PaymentDto, InitiatePaymentDto, RecordManualPaymentDto
   - ApplicationInvoiceDto, CreateInvoiceDto, UpdateInvoiceDto
   - ApplicationDto, ApplicationFilters
   - PaginatedResponse, ApiResponse

2. **Seafarer Types** (`types/seafarer.ts`)
   - UserOrganizationDto, ContactDetailsDto, OrganizationFilters
   - ProgramDto, ProgramFilters
   - CourseDto, CourseFilters
   - EnrollmentDto, CreateEnrollmentDto, EnrollmentFilters
   - UserProfileDto, UpdateUserProfileDto, UserStatusHistoryDto, UserFilters
   - ApplicantDto, CreateApplicantDto, UpdateApplicantDto, ApplicantFilters
   - ServiceDto, ServiceRequirementDto, ServiceFilters
   - RequirementDto, RequirementFilters
   - ApplicationRequirementDto, ReviewRequirementDto

## ⚠️ Endpoints Not Yet Integrated

### Missing Services (Can be added as needed)

1. **Documents Service**
   - ✅ User documents already integrated in `profile-documents/page.tsx`
   - ❌ Organization documents endpoints
   - ❌ Education records documents endpoints

2. **Additional Endpoints** (Less commonly used)
   - ❌ GET /api/v1/Departments
   - ❌ GET /api/v1/Faculty
   - ❌ GET /api/v1/Permissions
   - ❌ GET /api/v1/Roles
   - ❌ GET /api/v1/Reports
   - ❌ GET /api/v1/Settings
   - ❌ GET /api/v1/Staff
   - ❌ GET /api/v1/Status/health
   - ❌ GET /api/v1/lookups/{type}
   - ❌ POST /api/v1/Notifications/test-email
   - ❌ POST /api/v1/auth-sync/sync-user
   - ❌ GET /api/v1/public/accredited-institutions
   - ❌ GET /api/v1/users/me/education-records
   - ❌ Admin endpoints (/api/Admin/\*)

### Pages That May Need Integration Updates

1. **Seafarer Overview Page** (`/seafarer/overview/page.tsx`)
   - Uses mock data for stats
   - Could use aggregated API endpoints for stats

2. **Seafarer Profile Pages** (`/seafarer/profile/[id]/page.tsx`)
   - May need User service integration for profile details
   - Documents integration (already partially done)

3. **Application Review Page** (`/seafarer/applications/[id]/review/page.tsx`)
   - Application requirements integration needed
   - Document verification integration

4. **Training Enroll Page** (`/training/enroll/page.tsx`)
   - Enrollment creation integration
   - Payment integration after enrollment

5. **MTI Detail Page** (`/seafarer/miis/[id]/page.tsx`)
   - Organization details integration
   - Accreditation details integration
   - Programs and courses for institution

6. **Add Seafarer Page** (`/seafarer/add/page.tsx`)
   - Applicant creation integration
   - User creation integration

7. **Profile Documents Page** (`/profile-documents/page.tsx`)
   - ✅ Already partially integrated
   - ✅ Document upload/download working

## 🎯 Integration Patterns Established

### Service Pattern

All services follow a consistent pattern:

- Use `apiGetMain`, `apiPostMain`, `apiPutMain`, `apiPatchMain`, `apiDeleteMain`
- Consistent error handling via ApiResponse<T>
- Pagination support with filters
- Type-safe with TypeScript interfaces

### Page Integration Pattern

Pages follow this pattern:

1. Use `useState` for data, loading, and pagination state
2. Use `useEffect` to load data on mount/filter changes
3. Display loading states with `LoadingSpinner`
4. Display empty states with `EmptyState`
5. Handle errors with toast notifications
6. Use `DataTable` component for lists
7. Implement search and filter functionality

## 📝 Next Steps

1. **Update remaining pages** to use the services (following the established patterns)
2. **Create missing services** for Departments, Faculty, Permissions, Roles, Reports, Settings, Staff if needed
3. **Add specialized endpoints** like lookup endpoints, health checks, etc.
4. **Enhance error handling** with more specific error types if needed
5. **Add caching** for frequently accessed data (e.g., lookup values)
6. **Implement optimistic updates** where appropriate for better UX

## 🔍 How to Check Integration Status

To see which endpoints are integrated:

1. Check `src/lib/services/` - All service files
2. Check `src/types/` - All type definitions
3. Check individual page files - Look for service imports and API calls

## 📚 API Documentation Reference

- **Swagger UI**: https://pay-service.icadpays.com/swagger/index.html
- **Frontend Integration Guide**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Base URL**: `https://pay-service.icadpays.com` (configured via `NEXT_PUBLIC_API_BASE_URL`)

---

**Last Updated**: December 2024
**Total Endpoints in Swagger**: 88
**Services Created**: 12
**Pages Fully Integrated**: 7

