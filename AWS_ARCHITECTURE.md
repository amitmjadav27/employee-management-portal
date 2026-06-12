# 👔 Employee Management Portal - AWS Architecture

A serverless Employee Management Portal built on AWS infrastructure with DynamoDB, Lambda, API Gateway, hosted on S3 with CloudFront CDN.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              S3 Static Website Hosting                   │
│  (Frontend: HTML, CSS, JavaScript, Assets)              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 API Gateway                             │
│  (REST API endpoints for CRUD operations)               │
└────────────────────┬────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   ┌──▼──┐      ┌───▼───┐     ┌───▼───┐
   │GET  │      │POST   │     │PUT    │
   │List │      │Create │     │Update │
   │Item │      │Item   │     │Item   │
   └──┬──┘      └───┬───┘     └───┬───┘
      │              │              │
┌─────▼──────────────▼──────────────▼──────┐
│         Lambda Functions                  │
│  (Business Logic for CRUD operations)     │
└─────┬──────────────┬──────────────┬──────┘
      │              │              │
┌─────▼──────────────▼──────────────▼──────┐
│              DynamoDB Table               │
│  (Employees: PK=EmployeeID, GSI=Email)   │
└──────────────────────────────────────────┘
```

## Project Structure

```
employee-management-portal/
├── backend/
│   ├── lambda/
│   │   ├── create-employee/
│   │   │   └── index.js
│   │   ├── get-employees/
│   │   │   └── index.js
│   │   ├── get-employee/
│   │   │   └── index.js
│   │   ├── update-employee/
│   │   │   └── index.js
│   │   ├── delete-employee/
│   │   │   └── index.js
│   │   └── search-employees/
│   │       └── index.js
│   ├── sam-template.yaml
│   └── README.md
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── README.md
├── infrastructure/
│   ├── dynamodb.tf
│   ├── lambda.tf
│   ├── api-gateway.tf
│   ├── s3.tf
│   ├── cloudfront.tf
│   ├── iam.tf
│   └── terraform.tfvars
├── tests/
│   ├── api-tests.http
│   └── postman-collection.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── API_DOCUMENTATION.md
└── README.md
```

## Phase 1: Backend (AWS Serverless)

### 1.1 DynamoDB Table Setup

**Table Name:** `Employees`

**Primary Key:**
- Partition Key: `EmployeeId` (String)

**Global Secondary Index (GSI):**
- Partition Key: `Email` (for searching by email)

**Attributes:**
```json
{
  "EmployeeId": "emp-001",
  "Name": "John Doe",
  "Email": "john@example.com",
  "Department": "Engineering",
  "Position": "Senior Developer",
  "Salary": 75000,
  "JoinDate": "2025-01-15",
  "CreatedAt": "2025-06-12T10:30:00Z",
  "UpdatedAt": "2025-06-12T10:30:00Z"
}
```

### 1.2 Lambda Functions

#### Function 1: Create Employee
- **Trigger:** POST /api/employees
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds
- **Memory:** 128 MB

#### Function 2: Get All Employees
- **Trigger:** GET /api/employees
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds
- **Memory:** 128 MB

#### Function 3: Get Single Employee
- **Trigger:** GET /api/employees/{id}
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds
- **Memory:** 128 MB

#### Function 4: Update Employee
- **Trigger:** PUT /api/employees/{id}
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds
- **Memory:** 128 MB

#### Function 5: Delete Employee
- **Trigger:** DELETE /api/employees/{id}
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds
- **Memory:** 128 MB

#### Function 6: Search Employees
- **Trigger:** GET /api/employees/search?q={query}
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds
- **Memory:** 128 MB

### 1.3 API Gateway

**API Name:** `EmployeeManagementAPI`
**Stage:** `prod`

**Endpoints:**
```
POST   /api/employees              → Create Employee
GET    /api/employees              → List All Employees
GET    /api/employees/{id}         → Get Employee Details
PUT    /api/employees/{id}         → Update Employee
DELETE /api/employees/{id}         → Delete Employee
GET    /api/employees/search       → Search Employees
```

### 1.4 IAM Permissions

Lambda Functions need permissions to:
- `dynamodb:PutItem`
- `dynamodb:GetItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`
- `dynamodb:Query`
- `dynamodb:Scan`
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`

## Phase 2: Frontend

### 2.1 Technology Stack
- **HTML5** - Structure
- **CSS3** - Styling & Responsive Design
- **JavaScript (ES6+)** - Functionality
- **Fetch API** - API calls

### 2.2 Key Files

**index.html** - Main page with:
- Navigation tabs (View, Add, Search)
- Employee cards grid
- Add employee form
- Edit employee modal
- Delete confirmation modal
- Search interface

**styles.css** - Features:
- Responsive design (Mobile, Tablet, Desktop)
- Modern gradient design
- Card-based layout
- Form styling
- Modal dialogs
- Animations

**app.js** - Functionality:
- Tab navigation
- CRUD operations
- Search functionality
- Form validation
- Error handling
- Loading states

## Phase 3: Deployment

### 3.1 S3 Static Website Hosting

**Bucket Configuration:**
- Enable Static Website Hosting
- Set index document: `index.html`
- Set error document: `index.html`
- Block Public Access: Off
- Bucket Policy: Allow public read

**Upload Files:**
```bash
aws s3 sync frontend/ s3://your-bucket-name --delete
```

### 3.2 CloudFront CDN

**Distribution Configuration:**
- Origin: S3 bucket
- Default Root Object: `index.html`
- SSL Certificate: ACM certificate
- Cache Behavior:
  - Default TTL: 86400 (1 day)
  - Max TTL: 31536000 (1 year)
  - Compress: Enabled
- Custom Error Response:
  - 404 → /index.html (SPA routing)

## Setup & Deployment Guide

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- Node.js 20.x or higher
- SAM CLI or Terraform (for infrastructure)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/amitmjadav27/employee-management-portal.git
cd employee-management-portal
```

### Step 2: Deploy Backend

#### Option A: Using AWS SAM
```bash
cd backend
sam build
sam deploy --guided
```

#### Option B: Using Terraform
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Step 3: Configure Frontend API URL
Update `frontend/app.js`:
```javascript
const API_URL = 'https://your-api-gateway-url.execute-api.region.amazonaws.com/prod';
```

### Step 4: Deploy Frontend

1. Create S3 bucket:
```bash
aws s3 mb s3://employee-portal-prod-$(date +%s)
```

2. Enable static website hosting:
```bash
aws s3api put-bucket-website \
  --bucket employee-portal-prod-xxx \
  --website-configuration file://website-config.json
```

3. Upload files:
```bash
aws s3 sync frontend/ s3://employee-portal-prod-xxx --delete
```

4. Create bucket policy to make public:
```bash
aws s3api put-bucket-policy \
  --bucket employee-portal-prod-xxx \
  --policy file://bucket-policy.json
```

### Step 5: Setup CloudFront

1. Create CloudFront distribution pointing to S3 bucket
2. Request SSL certificate (ACM)
3. Configure custom domain (optional)
4. Wait for distribution to deploy (10-15 minutes)

### Step 6: Test APIs

Use provided Postman collection or HTTP test file:
```bash
cd tests
# Use VS Code REST Client extension or Postman
```

## Development Workflow

### Local Development
```bash
# Backend - Test Lambda functions locally
sam local start-api

# Frontend - Serve HTML files
python -m http.server 8000
```

### Testing
```bash
# Run API tests
npm test

# Integration tests
npm run test:integration
```

### Deployment
```bash
# Deploy backend changes
./scripts/deploy-backend.sh

# Deploy frontend changes
./scripts/deploy-frontend.sh

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

## Cost Estimation (Monthly)

- **DynamoDB:** ~$1-5 (On-Demand)
- **Lambda:** ~$0.20 (1M requests)
- **API Gateway:** ~$3.50 (1M requests)
- **S3:** ~$0.50 (Storage)
- **CloudFront:** ~$1-2 (Data transfer)
- **Total:** ~$6-12/month

## Security Best Practices

✅ CORS enabled for API
✅ Input validation on Lambda
✅ Encryption at rest (DynamoDB)
✅ Encryption in transit (HTTPS)
✅ IAM roles with least privilege
✅ S3 bucket policies
✅ API rate limiting
✅ CloudFront security headers

## Monitoring & Logging

- **CloudWatch Logs:** Lambda function logs
- **X-Ray:** Distributed tracing
- **CloudWatch Metrics:** API performance
- **S3 Access Logs:** Static website requests

## Useful Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

## Contributing

Contributions welcome! Please follow the development guide and submit PRs.

## License

MIT License - See LICENSE file for details

## Author

**Amit Jadav** - [@amitmjadav27](https://github.com/amitmjadav27)

---

Made with ❤️ for serverless applications
