import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './ReviewSection.module.css';

const staticReviews = [
    { id: 1, name: 'Ahmed Raza', location: 'Faisalabad', rating: 5, text: 'Zabardast service! Waqas bhai ne mera parcel 2 ghanton se kam time mein deliver kar diya. Bohat professional aur bharosemand.', date: '2024-01-15' },
    { id: 2, name: 'Fatima Khan', location: 'Lahore', rating: 5, text: 'Punjab ka best rider hai Maine apni behan ko Faisalabad mein gift bheja tha. Bilkul fresh aur time par deliver hua. Highly recommended!', date: '2024-01-20' },
    { id: 3, name: 'Muhammad Bilal', location: 'Faisalabad', rating: 5, text: 'Urgent documents delivery ke liye use kiya. Jo time promise kiya tha usi window mein aa gaye. Bohat reliable service!', date: '2024-01-25' },
    { id: 4, name: 'Sana Malik', location: 'Rawalpindi', rating: 4, text: 'Inter-city deliveries ke liye great service. Mere electronics ko safe aur secure tareeke se handle kiya.', date: '2024-02-01' },
    { id: 5, name: 'Ali Hassan', location: 'Karachi', rating: 5, text: 'Birthday gift delivery ke liye call kiya tha. Unhon ne gift khoobsurati se wrap kiya aur personal touch ke saath deliver kiya. Amazing service!', date: '2024-02-08' },];

function StarRating({ value, onChange, readOnly = false }) {
    const [hover, setHover] = useState(0);
    return (
        <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${star <= (hover || value) ? styles.starActive : ''}`}
                    onClick={() => !readOnly && onChange?.(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                    <FiStar size={readOnly ? 14 : 22} />
                </button>
            ))}
        </div>
    );
}

export default function ReviewSection({ showForm = false }) {
    const [reviews, setReviews] = useState(staticReviews);
    const [current, setCurrent] = useState(0);
    const [form, setForm] = useState({ name: '', email: '', rating: 0, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Modal State
    const [selectedReview, setSelectedReview] = useState(null);

    // Responsive items count
    const [itemsToShow, setItemsToShow] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsToShow(1);
            else if (window.innerWidth < 1024) setItemsToShow(2);
            else if (window.innerWidth < 1280) setItemsToShow(3);
            else setItemsToShow(4);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/reviews/list');
            const data = await res.json();
            if (data.success && data.reviews.length > 0) {
                setReviews(data.reviews);
            }
        } catch (e) {
            console.error('Failed to fetch reviews:', e);
        }
    };

    useEffect(() => {
        fetchReviews();
        const id = setInterval(() => {
            if (selectedReview) return; // Pause while reading modal
            if (reviews.length <= itemsToShow) return; // Don't scroll if all visible

            setCurrent(prev => {
                const maxIndex = Math.max(0, reviews.length - itemsToShow);
                return prev >= maxIndex ? 0 : prev + 1;
            });
        }, 3500); // Slightly faster scroll for better visibility
        return () => clearInterval(id);
    }, [reviews.length, itemsToShow, selectedReview]);

    const next = () => {
        const maxIndex = reviews.length - itemsToShow;
        setCurrent(prev => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prev = () => {
        const maxIndex = reviews.length - itemsToShow;
        setCurrent(prev => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.rating || !form.text) {
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setForm({ name: '', email: '', rating: 0, text: '' });
                fetchReviews();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    // For marquee, we duplicate the list to make it infinite
    const marqueeReviews = [...reviews, ...reviews];

    const truncateText = (text, limit = 100) => {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + '...';
    };

    return (
        <div className={styles.wrapper}>
            {/* Review Marquee */}
            <div className={styles.carousel}>
                <div className={styles.track}>
                    <div
                        className={styles.reviewsGrid}
                        style={{
                            animationPlayState: selectedReview ? 'paused' : 'running'
                        }}
                    >
                        {marqueeReviews.map((review, idx) => (
                            <div
                                key={`${review.id}-${idx}`}
                                className={styles.reviewCard}
                            >
                                <div className={styles.quoteIcon}>&ldquo;</div>
                                <StarRating value={review.rating} readOnly />
                                <p className={styles.reviewText}>
                                    {truncateText(review.text)}
                                    {review.text.length > 100 && (
                                        <button
                                            className={styles.seeMoreBtn}
                                            onClick={() => setSelectedReview(review)}
                                        >
                                            See More
                                        </button>
                                    )}
                                </p>
                                <div className={styles.reviewer}>
                                    <div className={styles.avatar}>
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <strong className={styles.reviewerName}>{review.name}</strong>
                                        <span className={styles.reviewerLoc}>📍 {review.location || 'Faisalabad'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal for full review */}
            <AnimatePresence>
                {selectedReview && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedReview(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className={styles.closeBtn} onClick={() => setSelectedReview(null)}>&times;</button>
                            <div className={styles.modalBody}>
                                <StarRating value={selectedReview.rating} readOnly />
                                <div className={styles.modalQuote}>&ldquo;</div>
                                <p className={styles.fullText}>{selectedReview.text}</p>
                                <div className={styles.reviewer} style={{ marginTop: 24 }}>
                                    <div className={styles.avatar} style={{ width: 50, height: 50, fontSize: 20 }}>
                                        {selectedReview.name.charAt(0)}
                                    </div>
                                    <div>
                                        <strong className={styles.reviewerName} style={{ fontSize: 17 }}>{selectedReview.name}</strong>
                                        <span className={styles.reviewerLoc} style={{ fontSize: 14 }}>📍 {selectedReview.location || 'Faisalabad'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dots */}
            <div className={styles.dots}>
                {Array.from({ length: Math.ceil(reviews.length / itemsToShow) }).map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${Math.floor(current / itemsToShow) === i ? styles.dotActive : ''}`}
                        onClick={() => setCurrent(i * itemsToShow)}
                        aria-label={`Go to page ${i + 1}`}
                    />
                ))}
            </div>

            {/* Review Form */}
            {showForm && (
                <motion.div
                    className={styles.formWrap}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className={styles.formTitle}>Share Your Experience</h3>
                    {submitted ? (
                        <div className={styles.thankYou}>
                            ⭐ Thank you for your review! It will appear on our homepage shortly.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.reviewForm}>
                            <div className={styles.ratingField}>
                                <label className="form-label">Your Rating *</label>
                                <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reviewer-name">Name *</label>
                                    <input id="reviewer-name" className="form-input" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reviewer-email">Email</label>
                                    <input id="reviewer-email" className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="review-text">Review *</label>
                                <textarea id="review-text" className="form-input" rows={3} value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} placeholder="Tell us about your experience..." required />
                            </div>
                            <button type="submit" className="btn btn-teal" disabled={submitting} id="submit-review-btn">
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </motion.div>
            )}
        </div>
    );
}
