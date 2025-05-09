const axios = require('axios');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  try {
    const userData = JSON.parse(event.body);
    
    // Validate input
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Create user in your database (pseudo-code)
    const userId = await createUserInDatabase(userData);
    
    // Create Salesforce Lead
    await createSalesforceLead(userData);

    // Generate JWT
    const token = jwt.sign(
      { email: userData.email, userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        token 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function createUserInDatabase(userData) {
  // Implement your actual user creation logic
  return 'user123'; // Return generated user ID
}

async function createSalesforceLead(userData) {
  try {
    // In a real app, you would use a stored Salesforce access token
    // or service account credentials
    const response = await axios.post(
      `${process.env.SF_INSTANCE_URL}/services/data/v56.0/sobjects/Lead`,
      {
        FirstName: userData.firstName,
        LastName: userData.lastName,
        Email: userData.email,
        Company: 'New House Visit',
        LeadSource: 'Website Registration',
        Status: 'New'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SF_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Salesforce lead creation failed:', error);
    // Fail silently as user registration should still succeed
    return null;
  }
}