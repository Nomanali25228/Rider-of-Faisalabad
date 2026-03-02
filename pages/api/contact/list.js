import { getContacts } from '../../../lib/contactStore';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Check admin session
    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET || 'unjgvwpcasdterzllrnatvonycpbekmk';
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const allContacts = await getContacts();

        // Sort by newest first
        const sorted = [...allContacts].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        return res.status(200).json({
            success: true,
            contacts: sorted,
        });
    } catch (err) {
        console.error('Contacts fetch error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch contacts.' });
    }
}
