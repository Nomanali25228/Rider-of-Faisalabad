import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiClock, FiCheckCircle, FiPackage, FiMapPin, FiTruck, FiAlertCircle, FiStar, FiXCircle } from 'react-icons/fi';
import styles from './track-order.module.css';

const statusConfig = {
    Pending: { color: '#d97706', bg: '#fef3c7', icon: <FiClock size={20} />, step: 0 },
    Accepted: { color: '#2563eb', bg: '#dbeafe', icon: <FiCheckCircle size={20} />, step: 1 },
    'In Progress': { color: '#7c3aed', bg: '#ede9fe', icon: <FiTruck size={20} />, step: 2 },
    Delivered: { color: '#059669', bg: '#d1fae5', icon: <FiCheckCircle size={20} />, step: 3 },
    Rejected: { color: '#dc2626', bg: '#fee2e2', icon: <FiAlertCircle size={20} />, step: -1 },
};

const steps = ['Order Placed', 'Accepted', 'In Progress', 'Delivered'];

export default function TrackOrderPage() {
    const router = useRouter();
    const { id } = router.query;
    const [trackingId, setTrackingId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Feedback State
    const [reviewForm, setReviewForm] = useState({ rating: 0, text: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useEffect(() => {
        if (id) {
            setTrackingId(id.toString().toUpperCase());
            performTracking(id.toString());
        }
    }, [id]);

    const performTracking = async (tid) => {
        setLoading(true);
        setError('');
        setOrder(null);
        setReviewSubmitted(false);
        try {
            const res = await fetch(`/api/orders/track?id=${tid.trim()}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
            } else {
                setError(data.message || 'Order not found.');
            }
        } catch {
            setError('Failed to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingId.trim()) return;
        performTracking(trackingId);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewForm.rating || !reviewForm.text || !order) return;

        setReviewSubmitting(true);
        try {
            const res = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: order.fullName,
                    rating: reviewForm.rating,
                    text: reviewForm.text,
                    location: order.dropAddress.split(',').pop().trim() || 'Faisalabad'
                }),
            });
            const data = await res.json();
            if (data.success) {
                setReviewSubmitted(true);
            }
        } catch (err) {
            console.error('Feedback error:', err);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const cfg = order ? (statusConfig[order.status] || statusConfig.Pending) : null;

    return (
        <>
            <Head>
                <title>Track Order — Rider of Faisalabad</title>
                <meta name="description" content="Track your parcel delivery with Rider of Faisalabad. Enter your tracking ID to see real-time status and estimated delivery time." />
                <link rel="canonical" href="https://riderofaisalabad.com/track-order" />
            </Head>

            <div className="page-wrapper">
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div
                            className={styles.heroContent}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="section-badge"><FiPackage size={12} /> Track Order</span>
                            <h1 className="section-title" style={{ color: 'white' }}>
                                Track Your <span style={{ color: '#F4C542' }}>Parcel</span>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>
                                Enter your tracking ID to get live status of your delivery.
                            </p>

                            {/* Search Form */}
                            <form className={styles.trackForm} onSubmit={handleTrack}>
                                <div className={styles.searchBox}>
                                    <FiSearch size={20} className={styles.searchIcon} />
                                    <input
                                        className={styles.searchInput}
                                        type="text"
                                        placeholder="Enter Tracking ID (e.g. ROF-ABC12345)"
                                        value={trackingId}
                                        onChange={e => setTrackingId(e.target.value.toUpperCase())}
                                        id="tracking-id-input"
                                    />
                                    <button type="submit" className={styles.searchBtn} disabled={loading} id="track-submit-btn">
                                        {loading ? <span className={styles.spinner} /> : 'Track'}
                                    </button>
                                </div>
                                <p className={styles.demoHint}>
                                    Check your email for your tracking ID.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                <section className="section-sm" style={{ background: 'var(--bg)', minHeight: '50vh' }}>
                    <div className="container">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    key="error"
                                    className={styles.errorBox}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <FiAlertCircle size={24} />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {order && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Status Card */}
                                    <div className={styles.statusCard}>
                                        <div className={styles.statusTop}>
                                            <div>
                                                <span className={styles.trackingLabel}>Tracking ID</span>
                                                <code className={styles.trackingCode}>{order.trackingId}</code>
                                            </div>
                                            <div
                                                className={styles.statusBadge}
                                                style={{ background: cfg.bg, color: cfg.color }}
                                            >
                                                {cfg.icon}
                                                <span>{order.status}</span>
                                            </div>
                                        </div>

                                        {/* Rejected Card */}
                                        {order.status === 'Rejected' && (
                                            <motion.div
                                                className={styles.rejectedCard}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                            >
                                                <div className={styles.rejectedIcon}>
                                                    <FiXCircle size={40} />
                                                </div>
                                                <h2 className={styles.rejectedTitle}>Order Not Accepted</h2>
                                                <p className={styles.rejectedSub}>We apologize, but your order could not be processed at this time.</p>

                                                {order.rejectionReason && (
                                                    <div className={styles.reasonInfo}>
                                                        <strong>Reason from Office:</strong>
                                                        <p>&ldquo;{order.rejectionReason}&rdquo;</p>
                                                    </div>
                                                )}

                                                <div className={styles.rejectedActions}>
                                                    <Link href="/contact" className="btn btn-outline">
                                                        Contact Support
                                                    </Link>
                                                    <Link href="/" className="btn btn-teal">
                                                        Place New Order
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Progress Steps */}
                                        {order.status !== 'Rejected' && (
                                            <div className={styles.progressWrap}>
                                                {steps.map((step, i) => (
                                                    <div key={step} className={styles.progressStep}>
                                                        <div
                                                            className={`${styles.stepCircle} ${i <= cfg.step ? styles.stepDone : ''} ${i === cfg.step ? styles.stepActive : ''}`}
                                                            data-label={step}
                                                        >
                                                            {i < cfg.step ? <FiCheckCircle size={14} /> : i + 1}
                                                        </div>
                                                        <span className={`${styles.stepLabel} ${i <= cfg.step ? styles.stepLabelDone : ''}`}>
                                                            {step}
                                                        </span>
                                                        {i < steps.length - 1 && (
                                                            <div className={`${styles.stepLine} ${i < cfg.step ? styles.stepLineDone : ''}`} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div className={styles.orderDetails}>
                                            <div className={styles.detailItem}>
                                                <FiPackage size={16} className={styles.detailIcon} />
                                                <div>
                                                    <span className={styles.detailLabel}>Parcel Type</span>
                                                    <strong>{order.parcelType}</strong>
                                                </div>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <FiClock size={16} className={styles.detailIcon} />
                                                <div>
                                                    <span className={styles.detailLabel}>Delivery Type</span>
                                                    <strong>{order.deliveryType}</strong>
                                                </div>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <FiMapPin size={16} className={styles.detailIcon} />
                                                <div>
                                                    <span className={styles.detailLabel}>From</span>
                                                    <strong>{order.pickupAddress}</strong>
                                                </div>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <FiMapPin size={16} className={styles.detailIcon} />
                                                <div>
                                                    <span className={styles.detailLabel}>To</span>
                                                    <strong>{order.dropAddress}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {order.estimatedTime && (
                                            <div className={styles.etaBox}>
                                                <FiClock size={16} />
                                                <span>Estimated delivery time: <strong>{order.estimatedTime}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feedback Section (Shown if delivered) */}
                                    {order.status === 'Delivered' && (
                                        <motion.div
                                            className={styles.feedbackCard}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <div className={styles.feedbackIcon}>
                                                <FiStar size={30} />
                                            </div>
                                            <h2 className={styles.feedbackTitle}>How was your experience?</h2>
                                            <p className={styles.feedbackSub}>Your feedback helps us improve our service and helps other customers too!</p>

                                            {reviewSubmitted ? (
                                                <div className={styles.feedbackThanks}>
                                                    🎊 Thank you for your feedback! Your review will be shown on our homepage.
                                                </div>
                                            ) : (
                                                <form className={styles.feedbackForm} onSubmit={handleReviewSubmit}>
                                                    <div className={styles.ratingGroup}>
                                                        <span className="form-label">Rate us:</span>
                                                        <div className={styles.stars}>
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    className={`${styles.star} ${s <= reviewForm.rating ? styles.starActive : ''}`}
                                                                    onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                                                                >
                                                                    <FiStar size={28} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Tell us more:</label>
                                                        <textarea
                                                            className="form-input"
                                                            rows={3}
                                                            placeholder="Write your review here..."
                                                            value={reviewForm.text}
                                                            onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                                                            required
                                                        />
                                                    </div>
                                                    <button type="submit" className={`btn btn-teal ${styles.submitFeedbackBtn}`} disabled={reviewSubmitting || !reviewForm.rating}>
                                                        {reviewSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                                    </button>
                                                </form>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Timeline */}
                                    {order.timeline && (
                                        <div className={styles.timelineCard} style={{ marginTop: 24 }}>
                                            <h3 className={styles.timelineTitle}>Delivery Timeline</h3>
                                            {order.timeline.map(({ step, time, done }, i) => (
                                                <div key={i} className={`${styles.timelineRow} ${done ? styles.timelineDone : ''}`}>
                                                    <div className={`${styles.tlDot} ${done ? styles.tlDotDone : ''}`} />
                                                    <div className={styles.tlContent}>
                                                        <span className={styles.tlStep}>{step}</span>
                                                        <span className={styles.tlTime}>
                                                            {time ? new Date(time).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </>
    );
}
