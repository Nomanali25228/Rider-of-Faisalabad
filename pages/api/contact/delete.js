import { githubStore } from '../../../lib/github';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET || 'unjgvwpcasdterzllrnatvonycpbekmk';
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'ID required' });

    try {
        await githubStore.remove('contacts', id);
        return res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (err) {
        console.error('Delete inquiry error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete inquiry' });
    }
}
