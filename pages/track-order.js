import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiClock, FiCheckCircle, FiPackage, FiMapPin, FiTruck, FiAlertCircle, FiStar, FiXCircle, FiUpload, FiTrash2, FiFileText, FiCopy, FiSmartphone } from 'react-icons/fi';
import styles from './track-order.module.css';

const statusConfig = {
    Pending: { color: '#d97706', bg: '#fef3c7', icon: <FiClock size={20} />, step: 0 },
    Accepted: { color: '#2563eb', bg: '#dbeafe', icon: <FiCheckCircle size={20} />, step: 1 },
    'In Progress': { color: '#7c3aed', bg: '#f5f3ff', icon: <FiTruck size={20} />, step: 2 },
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

    // State
    const [reviewForm, setReviewForm] = useState({ rating: 0, text: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // Payment State
    const [paymentFile, setPaymentFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    // Auto-polling refs
    const pollingRef = useRef(null);
    const activeTrackingId = useRef('');
    const lastStatus = useRef('');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Number copied!');
    };

    // Silent poll to fetch latest order status without resetting UI
    const silentPoll = async () => {
        const tid = activeTrackingId.current;
        if (!tid) return;
        try {
            const res = await fetch(`/api/orders/track?id=${tid.trim()}`);
            const data = await res.json();
            if (data.success && data.order) {
                // Check if status changed
                if (lastStatus.current && data.order.status !== lastStatus.current) {
                    toast.success(`Order status updated: ${data.order.status}`, { icon: '🔄' });
                }
                lastStatus.current = data.order.status;
                setOrder(data.order);
            }
        } catch {
            // Silently ignore polling errors
        }
    };

    // Start polling when order is loaded
    useEffect(() => {
        if (order && order.trackingId) {
            activeTrackingId.current = order.trackingId;
            lastStatus.current = order.status;

            // Clear any existing interval
            if (pollingRef.current) clearInterval(pollingRef.current);

            // Poll every 8 seconds
            pollingRef.current = setInterval(silentPoll, 8000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [order?.trackingId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

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
        activeTrackingId.current = '';
        if (pollingRef.current) clearInterval(pollingRef.current);
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

    const handlePaymentUpload = async (e) => {
        e.preventDefault();
        if (!paymentFile || !order) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('paymentScreenshot', paymentFile);
            formData.append('orderId', order.id);
            formData.append('trackingId', order.trackingId);

            const res = await fetch('/api/orders/upload-screenshot', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploaded(true);
                setOrder(prev => ({ ...prev, paymentScreenshot: data.url }));
                toast.success('Screenshot uploaded! Awaiting Admin approval for In Progress status.');
            } else {
                alert(data.message || 'Upload failed.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setUploading(false);
        }
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
                    location: (() => {
                        if (!order.dropAddress) return 'Faisalabad';
                        const parts = order.dropAddress.split(',').map(p => p.trim()).filter(Boolean);
                        // If standard address format (House, Area, City, Country)
                        if (parts.length >= 3) {
                            // 2nd to last is usually city if last is country
                            if (parts[parts.length - 1].toLowerCase() === 'pakistan') {
                                return parts[parts.length - 2];
                            }
                            return parts[parts.length - 1];
                        }
                        return parts[0];
                    })()
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
                            <h1 className={styles.heroTitle}>
                                Track Your <span>Parcel</span>
                            </h1>
                            <p className={styles.heroDesc}>
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
                                            {order.productDetails && (
                                                <div className={`${styles.detailItem} ${styles.detailFullWidth}`}>
                                                    <FiFileText size={16} className={styles.detailIcon} />
                                                    <div style={{ width: '100%' }}>
                                                        <span className={styles.detailLabel}>Included Shop Items</span>
                                                        <div className={styles.premiumItemsRow}>
                                                            {(() => {
                                                                try {
                                                                    const items = JSON.parse(order.productDetails);
                                                                    const itemsArray = Array.isArray(items) ? items : [items];
                                                                    return itemsArray.map((item, idx) => (
                                                                        <div key={idx} className={styles.premiumMiniItem}>
                                                                            <img src={item.image} alt={item.label} />
                                                                            <div className={styles.miniInfo}>
                                                                                <span>{item.label}</span>
                                                                                <strong>RS. {item.price}</strong>
                                                                            </div>
                                                                        </div>
                                                                    ));
                                                                } catch (e) { return <span>Order details attached.</span>; }
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Section for Accepted Order */}
                                        {order.status === 'Accepted' && (
                                            <div className={styles.paymentSection} style={{ marginTop: '20px', padding: '20px', background: '#fdfaf0', border: '1px solid #F4C542', borderRadius: '12px' }}>
                                                <h3 style={{ marginTop: 0, color: '#222', fontSize: '18px' }}>Action Required: Payment</h3>

                                                <div style={{ margin: '15px 0', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px dashed #2F8F83', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '14px', color: '#555' }}>Total Delivery & Items Price:</span>
                                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#2F8F83' }}>RS. {order.totalPrice || order.totalPrice === 0 ? order.totalPrice.toLocaleString() : 'To be confirmed'}</div>
                                                </div>

                                                <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                                                    To move your order to <strong>"In Progress"</strong>, please make the payment using one of the given accounts and upload the screenshot.
                                                </p>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                                    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <strong style={{ display: 'block', marginBottom: '8px', color: '#222' }}>JazzCash</strong>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: '#2F8F83', fontWeight: '700' }}>0302-7201810</span>
                                                            <button type="button" onClick={() => copyToClipboard('03027201810')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FiCopy size={14} /></button>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Title: WAQAS AHMAD</div>
                                                    </div>

                                                    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <strong style={{ display: 'block', marginBottom: '8px', color: '#222' }}>EasyPaisa</strong>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: '#2F8F83', fontWeight: '700' }}>0302-7201810</span>
                                                            <button type="button" onClick={() => copyToClipboard('03027201810')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FiCopy size={14} /></button>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Title: WAQAS AHMAD</div>
                                                    </div>

                                                    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <strong style={{ display: 'block', marginBottom: '8px', color: '#222' }}>HBL Bank</strong>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ color: '#2F8F83', fontWeight: '700' }}>14667905719303</span>
                                                            <button type="button" onClick={() => copyToClipboard('14667905719303')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FiCopy size={14} /></button>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Title: WAQAS AHMAD</div>
                                                    </div>
                                                </div>

                                                {(!order.paymentScreenshot && !uploaded) ? (
                                                    <form onSubmit={handlePaymentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <label className="form-label" style={{ fontWeight: '600' }}><FiUpload size={14} /> Upload Payment Screenshot:</label>
                                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={e => setPaymentFile(e.target.files[0])}
                                                                style={{ padding: '8px', border: '1px dashed #ccc', borderRadius: '8px', flex: 1, minWidth: '200px', background: 'white' }}
                                                            />
                                                            <button type="submit" className="btn btn-teal" disabled={uploading || !paymentFile} style={{ padding: '10px 20px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                                                {uploading ? 'Uploading...' : 'Submit Screenshot'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <FiCheckCircle size={18} />
                                                        <strong>Screenshot Uploaded! Waiting for Admin verification to proceed.</strong>
                                                    </div>
                                                )}
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
