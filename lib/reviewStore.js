import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'reviews';

const DEFAULT_REVIEWS = [
    { id: 1, name: 'Ahmed Raza', location: 'Faisalabad', rating: 5, text: 'Excellent service! Waqas delivered my parcel in less than 2 hours. Very professional and trustworthy.', date: '2024-01-15' },
    { id: 2, name: 'Fatima Khan', location: 'Lahore', rating: 5, text: 'Best rider service in Punjab! Sent a gift to my sister in Faisalabad. Arrived fresh and on time. Highly recommended!', date: '2024-01-20' },
    { id: 3, name: 'Muhammad Bilal', location: 'Faisalabad', rating: 5, text: 'Used them for urgent document delivery. They arrived within the promised window. Very reliable!', date: '2024-01-25' },
    { id: 4, name: 'Sana Malik', location: 'Rawalpindi', rating: 4, text: 'Great service for inter-city deliveries. Safe and secure handling of my electronics.', date: '2024-02-01' },
    { id: 5, name: 'Ali Hassan', location: 'Karachi', rating: 5, text: 'Called for a birthday gift delivery. They wrapped it beautifully and delivered with a personal touch. Amazing!', date: '2024-02-08' },
];

function buildIdFilter(id) {
    if (!id) return { _id: null };
    const searchId = id.toString().trim();
    const numId = Number(id);
    const filters = [
        { _id: searchId },
        { id: searchId },
        { id: isNaN(numId) ? null : numId },
    ];

    if (ObjectId.isValid(searchId)) {
        try {
            filters.push({ _id: new ObjectId(searchId) });
        } catch (e) { }
    }

    return { $or: filters };
}

/**
 * Fetch all reviews from MongoDB.
 */
export const getReviews = async () => {
    try {
        const db = await getDb();
        const reviews = await db.collection(COLLECTION)
            .find({})
            .sort({ date: -1 })
            .toArray();

        if (reviews && reviews.length > 0) {
            return reviews.map(r => ({
                ...r,
                _id: r._id ? r._id.toString() : r.id,
            }));
        }

        return DEFAULT_REVIEWS;
    } catch (error) {
        console.error('Error in getReviews (MongoDB):', error);
        return DEFAULT_REVIEWS;
    }
};

/**
 * Add a new review to MongoDB.
 */
export const addReview = async (review) => {
    try {
        const db = await getDb();
        const reviewId = Date.now();
        const newReview = {
            _id: `rev_${reviewId}`,
            id: reviewId,
            date: new Date().toISOString(),
            ...review,
        };

        const result = await db.collection(COLLECTION).insertOne(newReview);
        return {
            ...newReview,
            _id: result.insertedId ? result.insertedId.toString() : newReview._id,
        };
    } catch (error) {
        console.error('Error in addReview (MongoDB):', error);
        throw error;
    }
};

/**
 * Delete a review from MongoDB.
 */
export const deleteReview = async (id) => {
    if (!id) return false;
    try {
        const db = await getDb();
        const filter = buildIdFilter(id);
        const result = await db.collection(COLLECTION).deleteOne(filter);
        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error in deleteReview (MongoDB):', error);
        return false;
    }
};
