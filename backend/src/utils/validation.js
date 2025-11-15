const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().min(3).max(255).required()
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Inscription validation
const inscriptionSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  last_name: Joi.string().min(2).max(100).required(),
  section: Joi.string().min(2).max(100).required(),
  health_condition: Joi.string().max(255).allow('', null).optional(),
  age: Joi.number().integer().min(13).max(100).required(),
  residence_location: Joi.string().max(255).required(),
  contact_phone: Joi.string().pattern(/^[0-9]{8,15}$/).required(),
  guardian_name: Joi.string().max(100).allow('', null).optional(),
  guardian_contact: Joi.string().pattern(/^[0-9]{8,15}$/).allow('', null).optional(),
  gender: Joi.string().valid('male', 'female').required()
});

// Payment initiation validation
const paymentInitiateSchema = Joi.object({
  inscription_id: Joi.string().uuid().required(),
  payment_method: Joi.string().valid('orange_money', 'mtn_money', 'moov_money', 'wave').required()
});

// Email validation
const emailSchema = Joi.object({
  email: Joi.string().email().required()
});

// Password reset validation
const passwordResetSchema = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(8).required()
});

// Dormitory assignment validation
const dormitoryAssignmentSchema = Joi.object({
  inscription_id: Joi.string().uuid().required(),
  dormitory_id: Joi.string().uuid().required(),
  room_number: Joi.string().max(50).optional(),
  bed_number: Joi.string().max(50).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  inscriptionSchema,
  paymentInitiateSchema,
  emailSchema,
  passwordResetSchema,
  dormitoryAssignmentSchema
};
