import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiEye, FiMic, FiMapPin, FiClock, FiXCircle, FiTrash2, FiImage, FiCheckCircle } from 'react-icons/fi';
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

export default function AdminOrderTable({ orders = [], onStatusChange, onDelete }) {
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [viewedOrders, setViewedOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('viewedOrders');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const detailRef = useRef(null);

    // Sort orders: newest first, unviewed first within same time
    const sortedOrders = [...orders].sort((a, b) => {
        const aViewed = viewedOrders.includes(a._id || a.trackingId);
        const bViewed = viewedOrders.includes(b._id || b.trackingId);
        if (!aViewed && bViewed) return -1;
        if (aViewed && !bViewed) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const isNew = (order) => !viewedOrders.includes(order._id || order.trackingId);

    const markAsViewed = (order) => {
        const id = order._id || order.trackingId;
        setViewedOrders(prev => {
            if (prev.includes(id)) return prev;
            const updated = [...prev, id];
            try { localStorage.setItem('viewedOrders', JSON.stringify(updated)); } catch { }
            return updated;
        });
    };

    // Auto-scroll to details when opened
    useEffect(() => {
        if (selected && detailRef.current) {
            setTimeout(() => {
                const yOffset = -80;
                const y = detailRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 150);
        }
    }, [selected]);

    const handleSelectOrder = (order) => {
        markAsViewed(order);
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

    // Accept Modal State
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [acceptOrderId, setAcceptOrderId] = useState(null);
    const [totalPrice, setTotalPrice] = useState('');

    const handleStatusChange = async (orderId, newStatus, extraData = null) => {
        const order = orders.find(o => (o._id === orderId || o.trackingId === orderId));
        const hasScreenshot = order?.paymentScreenshot || order?.attachmentUrl;

        if (newStatus === 'Accepted' && !hasScreenshot && (!extraData || !extraData.totalPrice)) {
            setAcceptOrderId(orderId);
            setTotalPrice('');
            setShowAcceptModal(true);
            return;
        }

        // If it has a screenshot, we can auto-accept with existing totalPrice (if any)
        const finalExtraData = (newStatus === 'Accepted' && hasScreenshot && !extraData?.totalPrice)
            ? { ...extraData, totalPrice: order.totalPrice || 'Paid' }
            : extraData;

        if (newStatus === 'Rejected' && (!extraData || !extraData.rejectionReason)) {
            setRejectOrderId(orderId);
            setRejectReason('');
            setShowRejectModal(true);
            return;
        }

        setUpdating(orderId);
        try {
            const success = await onStatusChange?.(orderId, newStatus, finalExtraData);
            if (success) {
                setShowRejectModal(false);
                setShowAcceptModal(false);
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setUpdating(null);
        }
    };

    const confirmRejection = () => {
        if (!rejectReason.trim()) {
            toast.error('Please enter or select a reason.');
            return;
        }
        handleStatusChange(rejectOrderId, 'Rejected', { rejectionReason: rejectReason });
    };

    const confirmAcceptance = () => {
        if (!totalPrice.trim()) {
            toast.error('Please enter a total price.');
            return;
        }
        handleStatusChange(acceptOrderId, 'Accepted', { totalPrice: totalPrice });
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
                        {sortedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyRow}>No orders found.</td>
                            </tr>
                        ) : (
                            sortedOrders.map((order, i) => (
                                <motion.tr
                                    key={order._id || order.trackingId}
                                    className={`${styles.tableRow} ${isNew(order) ? styles.tableRowNew : ''} ${selected?.trackingId === order.trackingId ? styles.tableRowSelected : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => handleSelectOrder(order)}
                                    style={{ cursor: 'pointer' }}
                                    title="Click to view order details"
                                >
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <code className={styles.trackCode}>{order.trackingId}</code>
                                            {isNew(order) && (
                                                <span className={styles.newOrderBadge}>
                                                    🔔 NEW ORDER
                                                </span>
                                            )}
                                            {(order.paymentScreenshot || order.attachmentUrl) && (
                                                <span style={{ fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', width: 'fit-content', border: '1px solid #34d399' }}>
                                                    <FiCheckCircle size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                                    Payment Received
                                                </span>
                                            )}
                                        </div>
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
                                    <td onClick={e => e.stopPropagation()}>
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
                                            {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className={styles.actionBtns}>
                                            <button
                                                className={`${styles.iconBtn} ${selected?.trackingId === order.trackingId ? styles.iconBtnActive : ''}`}
                                                onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
                                                title="View Details"
                                                aria-label="View order details"
                                            >
                                                <FiEye size={15} />
                                            </button>

                                            {order.status !== 'Rejected' && (
                                                <>
                                                    {order.voiceNoteUrl && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
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
                                                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order._id || order.trackingId, 'Accepted'); }}
                                                                title="Accept Order"
                                                            >
                                                                <FiCheck size={15} />
                                                            </button>
                                                            <button
                                                                className={`${styles.iconBtn} ${styles.rejectBtn}`}
                                                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order._id || order.trackingId, 'Rejected'); }}
                                                                title="Reject Order"
                                                            >
                                                                <FiX size={15} />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {order.status === 'Rejected' && (
                                                <span className={styles.cancelledLabel}>Cancelled</span>
                                            )}

                                            <button
                                                className={`${styles.iconBtn} ${styles.rejectBtn}`}
                                                style={{ marginLeft: '4px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Are you sure you want to delete this order?')) {
                                                        onDelete?.(order._id || order.trackingId);
                                                    }
                                                }}
                                                title="Delete Order"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
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
                        {selected.deliveryDate && (
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Target Date</span>
                                <strong style={{ color: '#2F8F83' }}>{selected.deliveryDate}</strong>
                            </div>
                        )}
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
                        {selected.productDetails && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}>Shop Items</span>
                                <div className={styles.premiumItemsList}>
                                    {(() => {
                                        try {
                                            const items = JSON.parse(selected.productDetails);
                                            const itemsArray = Array.isArray(items) ? items : [items];
                                            return itemsArray.map((item, idx) => (
                                                <div key={idx} className={styles.premiumItem}>
                                                    <img src={item.image} alt={item.label} className={styles.premiumItemThumb} />
                                                    <div className={styles.premiumItemInfo}>
                                                        <strong>{item.label}</strong>
                                                        <span>RS. {item.price}</span>
                                                    </div>
                                                </div>
                                            ));
                                        } catch (e) { return <span>Error loading items</span>; }
                                    })()}
                                </div>
                            </div>
                        )}
                        {(selected.paymentScreenshot || selected.attachmentUrl) && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}>
                                    <FiImage size={12} /> {selected.attachmentUrl ? 'Initial Attachment / Screenshot' : 'Payment Confirmation'}
                                </span>
                                <div className={styles.screenshotPreview}>
                                    <p className={styles.screenshotHint}>Verification Screenshot (Click to enlarge):</p>
                                    <div
                                        className={styles.screenshotLink}
                                        onClick={() => setPreviewImage(selected.paymentScreenshot || selected.attachmentUrl)}
                                    >
                                        <img src={selected.paymentScreenshot || selected.attachmentUrl} alt="Payment" className={styles.paymentImage} />
                                        <div className={styles.imgOverlay}><FiEye /> Click to View Full Size</div>
                                    </div>
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

            {/* Custom Accept Modal */}
            <AnimatePresence>
                {showAcceptModal && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.modalContent}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <FiCheck size={24} color="#2F8F83" />
                                <h3>Accept Order</h3>
                            </div>
                            <div className={styles.modalBody}>
                                {(() => {
                                    const order = orders.find(o => o._id === acceptOrderId || o.trackingId === acceptOrderId);
                                    if (!order) return null;
                                    let items = [];
                                    try { items = order.productDetails ? JSON.parse(order.productDetails) : []; if (!Array.isArray(items)) items = [items]; } catch (e) { }

                                    return (
                                        <div style={{ marginBottom: '20px' }}>
                                            <p className={styles.instruction} style={{ marginBottom: '12px' }}>Review items for <strong>{order.trackingId}</strong>:</p>

                                            {items.length > 0 && (
                                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px', maxHeight: '150px', overflowY: 'auto' }}>
                                                    {items.map((item, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: idx === items.length - 1 ? 0 : '8px' }}>
                                                            <img src={item.image} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} alt="" />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>{item.label}</div>
                                                                <div style={{ fontSize: '12px', color: '#64748b' }}>RS. {item.price}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <p className={styles.instruction}>Please enter the Total Price (including delivery) to send a payment request.</p>
                                            {order.totalPrice && (
                                                <div style={{ fontSize: '12px', color: '#2F8F83', marginBottom: '8px', fontWeight: 'bold' }}>
                                                    Shop Items Subtotal: RS. {order.totalPrice.toLocaleString()}
                                                </div>
                                            )}

                                            {order.message && (
                                                <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', border: '1px solid #fcd34d', marginBottom: '15px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Customer Instructions:</span>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.4' }}>{order.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <input
                                    className={styles.rejectionInput}
                                    type="text"
                                    placeholder="e.g. 5000"
                                    value={totalPrice}
                                    onChange={(e) => setTotalPrice(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={styles.cancelBtn} onClick={() => setShowAcceptModal(false)}>Cancel</button>
                                <button
                                    className={styles.confirmBtn}
                                    style={{ background: '#2F8F83' }}
                                    onClick={confirmAcceptance}
                                    disabled={updating === acceptOrderId}
                                >
                                    Confirm & Request Payment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Preview Lightbox */}
            <AnimatePresence>
                {previewImage && (
                    <div className={styles.lightboxOverlay} onClick={() => setPreviewImage(null)}>
                        <motion.div
                            className={styles.lightboxContent}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.lightboxClose} onClick={() => setPreviewImage(null)}>
                                <FiX size={24} />
                            </button>
                            <img src={previewImage} alt="Preview" className={styles.lightboxImage} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
