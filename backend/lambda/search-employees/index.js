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

const searchEmployees = async (query) => {
  try {
    const params = {
      TableName: tableName
    };
    
    const result = await dynamodb.scan(params).promise();
    
    // Filter results based on query
    const queryLower = query.toLowerCase();
    const filtered = result.Items.filter(employee => 
      employee.Name.toLowerCase().includes(queryLower) ||
      employee.Email.toLowerCase().includes(queryLower) ||
      employee.Department.toLowerCase().includes(queryLower) ||
      employee.Position.toLowerCase().includes(queryLower)
    );
    
    return filtered;
  } catch (error) {
    console.error('Error scanning table:', error);
    throw error;
  }
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));
  
  try {
    const query = event.queryStringParameters?.q;
    
    if (!query || query.trim() === '') {
      return response(400, {
        success: false,
        message: 'Search query is required',
        data: []
      });
    }
    
    // Search employees
    const results = await searchEmployees(query);
    
    console.log(`Found ${results.length} employees matching query: ${query}`);
    
    return response(200, {
      success: true,
      message: `Found ${results.length} employee(s)`,
      data: results,
      count: results.length,
      query: query
    });
  } catch (error) {
    console.error('Error searching employees:', error);
    return response(500, {
      success: false,
      message: 'Error searching employees',
      error: error.message,
      data: []
    });
  }
};
