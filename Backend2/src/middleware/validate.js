import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace req properties with validated ones (which might have default values or type casting)
    req.body = validatedData.body;
    if (validatedData.query) {
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, validatedData.data.query);
    }
    req.params = validatedData.params;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(", ");
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    next(error);
  }
};
