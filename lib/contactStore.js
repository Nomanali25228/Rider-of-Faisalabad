import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'contacts';

function buildIdFilter(id) {
    if (!id) return { _id: null };
    const searchId = id.toString().trim();
    const filters = [
        { _id: searchId },
        { id: searchId },
    ];

    if (ObjectId.isValid(searchId)) {
        try {
            filters.push({ _id: new ObjectId(searchId) });
        } catch (e) { }
    }

    return { $or: filters };
}

/**
 * Get all contact form submissions from MongoDB.
 */
export const getContacts = async () => {
    try {
        const db = await getDb();
        const contacts = await db.collection(COLLECTION)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return contacts.map(c => ({
            ...c,
            _id: c._id ? c._id.toString() : c.id,
        }));
    } catch (error) {
        console.error('Error in getContacts (MongoDB):', error);
        return [];
    }
};

/**
 * Save a new contact submission to MongoDB.
 */
export const addContact = async (contact) => {
    try {
        const db = await getDb();
        const contactId = `ct_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newContact = {
            _id: contactId,
            id: contactId,
            createdAt: new Date().toISOString(),
            ...contact,
        };
        const result = await db.collection(COLLECTION).insertOne(newContact);
        return {
            ...newContact,
            _id: result.insertedId ? result.insertedId.toString() : newContact._id,
        };
    } catch (error) {
        console.error('Error in addContact (MongoDB):', error);
        throw error;
    }
};

/**
 * Delete a contact submission by ID from MongoDB.
 */
export const deleteContact = async (id) => {
    if (!id) return false;
    try {
        const db = await getDb();
        const filter = buildIdFilter(id);
        const result = await db.collection(COLLECTION).deleteOne(filter);
        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error in deleteContact (MongoDB):', error);
        return false;
    }
};
