import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiMic, FiMapPin, FiClock, FiXCircle } from 'react-icons/fi';
import styles from './AdminOrderTable.module.css';

const STATUS_OPTIONS = ['Pending', 'Accepted', 'In Progress', 'Delivered'];

const statusClass = {
    Pending: 'badge-pending',
    Accepted: 'badge-accepted',
    'In Progress': 'badge-in-progress',
    Delivered: 'badge-delivered',
    Rejected: 'badge-rejected',
};

const REJECTION_SUGGESTIONS = [
    "Rider unavailable at this moment.",
    "Outside our delivery coverage area.",
    "Parcel contains prohibited items.",
    "Incorrect Pick-up / Drop-off location.",
    "Service is temporarily unavailable."
];

export default function AdminOrderTable({ orders = [], onStatusChange }) {
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(null);
    const detailRef = useRef(null);

    // Auto-scroll to details when opened
    useEffect(() => {
        if (selected && detailRef.current) {
            setTimeout(() => {
                detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [selected]);

    const handleSelectOrder = (order) => {
        if (selected?.trackingId === order.trackingId) {
            setSelected(null);
        } else {
            setSelected(order);
        }
    };

    // Rejection Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectOrderId, setRejectOrderId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleStatusChange = async (orderId, newStatus, reason = null) => {
        if (newStatus === 'Rejected' && !reason) {
            setRejectOrderId(orderId);
            setRejectReason('');
            setShowRejectModal(true);
            return;
        }

        setUpdating(orderId);
        try {
            const res = await fetch('/api/orders/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus, rejectionReason: reason }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                onStatusChange?.(orderId, newStatus, reason);
                setShowRejectModal(false);
            } else {
                toast.error('Failed to update status.');
            }
        } catch {
            toast.error('Network error.');
        } finally {
            setUpdating(null);
        }
    };

    const confirmRejection = () => {
        if (!rejectReason.trim()) {
            toast.error('Please enter or select a reason.');
            return;
        }
        handleStatusChange(rejectOrderId, 'Rejected', rejectReason);
    };

    return (
        <div className={styles.wrapper}>
            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tracking ID</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Delivery</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyRow}>No orders found.</td>
                            </tr>
                        ) : (
                            orders.map((order, i) => (
                                <motion.tr
                                    key={order._id || order.trackingId}
                                    className={styles.tableRow}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <td>
                                        <code className={styles.trackCode}>{order.trackingId}</code>
                                    </td>
                                    <td>
                                        <div className={styles.customerCell}>
                                            <strong>{order.fullName}</strong>
                                            <span>{order.phone}</span>
                                        </div>
                                    </td>
                                    <td><span className={styles.parcelType}>{order.parcelType}</span></td>
                                    <td>
                                        <span className={`${styles.deliveryBadge} ${order.deliveryType === 'Urgent' ? styles.urgent : order.deliveryType === 'Same Day' ? styles.sameDay : ''}`}>
                                            {order.deliveryType}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className={`badge ${statusClass[order.status]} ${styles.statusSelect}`}
                                            value={order.status}
                                            onChange={e => handleStatusChange(order._id || order.trackingId, e.target.value)}
                                            disabled={updating === (order._id || order.trackingId) || order.status === 'Rejected' || order.status === 'Delivered'}
                                        >
                                            {order.status === 'Rejected' && <option value="Rejected">Rejected</option>}
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <span className={styles.date}>
                                            {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => handleSelectOrder(order)}
                                                title="View Details"
                                                aria-label="View order details"
                                            >
                                                <FiEye size={15} />
                                            </button>

                                            {order.status !== 'Rejected' && (
                                                <>
                                                    {order.voiceNoteUrl && (
                                                        <button
                                                            onClick={() => handleSelectOrder(order)}
                                                            className={`${styles.iconBtn} ${styles.voiceBtn}`}
                                                            title="Listen to Voice Note"
                                                        >
                                                            <FiMic size={15} />
                                                        </button>
                                                    )}
                                                    {order.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                className={`${styles.iconBtn} ${styles.acceptBtn}`}
                                                                onClick={() => handleStatusChange(order._id || order.trackingId, 'Accepted')}
                                                                title="Accept Order"
                                                            >
                                                                <FiCheck size={15} />
                                                            </button>
                                                            <button
                                                                className={`${styles.iconBtn} ${styles.rejectBtn}`}
                                                                onClick={() => handleStatusChange(order._id || order.trackingId, 'Rejected')}
                                                                title="Reject Order"
                                                            >
                                                                <FiX size={15} />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {order.status === 'Rejected' && (
                                                <span className={styles.cancelledLabel}>Order Cancelled</span>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Panel */}
            {selected && (
                <motion.div
                    ref={detailRef}
                    className={styles.detailPanel}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ scrollMarginTop: '100px' }}
                >
                    <div className={styles.detailHeader}>
                        <h3>Order Details — {selected.trackingId}</h3>
                        <button onClick={() => setSelected(null)} className={styles.closeBtn}>
                            <FiX size={18} />
                        </button>
                    </div>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Customer</span>
                            <strong>{selected.fullName}</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Phone</span>
                            <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email</span>
                            <span>{selected.email || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Parcel</span>
                            <span>{selected.parcelType}</span>
                        </div>
                        <div className={`${styles.detailItem} ${styles.detailFull}`}>
                            <span className={styles.detailLabel}><FiMapPin size={12} /> Pickup</span>
                            <span>{selected.pickupAddress}</span>
                        </div>
                        <div className={`${styles.detailItem} ${styles.detailFull}`}>
                            <span className={styles.detailLabel}><FiMapPin size={12} /> Drop</span>
                            <span>{selected.dropAddress}</span>
                        </div>
                        {selected.message && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}>Text Instructions</span>
                                <span>{selected.message}</span>
                            </div>
                        )}
                        {selected.voiceNoteUrl && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}><FiMic size={12} /> Voice Recording</span>
                                <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                                    <audio controls src={selected.voiceNoteUrl} style={{ width: '100%', height: '36px' }}>
                                        Your browser does not support audio.
                                    </audio>
                                </div>
                            </div>
                        )}
                        {selected.status === 'Rejected' && selected.rejectionReason && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`} style={{ background: '#fff5f5', padding: '12px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                <span className={styles.detailLabel} style={{ color: '#c53030' }}>Rejection Reason</span>
                                <span style={{ color: '#c53030' }}>{selected.rejectionReason}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Custom Rejection Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.modalContent}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <FiXCircle size={24} />
                                <h3>Reject Order</h3>
                            </div>
                            <div className={styles.modalBody}>
                                <p className={styles.instruction}>Please provide a reason why you are unable to accept this order.</p>

                                <input
                                    className={styles.rejectionInput}
                                    type="text"
                                    placeholder="Enter rejection reason here..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                />

                                <div className={styles.suggestionsBox}>
                                    <h5 className={styles.suggestionsTitle}>Quick Suggestions:</h5>
                                    <div className={styles.suggestions}>
                                        {REJECTION_SUGGESTIONS.map((msg, i) => (
                                            <button
                                                key={i}
                                                className={styles.suggestionBtn}
                                                onClick={() => setRejectReason(msg)}
                                                type="button"
                                            >
                                                {msg}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={styles.cancelBtn} onClick={() => setShowRejectModal(false)}>Cancel</button>
                                <button
                                    className={styles.confirmBtn}
                                    onClick={confirmRejection}
                                    disabled={updating === rejectOrderId}
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
