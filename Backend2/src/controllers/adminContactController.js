import { CustomError } from "../middleware/errorHandler.js";
import { Contact } from "../models/contactModel.js";
export const getAllContacts = async (req, res) => {
  let {
    page = 1,
    limit = 10
  } = req.query;
  page = Number(page);
  limit = Number(limit);
  const contacts = await Contact.find().sort({
    createdAt: -1
  }).skip((page - 1) * limit).limit(limit);
  const totalContacts = await Contact.countDocuments();
  res.status(200).json({
    success: true,
    count: contacts.length,
    totalContacts,
    currentPage: page,
    totalPages: Math.ceil(totalContacts / limit),
    contacts
  });
};
export const updateContactStatus = async (req, res) => {
  const {
    status
  } = req.body;
  if (!["pending", "resolved"].includes(status)) {
    throw new CustomError("Invalid status", 400);
  }
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new CustomError("Contact not found", 404);
  }
  contact.status = status;
  await contact.save();
  res.status(200).json({
    success: true,
    message: "Status updated",
    contact
  });
};