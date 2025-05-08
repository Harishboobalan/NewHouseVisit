require('dotenv').config();
const express = require('express');
const jsforce = require('jsforce');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

// Salesforce connection
const conn = new jsforce.Connection({
  loginUrl: process.env.SF_LOGIN_URL
});

// Connect to Salesforce
async function connectToSalesforce() {
  try {
    await conn.login(
      process.env.SF_USERNAME,
      process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN
    );
    console.log('Connected to Salesforce');
  } catch (error) {
    console.error('Salesforce connection error:', error);
  }
}

connectToSalesforce();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// API Endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Create registration record
    const registration = await conn.sobject('User_Registration__c').create({
      First_Name__c: firstName,
      Last_Name__c: lastName,
      Email__c: email,
      Password__c: password,
      Registration_Date__c: new Date().toISOString(),
      Source__c: 'Web'
    });

    // Send welcome email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Dream House Explorer',
      html: `<p>Hi ${firstName},</p>
             <p>Thank you for registering with us!</p>`
    });

    res.status(201).json({ success: true, id: registration.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create contact request
    const contactReq = await conn.sobject('Contact_Request__c').create({
      Name__c: name,
      Email__c: email,
      Subject__c: subject,
      Message__c: message,
      Status__c: 'New',
      Response_Sent__c: false
    });

    // Send auto-response
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message',
      html: `<p>Hi ${name},</p>
             <p>We've received your message and will respond shortly.</p>
             <p>Your reference: ${contactReq.id}</p>`
    });

    // Update record
    await conn.sobject('Contact_Request__c').update({
      Id: contactReq.id,
      Response_Sent__c: true
    });

    res.status(201).json({ success: true, id: contactReq.id });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));