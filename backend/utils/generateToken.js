import jwt from 'jsonwebtoken';

/**
 * Creates a JSON Web Token (JWT) for a user.
 * This token is sent to the frontend and stored in LocalStorage to 
 * keep the user logged in for 30 days.
 * 
 * @param {string} id - The MongoDB User ID
 * @returns {string} - The signed JWT string
 */
const generateToken = (id) => {
  // Signs the payload {id} with our secret key
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export default generateToken;
