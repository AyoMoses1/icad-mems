# Master Data API Reference

Base URL: `api/seafarer/MasterData`

All endpoints require **Authorization** header with Bearer token.

---

## Get All Master Data

Retrieves all lookup/reference data in a single call (recommended for initial app load).

**Endpoint:** `GET /api/seafarer/MasterData/all`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "documentTypes": [...],
    "accreditedInstitutions": [...],
    "stcwAccreditations": [...],
    "genders": [...],
    "nationalities": [...],
    "civilStatuses": [...],
    "ranks": [...],
    "accreditationStatuses": [...],
    "userTypes": [...],
    "trainingStatuses": [...],
    "organisationTypes": [...],
    "vesselTypes": [...],
    "tradingAreas": [...],
    "serviceTypes": [...],
    "stcwStandards": [...],
    "workTypes": [...],
    "watchShifts": [...],
    "applicationStatuses": [...]
  }
}
```

---

## Document Types

**Endpoint:** `GET /api/seafarer/MasterData/document-types`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "documentTypesId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Passport"
    },
    {
      "documentTypesId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Seaman's Book"
    }
  ]
}
```

---

## Genders

**Endpoint:** `GET /api/seafarer/MasterData/genders`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "genderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "code": "M",
      "description": "Male"
    },
    {
      "genderId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "code": "F",
      "description": "Female"
    }
  ]
}
```

---

## Nationalities

**Endpoint:** `GET /api/seafarer/MasterData/nationalities`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "nationalityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Nigeria",
      "isoCode": "NG"
    },
    {
      "nationalityId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "name": "United States",
      "isoCode": "US"
    }
  ]
}
```

---

## Civil Statuses

**Endpoint:** `GET /api/seafarer/MasterData/civil-statuses`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "civilStatusId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Single"
    },
    {
      "civilStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Married"
    }
  ]
}
```

---

## Ranks

**Endpoint:** `GET /api/seafarer/MasterData/ranks`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "ranksId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "rankId": 1,
      "description": "Captain"
    },
    {
      "ranksId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "rankId": 2,
      "description": "Chief Officer"
    }
  ]
}
```

---

## User Types

**Endpoint:** `GET /api/seafarer/MasterData/user-types`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "userTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Seafarer"
    },
    {
      "userTypeId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Institution"
    }
  ]
}
```

---

## Accreditation Statuses

**Endpoint:** `GET /api/seafarer/MasterData/accreditation-statuses`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "accreditationStatusId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Pending"
    },
    {
      "accreditationStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Approved"
    }
  ]
}
```

---

## Training Statuses

**Endpoint:** `GET /api/seafarer/MasterData/training-statuses`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "trainingStatusId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "In Progress"
    },
    {
      "trainingStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Completed"
    }
  ]
}
```

---

## Organisation Types

**Endpoint:** `GET /api/seafarer/MasterData/organisation-types`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "organisationTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Training Institution"
    },
    {
      "organisationTypeId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Manning Agent"
    }
  ]
}
```

---

## Vessel Types

**Endpoint:** `GET /api/seafarer/MasterData/vessel-types`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "vesselTypesId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Cargo Ship"
    },
    {
      "vesselTypesId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Tanker"
    }
  ]
}
```

---

## Trading Areas

**Endpoint:** `GET /api/seafarer/MasterData/trading-areas`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "tradingAreaId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Near Coastal Voyage"
    },
    {
      "tradingAreaId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Unlimited"
    }
  ]
}
```

---

## Service Types

**Endpoint:** `GET /api/seafarer/MasterData/service-types`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "serviceTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Certificate of Competency"
    },
    {
      "serviceTypeId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Certificate of Proficiency"
    }
  ]
}
```

---

## Work Types

**Endpoint:** `GET /api/seafarer/MasterData/work-types`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "workTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Navigation"
    },
    {
      "workTypeId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Cargo Operations"
    }
  ]
}
```

---

## Watch Shifts

**Endpoint:** `GET /api/seafarer/MasterData/watch-shifts`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "watchShiftId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "0000-0400"
    },
    {
      "watchShiftId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "0400-0800"
    }
  ]
}
```

---

## Application Statuses

**Endpoint:** `GET /api/seafarer/MasterData/application-statuses`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "applicationStatusId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Draft"
    },
    {
      "applicationStatusId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "description": "Submitted"
    }
  ]
}
```

---

## STCW Standards

**Endpoint:** `GET /api/seafarer/MasterData/stcw-standards`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "stcwRef": "II/1",
      "regulationCode": "II/1",
      "competenceArea": "Navigation at the operational level",
      "level": "Operational"
    },
    {
      "stcwRef": "II/2",
      "regulationCode": "II/2",
      "competenceArea": "Navigation at the management level",
      "level": "Management"
    }
  ]
}
```

---

## Accredited Institutions

**Endpoint:** `GET /api/seafarer/MasterData/accredited-institutions`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "accreditedInstitutionsId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accreditedInstitutionName": "Maritime Academy of Nigeria",
      "accreditedInstitutionAddress": "Oron, Akwa Ibom State",
      "institutionTypeId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "institutionTypeDescription": "Training Institution",
      "isApproved": true,
      "accreditationStatusId": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
      "accreditationStatus": "Approved",
      "accreditedInstitutionEmail": "info@man.edu.ng",
      "accreditedInstitutionPhone": "+234-123-456-7890",
      "expiryDate": "2025-12-31T00:00:00Z",
      "stcwAccreditations": []
    }
  ]
}
```

---

## STCW Accreditations

**Endpoint:** `GET /api/seafarer/MasterData/stcw-accreditations`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| institutionId | Guid (optional) | Filter by institution ID |

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "institutionSTCWAccreditationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accreditedInstitutionId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "institutionName": "Maritime Academy of Nigeria",
      "stcwRef": "II/1",
      "regulationCode": "II/1",
      "competenceArea": "Navigation at the operational level",
      "accreditationStatusId": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "accreditationStatus": "Approved",
      "isApproved": true,
      "effectiveDate": "2023-01-01T00:00:00Z",
      "expiryDate": "2025-12-31T00:00:00Z",
      "remarks": null
    }
  ]
}
```

---

## Error Response

All endpoints return the following format on error:

```json
{
  "success": false,
  "message": "Error message description",
  "data": null
}
```

---

## Data Type Summary

| Endpoint | ID Field | Display Field |
|----------|----------|---------------|
| document-types | documentTypesId | description |
| genders | genderId | code, description |
| nationalities | nationalityId | name, isoCode |
| civil-statuses | civilStatusId | description |
| ranks | ranksId, rankId | description |
| user-types | userTypeId | description |
| accreditation-statuses | accreditationStatusId | description |
| training-statuses | trainingStatusId | description |
| organisation-types | organisationTypeId | description |
| vessel-types | vesselTypesId | description |
| trading-areas | tradingAreaId | description |
| service-types | serviceTypeId | description |
| work-types | workTypeId | description |
| watch-shifts | watchShiftId | description |
| application-statuses | applicationStatusId | description |
| stcw-standards | stcwRef | regulationCode, competenceArea, level |
| accredited-institutions | accreditedInstitutionsId | accreditedInstitutionName |
| stcw-accreditations | institutionSTCWAccreditationId | institutionName, stcwRef |

