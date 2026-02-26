// Shared in-memory store for contacts
if (!global.contacts) {
    global.contacts = [];
}

export const getContacts = () => global.contacts;

export const addContact = (contact) => {
    const newContact = {
        _id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...contact
    };
    global.contacts.unshift(newContact);
    console.log('Contact added to store. Total contacts:', global.contacts.length);
    return newContact;
};
