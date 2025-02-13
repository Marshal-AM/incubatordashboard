**Updated Requirements Document for Next.js Shadcn/UI Application**  
**Version 3.0**  

---

## **Table of Contents**  
1. [Service Provider Dashboard](#service-provider-dashboard)  
   - [Dashboard Metrics](#dashboard-metrics)  
   - [My Facilities](#my-facilities)  
   - [Bookings Section](#bookings-section)  
2. [Technical Implementation](#technical-implementation)  
   - [Data Fetching Strategies](#data-fetching-strategies)  
   - [UI Components](#ui-components)  
3. [Database Queries](#database-queries)  
4. [Security Considerations](#security-considerations)  

---

## **Service Provider Dashboard**  

### **Dashboard Metrics**  
#### **Key Performance Indicators (KPIs)**  
1. **Total Facilities**:  
   - `COUNT` facilities where `serviceProviderId = currentUser._id` AND `status = "active"`  
   - **Query**:  
     ```javascript  
     db.facilities.countDocuments({ 
       serviceProviderId: ObjectId("..."), 
       status: "active" 
     })
     ```  

2. **New Facilities (Past 30 Days)**:  
   - `COUNT` facilities created in last 30 days (`createdAt >= currentDate - 30`)  
   - **Query**:  
     ```javascript  
     db.facilities.countDocuments({
       serviceProviderId: ObjectId("..."),
       createdAt: { $gte: new Date(Date.now() - 30 * 86400000) }
     })
     ```  

3. **Total Bookings**:  
   - `COUNT` bookings where `status = "approved"` AND linked to service provider's facilities  
   - **Query**:  
     ```javascript  
     db.bookings.countDocuments({ 
       status: "approved",
       facilityId: { $in: serviceProviderFacilityIds } 
     })
     ```  

4. **Earnings**:  
   - **All Time**: `SUM(amount)` from all approved bookings  
   - **This Month**: `SUM(amount)` where `updatedAt` is within current month  
   - **Monthly Comparison**:  
     ```javascript  
     (currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings * 100
     ```  
   - **Visual Indicator**: ▲ Green (increase) / ▼ Red (decrease)  

5. **Graphs**:  
   - **Monthly Earnings**:  
     - X-axis: Months of current year  
     - Y-axis: Sum of `amount` grouped by month  
   - **Monthly Bookings**:  
     - X-axis: Months of current year  
     - Y-axis: Count of bookings grouped by month  
   - **Facility Category Distribution**:  
     - Pie chart showing % of bookings per facility type  

---

### **My Facilities**  
#### **UI Requirements**  
1. **Listing**:  
   - Grid/Table showing all `active` facilities  
   - Columns:  
     | Field | Source |  
     |-------|--------|  
     | Facility Title | `details.name` |  
     | Date Published | `updatedAt` |  
     | Actions | Edit/Delete buttons |  

2. **Actions**:  
   - **Edit (✏️)**:  
     - Redirect to pre-filled form with existing facility data  
     - On submit: `PATCH /api/facilities/:id`  
   - **Delete (🗑️)**:  
     - Hard delete: `DELETE /api/facilities/:id`  

3. **Form Behavior**:  
   - Dynamic form renders fields based on `facilityType`  
   - Pre-fill data using `GET /api/facilities/:id`  

---

### **Bookings Section**  
#### **Approved Bookings Table**  
1. **Columns**:  
   | Section | Data Source |  
   |---------|-------------|  
   | **Startup Details** | `startups.logoUrl`, `startups.startupName` |  
   | **Facility Type** | `facilities.facilityType` |  
   | **Booked On** | `bookings.updatedAt` |  
   | **Validity Till** | `bookings.rentalPlan` + `bookings.updatedAt` |  

2. **Validity Calculation**:  
   ```javascript  
   const validityMap = {
     "Annual": 365 * 24 * 60 * 60 * 1000,
     "Monthly": 30 * 24 * 60 * 60 * 1000,
     "Weekly": 7 * 24 * 60 * 60 * 1000,
     "One Day (24 Hours)": 24 * 60 * 60 * 1000
   };
   const endDate = new Date(booking.updatedAt.getTime() + validityMap[booking.rentalPlan]);
   ```  

3. **Data Joins**:  
   - Use MongoDB `$lookup` to merge:  
     ```javascript  
     db.bookings.aggregate([
       { $match: { status: "approved" } },
       { $lookup: {
           from: "facilities",
           localField: "facilityId",
           foreignField: "_id",
           as: "facility"
         }},
       { $lookup: {
           from: "startups",
           localField: "startupId",
           foreignField: "_id",
           as: "startup"
         }}
     ])
     ```  

---

## **Technical Implementation**  

### **Data Fetching Strategies**  
1. **Aggregation Caching**:  
   - Precompute monthly metrics using MongoDB Change Streams  
   - Store results in `analytics` collection for fast retrieval  

2. **Real-Time Updates**:  
   - Use `SWR` or `React Query` for client-side data revalidation  

3. **Image Handling**:  
   ```javascript  
   // Next.js API Route for Upload
   export default async function handler(req, res) {
     const file = req.files[0];
     const { url } = await uploadToCloudStorage(file); // AWS S3/Firebase
     res.status(200).json({ url });
   }
   ```  

### **UI Components**  
1. **Dashboard Cards**:  
   - Use `shadcn/ui` Card + Badge components  
   - Sparkline graphs with `recharts`  

2. **Facilities Table**:  
   - `shadcn/ui` DataTable with sorting/pagination  

3. **Dynamic Forms**:  
   - Render facility-type-specific fields using `Formik` + `Yup`  
   ```jsx  
   <Formik
     initialValues={facilityData}
     validationSchema={getSchemaByType(facilityType)}
   >
     {({ values }) => (
       <Form>
         {values.facilityType === "individual-cabin" && (
           <Field name="totalCabins" type="number" />
         )}
       </Form>
     )}
   </Formik>
   ```  

---

## **Database Queries**  
### **Monthly Earnings Aggregation**  
```javascript  
db.bookings.aggregate([
  { $match: { status: "approved" } },
  { $group: {
      _id: { $month: "$updatedAt" },
      total: { $sum: "$amount" }
    }},
  { $project: {
      month: "$_id",
      total: 1,
      _id: 0
    }}
])
```  

### **Facility Category Distribution**  
```javascript  
db.bookings.aggregate([
  { $lookup: {
      from: "facilities",
      localField: "facilityId",
      foreignField: "_id",
      as: "facility"
    }},
  { $unwind: "$facility" },
  { $group: {
      _id: "$facility.facilityType",
      count: { $sum: 1 }
    }}
])
```  

---

## **Security Considerations**  
1. **Authentication**:  
   - Validate JWT token in API routes  
   ```javascript  
   // Next.js Middleware
   export async function middleware(req) {
     const session = await getSession({ req });
     if (!session) return new Response("Unauthorized", { status: 401 });
   }
   ```  

2. **Authorization**:  
   - Ensure users only access their own data:  
   ```javascript  
   // API Route Example
   const facilities = await db.facilities.find({
     serviceProviderId: req.user._id // From session
   });
   ```  

3. **Rate Limiting**:  
   - Implement Redis-based rate limiting on edit/delete actions  

--- 

**Requirements Document Addendum: Analytics Collection**  
**Version 3.1**  

---

## **Analytics Collection Design**  
### **Purpose**  
Precompute and store dashboard metrics for rapid retrieval, reducing real-time database load.  

---

### **Schema Validation**  
```json  
{
  $jsonSchema: {
    bsonType: "object",
    required: [
      "serviceProviderId",
      "periodType",
      "startDate",
      "endDate",
      "facilities",
      "bookings",
      "earnings",
      "comparisons"
    ],
    properties: {
      serviceProviderId: {
        bsonType: "objectId",
        description: "Linked Service Provider ID"
      },
      periodType: {
        enum: ["daily", "monthly", "yearly"],
        description: "Aggregation interval"
      },
      startDate: {
        bsonType: "date",
        description: "Start of the analytics period"
      },
      endDate: {
        bsonType: "date",
        description: "End of the analytics period"
      },
      facilities: {
        bsonType: "object",
        required: ["total", "new"],
        properties: {
          total: { bsonType: "int" },
          new: { bsonType: "int" }
        }
      },
      bookings: {
        bsonType: "object",
        required: ["total", "earnings"],
        properties: {
          total: { bsonType: "int" },
          earnings: { bsonType: "double" }
        }
      },
      earnings: {
        bsonType: "object",
        required: ["total", "byCategory"],
        properties: {
          total: { bsonType: "double" },
          byCategory: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["category", "amount"],
              properties: {
                category: { 
                  enum: [
                    "Individual Cabin", "Coworking Spaces", 
                    "Meeting/Board Rooms", "Bio & Allied Facilities", 
                    "Manufacturing Facilities", "Prototyping Labs", 
                    "SAAS Labs and Facilities", "Specialized Softwares", 
                    "Raw Space-Office Setup", "Raw Space-Lab Setup"
                  ] 
                },
                amount: { bsonType: "double" }
              }
            }
          }
        }
      },
      comparisons: {
        bsonType: "object",
        properties: {
          earningsMoM: { bsonType: "double" }, // Month-over-Month %
          bookingsMoM: { bsonType: "double" }
        }
      },
      monthlyTrends: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["month", "earnings", "bookings"],
          properties: {
            month: { bsonType: "string" }, // "2025-03"
            earnings: { bsonType: "double" },
            bookings: { bsonType: "int" }
          }
        }
      }
    }
  }
}
```  

---

### **Sample Document**  
```json  
{
  "_id": { "$oid": "65d3f1a7b4f9e8a1d0c7b2e1" },
  "serviceProviderId": { "$oid": "67a661e8e49797580e3894a9" },
  "periodType": "monthly",
  "startDate": { "$date": "2025-03-01T00:00:00Z" },
  "endDate": { "$date": "2025-03-31T23:59:59Z" },
  "facilities": {
    "total": 15,
    "new": 2
  },
  "bookings": {
    "total": 45,
    "earnings": 12500.75
  },
  "earnings": {
    "total": 12500.75,
    "byCategory": [
      { "category": "Individual Cabin", "amount": 6000.50 },
      { "category": "Coworking Spaces", "amount": 3200.25 },
      { "category": "Meeting/Board Rooms", "amount": 3300.00 }
    ]
  },
  "comparisons": {
    "earningsMoM": 18.5, // 18.5% increase from previous month
    "bookingsMoM": -5.2  // 5.2% decrease
  },
  "monthlyTrends": [
    {
      "month": "2025-01",
      "earnings": 11000.00,
      "bookings": 40
    },
    {
      "month": "2025-02",
      "earnings": 10500.00,
      "bookings": 38
    },
    {
      "month": "2025-03",
      "earnings": 12500.75,
      "bookings": 45
    }
  ]
}
```  

---

### **Data Population Strategy**  
#### 1. **Scheduled Aggregations**  
- **Daily Job**: Updates current month's analytics.  
- **Monthly Job**: Finalizes month-end metrics and stores historical trends.  

#### 2. **MongoDB Aggregation Pipeline**  
```javascript  
// Example: Monthly Earnings by Facility Type
db.bookings.aggregate([
  { $match: { 
    status: "approved",
    updatedAt: { 
      $gte: ISODate("2025-03-01"), 
      $lte: ISODate("2025-03-31") 
    }
  }},
  { $lookup: {
      from: "facilities",
      localField: "facilityId",
      foreignField: "_id",
      as: "facility"
  }},
  { $unwind: "$facility" },
  { $group: {
      _id: "$facility.facilityType",
      total: { $sum: "$amount" }
  }},
  { $project: {
      category: "$_id",
      amount: "$total",
      _id: 0
  }}
])
```  

---

### **Query Optimization**  
1. **Indexes**:  
   ```javascript  
   db.analytics.createIndex({ 
     serviceProviderId: 1, 
     periodType: 1, 
     startDate: -1 
   })  
   ```  
2. **Cache Control**:  
   - Serve dashboard data from `analytics` collection instead of real-time queries.  
   - Refresh cache only during scheduled aggregation jobs.  

---

### **Dashboard Integration**  
#### **Fetching Current Month Data**  
```javascript  
// Next.js API Route
const data = await db.analytics.findOne({
  serviceProviderId: user._id,
  periodType: "monthly",
  startDate: { $lte: new Date() },
  endDate: { $gte: new Date() }
});
```  

#### **Frontend Display**  
```jsx  
// Earnings Comparison Component
<div className="flex gap-2 items-center">
  <span>{data.comparisons.earningsMoM}%</span>
  {data.comparisons.earningsMoM > 0 ? (
    <ArrowUp className="text-green-500" />
  ) : (
    <ArrowDown className="text-red-500" />
  )}
</div>
```  

---

## **Security & Validation**  
1. **Write Restrictions**:  
   - Only backend cron jobs can modify the `analytics` collection.  
2. **Data Integrity Checks**:  
   - Compare precomputed totals with raw data during audits:  
   ```javascript  
   const liveBookings = await db.bookings.countDocuments({
     status: "approved",
     updatedAt: { $gte: period.startDate, $lte: period.endDate }
   });
   assert(liveBookings === analytics.bookings.total);
   ```  

--- 

**This collection ensures millisecond response times for complex dashboard metrics while maintaining data accuracy.**
**End of Document**  
*Updated to include full dashboard implementation details.*