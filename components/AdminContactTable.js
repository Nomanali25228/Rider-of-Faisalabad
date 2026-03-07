import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiMic, FiPhone, FiMail, FiCalendar, FiTrash2, FiX, FiImage } from 'react-icons/fi';
import styles from './AdminOrderTable.module.css'; // Reusing similar table styles

export default function AdminContactTable({ contacts = [], onDelete }) {
    const [selected, setSelected] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const detailRef = useRef(null);

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

    const handleSelectContact = (contact) => {
        if (selected?._id === contact._id) {
            setSelected(null);
        } else {
            setSelected(contact);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.emptyRow}>No contact inquiries yet.</td>
                            </tr>
                        ) : (
                            contacts.map((contact, i) => (
                                <motion.tr
                                    key={contact._id}
                                    className={styles.tableRow}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <td>
                                        <strong>{contact.name}</strong>
                                    </td>
                                    <td>
                                        <div className={styles.customerCell}>
                                            <span><FiPhone size={10} /> {contact.phone || 'N/A'}</span>
                                            <span><FiMail size={10} /> {contact.email || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.parcelType}>{contact.subject || 'General'}</span>
                                    </td>
                                    <td>
                                        <span className={styles.date}>
                                            {new Date(contact.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => handleSelectContact(contact)}
                                                title="View Message"
                                            >
                                                <FiEye size={15} />
                                            </button>
                                            {(contact.voiceNoteUrl || contact.voiceNote) && (
                                                <button
                                                    onClick={() => handleSelectContact(contact)}
                                                    className={`${styles.iconBtn} ${styles.voiceBtn}`}
                                                    title="Listen to Voice Note"
                                                >
                                                    <FiMic size={15} />
                                                </button>
                                            )}
                                            {(contact.attachmentUrl) && (
                                                <button
                                                    onClick={() => handleSelectContact(contact)}
                                                    className={`${styles.iconBtn} ${styles.acceptBtn}`}
                                                    title="View Attachment"
                                                >
                                                    <FiImage size={15} />
                                                </button>
                                            )}
                                            <button
                                                className={`${styles.iconBtn} ${styles.rejectBtn}`}
                                                style={{ marginLeft: '8px' }}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this inquiry?')) {
                                                        onDelete?.(contact._id);
                                                    }
                                                }}
                                                title="Delete Inquiry"
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
                    style={{ scrollMarginTop: '100px' }}
                >
                    <div className={styles.detailHeader}>
                        <h3>Inquiry Details</h3>
                        <button onClick={() => setSelected(null)} className={styles.closeBtn}>×</button>
                    </div>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Subject</span>
                            <strong>{selected.subject || 'General Inquiry'}</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>From</span>
                            <strong>{selected.name}</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Phone</span>
                            <a href={`tel:${selected.phone}`}>{selected.phone || 'N/A'}</a>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email</span>
                            <a href={`mailto:${selected.email}`}>{selected.email || 'N/A'}</a>
                        </div>
                        <div className={`${styles.detailItem} ${styles.detailFull}`}>
                            <span className={styles.detailLabel}>Message Content</span>
                            <p style={{ whiteSpace: 'pre-wrap', color: '#444', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #eef2f6', marginTop: '8px' }}>
                                {selected.message}
                            </p>
                        </div>
                        {(selected.voiceNoteUrl || selected.voiceNote) && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}><FiMic size={12} /> Customer Voice Recording</span>
                                <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                                    <audio controls src={selected.voiceNoteUrl || `/uploads/${selected.voiceNote}`} style={{ width: '100%', height: '36px' }}>
                                        Your browser does not support audio.
                                    </audio>
                                </div>
                            </div>
                        )}
                        {selected.attachmentUrl && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}><FiImage size={12} /> Attachment / Screenshot</span>
                                <div className={styles.screenshotPreview}>
                                    <p className={styles.screenshotHint}>Verification Screenshot (Click to enlarge):</p>
                                    <div
                                        className={styles.screenshotLink}
                                        onClick={() => setPreviewImage(selected.attachmentUrl)}
                                    >
                                        <img src={selected.attachmentUrl} alt="Inquiry Attachment" className={styles.paymentImage} />
                                        <div className={styles.imgOverlay}><FiEye /> Click to View Full Size</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
            {/* Image Preview Lightbox */}
            <AnimatePresence key="lightbox">
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

// Ensure AnimatePresence is imported
import { AnimatePresence } from 'framer-motion';
