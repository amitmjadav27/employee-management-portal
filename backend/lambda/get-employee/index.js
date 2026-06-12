const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.EMPLOYEES_TABLE;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const response = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));
  
  try {
    const employeeId = event.pathParameters?.id;
    
    if (!employeeId) {
      return response(400, {
        success: false,
        message: 'Employee ID is required'
      });
    }
    
    // Get employee from DynamoDB
    const result = await dynamodb.get({
      TableName: tableName,
      Key: {
        EmployeeId: employeeId
      }
    }).promise();
    
    if (!result.Item) {
      return response(404, {
        success: false,
        message: 'Employee not found'
      });
    }
    
    console.log('Employee retrieved:', employeeId);
    
    return response(200, {
      success: true,
      message: 'Employee retrieved successfully',
      data: result.Item
    });
  } catch (error) {
    console.error('Error retrieving employee:', error);
    return response(500, {
      success: false,
      message: 'Error retrieving employee',
      error: error.message
    });
  }
};
