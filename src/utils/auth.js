const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = require('apollo-server');
require('dotenv').config();

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Middleware pour vérifier l'authentification
const isAuthenticated = (context) => {
  const user = context.user;
  if (!user) {
    throw new AuthenticationError('Vous devez être connecté pour effectuer cette action');
  }
  return true;
};

// Middleware pour vérifier le rôle admin
const isAdmin = (context) => {
  isAuthenticated(context);
  if (context.user.role !== 'admin') {
    throw new ForbiddenError('Action réservée aux administrateurs');
  }
  return true;
};

// Obtenir l'utilisateur à partir du token
const getUserFromToken = async (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  isAuthenticated,
  isAdmin,
  getUserFromToken
};
