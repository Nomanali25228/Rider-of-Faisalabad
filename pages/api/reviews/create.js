import { addReview } from '../../../lib/reviewStore';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { name, rating, text, location } = req.body;

    if (!name || !rating || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const review = addReview({
        name,
        rating,
        text,
        location: location || 'Faisalabad'
    });

    return res.status(200).json({ success: true, review });
}
