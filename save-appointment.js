const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const appointmentData = JSON.parse(event.body);
    
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    
    // Select database and collection
    const database = client.db('hospital_db');
    const collection = database.collection('appointments');
    
    // Add timestamp and generate ID
    appointmentData.created_at = new Date();
    appointmentData.appointment_id = `DH${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Save to database
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
        appointmentId: appointmentData.appointment_id,
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