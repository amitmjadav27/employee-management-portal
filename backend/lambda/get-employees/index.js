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
    // Get pagination parameters
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 100;
    const exclusiveStartKey = event.queryStringParameters?.lastEvaluatedKey ? 
      JSON.parse(decodeURIComponent(event.queryStringParameters.lastEvaluatedKey)) : 
      undefined;
    
    // Scan DynamoDB table
    const params = {
      TableName: tableName,
      Limit: Math.min(limit, 1000),
      ExclusiveStartKey: exclusiveStartKey
    };
    
    const result = await dynamodb.scan(params).promise();
    
    console.log(`Retrieved ${result.Items.length} employees`);
    
    return response(200, {
      success: true,
      message: 'Employees retrieved successfully',
      data: result.Items,
      count: result.Items.length,
      lastEvaluatedKey: result.LastEvaluatedKey ? 
        encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : 
        null
    });
  } catch (error) {
    console.error('Error retrieving employees:', error);
    return response(500, {
      success: false,
      message: 'Error retrieving employees',
      error: error.message
    });
  }
};
