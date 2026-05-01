import { Contact } from "../models/contactModel.js";

export const getAllContacts = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;

        page = Number(page);
        limit = Number(limit);

        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalContacts = await Contact.countDocuments();

        res.status(200).json({
            success: true,
            count: contacts.length,
            totalContacts,
            currentPage: page,
            totalPages: Math.ceil(totalContacts / limit),
            contacts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "resolved"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        contact.status = status;

        await contact.save();

        res.status(200).json({
            success: true,
            message: "Status updated",
            contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};