const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Joi validation error
  if (err.isJoi) {
    const errors = err.details.map(detail => {
      const field = detail.path.join('.');
      let message = detail.message;
      
      // Messages personnalisés en français
      switch (detail.type) {
        case 'string.empty':
          message = `Le champ "${field}" ne peut pas être vide`;
          break;
        case 'string.min':
          message = `Le champ "${field}" doit contenir au moins ${detail.context.limit} caractères`;
          break;
        case 'string.max':
          message = `Le champ "${field}" doit contenir au maximum ${detail.context.limit} caractères`;
          break;
        case 'string.pattern.base':
          if (field === 'contact_phone' || field === 'guardian_contact') {
            message = `Le numéro de téléphone doit contenir entre 8 et 15 chiffres (le + est optionnel)`;
          } else {
            message = `Le format du champ "${field}" est invalide`;
          }
          break;
        case 'string.email':
          message = `L'adresse email est invalide`;
          break;
        case 'number.min':
          message = `Le champ "${field}" doit être supérieur ou égal à ${detail.context.limit}`;
          break;
        case 'number.max':
          message = `Le champ "${field}" doit être inférieur ou égal à ${detail.context.limit}`;
          break;
        case 'any.required':
          message = `Le champ "${field}" est obligatoire`;
          break;
        case 'any.only':
          message = `Le champ "${field}" doit être l'une des valeurs suivantes: ${detail.context.valids.join(', ')}`;
          break;
        default:
          message = detail.message;
      }
      
      return {
        field: field,
        message: message
      };
    });
    
    return res.status(400).json({
      success: false,
      message: 'Veuillez corriger les erreurs du formulaire',
      errors: errors
    });
  }

  // Supabase error
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }

  // Custom error with status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'An error occurred'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

module.exports = errorHandler;
