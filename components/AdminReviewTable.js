import { FiStar, FiMail } from 'react-icons/fi';
import styles from './AdminOrderTable.module.css';

export default function AdminReviewTable({ reviews }) {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < rating ? '#F4C542' : '#ddd', fontSize: 16 }}>★</span>
        ));
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className={styles.emptyState}>
                <FiStar size={48} />
                <p>No reviews yet.<br />Reviews submitted via the Feedback page will appear here.</p>
            </div>
        );
    }

    return (
        <div className={styles.tableWrap} style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Reviewer</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Location</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review.id}>
                            {/* Name */}
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #2F8F83, #3aada0)',
                                        color: 'white', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0
                                    }}>
                                        {review.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#222' }}>{review.name}</span>
                                </div>
                            </td>
                            {/* Email */}
                            <td>
                                {review.email ? (
                                    <a
                                        href={`mailto:${review.email}`}
                                        style={{ color: '#2F8F83', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}
                                    >
                                        <FiMail size={13} /> {review.email}
                                    </a>
                                ) : (
                                    <span style={{ color: '#bbb', fontSize: 13 }}>—</span>
                                )}
                            </td>
                            {/* Rating */}
                            <td>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {renderStars(review.rating)}
                                </div>
                                <small style={{ color: '#888', fontSize: 11 }}>{review.rating}/5</small>
                            </td>
                            {/* Review Text */}
                            <td style={{ maxWidth: 280 }}>
                                <p style={{ fontSize: 13, color: '#555', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                                    &ldquo;{review.text}&rdquo;
                                </p>
                            </td>
                            {/* Location */}
                            <td>
                                <span style={{ fontSize: 13, color: '#666' }}>
                                    📍 {review.location || 'N/A'}
                                </span>
                            </td>
                            {/* Date */}
                            <td>
                                <span style={{ fontSize: 12, color: '#888' }}>
                                    {review.date ? new Date(review.date).toLocaleDateString('en-PK', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    }) : '—'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
