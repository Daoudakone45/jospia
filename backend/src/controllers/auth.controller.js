const supabase = require('../config/supabase');
const { registerSchema, loginSchema, emailSchema, passwordResetSchema } = require('../utils/validation');
const { sendPasswordResetEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res, next) => {
  try {
    // Validate input
    const { error: validationError, value } = registerSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const { email, password, full_name } = value;

    console.log('📝 Tentative d\'inscription pour:', email);

    // Vérifier si l'utilisateur existe déjà dans la table users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('⚠️  Email déjà utilisé:', email);
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Create user with Supabase Auth
    console.log('🔐 Création du compte Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    console.log('✅ Compte Supabase Auth créé, ID:', authData.user.id);

    // Insert user into users table
    console.log('📊 Insertion dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        full_name,
        role: 'participant'
      }])
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur insertion users table:', userError);
      
      // Nettoyer : supprimer l'utilisateur de auth.users si l'insertion échoue
      console.log('🧹 Nettoyage: suppression du compte auth créé...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(400).json({
        success: false,
        message: `Erreur lors de la création du profil: ${userError.message}`
      });
    }

    console.log('✅ Inscription réussie pour:', email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role
        },
        session: authData.session
      }
    });
  } catch (error) {
    console.error('❌ Erreur globale register:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // Validate input
    const { error: validationError, value } = loginSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const { email, password } = value;

    console.log('🔐 Tentative de connexion pour:', email);

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Erreur Supabase Auth login:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Authentification Supabase réussie, user ID:', data.user.id);

    // Get user details - seulement les colonnes nécessaires
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('❌ Utilisateur introuvable dans la table users:', userError.message);
      return res.status(404).json({
        success: false,
        message: 'Profil utilisateur introuvable'
      });
    }

    console.log('✅ Connexion réussie pour:', email, '- Role:', userData.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role
        },
        session: data.session
      }
    });
  } catch (error) {
    console.error('❌ Erreur globale login:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Note: La déconnexion réelle se fait côté frontend via supabase.auth.signOut()
    // Le backend n'a pas de session à déconnecter car il utilise le Service Key
    // Cette route sert juste à confirmer la déconnexion côté serveur
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { error: validationError, value } = emailSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const { email } = value;

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { error: validationError, value } = passwordResetSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const { token, new_password } = value;

    // Update password with Supabase
    const { data, error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
