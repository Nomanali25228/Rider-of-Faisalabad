import { addReview } from '../../../lib/reviewStore';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { name, email, rating, text, location } = req.body;

    if (!name || !rating || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const review = await addReview({
            name,
            email: email || null,
            rating,
            text,
            location: location || 'Faisalabad'
        });

        return res.status(200).json({ success: true, review });
    } catch (err) {
        console.error('Review create error:', err);
        return res.status(500).json({ success: false, message: 'Failed to add review.' });
    }
}
