const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.EMPLOYEES_TABLE;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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
    
    const employee = getResult.Item;
    
    // Delete employee
    await dynamodb.delete({
      TableName: tableName,
      Key: { EmployeeId: employeeId }
    }).promise();
    
    console.log('Employee deleted:', employeeId);
    
    return response(200, {
      success: true,
      message: 'Employee deleted successfully',
      data: {
        EmployeeId: employee.EmployeeId,
        Name: employee.Name,
        Email: employee.Email,
        DeletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return response(500, {
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
};
