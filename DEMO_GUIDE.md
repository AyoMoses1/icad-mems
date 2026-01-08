# 🚢 MEMS Seafarer Portal - Demo Guide

## Overview

The **Maritime Enterprise Management System (MEMS) Seafarer Portal** is a comprehensive digital platform designed to streamline maritime services for seafarers in Nigeria. It serves as a one-stop solution for seafarer registration, certification, and service applications managed by NIMASA (Nigerian Maritime Administration and Safety Agency).

---

## 🎯 Purpose

The platform digitizes and modernizes the entire lifecycle of a seafarer's professional journey:

- **Eliminate paperwork** - All applications and documents are handled digitally
- **Reduce processing time** - Automated workflows and real-time status tracking
- **Ensure compliance** - Built-in validation for maritime regulations
- **Improve transparency** - Full audit trail and application history

---

## 👥 User Roles

| Role                     | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| **Seafarer**             | Individual maritime professionals (captains, officers, ratings) |
| **Training Institution** | Maritime academies and training centers                         |
| **Agent**                | Manning agents and recruitment agencies                         |
| **Admin/Staff**          | NIMASA officers who review and process applications             |

---

## 🔄 Key Workflows

### 1. Seafarer Registration & Onboarding

**Steps:**

1. **Register** - Create account with email verification
2. **Onboarding** - Submit comprehensive profile:
   - Personal information (name, DOB, nationality, rank)
   - Contact details & emergency contacts
   - Education history with certificates
   - Sea service/voyage records
   - Profile documents (passport, COC, medical certificate)
3. **Review** - Admin verifies submitted documents
4. **Approval** - Seafarer receives Registration Number (RN)

### 2. Service Application Flow

**Available Services:**

- Certificate of Competency (COC) - New/Renewal
- Seaman's Book Issuance
- Medical Fitness Certificate
- STCW Endorsements
- And more...

**Application Process:**

1. **Browse Services** - View available maritime services
2. **Create Application** - Select service and provide remarks
3. **Fulfill Requirements** - Upload documents or provide text values based on service requirements
4. **Review & Submit** - Verify all information and submit
5. **Generate Invoice** - System creates invoice for payment
6. **Make Payment** - Redirect to payment gateway
7. **Processing** - Admin reviews and processes application
8. **Completion** - Certificate/document issued

### 3. Payment Flow

- Secure payment gateway integration
- Multiple payment methods supported
- Real-time payment verification
- Invoice generation and download

---

## 📱 Main Features

### For Seafarers

| Feature                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **Dashboard**           | Overview of applications, payments, and notifications |
| **My Applications**     | Track all submitted applications and their status     |
| **Services**            | Browse and apply for available maritime services      |
| **Profile**             | Manage personal information and documents             |
| **Invoices**            | View and pay outstanding invoices                     |
| **Document Management** | Upload and manage certificates and documents          |

### Application Statuses

| Status            | Meaning                               |
| ----------------- | ------------------------------------- |
| `DRAFT`           | Application created but not submitted |
| `SUBMITTED`       | Awaiting review                       |
| `UNDER_REVIEW`    | Being processed by admin              |
| `PENDING_PAYMENT` | Awaiting payment                      |
| `PAID`            | Payment confirmed                     |
| `APPROVED`        | Application approved                  |
| `COMPLETED`       | Certificate/document issued           |
| `REJECTED`        | Application rejected (with reason)    |

---

## 🖥️ Demo Walkthrough

### Demo Scenario: New Seafarer Applying for Seaman's Book

**1. Login as Seafarer**

- Navigate to login page
- Enter credentials
- Redirect to dashboard

**2. View Dashboard**

- Show application summary cards
- Recent applications list
- Quick action buttons

**3. Browse Services**

- Navigate to Services page
- View available services (COC, Seaman's Book, etc.)
- Click on a service to apply

**4. Create Application**

- Show service information
- Add application notes
- Click "Create Application"

**5. Fulfill Requirements**

- Display requirements from the system
- For text requirements: Enter values
- For document requirements: Upload files
- Show validation indicators

**6. Review & Submit**

- Display application summary
- Show all requirements with status
- Click "Submit Application"

**7. Invoice & Payment**

- Show generated invoice
- Display amount due
- Click "Proceed to Payment"
- Redirect to payment gateway

**8. Track Application**

- Navigate to My Applications
- Show application status
- View application history/timeline

---

## 🔐 Security Features

- JWT-based authentication
- Email verification required
- Secure document storage
- Role-based access control
- Audit logging for all actions

---

## 🛠️ Technical Stack

| Component         | Technology                    |
| ----------------- | ----------------------------- |
| Frontend          | Next.js 14, React, TypeScript |
| UI Components     | Shadcn/ui, Tailwind CSS       |
| State Management  | Zustand                       |
| API Communication | REST APIs                     |
| Authentication    | JWT Tokens                    |
| Payments          | Integrated Payment Gateway    |

---

## 📊 Benefits

### For Seafarers

- ✅ Apply for services anytime, anywhere
- ✅ Track application status in real-time
- ✅ Secure document storage
- ✅ Digital payment options
- ✅ Notification alerts

### For NIMASA

- ✅ Streamlined application processing
- ✅ Reduced manual paperwork
- ✅ Better compliance tracking
- ✅ Comprehensive reporting
- ✅ Audit trail for all actions

### For Training Institutions

- ✅ Manage trainee records
- ✅ Issue training certificates
- ✅ Track accreditation status

---

## 📞 Support

For technical support or inquiries:

- **Email:** support@nimasa.gov.ng
- **Website:** www.nimasa.gov.ng

---

## 🚀 Future Enhancements

- Mobile application (iOS/Android)
- Real-time notifications (WebSocket)
- Digital certificate verification (QR codes)
- Integration with international maritime databases
- Advanced analytics and reporting

---

**Version:** 1.0.0  
**Last Updated:** December 31, 2025  
**Developed for:** NIMASA - Nigerian Maritime Administration and Safety Agency


