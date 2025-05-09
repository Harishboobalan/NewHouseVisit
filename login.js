const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  try {
    const { email, password, rememberMe } = JSON.parse(event.body);
    
    // Validate credentials (replace with your actual user validation)
    const isValid = await validateUser(email, password);
    if (!isValid) throw new Error('Invalid email or password');

    // Create JWT
    const token = jwt.sign(
      { email, userId: 'user123' }, // Replace with actual user ID
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '7d' : '1h' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        token,
        refreshToken: rememberMe ? 'generate-refresh-token' : null
      })
    };
    
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function validateUser(email, password) {
  // Implement your actual user validation logic
  return true; // Replace with real check
}