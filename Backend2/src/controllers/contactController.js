import { CustomError } from "../middleware/errorHandler.js";
import { Contact } from "../models/contactModel.js";
export const createContact = async (req, res) => {
  const {
    name,
    email,
    phone,
    message
  } = req.body;
  if (!name || !email || !message) {
    throw new CustomError("All fields are required", 400);
  }
  const contact = await Contact.create({
    name,
    email,
    phone,
    message
  });
  res.status(201).json({
    success: true,
    message: "Message sent successfully"
  });
};