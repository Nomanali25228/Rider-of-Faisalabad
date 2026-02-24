// Shared in-memory store for reviews
// Using global to persist data across HMR in development

if (!global.reviews) {
    global.reviews = [
        { id: 1, name: 'Ahmed Raza', location: 'Faisalabad', rating: 5, text: 'Excellent service! Waqas delivered my parcel in less than 2 hours. Very professional and trustworthy.', date: '2024-01-15' },
        { id: 2, name: 'Fatima Khan', location: 'Lahore', rating: 5, text: 'Best rider service in Punjab! Sent a gift to my sister in Faisalabad. Arrived fresh and on time. Highly recommended!', date: '2024-01-20' },
        { id: 3, name: 'Muhammad Bilal', location: 'Faisalabad', rating: 5, text: 'Used them for urgent document delivery. They arrived within the promised window. Very reliable!', date: '2024-01-25' },
        { id: 4, name: 'Sana Malik', location: 'Rawalpindi', rating: 4, text: 'Great service for inter-city deliveries. Safe and secure handling of my electronics.', date: '2024-02-01' },
        { id: 5, name: 'Ali Hassan', location: 'Karachi', rating: 5, text: 'Called for a birthday gift delivery. They wrapped it beautifully and delivered with a personal touch. Amazing!', date: '2024-02-08' },
    ];
}

export const getReviews = () => global.reviews;

export const addReview = (review) => {
    const newReview = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...review
    };
    global.reviews.unshift(newReview);
    return newReview;
};
