import { getReviews } from '../../../lib/reviewStore';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const reviews = getReviews();
    return res.status(200).json({ success: true, reviews });
}
