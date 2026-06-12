const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.EMPLOYEES_TABLE;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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
  
  if (data.name && data.name.trim() === '') {
    errors.push('Name cannot be empty');
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.department && data.department.trim() === '') {
    errors.push('Department cannot be empty');
  }
  
  if (data.position && data.position.trim() === '') {
    errors.push('Position cannot be empty');
  }
  
  if (data.salary && isNaN(data.salary)) {
    errors.push('Salary must be a number');
  }
  
  return errors;
};

const checkEmailExists = async (email, employeeId) => {
  try {
    const result = await dynamodb.query({
      TableName: tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'Email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();
    
    return result.Items.length > 0 && result.Items[0].EmployeeId !== employeeId;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));
  
  try {
    const employeeId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    
    if (!employeeId) {
      return response(400, {
        success: false,
        message: 'Employee ID is required'
      });
    }
    
    // Validate input
    const errors = validateInput(body);
    if (errors.length > 0) {
      return response(400, {
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Check if employee exists
    const getResult = await dynamodb.get({
      TableName: tableName,
      Key: { EmployeeId: employeeId }
    }).promise();
    
    if (!getResult.Item) {
      return response(404, {
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if email already exists (if email is being updated)
    if (body.email && body.email !== getResult.Item.Email) {
      const emailExists = await checkEmailExists(body.email, employeeId);
      if (emailExists) {
        return response(400, {
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Build update expression
    let updateExpression = 'SET UpdatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    if (body.name) {
      updateExpression += ', #name = :name';
      expressionAttributeValues[':name'] = body.name;
    }
    
    if (body.email) {
      updateExpression += ', Email = :email';
      expressionAttributeValues[':email'] = body.email;
    }
    
    if (body.department) {
      updateExpression += ', Department = :department';
      expressionAttributeValues[':department'] = body.department;
    }
    
    if (body.position) {
      updateExpression += ', #position = :position';
      expressionAttributeValues[':position'] = body.position;
    }
    
    if (body.salary !== undefined) {
      updateExpression += ', Salary = :salary';
      expressionAttributeValues[':salary'] = body.salary;
    }
    
    if (body.joinDate) {
      updateExpression += ', JoinDate = :joinDate';
      expressionAttributeValues[':joinDate'] = body.joinDate;
    }
    
    // Update employee
    const updateResult = await dynamodb.update({
      TableName: tableName,
      Key: { EmployeeId: employeeId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        '#name': 'Name',
        '#position': 'Position'
      },
      ReturnValues: 'ALL_NEW'
    }).promise();
    
    console.log('Employee updated:', employeeId);
    
    return response(200, {
      success: true,
      message: 'Employee updated successfully',
      data: updateResult.Attributes
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return response(500, {
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};
