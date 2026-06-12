# Employee Management Portal - Backend

Serverless backend built with AWS Lambda, DynamoDB, and API Gateway.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- AWS SAM CLI installed
- Node.js 20.x or higher
- Git

## Project Structure

```
backend/
├── lambda/
│   ├── create-employee/
│   ├── get-employees/
│   ├── get-employee/
│   ├── update-employee/
│   ├── delete-employee/
│   └── search-employees/
├── sam-template.yaml
└── README.md
```

## Deployment

### Option 1: Using AWS SAM

1. **Build the project:**
   ```bash
   sam build
   ```

2. **Deploy with guided setup:**
   ```bash
   sam deploy --guided
   ```

3. **Follow the prompts:**
   - Stack Name: `employee-portal-stack`
   - Region: Choose your region
   - Environment: `prod` (or dev/staging)
   - SAM CLI will create S3 bucket and deploy resources

### Option 2: Manual Deployment

1. **Package the application:**
   ```bash
   sam package --output-template-file packaged.yaml --s3-bucket your-bucket-name
   ```

2. **Deploy:**
   ```bash
   sam deploy --template-file packaged.yaml --stack-name employee-portal-stack --capabilities CAPABILITY_IAM
   ```

## Environment Variables

Set before deployment:
```bash
export AWS_REGION=us-east-1
export ENVIRONMENT=prod
```

## API Endpoints

After deployment, you'll get the API endpoint URL:
```
https://your-api-id.execute-api.region.amazonaws.com/prod
```

### Available Endpoints

```
POST   /api/employees
GET    /api/employees
GET    /api/employees/{id}
PUT    /api/employees/{id}
DELETE /api/employees/{id}
GET    /api/employees/search?q=query
```

## Lambda Functions

### 1. Create Employee
- **Function:** `employee-create-prod`
- **Trigger:** POST /api/employees
- **Runtime:** Node.js 20.x
- **Memory:** 128 MB
- **Timeout:** 10 seconds

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "position": "Senior Developer",
  "salary": 75000,
  "joinDate": "2025-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "EmployeeId": "emp-xxxx-xxxx",
    "Name": "John Doe",
    "Email": "john@example.com",
    ...
  }
}
```

### 2. Get All Employees
- **Function:** `employee-list-prod`
- **Trigger:** GET /api/employees
- **Query Parameters:**
  - `limit` (optional): Items per page (default: 100)
  - `lastEvaluatedKey` (optional): For pagination

### 3. Get Single Employee
- **Function:** `employee-get-prod`
- **Trigger:** GET /api/employees/{id}
- **Path Parameter:** `id` (EmployeeId)

### 4. Update Employee
- **Function:** `employee-update-prod`
- **Trigger:** PUT /api/employees/{id}
- **Request Body:** Any fields to update

### 5. Delete Employee
- **Function:** `employee-delete-prod`
- **Trigger:** DELETE /api/employees/{id}

### 6. Search Employees
- **Function:** `employee-search-prod`
- **Trigger:** GET /api/employees/search
- **Query Parameter:** `q` (search query)

## DynamoDB Table

**Table Name:** `Employees-prod`

**Key Schema:**
- Partition Key: `EmployeeId` (String)

**Global Secondary Index:**
- Index Name: `EmailIndex`
- Partition Key: `Email` (String)

**Billing Mode:** PAY_PER_REQUEST (Serverless)

## Monitoring

### CloudWatch Logs
```bash
# View logs for create function
aws logs tail /aws/lambda/employee-create-prod --follow

# View all Lambda logs
aws logs describe-log-groups | grep employee
```

### CloudWatch Metrics
- Lambda Invocations
- Lambda Errors
- Lambda Duration
- DynamoDB Consumed Capacity

### X-Ray Tracing
- Enabled by default in SAM template
- View traces in AWS X-Ray console

## Testing

### Local Testing with SAM

```bash
# Start local API Gateway
sam local start-api

# In another terminal, test endpoints
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","department":"Engineering","position":"Developer"}'
```

### Using Postman or cURL

See `tests/api-tests.http` for example requests.

## Cleanup

Delete all resources:
```bash
aws cloudformation delete-stack --stack-name employee-portal-stack
```

## Troubleshooting

### Lambda Execution Role Issues
- Ensure IAM role has DynamoDB permissions
- Check CloudWatch logs for detailed errors

### DynamoDB Access Issues
- Verify table exists: `aws dynamodb list-tables`
- Check table permissions: `aws dynamodb describe-table --table-name Employees-prod`

### API Gateway Issues
- Check CORS configuration
- Verify endpoint URL is correct
- Check CloudWatch logs for request/response details

## Next Steps

1. Deploy frontend to S3
2. Create CloudFront distribution
3. Configure custom domain (optional)
4. Setup CI/CD pipeline
5. Add authentication/authorization
6. Implement caching strategy

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
