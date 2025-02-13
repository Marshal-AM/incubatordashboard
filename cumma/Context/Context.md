**Requirements Document for Next.js Shadcn/UI Application**  
**Version 1.0**  

---

## **Table of Contents**
1. [Application Overview](#application-overview)
2. [Database Schema](#database-schema)
   - [Users Collection](#users-collection)
   - [Startups Collection](#startups-collection)
   - [Service Providers Collection](#service-providers-collection)
3. [Authentication Flows](#authentication-flows)
   - [Startup Authentication](#startup-authentication)
   - [Service Provider Authentication](#service-provider-authentication)
4. [User Interface Requirements](#user-interface-requirements)
   - [Startup Pages](#startup-pages)
   - [Service Provider Pages](#service-provider-pages)
5. [Technical Specifications](#technical-specifications)
6. [Future Considerations](#future-considerations)

---

## **Application Overview**
The application is a Next.js platform with two distinct user roles: **Startups** and **Service Providers**. Both roles share a common `Users` collection for authentication but have separate profiles stored in dedicated collections (`Startups` and `ServiceProviders`). Key features include:
- Separate login/signup flows for Startups and Service Providers.
- Dashboard redirection post-login (placeholder pages for now).
- Support for **email/password** and **OAuth** (Google, Facebook, Apple) authentication.
- Strict schema validation for MongoDB documents.

---

## **Database Schema**

### **Users Collection**
- **Purpose**: Stores core authentication details for all users.
- **Schema Validation**:
  ```json
  {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'userType', 'authProvider', 'createdAt', 'updatedAt'],
      properties: {
        email: { 
          bsonType: 'string', 
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' 
        },
        password: { bsonType: ['string', 'null'] },
        userType: { enum: ['startup', 'Service Provider'] },
        authProvider: { enum: ['local', 'google', 'facebook', 'apple'] },
        authProviderId: { bsonType: ['string', 'null'] },
        isEmailVerified: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
  ```
- **Notes**:
  - `userId` (ObjectId) is referenced in `Startups` and `ServiceProviders` collections.
  - `password` is nullable for OAuth users.
  - `authProviderId` stores the OAuth provider’s user ID (e.g., Google sub ID).

---

### **Startups Collection**
- **Purpose**: Stores profile details for Startup users.
- **Schema Validation**:
  ```json
  {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'startupName', 'contactName', 'contactNumber', 'createdAt', 'updatedAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        startupName: { bsonType: 'string', minLength: 1 },
        contactName: { bsonType: 'string', minLength: 1 },
        contactNumber: { bsonType: 'string', minLength: 1 },
        address: { bsonType: ['string', 'null'] },
        logoUrl: { bsonType: ['string', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
  ```
- **Notes**:
  - Created **simultaneously** with a `Users` document during signup.
  - `address` and `logoUrl` are optional.

---

### **Service Providers Collection**
- **Purpose**: Stores profile details for Service Provider users.
- **Schema Validation**:
  ```json
  {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'userId', 'serviceProviderType', 'serviceName', 'address', 'city',
        'stateProvince', 'zipPostalCode', 'primaryContact1Name',
        'primaryContact1Designation', 'primaryContactNumber', 'primaryEmailId',
        'createdAt', 'updatedAt'
      ],
      properties: {
        userId: { bsonType: 'objectId' },
        serviceProviderType: { 
          enum: ['Incubator', 'Accelerator', 'Institution/University', 
                 'Private Coworking Space', 'Community Space', 'Cafe'] 
        },
        serviceName: { bsonType: 'string', minLength: 1 },
        address: { bsonType: 'string', minLength: 1 },
        features: { bsonType: 'array', items: { bsonType: 'string' } },
        city: { bsonType: 'string', minLength: 1 },
        stateProvince: { bsonType: 'string', minLength: 1 },
        zipPostalCode: { bsonType: 'string', minLength: 1 },
        primaryContact1Name: { bsonType: 'string', minLength: 1 },
        primaryContact1Designation: { bsonType: 'string', minLength: 1 },
        contact2Name: { bsonType: ['string', 'null'] },
        contact2Designation: { bsonType: ['string', 'null'] },
        primaryContactNumber: { bsonType: 'string', minLength: 1 },
        alternateContactNumber: { bsonType: ['string', 'null'] },
        primaryEmailId: { 
          bsonType: 'string', 
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' 
        },
        alternateEmailId: { 
          bsonType: ['string', 'null'], 
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' 
        },
        logoUrl: { bsonType: ['string', 'null'] },
        websiteUrl: { bsonType: ['string', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
  ```
- **Notes**:
  - Created **simultaneously** with a `Users` document during signup.
  - `features`, `contact2Name`, `contact2Designation`, `alternateContactNumber`, `alternateEmailId`, `logoUrl`, and `websiteUrl` are optional.


### **Facilities Collection**  
- **Purpose**: Stores details of facilities managed by Service Providers.  
- **Schema Validation**:  
  ```json  
  // Provided schema (see user input for full JSON)  
  ```  
- **Key Fields**:  
  - `serviceProviderId`: Links to the Service Provider’s `_id`.  
  - `facilityType`: Predefined types (e.g., "Individual Cabin", "Specialized Softwares").  
  - `status`: `active`, `pending`, or `inactive`.  
  - `details`: Dynamic object structure based on `facilityType` (see breakdown below).  

#### **Facility Type-Specific Requirements**  
1. **Individual Cabin**:  
   - `totalCabins` (number), `availableCabins` (number), `images` (URL array), `rentalPlans` (pricing plans).  
2. **Coworking Spaces**:  
   - `totalSeats`, `availableSeats`, `images`, `rentalPlans`.  
3. **Meeting/Board Rooms**:  
   - Conference/training room counts, seaters, `images`, `rentalPlans`.  
4. **Bio & Allied / Manufacturing / Prototyping / SAAS Labs**:  
   - Equipment details (lab name, equipment name, capacity, make), `images`, `subscriptionPlans`.  
5. **Specialized Softwares**:  
   - Software details (name, version), `subscriptionPlans`.  
6. **Raw Space (Office/Lab Setup)**:  
   - Area details (sq.ft, type, furnishing), `images`, `subscriptionPlans`.  

---

## **Authentication Flows**

### **Startup Authentication**
1. **Sign In**:
   - Fields: Email, Password.
   - OAuth options: Google, Facebook, Apple.
   - Redirect to Startup Dashboard (placeholder).
2. **Sign Up**:
   - **Email/Password Flow**:
     - Fields: Email, Password, Startup Name, Contact Number.
     - Creates `Users` + `Startups` documents.
   - **OAuth Flow**:
     - Redirects to a middle page after OAuth success.
     - Middle page collects **Startup Name** and **Contact Number**.
     - Creates `Users` + `Startups` documents.

---

### **Service Provider Authentication**
1. **Sign In**:
   - Fields: Email, Password.
   - OAuth options: Google, Facebook, Apple.
   - Redirect to Service Provider Dashboard (placeholder).
2. **Sign Up**:
   - **Step 1**: Basic Details
     - Fields: Email, Password, Service Provider Name, Primary Contact Number.
   - **Step 2**: Extended Details
     - Fields: 
       - Service Provider Type (dropdown)
       - Address, City, State/Province, ZIP/Postal Code
       - Primary Contact Person (Name, Designation)
       - Optional: Contact Person 2 (Name, Designation)
       - Alternate Contact Number, Alternate Email ID
   - Form validation ensures **all required fields** are filled before submission.
   - Creates `Users` + `ServiceProviders` documents.

---

## **User Interface Requirements**

### **Startup Pages**
1. **Login Page**:
   - Email, Password fields.
   - OAuth buttons (Google, Facebook, Apple).
   - Link to Signup page.
2. **Signup Page**:
   - For email/password: 4 fields (Email, Password, Startup Name, Contact Number).
   - For OAuth: Middle page with 2 fields (Startup Name, Contact Number).
   - Submit button creates account and redirects to dashboard.

---

### **Service Provider Pages**
1. **Login Page**:
   - Email, Password fields.
   - OAuth buttons (Google, Facebook, Apple).
   - Link to Signup page.
2. **Signup Page**:
   - **Step 1**: 4 fields (Email, Password, Service Provider Name, Primary Contact Number).
   - **Step 2**: Multi-field form with dropdowns and validation.
   - "Next" button progresses to Step 2; "Create Account" submits both steps.

---

### **Service Provider Dashboard**  

#### **Dashboard Layout**  
1. **Header**:  
   - Platform logo (left).  
   - "Welcome {Service Provider Name}!" with profile picture (right).  
2. **Sidebar Navigation**:  
   - **MAIN**:  
     - Dashboard (under development).  
     - Bookings (under development).  
     - **Add New Facilities**: Form to register facilities (see below).  
     - **My Services & Facilities**: List of active facilities.  
   - **MANAGE ACCOUNT**:  
     - **My Profile**: Edit service provider details/logo.  
     - **Logout**: Redirect to sign-in page.  

---

#### **Add New Facilities Section**  
- **Flow**:  
  1. Select `facilityType` from a dropdown of 10 predefined options.  
  2. Display a **dynamic form** based on the selected type.  
  3. Validate all fields before submission.  
  4. Submit to create a new document in the `Facilities` collection.  

- **Form Requirements by Type**:  
  | Facility Type               | Required Fields                                                                 |  
  |-----------------------------|---------------------------------------------------------------------------------|  
  | **Individual Cabin**        | Total cabins, available cabins, image URLs, rental plans.                      |  
  | **Coworking Spaces**        | Total seats, available seats, image URLs, rental plans.                        |  
  | **Meeting/Board Rooms**     | Conference/training room counts, seaters, image URLs, rental plans.             |  
  | **Bio & Allied Facilities** | Equipment list (name, capacity, make), image URLs, subscription plans.         |  
  | **Specialized Softwares**   | Software list (name, version), subscription plans.                             |  
  | **Raw Space-Office/Lab**    | Area details (sq.ft, type, furnishing), image URLs, subscription plans.         |  

- **Image Upload**:  
  - Users can upload images from local storage.  
  - Images are stored in cloud storage (e.g., AWS S3, Firebase).  
  - URLs are saved to the `images` array in the `Facilities` collection.  

---

#### **My Services & Facilities Section**  
- Displays a list of facilities with `status: "active"`.  
- Each entry shows:  
  - Facility name/type.  
  - Thumbnail from `images` array.  
  - Quick actions (edit, deactivate).  

---

#### **My Profile Section**  
- Displays all fields from the document of the logged in user from the`ServiceProviders` collection.  
- Editable fields:  
  - Logo (upload new image → update `logoUrl`).  
  - Contact details, addresses, emails etc.  
- Form validation mirrors the `ServiceProviders` schema.  

---

## **Technical Specifications**
- **Frontend**:
  - Next.js with shadcn/ui components.
  - Form handling: Formik + Yup for validation.
  - OAuth integration: NextAuth.js.
- **Backend**:
  - MongoDB Atlas (URI: `mongodb+srv://Marshal:Marshal2004@facilitease.qimoe.mongodb.net/`, Database: `Cumma`).
  - Mongoose for schema validation and transactions.
- **Security**:
  - Password hashing with bcrypt.
  - JWT for session management (if using custom auth).
- **Deployment**:
  - Vercel for Next.js app.
  - Environment variables for MongoDB and OAuth credentials.

- **Image Handling**:  
  - Use `react-dropzone` for uploads.  
  - Integrate with cloud storage (e.g., Firebase Storage).  
  - Store URLs in MongoDB after successful upload.  
- **Dynamic Forms**:  
  - Use `Formik` with conditional rendering based on `facilityType`.  
  - Validate using `Yup` schemas tailored to each facility type.  
- **Dashboard State Management**:  
  - Fetch facilities via `serviceProviderId` using MongoDB queries.  
  - Use `SWR` or `React Query` for real-time updates.  

---

## **Future Considerations**
- Email verification flow for `isEmailVerified`.
- Password reset functionality.
- Dashboard UI development.
- Role-based access control (RBAC) for routes.

---

**End of Document**  
*This document will be updated as the project evolves.*
