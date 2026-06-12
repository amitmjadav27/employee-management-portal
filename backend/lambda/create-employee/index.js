const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.EMPLOYEES_TABLE;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const response = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body)
});

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateInput = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.department || data.department.trim() === '') {
    errors.push('Department is required');
  }
  
  if (!data.position || data.position.trim() === '') {
    errors.push('Position is required');
  }
  
  if (data.salary && isNaN(data.salary)) {
    errors.push('Salary must be a number');
  }
  
  return errors;
};

const checkEmailExists = async (email) => {
  try {
    const result = await dynamodb.query({
      TableName: tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'Email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();
    
    return result.Items.length > 0;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate input
    const errors = validateInput(body);
    if (errors.length > 0) {
      return response(400, {
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Check if email already exists
    const emailExists = await checkEmailExists(body.email);
    if (emailExists) {
      return response(400, {
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create employee object
    const employee = {
      EmployeeId: `emp-${uuidv4()}`,
      Name: body.name,
      Email: body.email,
      Department: body.department,
      Position: body.position,
      Salary: body.salary || 0,
      JoinDate: body.joinDate || new Date().toISOString().split('T')[0],
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Status: 'Active'
    };
    
    // Save to DynamoDB
    await dynamodb.put({
      TableName: tableName,
      Item: employee
    }).promise();
    
    console.log('Employee created:', employee.EmployeeId);
    
    return response(201, {
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return response(500, {
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};
