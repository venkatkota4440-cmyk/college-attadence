const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages, errors: error.errors });
    }
    return res.status(400).json({ success: false, message: 'Invalid payload request format.' });
  }
};

module.exports = validate;
