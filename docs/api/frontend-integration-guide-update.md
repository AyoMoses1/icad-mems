# Frontend Integration Guide - Next.js

**Date:** January 24, 2026  
**Project:** MEMS Seafarer Frontend (Next.js)  
**Purpose:** This document provides comprehensive guidance for integrating the Next.js frontend with the MEMS Seafarer Backend API, covering all recently implemented features.

---

## Table of Contents

1. [Overview](#overview)
2. [API Base Configuration](#api-base-configuration)
3. [TypeScript Types and Interfaces](#typescript-types-and-interfaces)
4. [API Integration by Feature](#api-integration-by-feature)
   - [Onboarding Document Display](#1-onboarding-document-display)
   - [Multiple Document Upload for Requirement Lists](#2-multiple-document-upload-for-requirement-lists)
   - [Total Sea Time Display on Dashboard](#3-total-sea-time-display-on-dashboard)
   - [Onboarding Status and Completion Tracking](#4-onboarding-status-and-completion-tracking)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)
7. [Code Examples](#code-examples)

---

## Overview

The backend API has been enhanced with four major features:

1. **Onboarding Document Display Enhancement** - Full document visibility in onboarding review
2. **Multiple Document Upload for Requirement Lists** - Support for multiple document types per requirement
3. **Total Sea Time Display on Dashboard** - Calculated sea time from voyage activities
4. **Onboarding Status and Completion Tracking** - Prevent multiple active onboardings

All API endpoints follow the base path: `/seafarer/api/v1/`

---

## API Base Configuration

### Environment Variables

Create a `.env.local` file in your Next.js project:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
# or for production:
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### API Client Setup

Create an API client utility (`lib/api-client.ts`):

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const API_PREFIX = '/seafarer/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  // Get auth token from your auth system (e.g., NextAuth, JWT)
  const token = await getAuthToken(); // Implement based on your auth solution
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'An error occurred',
      response.status
    );
  }

  return data;
}

export const apiClient = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
```

---

## TypeScript Types and Interfaces

Create a types file (`types/api.ts`):

```typescript
// Document Types
export interface DocumentTypeDto {
  documentTypesId: string;
  description: string;
  code?: string | null;
  isActive?: boolean;
}

export interface ProfileDocumentDto {
  documentId: string;
  rn?: string | null;
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
}

export interface VoyageDocumentDto {
  documentId: string;
  voyageActivityId?: string | null;
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
}

export interface TrainingDocumentDto {
  documentId: string;
  trainingId?: string | null;
  documentTypesId: string;
  documentTypeDescription?: string | null;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingAuthority?: string | null;
  filePathOrUrl?: string | null;
  dateCreated?: string | null;
}

// Training DTO
export interface SeafarerTrainingDto {
  trainingId: string;
  rn?: string | null;
  institutionSTCWAccreditationId: string;
  institutionSTCWAccreditationName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  trainingStatusId: string;
  trainingStatusDescription?: string | null;
  result?: string | null;
  certificateName?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  documents?: TrainingDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}

// Voyage Activity DTO
export interface VoyageActivityDto {
  voyageActivityId: string;
  rn?: string | null;
  seamanBookNo?: string | null;
  vesselName?: string | null;
  imoNumber?: string | null;
  flagState?: string | null;
  operatorCompany?: string | null;
  portOfEngagement?: string | null;
  portOfDischarge?: string | null;
  dateJoined?: string | null;
  dateLeft?: string | null;
  totalSeaTimeDays?: number | null;
  remarks?: string | null;
  documents?: VoyageDocumentDto[] | null;
  dateCreated?: string | null;
  dateModified?: string | null;
}

// Onboarding DTO
export interface UserSeafarerOnboardingDto {
  userSeafarerOnboardingId: string;
  userId: string;
  role: string;
  status: string;
  rn?: string | null;
  isOnboardingComplete: boolean;
  hasActiveOnboarding: boolean;
  canCreateNewOnboarding: boolean;
  blockingReason?: string | null;
  activeOnboardingRole?: string | null;
  activeOnboardingStatus?: string | null;
  
  // Document arrays
  seafarerTrainings?: SeafarerTrainingDto[] | null;
  voyageActivities?: VoyageActivityDto[] | null;
  profileDocuments?: ProfileDocumentDto[] | null;
  trainingDocuments?: TrainingDocumentDto[] | null;
  voyageDocuments?: VoyageDocumentDto[] | null;
  
  // Helper flags
  hasSeafarerTrainings?: boolean;
  hasVoyageActivities?: boolean;
  hasProfileDocuments?: boolean;
  seafarerTrainingCount?: number;
  voyageActivityCount?: number;
  profileDocumentCount?: number;
  
  // ... other existing fields
}

// Requirement List DTOs
export interface RequirementListDto {
  requirementListId: string;
  description: string;
  metricId: string;
  metricDescription: string;
  
  // Backward compatibility (single document type)
  documentTypesId?: string | null;
  documentTypeDescription?: string | null;
  
  // New multiple document types
  documentTypeIds?: string[] | null;
  documentTypes?: DocumentTypeDto[] | null;
  
  isActive: boolean;
  // ... other fields
}

export interface CreateRequirementListRequest {
  description: string;
  metricId: string;
  documentTypesId?: string | null; // Backward compatibility
  documentTypeIds?: string[] | null; // New: preferred
  isActive: boolean;
}

export interface UpdateRequirementListRequest {
  description?: string;
  metricId?: string;
  documentTypesId?: string | null; // Backward compatibility
  documentTypeIds?: string[] | null; // New: preferred
  isActive?: boolean;
}

// Dashboard DTO
export interface ApplicationDashboardDto {
  // ... existing fields
  totalSeaTimeDays?: number | null;
  totalSeaTimeMonths?: number | null;
  totalSeaTimeYears?: number | null;
  // ... other fields
}
```

---

## API Integration by Feature

### 1. Onboarding Document Display

#### Get Onboarding with All Documents

**Endpoint:** `GET /seafarer/api/v1/Onboarding/{id}`

**Usage in Next.js:**

```typescript
// app/api/onboarding/[id]/route.ts (Server Component)
import { apiClient } from '@/lib/api-client';
import { UserSeafarerOnboardingDto } from '@/types/api';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await apiClient.get<UserSeafarerOnboardingDto>(
      `/Onboarding/${params.id}`
    );
    return Response.json(response);
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**React Component Example:**

```typescript
// components/OnboardingReview.tsx
'use client';

import { useEffect, useState } from 'react';
import { UserSeafarerOnboardingDto } from '@/types/api';

interface OnboardingReviewProps {
  onboardingId: string;
}

export default function OnboardingReview({ onboardingId }: OnboardingReviewProps) {
  const [onboarding, setOnboarding] = useState<UserSeafarerOnboardingDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboarding() {
      try {
        const response = await fetch(`/api/onboarding/${onboardingId}`);
        const data = await response.json();
        setOnboarding(data.data);
      } catch (error) {
        console.error('Failed to fetch onboarding:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOnboarding();
  }, [onboardingId]);

  if (loading) return <div>Loading...</div>;
  if (!onboarding) return <div>Onboarding not found</div>;

  return (
    <div className="onboarding-review">
      {/* Education Details Tab */}
      <section>
        <h2>Education Details</h2>
        {/* Render education details */}
      </section>

      {/* Training Records Tab */}
      {onboarding.hasSeafarerTrainings && (
        <section>
          <h2>Training Records ({onboarding.seafarerTrainingCount})</h2>
          {onboarding.seafarerTrainings?.map((training) => (
            <div key={training.trainingId} className="training-card">
              <h3>{training.certificateName}</h3>
              <p>Institution: {training.institutionSTCWAccreditationName}</p>
              <p>Status: {training.trainingStatusDescription}</p>
              <p>Start: {training.startDate}</p>
              <p>End: {training.endDate}</p>
              {training.documents && training.documents.length > 0 && (
                <div className="documents">
                  <h4>Documents:</h4>
                  {training.documents.map((doc) => (
                    <a key={doc.documentId} href={doc.filePathOrUrl || '#'}>
                      {doc.documentTypeDescription}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Voyage Activities Tab */}
      {onboarding.hasVoyageActivities && (
        <section>
          <h2>Voyage Activities ({onboarding.voyageActivityCount})</h2>
          {onboarding.voyageActivities?.map((voyage) => (
            <div key={voyage.voyageActivityId} className="voyage-card">
              <h3>{voyage.vesselName}</h3>
              <p>IMO: {voyage.imoNumber}</p>
              <p>Flag: {voyage.flagState}</p>
              <p>Joined: {voyage.dateJoined}</p>
              <p>Left: {voyage.dateLeft}</p>
              <p>Sea Time: {voyage.totalSeaTimeDays} days</p>
              {voyage.documents && voyage.documents.length > 0 && (
                <div className="documents">
                  <h4>Documents:</h4>
                  {voyage.documents.map((doc) => (
                    <a key={doc.documentId} href={doc.filePathOrUrl || '#'}>
                      {doc.documentTypeDescription}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Profile Documents Tab */}
      {onboarding.hasProfileDocuments && (
        <section>
          <h2>Profile Documents ({onboarding.profileDocumentCount})</h2>
          {onboarding.profileDocuments?.map((doc) => (
            <div key={doc.documentId} className="document-card">
              <h3>{doc.documentTypeDescription}</h3>
              <p>Document Number: {doc.documentNumber}</p>
              <p>Issue Date: {doc.issueDate}</p>
              <p>Expiry Date: {doc.expiryDate}</p>
              <a href={doc.filePathOrUrl || '#'}>View Document</a>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
```

---

### 2. Multiple Document Upload for Requirement Lists

#### Create Requirement List with Multiple Document Types

**Endpoint:** `POST /seafarer/api/v1/services/requirement-lists`

**Usage:**

```typescript
// lib/api/requirement-lists.ts
import { apiClient } from '@/lib/api-client';
import { RequirementListDto, CreateRequirementListRequest } from '@/types/api';

export async function createRequirementList(
  request: CreateRequirementListRequest
): Promise<RequirementListDto> {
  const response = await apiClient.post<RequirementListDto>(
    '/services/requirement-lists',
    request
  );
  return response.data!;
}
```

**React Component Example:**

```typescript
// components/RequirementListForm.tsx
'use client';

import { useState } from 'react';
import { DocumentTypeDto } from '@/types/api';
import { createRequirementList } from '@/lib/api/requirement-lists';

interface RequirementListFormProps {
  documentTypes: DocumentTypeDto[];
  metricId: string;
  onSuccess?: () => void;
}

export default function RequirementListForm({
  documentTypes,
  metricId,
  onSuccess,
}: RequirementListFormProps) {
  const [description, setDescription] = useState('');
  const [selectedDocumentTypeIds, setSelectedDocumentTypeIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentTypeToggle = (documentTypeId: string) => {
    setSelectedDocumentTypeIds((prev) =>
      prev.includes(documentTypeId)
        ? prev.filter((id) => id !== documentTypeId)
        : [...prev, documentTypeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createRequirementList({
        description,
        metricId,
        documentTypeIds: selectedDocumentTypeIds.length > 0 
          ? selectedDocumentTypeIds 
          : undefined,
        isActive,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create requirement list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="requirement-list-form">
      <div>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Document Types (Select Multiple):</label>
        <div className="document-type-checkboxes">
          {documentTypes.map((docType) => (
            <label key={docType.documentTypesId} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedDocumentTypeIds.includes(docType.documentTypesId)}
                onChange={() => handleDocumentTypeToggle(docType.documentTypesId)}
              />
              {docType.description}
            </label>
          ))}
        </div>
        {selectedDocumentTypeIds.length === 0 && (
          <p className="error">Please select at least one document type</p>
        )}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading || selectedDocumentTypeIds.length === 0}>
        {loading ? 'Creating...' : 'Create Requirement List'}
      </button>
    </form>
  );
}
```

#### Update Requirement List

**Endpoint:** `PUT /seafarer/api/v1/services/requirement-lists/{id}`

```typescript
// lib/api/requirement-lists.ts
export async function updateRequirementList(
  id: string,
  request: UpdateRequirementListRequest
): Promise<RequirementListDto> {
  const response = await apiClient.put<RequirementListDto>(
    `/services/requirement-lists/${id}`,
    request
  );
  return response.data!;
}
```

#### Get Requirement List

**Endpoint:** `GET /seafarer/api/v1/services/requirement-lists/{id}`

```typescript
// lib/api/requirement-lists.ts
export async function getRequirementList(
  id: string
): Promise<RequirementListDto> {
  const response = await apiClient.get<RequirementListDto>(
    `/services/requirement-lists/${id}`
  );
  return response.data!;
}
```

**Display Component:**

```typescript
// components/RequirementListDisplay.tsx
'use client';

import { RequirementListDto } from '@/types/api';

interface RequirementListDisplayProps {
  requirementList: RequirementListDto;
}

export default function RequirementListDisplay({
  requirementList,
}: RequirementListDisplayProps) {
  return (
    <div className="requirement-list-display">
      <h2>{requirementList.description}</h2>
      <p>Metric: {requirementList.metricDescription}</p>
      
      <div className="document-types">
        <h3>Required Document Types:</h3>
        {requirementList.documentTypes && requirementList.documentTypes.length > 0 ? (
          <ul>
            {requirementList.documentTypes.map((docType) => (
              <li key={docType.documentTypesId}>
                {docType.description}
                {docType.code && <span className="code">({docType.code})</span>}
              </li>
            ))}
          </ul>
        ) : (
          // Fallback to single document type for backward compatibility
          requirementList.documentTypeDescription && (
            <p>{requirementList.documentTypeDescription}</p>
          )
        )}
      </div>
      
      <p>Status: {requirementList.isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}
```

---

### 3. Total Sea Time Display on Dashboard

#### Get Application Dashboard

**Endpoint:** `GET /seafarer/api/v1/Applications/dashboard`

**Usage:**

```typescript
// lib/api/dashboard.ts
import { apiClient } from '@/lib/api-client';
import { ApplicationDashboardDto } from '@/types/api';

export async function getApplicationDashboard(): Promise<ApplicationDashboardDto> {
  const response = await apiClient.get<ApplicationDashboardDto>(
    '/Applications/dashboard'
  );
  return response.data!;
}
```

**Dashboard Component:**

```typescript
// components/SeaTimeDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { ApplicationDashboardDto } from '@/types/api';
import { getApplicationDashboard } from '@/lib/api/dashboard';

export default function SeaTimeDisplay() {
  const [dashboard, setDashboard] = useState<ApplicationDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getApplicationDashboard();
        setDashboard(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!dashboard) return null;

  const formatSeaTime = () => {
    if (!dashboard.totalSeaTimeDays) return 'No sea time recorded';

    const years = dashboard.totalSeaTimeYears || 0;
    const months = dashboard.totalSeaTimeMonths || 0;
    const days = dashboard.totalSeaTimeDays;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years.toFixed(1)} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months.toFixed(1)} month${months !== 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

    return parts.join(', ') || 'No sea time recorded';
  };

  return (
    <div className="sea-time-display">
      <h2>Total Sea Time</h2>
      <div className="sea-time-stats">
        <div className="stat-card">
          <h3>Days</h3>
          <p className="stat-value">{dashboard.totalSeaTimeDays || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Months</h3>
          <p className="stat-value">
            {dashboard.totalSeaTimeMonths?.toFixed(1) || '0.0'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Years</h3>
          <p className="stat-value">
            {dashboard.totalSeaTimeYears?.toFixed(1) || '0.0'}
          </p>
        </div>
      </div>
      <p className="sea-time-formatted">{formatSeaTime()}</p>
    </div>
  );
}
```

---

### 4. Onboarding Status and Completion Tracking

#### Get My Onboarding (with Status Check)

**Endpoint:** `GET /seafarer/api/v1/Onboarding/my-onboarding`

**Usage:**

```typescript
// lib/api/onboarding.ts
import { apiClient } from '@/lib/api-client';
import { UserSeafarerOnboardingDto } from '@/types/api';

export async function getMyOnboarding(): Promise<UserSeafarerOnboardingDto> {
  const response = await apiClient.get<UserSeafarerOnboardingDto>(
    '/Onboarding/my-onboarding'
  );
  return response.data!;
}
```

#### Create Onboarding (with Validation)

**Endpoint:** `POST /seafarer/api/v1/Onboarding`

**Usage:**

```typescript
// lib/api/onboarding.ts
export interface CreateUserSeafarerOnboardingRequest {
  accreditedInstitutionId?: string;
  roleSpecificIdentifier?: string;
  sin?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  notes?: string;
}

export async function createOnboarding(
  request: CreateUserSeafarerOnboardingRequest
): Promise<UserSeafarerOnboardingDto> {
  const response = await apiClient.post<UserSeafarerOnboardingDto>(
    '/Onboarding',
    request
  );
  return response.data!;
}
```

**Onboarding Status Component:**

```typescript
// components/OnboardingStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import { UserSeafarerOnboardingDto } from '@/types/api';
import { getMyOnboarding, createOnboarding } from '@/lib/api/onboarding';

export default function OnboardingStatus() {
  const [onboarding, setOnboarding] = useState<UserSeafarerOnboardingDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOnboarding() {
      try {
        const data = await getMyOnboarding();
        setOnboarding(data);
      } catch (error) {
        console.error('Failed to fetch onboarding:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOnboarding();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!onboarding) {
    return <div>No onboarding found</div>;
  }

  // Check if user can create new onboarding
  if (!onboarding.canCreateNewOnboarding) {
    return (
      <div className="onboarding-blocked">
        <h2>Cannot Create New Onboarding</h2>
        <p className="error-message">{onboarding.blockingReason}</p>
        {onboarding.hasActiveOnboarding && (
          <div className="active-onboarding-info">
            <p>
              Active Onboarding: {onboarding.activeOnboardingRole} -{' '}
              {onboarding.activeOnboardingStatus}
            </p>
            <a href={`/onboarding/${onboarding.userSeafarerOnboardingId}`}>
              View Active Onboarding
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="onboarding-status">
      <h2>Onboarding Status</h2>
      <div className="status-info">
        <p>
          <strong>Status:</strong> {onboarding.status}
        </p>
        <p>
          <strong>Role:</strong> {onboarding.role}
        </p>
        {onboarding.rn && (
          <p>
            <strong>Registration Number:</strong> {onboarding.rn}
          </p>
        )}
        <p>
          <strong>Completion:</strong>{' '}
          {onboarding.isOnboardingComplete ? 'Complete' : 'Incomplete'}
        </p>
      </div>

      {onboarding.status === 'APPROVED' && onboarding.isOnboardingComplete && (
        <div className="onboarding-complete">
          <p>✅ Your onboarding has been completed and approved.</p>
        </div>
      )}

      {onboarding.canCreateNewOnboarding && (
        <button
          onClick={async () => {
            try {
              const newOnboarding = await createOnboarding({
                // Add required fields based on role
              });
              setOnboarding(newOnboarding);
            } catch (error: any) {
              if (error.code === 'PENDING_ONBOARDING_EXISTS') {
                alert('You already have a pending onboarding application.');
              } else if (error.code === 'DRAFT_ONBOARDING_EXISTS') {
                alert('You have a draft onboarding. Please submit it first.');
              } else if (error.code === 'ACTIVE_ONBOARDING_EXISTS') {
                alert('You have an active approved onboarding.');
              } else {
                alert(`Error: ${error.message}`);
              }
            }
          }}
        >
          Create New Onboarding
        </button>
      )}
    </div>
  );
}
```

#### Update Onboarding Status (Admin Only)

**Endpoint:** `PATCH /seafarer/api/v1/Onboarding/{id}/status`

```typescript
// lib/api/onboarding.ts
export interface UpdateOnboardingStatusRequest {
  status: string;
  rn?: string;
  rejectionReason?: string;
  notes?: string;
}

export async function updateOnboardingStatus(
  id: string,
  request: UpdateOnboardingStatusRequest
): Promise<UserSeafarerOnboardingDto> {
  const response = await apiClient.patch<UserSeafarerOnboardingDto>(
    `/Onboarding/${id}/status`,
    request
  );
  return response.data!;
}
```

---

## Error Handling

### Error Codes Reference

The backend returns specific error codes that should be handled:

```typescript
// types/errors.ts
export enum OnboardingErrorCodes {
  PENDING_ONBOARDING_EXISTS = 'PENDING_ONBOARDING_EXISTS',
  DRAFT_ONBOARDING_EXISTS = 'DRAFT_ONBOARDING_EXISTS',
  ACTIVE_ONBOARDING_EXISTS = 'ACTIVE_ONBOARDING_EXISTS',
  ONBOARDING_NOT_FOUND = 'ONBOARDING_NOT_FOUND',
}

export enum RequirementListErrorCodes {
  DUPLICATE_DOCUMENT_TYPE_IDS = 'DUPLICATE_DOCUMENT_TYPE_IDS',
  DOCUMENT_TYPE_ASSOCIATION_FAILED = 'DOCUMENT_TYPE_ASSOCIATION_FAILED',
  DOCUMENT_TYPE_ASSOCIATION_UPDATE_FAILED = 'DOCUMENT_TYPE_ASSOCIATION_UPDATE_FAILED',
}
```

### Error Handling Utility

```typescript
// lib/error-handler.ts
import { ApiError } from '@/lib/api-client';
import { OnboardingErrorCodes, RequirementListErrorCodes } from '@/types/errors';

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case OnboardingErrorCodes.PENDING_ONBOARDING_EXISTS:
        return 'You already have a pending onboarding application. Please wait for approval.';
      case OnboardingErrorCodes.DRAFT_ONBOARDING_EXISTS:
        return 'You have a draft onboarding. Please submit it before creating a new one.';
      case OnboardingErrorCodes.ACTIVE_ONBOARDING_EXISTS:
        return 'You have an active approved onboarding. Please complete it first.';
      case RequirementListErrorCodes.DUPLICATE_DOCUMENT_TYPE_IDS:
        return 'Duplicate document type IDs are not allowed.';
      case RequirementListErrorCodes.DOCUMENT_TYPE_ASSOCIATION_FAILED:
        return 'Failed to associate document types with requirement list.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return 'An unexpected error occurred.';
}
```

---

## Best Practices

### 1. Use React Server Components When Possible

For data fetching that doesn't require interactivity, use Next.js Server Components:

```typescript
// app/onboarding/[id]/page.tsx
import { apiClient } from '@/lib/api-client';
import OnboardingReview from '@/components/OnboardingReview';

export default async function OnboardingPage({
  params,
}: {
  params: { id: string };
}) {
  const response = await apiClient.get(`/Onboarding/${params.id}`);
  
  return <OnboardingReview onboarding={response.data} />;
}
```

### 2. Implement Proper Loading States

```typescript
'use client';

import { useQuery } from '@tanstack/react-query'; // or SWR

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getApplicationDashboard(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DashboardContent data={data} />;
}
```

### 3. Cache API Responses

Use React Query or SWR for caching:

```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

### 4. Type Safety

Always use TypeScript types from your `types/api.ts` file. Avoid using `any`:

```typescript
// ✅ Good
const onboarding: UserSeafarerOnboardingDto = await getMyOnboarding();

// ❌ Bad
const onboarding: any = await getMyOnboarding();
```

### 5. Handle Backward Compatibility

The API maintains backward compatibility. Always check for both old and new fields:

```typescript
// Handle both single and multiple document types
const documentTypes = requirementList.documentTypes?.length
  ? requirementList.documentTypes
  : requirementList.documentTypeDescription
  ? [{ description: requirementList.documentTypeDescription }]
  : [];
```

---

## Code Examples

### Complete Onboarding Review Page

```typescript
// app/admin/onboarding/[id]/page.tsx
import { apiClient } from '@/lib/api-client';
import OnboardingReviewTabs from '@/components/OnboardingReviewTabs';

export default async function AdminOnboardingReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const response = await apiClient.get(`/Onboarding/${params.id}`);
  const onboarding = response.data!;

  return (
    <div className="container">
      <h1>Onboarding Review</h1>
      <OnboardingReviewTabs onboarding={onboarding} />
    </div>
  );
}
```

### Complete Requirement List Management

```typescript
// app/admin/requirement-lists/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { RequirementListDto, DocumentTypeDto } from '@/types/api';
import RequirementListForm from '@/components/RequirementListForm';
import RequirementListTable from '@/components/RequirementListTable';
import { getRequirementLists, getDocumentTypes } from '@/lib/api/requirement-lists';

export default function RequirementListsPage() {
  const [requirementLists, setRequirementLists] = useState<RequirementListDto[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [lists, types] = await Promise.all([
          getRequirementLists(),
          getDocumentTypes(),
        ]);
        setRequirementLists(lists);
        setDocumentTypes(types);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Requirement Lists</h1>
      <RequirementListForm
        documentTypes={documentTypes}
        onSuccess={() => {
          // Refresh list
          getRequirementLists().then(setRequirementLists);
        }}
      />
      <RequirementListTable requirementLists={requirementLists} />
    </div>
  );
}
```

---

## Summary

This guide covers:

1. ✅ **Onboarding Document Display** - Fetch and display all document types (trainings, voyages, profile docs)
2. ✅ **Multiple Document Upload** - Create/update requirement lists with multiple document types
3. ✅ **Total Sea Time Display** - Show calculated sea time on dashboard
4. ✅ **Onboarding Status Tracking** - Prevent multiple active onboardings and track completion

All integrations maintain backward compatibility and follow Next.js best practices.

---

**Document Version:** 1.0  
**Last Updated:** January 24, 2026
