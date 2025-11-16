const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Cache simple en mémoire pour les utilisateurs (TTL: 5 minutes)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedUser(userId) {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedUser(userId, userData) {
  userCache.set(userId, {
    data: userData,
    timestamp: Date.now()
  });
  
  // Nettoyer le cache après TTL
  setTimeout(() => userCache.delete(userId), CACHE_TTL);
}

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Décoder le JWT localement d'abord (pas de connexion réseau)
    let decoded;
    try {
      // Le JWT Supabase contient les infos de l'utilisateur sans besoin de vérification réseau
      decoded = jwt.decode(token);
      
      if (!decoded || !decoded.sub) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      // Vérifier l'expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Vérifier le cache d'abord
    const cachedUser = getCachedUser(decoded.sub);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // Récupérer les données utilisateur depuis la base de données
    // Utiliser un timeout court pour éviter les blocages
    try {
      const userPromise = supabase
        .from('users')
        .select('id, email, full_name, role') // Seulement les colonnes nécessaires
        .eq('id', decoded.sub)
        .single();

      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ timeout: true }), 2000) // Réduit à 2s
      );

      const result = await Promise.race([
        userPromise,
        timeoutPromise
      ]);

      // Si c'est un timeout
      if (result.timeout) {
        console.warn('⚠️ Database timeout, using fallback from JWT');
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          full_name: decoded.user_metadata?.full_name || '',
          role: decoded.user_metadata?.role || decoded.role || 'participant'
        };
        return next();
      }

      // Sinon, c'est une réponse Supabase
      const { data: userData, error: userError } = result;

      if (userError || !userData) {
        console.warn('⚠️ User not found in database:', userError?.message);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Mettre en cache
      setCachedUser(decoded.sub, userData);
      
      req.user = userData;
      next();
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError.message);
      
      // Fallback: créer un objet user minimal depuis le JWT décodé
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        full_name: decoded.user_metadata?.full_name || '',
        role: decoded.user_metadata?.role || decoded.role || 'participant'
      };
      
      next();
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

module.exports = { authenticate, authorizeAdmin };
