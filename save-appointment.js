const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const appointmentData = JSON.parse(event.body);
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('hospital_db');
    const collection = database.collection('appointments');
    
    // Add timestamp
    appointmentData.created_at = new Date();
    
    const result = await collection.insertOne(appointmentData);
    await client.close();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: true, 
        appointmentId: appointmentData.appointmentNumber,
        insertedId: result.insertedId 
      })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};
