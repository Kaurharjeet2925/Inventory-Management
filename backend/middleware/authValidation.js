const joi = require("joi");
const registerValidation = (req,res,next) => {
  const schema = joi.object({
	name: joi.string().min(3).max(100).required(),
	email: joi.string().email().required(),
	password: joi.string().min(6).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
	return res.status(400).json({ message: error.details[0].message });
  }	
 next();
}
 
const loginValidation = (req,res,next) => {
	  console.log("Login request body:", req.body);
	  const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).required(),
	  });
	  const { error } = schema.validate(req.body);
	  if (error) {
		console.log("Login validation error:", error.details[0].message);
		return res.status(400).json({ message: error.details[0].message, details: error.details[0] });
	  }	
	 next();
}

module.exports = { registerValidation, loginValidation };