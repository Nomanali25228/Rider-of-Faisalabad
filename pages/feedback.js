import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiMessageSquare, FiArrowRight, FiSend } from 'react-icons/fi';
import Link from 'next/link';
import styles from './feedback.module.css';

function StarRating({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${star <= (hover || value) ? styles.starActive : ''}`}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                    <FiStar size={30} />
                </button>
            ))}
        </div>
    );
}

export default function FeedbackPage() {
    const [form, setForm] = useState({ name: '', email: '', rating: 0, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.rating || !form.text) return;

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
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Feedback — Rider of Faisalabad | Your Opinion Matters</title>
                <meta name="description" content="Share your experience with Rider of Faisalabad. Rate our delivery service and help us improve. We value every feedback from our customers." />
                <link rel="canonical" href="https://rider-of-faisalabad.vercel.app/feedback" />
            </Head>

            <div className="page-wrapper">
                {/* Hero */}
                <section className={styles.hero}>
                    <div className="container">
                        <motion.div
                            className={styles.heroText}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-badge"><FiStar size={12} /> Feedback</span>
                            <h1 className="section-title" style={{ color: 'white' }}>
                                Your <span style={{ color: '#F4C542' }}>Opinion</span> Matters
                            </h1>
                            <p className={styles.heroSub}>
                                Did we deliver on time? Was our rider professional? Help us improve by sharing your thoughts — your review will appear on our homepage!
                            </p>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                {/* Main Content */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <div className={styles.contentGrid}>

                            {/* Form */}
                            <motion.div
                                className={styles.formCard}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {submitted ? (
                                    <div className={styles.thankYou}>
                                        <div className={styles.thankIcon}>⭐</div>
                                        <h2>Thank You!</h2>
                                        <p>Your review has been submitted successfully. It will appear on our homepage shortly.</p>
                                        <button
                                            className="btn btn-teal"
                                            onClick={() => setSubmitted(false)}
                                        >
                                            Submit Another Review
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className={styles.formTitle}>Share Your Experience</h2>
                                        <p className={styles.formSub}>Rate your delivery experience with Rider of Faisalabad</p>

                                        <form onSubmit={handleSubmit} className={styles.form}>
                                            {/* Rating */}
                                            <div className={styles.ratingGroup}>
                                                <label className="form-label">Your Rating *</label>
                                                <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
                                                {form.rating > 0 && (
                                                    <span className={styles.ratingLabel}>
                                                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][form.rating]}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Name & Email */}
                                            <div className={styles.halfGrid}>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="reviewer-name">Your Name *</label>
                                                    <input
                                                        id="reviewer-name"
                                                        className="form-input"
                                                        type="text"
                                                        placeholder="e.g. Ahmed Raza"
                                                        value={form.name}
                                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="reviewer-email">Email (Optional)</label>
                                                    <input
                                                        id="reviewer-email"
                                                        className="form-input"
                                                        type="email"
                                                        placeholder="your@email.com"
                                                        value={form.email}
                                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                    />
                                                </div>
                                            </div>

                                            {/* Review Text */}
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="review-text">Your Review *</label>
                                                <textarea
                                                    id="review-text"
                                                    className="form-input"
                                                    rows={5}
                                                    placeholder="Tell us about your delivery experience..."
                                                    value={form.text}
                                                    onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                                disabled={submitting || !form.rating}
                                                id="submit-review-btn"
                                            >
                                                {submitting ? 'Submitting...' : <><FiSend size={16} /> Submit Review</>}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </motion.div>

                            {/* Side Info */}
                            <motion.div
                                className={styles.sideInfo}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className={styles.infoCard}>
                                    <FiMessageSquare size={32} className={styles.infoIcon} />
                                    <h3>Why give feedback?</h3>
                                    <p>Your review is directly shared on our homepage and with our management team to ensure the highest delivery standards in Faisalabad.</p>
                                    <ul className={styles.benefitList}>
                                        <li>Review shows live on homepage</li>
                                        <li>Improve rider performance</li>
                                        <li>Faster delivery routes</li>
                                        <li>Better customer support</li>
                                    </ul>
                                </div>

                                <div className={styles.ctaCard}>
                                    <h3>Need Support?</h3>
                                    <p>If you have a problem with an active order, contact us directly for faster resolution.</p>
                                    <Link href="/contact" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                                        Contact Support <FiArrowRight />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
