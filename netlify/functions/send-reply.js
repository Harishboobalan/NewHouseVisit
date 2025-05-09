const jsforce = require('jsforce');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const formData = JSON.parse(event.body).payload;
    const { name, email, phone, message } = formData.data;

    // Connect to Salesforce
    const conn = new jsforce.Connection({
      loginUrl: process.env.SF_LOGIN_URL
    });
    
    await conn.login(
      process.env.SF_USERNAME,
      process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN
    );

    // Create the email
    const emailContent = `
      <html>
        <body>
          <p>Dear ${name},</p>
          <p>Thank you for your enquiry about our house visit service.</p>
          <p>We have received your message:</p>
          <blockquote>${message}</blockquote>
          <p>Our team will contact you shortly at ${phone || email}.</p>
          <p>Best regards,<br/>New House Visit Team</p>
        </body>
      </html>
    `;

    const emailResult = await conn.sobject('SingleEmailMessage').create({
      Subject: 'Thank you for your house visit enquiry',
      HtmlBody: emailContent,
      ToAddresses: email,
      SaveAsActivity: true
    });

    // Also create a Lead/Case in Salesforce (optional)
    await conn.sobject('Lead').create({
      FirstName: name.split(' ')[0],
      LastName: name.split(' ')[1] || '',
      Email: email,
      Phone: phone,
      Company: 'House Visit Enquiry',
      Description: message,
      LeadSource: 'Website'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Reply email sent successfully' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send reply email' })
    };
  }
};