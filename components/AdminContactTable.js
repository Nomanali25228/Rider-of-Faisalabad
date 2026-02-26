import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiMic, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';
import styles from './AdminOrderTable.module.css'; // Reusing similar table styles

export default function AdminContactTable({ contacts = [] }) {
    const [selected, setSelected] = useState(null);
    const detailRef = useRef(null);

    // Auto-scroll to details when opened
    useEffect(() => {
        if (selected && detailRef.current) {
            setTimeout(() => {
                detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
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
                                            {contact.voiceNote && (
                                                <button
                                                    onClick={() => handleSelectContact(contact)}
                                                    className={`${styles.iconBtn} ${styles.voiceBtn}`}
                                                    title="Listen to Voice Note"
                                                >
                                                    <FiMic size={15} />
                                                </button>
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
                        {selected.voiceNote && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <span className={styles.detailLabel}><FiMic size={12} /> Customer Voice Recording</span>
                                <div style={{ marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                                    <audio controls src={`/uploads/${selected.voiceNote}`} style={{ width: '100%', height: '36px' }}>
                                        Your browser does not support audio.
                                    </audio>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
