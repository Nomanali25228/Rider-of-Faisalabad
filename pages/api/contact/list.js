import { getContacts } from '../../../lib/contactStore';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Check admin session
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET || 'admin-secret-2024'}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const allContacts = getContacts();

    // Sort by newest first
    const sorted = [...allContacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
        success: true,
        contacts: sorted,
    });
}
