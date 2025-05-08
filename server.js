require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jsforce = require('jsforce');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Salesforce credentials from environment variables
const {
  SF_CLIENT_ID,
  SF_CLIENT_SECRET,
  SF_USERNAME,
  SF_PASSWORD,
  SF_SECURITY_TOKEN,
  SF_LOGIN_URL
} = process.env;

// Initialize Salesforce connection
const conn = new jsforce.Connection({
  loginUrl: SF_LOGIN_URL
});

// Login to Salesforce
async function salesforceLogin() {
  try {
    await conn.login(SF_USERNAME, SF_PASSWORD + SF_SECURITY_TOKEN);
    console.log('Connected to Salesforce');
  } catch (error) {
    console.error('Salesforce login error:', error);
  }
}

salesforceLogin();

// API Endpoint: Register User
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Create user in Salesforce
    const user = await conn.sobject('User').create({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Username: email,
      Alias: firstName.substring(0, 1) + lastName.substring(0, 4),
      CommunityNickname: firstName + lastName.substring(0, 1),
      TimeZoneSidKey: 'America/Los_Angeles',
      LocaleSidKey: 'en_US',
      EmailEncodingKey: 'UTF-8',
      ProfileId: '00e3h000001XrQYAA0', // Standard User profile ID
      LanguageLocaleKey: 'en_US'
    });

    // Create a custom object record for additional user data if needed
    await conn.sobject('Customer__c').create({
      Name: `${firstName} ${lastName}`,
      Email__c: email,
      User__c: user.id
      // Add other custom fields
    });

    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// API Endpoint: Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // In a real implementation, you would:
    // 1. Authenticate against your own database first
    // 2. Then use Salesforce API if needed
    
    // For demo purposes, we'll just check if user exists in Salesforce
    const user = await conn.sobject('User').findOne({
      Email: email
    }, 'Id, FirstName, LastName, Email');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // In production, you would:
    // - Verify password against your hashed password storage
    // - Generate a JWT or session token
    
    res.status(200).json({ 
      success: true, 
      user: {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));