import { getReviews } from '../../../lib/reviewStore';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const reviews = await getReviews();
        return res.status(200).json({ success: true, reviews });
    } catch (err) {
        console.error('Reviews fetch error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
}
