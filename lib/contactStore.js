import { githubStore } from './github';

const MODEL = 'contacts';

/**
 * Get all contact form submissions from GitHub.
 */
export const getContacts = async () => {
    return await githubStore.getAll(MODEL);
};

/**
 * Save a new contact submission to GitHub.
 */
export const addContact = async (contact) => {
    const newContact = {
        _id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...contact,
    };
    const saved = await githubStore.add(MODEL, newContact);
    console.log('Contact added to GitHub store. Tracking ID:', newContact._id);
    return saved;
};
