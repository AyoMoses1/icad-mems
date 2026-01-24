# Documentation Index

This directory contains all documentation for the MEMS Seafarer Frontend application, organized by category.

## 📚 Documentation Structure

### [Setup & Configuration](./setup/)
Configuration guides and environment setup documentation.

- [Environment Variables](./setup/environment-variables.md) - Complete reference for all environment variables
- [SSO Authentication Setup](./setup/sso-authentication-setup.md) - Single Sign-On configuration guide

### [API Documentation](./api/)
API integration guides, references, and endpoint documentation.

- [Complete API Integration Guide](./api/complete-api-integration-guide.md) - Comprehensive API integration overview
- [Master Data API Reference](./api/master-data-api-reference.md) - Master data endpoints reference
- [Frontend API Integration](./api/frontend-api-integration.md) - Frontend-specific API integration guide
- [Frontend Integration Guide](./api/frontend-integration-guide.md) - Main integration guide
- [Frontend Integration Guide Update](./api/frontend-integration-guide-update.md) - Updated integration guide
- [Get My Permissions API Documentation](./api/get-my-permissions-api-documentation.md) - Permissions API reference

### [Features](./features/)
Feature implementation summaries and change logs.

- [Changes Summary](./features/changes-summary.md) - Summary of all feature changes
- [Onboarding Implementation Summary](./features/onboarding-implementation-summary.md) - Onboarding feature summary
- [Comprehensive Onboarding Implementation](./features/comprehensive-onboarding-implementation.md) - Detailed onboarding implementation
- [Seafarer Application V2 Migration Summary](./features/seafarer-application-v2-migration-summary.md) - V2 API migration details
- [Seafarer Requirement Application Changes](./features/seafarer-requirement-application-changes.md) - Requirement application updates
- [Master Data Integration Summary](./features/master-data-integration-summary.md) - Master data integration details
- [Applications Endpoints Fix Summary](./features/applications-endpoints-fix-summary.md) - Applications API fixes

### [Authentication & Authorization](./auth/)
Authentication, authorization, and role-based access control documentation.

- [Role-Based Authentication](./auth/role-based-authentication.md) - Role-based authentication system
- [Staff Role Handling](./auth/staff-role-handling.md) - Staff role management
- [Updated Role Detection](./auth/updated-role-detection.md) - Role detection implementation

### [Onboarding](./onboarding/)
Onboarding-specific documentation and workflows.

- [Onboarding Payloads Reference](./onboarding/onboarding-payloads-reference.md) - API payload specifications
- [Onboarding Fix](./onboarding/onboarding-fix.md) - Onboarding bug fixes
- [Onboarding Documents Workflow](./onboarding/onboarding-documents-workflow.md) - Document upload workflow
- [Comprehensive Onboarding Integration](./onboarding/comprehensive-onboarding-integration.md) - Complete onboarding integration guide

### [Integrations](./integrations/)
Integration guides for external systems and services.

- [Document Upload Flow V1](./integrations/document-upload-flow-V1.md) - Original document upload specification
- [Document Upload Flow V2](./integrations/document-upload-flow-V2.md) - Enhanced document upload specification
- [Document Upload Flow V3](./integrations/document-upload-flow-v3.md) - Latest document upload specification
- [Frontend Service Management Guide](./integrations/frontend-service-management-guide.md) - Service management integration

### [Bug Fixes](./bugfixes/)
Bug fix documentation and issue resolutions.

- [Backend Issues](./bugfixes/backend-issues.md) - Backend-related issues and fixes
- [Select Empty Value Fix](./bugfixes/select-empty-value-fix.md) - Select component fix

### [Requirements & Planning](./requirements/)
Backend requirements and planning documents.

- [Backend Requirements](./requirements/backend-requirements.md) - Backend API requirements
- [Plans](./requirements/plans/) - Implementation planning documents
  - [Certificate Management Admin Pages](./requirements/plans/certificate-management-admin-pages.md)
  - [ID Documents Management](./requirements/plans/id-documents-management.md)
  - [Onboarding Requirements Admin Page](./requirements/plans/onboarding-requirements-admin-page.md)
  - [Training Documents Management](./requirements/plans/training-documents-management.md)

### [Testing & Demo](./testing/)
Testing guides and demo documentation.

- [Quick Test Guide](./testing/quick-test-guide.md) - Quick testing instructions
- [Demo Guide](./testing/demo-guide.md) - Demo and presentation guide

## 🗂️ Quick Navigation

### For New Developers
1. Start with [Environment Variables](./setup/environment-variables.md) for setup
2. Read [Frontend Integration Guide](./api/frontend-integration-guide.md) for API integration
3. Review [Role-Based Authentication](./auth/role-based-authentication.md) for auth flow
4. Check [Quick Test Guide](./testing/quick-test-guide.md) to get started

### For API Integration
- [Complete API Integration Guide](./api/complete-api-integration-guide.md)
- [Master Data API Reference](./api/master-data-api-reference.md)
- [Document Upload Flow V3](./integrations/document-upload-flow-v3.md)

### For Feature Development
- [Changes Summary](./features/changes-summary.md)
- [Comprehensive Onboarding Implementation](./features/comprehensive-onboarding-implementation.md)
- [Seafarer Application V2 Migration Summary](./features/seafarer-application-v2-migration-summary.md)

### For Troubleshooting
- [Bug Fixes](./bugfixes/) - Known issues and fixes
- [Backend Requirements](./requirements/backend-requirements.md) - Backend dependencies

## 📝 Notes

- All documentation uses Markdown format
- API specifications are in the root directory (`swagger.json`, `swagger.txt`)
- Code artifacts like `class_diagram.txt` remain in the root directory
- Documentation is organized by purpose for easy navigation

## 🔄 Documentation Updates

When adding new documentation:
1. Place it in the appropriate category folder
2. Update this README with a link to the new document
3. Follow the naming convention: lowercase with hyphens (e.g., `my-new-document.md`)
4. Add a brief description in the relevant section above

---

*Last Updated: January 2026*
