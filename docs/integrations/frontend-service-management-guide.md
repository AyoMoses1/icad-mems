# Frontend Service Management Integration Guide

## ⚠️ CRITICAL: Admin-Only Mutations

**ALL MUTATION OPERATIONS (POST, PUT, DELETE) ARE ADMIN-ONLY**

Before implementing this feature, ensure you understand:

1. **Read Operations (GET)**: Available to all authenticated users
   - `GET /seafarer/api/v1/applications/services` - List all services
   - `GET /seafarer/api/v1/applications/services/{serviceId}` - Get service details

2. **Mutation Operations (POST, PUT, DELETE)**: **ADMIN ONLY**
   - `POST /seafarer/api/v1/services` - Create service
   - `PUT /seafarer/api/v1/services/{serviceId}` - Update service
   - `DELETE /seafarer/api/v1/services/{serviceId}` - Delete service
   - `POST /seafarer/api/v1/services/{serviceId}/requirements` - Add requirement
   - `PUT /seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` - Update requirement
   - `DELETE /seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` - Delete requirement

**You MUST implement authorization checks in the frontend to:**
- Hide mutation UI elements from non-admin users
- Prevent non-admin users from calling mutation endpoints
- Show appropriate error messages if unauthorized access is attempted

---

## Overview

This guide helps frontend developers integrate the Service Management feature, which allows administrators to create, update, and delete services and their requirements.

**Security Requirement:** All mutation operations (POST, PUT, DELETE) are **admin-only** and must be protected in the frontend with proper authorization checks.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication & Authorization](#authentication--authorization)
3. [Type Definitions](#type-definitions)
4. [API Client Implementation](#api-client-implementation)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [UI/UX Recommendations](#uiux-recommendations)
8. [Common Pitfalls](#common-pitfalls)

---

## API Endpoints

### Base URL
```
/seafarer/api/v1/services
```

### Endpoint Summary

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/seafarer/api/v1/applications/services` | Get all services | ✅ | ❌ |
| GET | `/seafarer/api/v1/applications/services/{serviceId}` | Get service by ID | ✅ | ❌ |
| **POST** | `/seafarer/api/v1/services` | **Create service** | ✅ | ✅ |
| **PUT** | `/seafarer/api/v1/services/{serviceId}` | **Update service** | ✅ | ✅ |
| **DELETE** | `/seafarer/api/v1/services/{serviceId}` | **Delete service** | ✅ | ✅ |
| **POST** | `/seafarer/api/v1/services/{serviceId}/requirements` | **Add requirement** | ✅ | ✅ |
| **PUT** | `/seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` | **Update requirement** | ✅ | ✅ |
| **DELETE** | `/seafarer/api/v1/services/{serviceId}/requirements/{requirementId}` | **Delete requirement** | ✅ | ✅ |

**Note:** Read operations (GET) are available to all authenticated users via the `ApplicationsController`. Mutation operations (POST, PUT, DELETE) are admin-only via the `ServiceManagementController`.

---

## Authentication & Authorization

### Required Headers

All requests require authentication:

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Admin-Only Protection

**⚠️ CRITICAL SECURITY REQUIREMENT:** All mutation endpoints (POST, PUT, DELETE) **MUST** be protected in the frontend. Non-admin users should never be able to access these endpoints.

#### Step 1: Create Permission Check Utility

```typescript
// utils/permissions.ts
export interface User {
  id: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Check if user can manage services (admin-only)
 * @param user - Current user object
 * @returns true if user is admin, false otherwise
 */
export const canManageServices = (user: User | null | undefined): boolean => {
  if (!user) return false;
  
  // Check for admin role
  if (user.roles?.includes('ADMIN') || user.roles?.includes('ADMINISTRATOR')) {
    return true;
  }
  
  // Check for specific permission
  if (user.permissions?.includes('Services:Manage') || 
      user.permissions?.includes('SERVICES_MANAGE')) {
    return true;
  }
  
  return false;
};

/**
 * Hook to check service management permissions
 */
export const useCanManageServices = (): boolean => {
  const { user } = useAuth(); // Your auth hook
  return canManageServices(user);
};
```

#### Step 2: Protect API Calls

```typescript
// services/api/serviceManagementApi.ts
import { canManageServices } from '@/utils/permissions';
import { getCurrentUser } from '@/utils/auth';

// Wrap all mutation calls with permission check
export const serviceManagementApi = {
  createService: async (request: CreateServiceRequest): Promise<ServiceDto> => {
    const user = getCurrentUser();
    
    // Frontend protection - prevent unauthorized calls
    if (!canManageServices(user)) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const response = await apiClient.post<ApiResponse<ServiceDto>>(
      '/services',
      request
    );
    
    // Handle 403 from backend
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create service');
    }
    return response.data.data;
  },
  
  // ... same pattern for all mutation methods
};
```

#### Step 3: Protect UI Elements

```typescript
// components/ServiceManagement/ServiceList.tsx
import { useCanManageServices } from '@/utils/permissions';

const ServiceList = () => {
  const canManage = useCanManageServices(); // Admin check
  
  return (
    <div>
      {/* Only show create button to admins */}
      {canManage && (
        <Button onClick={handleCreateService}>
          + Create Service
        </Button>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Type</th>
            <th>Status</th>
            {canManage && <th>Actions</th>} {/* Only show actions column to admins */}
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.serviceId}>
              <td>{service.serviceName}</td>
              <td>{service.serviceTypeDescription}</td>
              <td>{service.isActive ? 'Active' : 'Inactive'}</td>
              {canManage && ( // Only show action buttons to admins
                <td>
                  <Button onClick={() => handleEdit(service.serviceId)}>Edit</Button>
                  <Button onClick={() => handleDelete(service.serviceId)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### Step 4: Handle Unauthorized Access

```typescript
// components/ServiceManagement/ServiceManagement.tsx
import { useCanManageServices } from '@/utils/permissions';

const ServiceManagement = () => {
  const canManage = useCanManageServices();
  
  // Show access denied message for non-admins
  if (!canManage) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to manage services. This feature is available to administrators only.</p>
      </div>
    );
  }
  
  // Admin-only content
  return (
    <div>
      {/* Service management UI */}
    </div>
  );
};
```

#### Step 5: Route Protection (React Router Example)

```typescript
// routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useCanManageServices } from '@/utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const canManage = useCanManageServices();
  
  if (requireAdmin && !canManage) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Usage in router
<Route 
  path="/admin/services" 
  element={
    <ProtectedRoute requireAdmin={true}>
      <ServiceManagement />
    </ProtectedRoute>
  } 
/>
```

---

## Type Definitions

### TypeScript Interfaces

```typescript
// Service DTOs
interface ServiceDto {
  serviceId: string;
  serviceName: string;
  description?: string;
  serviceTypeId: string;
  serviceTypeDescription: string;
  isActive: boolean;
  requirements: ServiceRequirementDto[];
}

interface ServiceRequirementDto {
  serviceRequirementId: string;
  requirementListId: string;
  requirementName: string;
  rankId: string;
  rankDescription: string;
  requiredValue: string;
  metricId: string;
  metricDescription: string;
  documentTypesId?: string | null;
  documentTypeDescription?: string | null;
}

// Request DTOs
interface CreateServiceRequest {
  serviceTypeId: string;
  currencyId: string;
  description: string;
  requirements?: CreateServiceRequirementRequest[];
}

interface UpdateServiceRequest {
  description: string;
  serviceTypeId: string;
  currencyId: string;
  isActive: boolean;
}

interface CreateServiceRequirementRequest {
  serviceId: string; // Will be set from route parameter
  requirementListId: string;
  rankId: string;
  requiredValue: string;
}

interface UpdateServiceRequirementRequest {
  requirementListId: string;
  rankId: string;
  requiredValue: string;
}

// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

interface ApiError {
  code: string;
  message: string;
}
```

---

## API Client Implementation

### Example: Axios-based API Client

```typescript
// services/api/serviceManagementApi.ts
import axios from 'axios';

const API_BASE_URL = '/seafarer/api/v1';

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Service Management API
export const serviceManagementApi = {
  // Create Service
  createService: async (request: CreateServiceRequest): Promise<ServiceDto> => {
    const response = await apiClient.post<ApiResponse<ServiceDto>>(
      '/services',
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create service');
    }
    return response.data.data;
  },

  // Update Service
  updateService: async (
    serviceId: string,
    request: UpdateServiceRequest
  ): Promise<ServiceDto> => {
    const response = await apiClient.put<ApiResponse<ServiceDto>>(
      `/services/${serviceId}`,
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update service');
    }
    return response.data.data;
  },

  // Delete Service
  deleteService: async (serviceId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/services/${serviceId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete service');
    }
    return response.data.data ?? true;
  },

  // Create Service Requirement
  createServiceRequirement: async (
    serviceId: string,
    request: CreateServiceRequirementRequest
  ): Promise<ServiceRequirementDto> => {
    // Ensure serviceId matches route
    const payload = { ...request, serviceId };
    
    const response = await apiClient.post<ApiResponse<ServiceRequirementDto>>(
      `/services/${serviceId}/requirements`,
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create requirement');
    }
    return response.data.data;
  },

  // Update Service Requirement
  updateServiceRequirement: async (
    serviceId: string,
    requirementId: string,
    request: UpdateServiceRequirementRequest
  ): Promise<ServiceRequirementDto> => {
    const response = await apiClient.put<ApiResponse<ServiceRequirementDto>>(
      `/services/${serviceId}/requirements/${requirementId}`,
      request
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update requirement');
    }
    return response.data.data;
  },

  // Delete Service Requirement
  deleteServiceRequirement: async (
    serviceId: string,
    requirementId: string
  ): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/services/${serviceId}/requirements/${requirementId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete requirement');
    }
    return response.data.data ?? true;
  },
};

// Read operations (available to all authenticated users)
export const servicesApi = {
  // Get all services (from ApplicationsController)
  getServices: async (): Promise<ServiceDto[]> => {
    const response = await apiClient.get<ApiResponse<ServiceDto[]>>(
      '/applications/services'
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch services');
    }
    return response.data.data;
  },

  // Get service by ID (from ApplicationsController)
  getServiceById: async (serviceId: string): Promise<ServiceDto> => {
    const response = await apiClient.get<ApiResponse<ServiceDto>>(
      `/applications/services/${serviceId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch service');
    }
    return response.data.data;
  },
};
```

---

## Usage Examples

### Example 1: Create Service with Requirements

```typescript
// components/ServiceManagement/CreateServiceForm.tsx
import { useState } from 'react';
import { serviceManagementApi } from '@/services/api/serviceManagementApi';

const CreateServiceForm = () => {
  const [formData, setFormData] = useState<CreateServiceRequest>({
    serviceTypeId: '',
    currencyId: '',
    description: '',
    requirements: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createdService = await serviceManagementApi.createService(formData);
      console.log('Service created:', createdService);
      // Redirect or show success message
    } catch (err: any) {
      setError(err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Service'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Example 2: Update Service

```typescript
// components/ServiceManagement/EditServiceForm.tsx
import { useState, useEffect } from 'react';
import { serviceManagementApi, servicesApi } from '@/services/api/serviceManagementApi';

const EditServiceForm = ({ serviceId }: { serviceId: string }) => {
  const [service, setService] = useState<ServiceDto | null>(null);
  const [formData, setFormData] = useState<UpdateServiceRequest>({
    description: '',
    serviceTypeId: '',
    currencyId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load service data
    servicesApi.getServiceById(serviceId)
      .then(setService)
      .catch(console.error);
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await serviceManagementApi.updateService(serviceId, formData);
      console.log('Service updated:', updated);
      // Show success message
    } catch (err: any) {
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Example 3: Add Requirement to Service

```typescript
// components/ServiceManagement/AddRequirementForm.tsx
const AddRequirementForm = ({ serviceId }: { serviceId: string }) => {
  const [formData, setFormData] = useState<CreateServiceRequirementRequest>({
    serviceId,
    requirementListId: '',
    rankId: '',
    requiredValue: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const requirement = await serviceManagementApi.createServiceRequirement(
        serviceId,
        formData
      );
      console.log('Requirement added:', requirement);
      // Refresh service data or update local state
    } catch (err: any) {
      console.error('Failed to add requirement:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Example 4: Delete Service (with Confirmation)

```typescript
// components/ServiceManagement/DeleteServiceButton.tsx
import { useState } from 'react';
import { serviceManagementApi } from '@/services/api/serviceManagementApi';

const DeleteServiceButton = ({ serviceId, onDeleted }: { 
  serviceId: string;
  onDeleted: () => void;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      await serviceManagementApi.deleteService(serviceId);
      onDeleted();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete service');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={deleting}
      className={confirming ? 'confirm' : ''}
    >
      {deleting 
        ? 'Deleting...' 
        : confirming 
        ? 'Click again to confirm' 
        : 'Delete Service'}
    </button>
  );
};
```

### Example 5: React Hook for Service Management

```typescript
// hooks/useServiceManagement.ts
import { useState, useCallback } from 'react';
import { serviceManagementApi } from '@/services/api/serviceManagementApi';

export const useServiceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = useCallback(async (request: CreateServiceRequest) => {
    setLoading(true);
    setError(null);
    try {
      const service = await serviceManagementApi.createService(request);
      return service;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (
    serviceId: string,
    request: UpdateServiceRequest
  ) => {
    setLoading(true);
    setError(null);
    try {
      const service = await serviceManagementApi.updateService(serviceId, request);
      return service;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (serviceId: string) => {
    setLoading(true);
    setError(null);
    try {
      await serviceManagementApi.deleteService(serviceId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createService,
    updateService,
    deleteService,
    loading,
    error,
  };
};
```

---

## Error Handling

### Common Error Codes

| Error Code | Description | Action |
|------------|-------------|--------|
| `UNAUTHENTICATED_USER` | User not authenticated | Redirect to login |
| `SERVICE_NOT_FOUND` | Service doesn't exist | Show error, redirect to list |
| `SERVICE_TYPE_NOT_FOUND` | Invalid service type | Show validation error |
| `CURRENCY_NOT_FOUND` | Invalid currency | Show validation error |
| `DUPLICATE_SERVICE` | Service with same description exists | Show validation error |
| `SERVICE_HAS_APPLICATIONS` | Cannot delete service with active applications | Show error, prevent deletion |
| `REQUIREMENT_LIST_NOT_FOUND` | Invalid requirement list | Show validation error |
| `RANK_NOT_FOUND` | Invalid rank | Show validation error |
| `DOCUMENT_TYPE_REQUIRED` | File/Document requirement missing DocumentTypesId | Show validation error |
| `DUPLICATE_REQUIREMENT` | Requirement already exists for service+rank | Show validation error |

### Error Handling Pattern

```typescript
// utils/errorHandler.ts
export const handleServiceManagementError = (error: any): string => {
  const errorCode = error.response?.data?.error?.code;
  const errorMessage = error.response?.data?.error?.message;

  switch (errorCode) {
    case 'UNAUTHENTICATED_USER':
      // Redirect to login
      window.location.href = '/login';
      return 'Please log in to continue';
    
    case 'SERVICE_NOT_FOUND':
      return 'Service not found. It may have been deleted.';
    
    case 'SERVICE_HAS_APPLICATIONS':
      return 'Cannot delete service with active applications. Please archive it instead.';
    
    case 'DUPLICATE_SERVICE':
      return 'A service with this description already exists.';
    
    case 'DOCUMENT_TYPE_REQUIRED':
      return 'Document type must be configured for File/Document requirements. Please contact an administrator.';
    
    default:
      return errorMessage || 'An unexpected error occurred';
  }
};

// Usage
try {
  await serviceManagementApi.createService(request);
} catch (error) {
  const message = handleServiceManagementError(error);
  toast.error(message);
}
```

---

## UI/UX Recommendations

### 1. Admin-Only UI Elements

```typescript
// Only show mutation buttons to admins
const { user } = useAuth();
const isAdmin = canManageServices(user);

{isAdmin && (
  <>
    <Button onClick={handleCreate}>Create Service</Button>
    <Button onClick={handleEdit}>Edit</Button>
    <Button onClick={handleDelete}>Delete</Button>
  </>
)}
```

### 2. Service List View

```typescript
// components/ServiceManagement/ServiceList.tsx
const ServiceList = () => {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const { user } = useAuth();
  const isAdmin = canManageServices(user);

  return (
    <div>
      {isAdmin && (
        <Button onClick={handleCreate}>+ Create Service</Button>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Requirements</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.serviceId}>
              <td>{service.serviceName}</td>
              <td>{service.serviceTypeDescription}</td>
              <td>{service.isActive ? 'Active' : 'Inactive'}</td>
              <td>{service.requirements.length}</td>
              {isAdmin && (
                <td>
                  <Button onClick={() => handleEdit(service.serviceId)}>Edit</Button>
                  <Button onClick={() => handleDelete(service.serviceId)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 3. Service Detail View with Requirements

```typescript
// components/ServiceManagement/ServiceDetail.tsx
const ServiceDetail = ({ serviceId }: { serviceId: string }) => {
  const [service, setService] = useState<ServiceDto | null>(null);
  const { user } = useAuth();
  const isAdmin = canManageServices(user);

  return (
    <div>
      <h1>{service?.serviceName}</h1>
      <p>Type: {service?.serviceTypeDescription}</p>
      <p>Status: {service?.isActive ? 'Active' : 'Inactive'}</p>

      <h2>Requirements</h2>
      {isAdmin && (
        <Button onClick={handleAddRequirement}>+ Add Requirement</Button>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Requirement</th>
            <th>Rank</th>
            <th>Required Value</th>
            <th>Document Type</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {service?.requirements.map(req => (
            <tr key={req.serviceRequirementId}>
              <td>{req.requirementName}</td>
              <td>{req.rankDescription}</td>
              <td>{req.requiredValue}</td>
              <td>{req.documentTypeDescription || 'N/A'}</td>
              {isAdmin && (
                <td>
                  <Button onClick={() => handleEditRequirement(req)}>Edit</Button>
                  <Button onClick={() => handleDeleteRequirement(req)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 4. Form Validation

```typescript
// utils/validation.ts
export const validateCreateServiceRequest = (
  request: CreateServiceRequest
): string[] => {
  const errors: string[] = [];

  if (!request.description?.trim()) {
    errors.push('Service description is required');
  }

  if (!request.serviceTypeId) {
    errors.push('Service type is required');
  }

  if (!request.currencyId) {
    errors.push('Currency is required');
  }

  // Validate requirements if provided
  if (request.requirements) {
    request.requirements.forEach((req, index) => {
      if (!req.requirementListId) {
        errors.push(`Requirement ${index + 1}: Requirement list is required`);
      }
      if (!req.rankId) {
        errors.push(`Requirement ${index + 1}: Rank is required`);
      }
      if (!req.requiredValue?.trim()) {
        errors.push(`Requirement ${index + 1}: Required value is required`);
      }
    });
  }

  return errors;
};
```

---

## Common Pitfalls

### 1. ❌ Missing Admin Check (SECURITY RISK)

```typescript
// BAD: No admin check - SECURITY VULNERABILITY
<Button onClick={handleCreate}>Create Service</Button>
// Any user can see and click this button!

// BAD: Only UI check, no API protection
{isAdmin && <Button onClick={handleCreate}>Create Service</Button>}
// If user manually calls API, they can still mutate!

// GOOD: Both UI and API protection
const canManage = useCanManageServices();

// UI protection
{canManage && <Button onClick={handleCreate}>Create Service</Button>}

// API protection (in serviceManagementApi.ts)
createService: async (request) => {
  if (!canManageServices(getCurrentUser())) {
    throw new Error('Unauthorized: Admin access required');
  }
  // ... make API call
}
```

### 2. ❌ Not Handling Soft Delete

```typescript
// BAD: Assuming deleted service is removed from list
const handleDelete = async () => {
  await deleteService(serviceId);
  // Service might still appear if using cached data
};

// GOOD: Refresh data after delete
const handleDelete = async () => {
  await deleteService(serviceId);
  await refreshServices(); // Reload from API
};
```

### 3. ❌ Not Validating DocumentTypesId for File/Document

```typescript
// BAD: Not checking if DocumentTypesId is set
const addRequirement = async (requirement: CreateServiceRequirementRequest) => {
  await createServiceRequirement(serviceId, requirement);
};

// GOOD: Validate before submission
const addRequirement = async (requirement: CreateServiceRequirementRequest) => {
  // Check if requirement is File/Document type
  const requirementList = await getRequirementList(requirement.requirementListId);
  if (requirementList.metricDescription === 'File/Document' && 
      !requirementList.documentTypesId) {
    throw new Error('Document type must be configured for File/Document requirements');
  }
  await createServiceRequirement(serviceId, requirement);
};
```

### 4. ❌ Not Handling Duplicate Requirements

```typescript
// BAD: No duplicate check
const addRequirement = async (req: CreateServiceRequirementRequest) => {
  await createServiceRequirement(serviceId, req);
};

// GOOD: Check for duplicates before adding
const addRequirement = async (req: CreateServiceRequirementRequest) => {
  const existing = service.requirements.find(
    r => r.requirementListId === req.requirementListId && 
         r.rankId === req.rankId
  );
  
  if (existing) {
    throw new Error('This requirement already exists for this rank');
  }
  
  await createServiceRequirement(serviceId, req);
};
```

### 5. ❌ Not Using Correct Endpoints

```typescript
// BAD: Using wrong endpoint for read operations
const services = await apiClient.get('/services'); // Wrong!

// GOOD: Use ApplicationsController for reads
const services = await apiClient.get('/applications/services'); // Correct
```

---

## Testing Checklist

- [ ] Admin can create service
- [ ] Admin can update service
- [ ] Admin can delete service (with confirmation)
- [ ] Admin can add requirement to service
- [ ] Admin can update requirement
- [ ] Admin can delete requirement
- [ ] Non-admin cannot see mutation buttons
- [ ] Non-admin gets 403 error if trying to mutate
- [ ] Error messages display correctly
- [ ] Form validation works
- [ ] Duplicate requirement prevention works
- [ ] Service with active applications cannot be deleted
- [ ] DocumentTypesId validation works for File/Document requirements

---

## Additional Resources

- [Document Upload Flow Guide](./document-upload-flow-v3.md) - Understanding document requirements
- [API Response Format](../api/complete-api-integration-guide.md) - Standard API response structure
- Backend API Documentation (Swagger) - Available at `/swagger` endpoint

---

## Support

For questions or issues:
1. Check the error code in the response
2. Review this guide's error handling section
3. Contact the backend team for API-specific issues
4. Check Swagger documentation for endpoint details
