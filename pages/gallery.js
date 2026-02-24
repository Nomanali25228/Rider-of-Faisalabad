import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiCamera } from 'react-icons/fi';
import styles from './gallery.module.css';

// Gallery items using emoji+color until real images added
const galleryItems = [
    { id: 1, label: 'Fast Delivery', emoji: '⚡', color: '#2F8F83', category: 'Delivery' },
    { id: 2, label: 'Gift Packaging', emoji: '🎁', color: '#e879a0', category: 'Gift' },
    { id: 3, label: 'Punjab Routes', emoji: '🗺️', color: '#0ea5e9', category: 'Routes' },
    { id: 4, label: 'Rider Waqas', emoji: '🏍️', color: '#F4C542', category: 'Team' },
    { id: 5, label: 'Happy Customer', emoji: '😊', color: '#059669', category: 'Reviews' },
    { id: 6, label: 'Same Day', emoji: '🚀', color: '#7c3aed', category: 'Delivery' },
    { id: 7, label: 'Secure Parcel', emoji: '🔒', color: '#2F8F83', category: 'Delivery' },
    { id: 8, label: 'Event Delivery', emoji: '🎉', color: '#d97706', category: 'Gift' },
    { id: 9, label: 'International', emoji: '🌍', color: '#0ea5e9', category: 'Routes' },
    { id: 10, label: 'Rider Saad', image: '/uploads/raider%20saad%20.jpeg', emoji: '🏆', color: '#2F8F83', category: 'Team' },
    { id: 11, label: 'Medical Parcel', emoji: '💊', color: '#dc2626', category: 'Delivery' },
    { id: 12, label: 'Team Effort', emoji: '🤝', color: '#F4C542', category: 'Team' },
];

const categories = ['All', 'Delivery', 'Gift', 'Routes', 'Team', 'Reviews'];

import { useState } from 'react';

export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selected, setSelected] = useState(null);

    const filtered = activeCategory === 'All'
        ? galleryItems
        : galleryItems.filter(g => g.category === activeCategory);

    return (
        <>
            <Head>
                <title>Gallery — Rider of Faisalabad | Delivery Photos & Team</title>
                <meta name="description" content="View the Rider of Faisalabad gallery — delivery photos, team riders, gift handling, and happy customers from Faisalabad to all Pakistan." />
                <link rel="canonical" href="https://riderofaisalabad.com/gallery" />
            </Head>

            <div className="page-wrapper">
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <span className="section-badge"><FiCamera size={12} /> Gallery</span>
                            <h1 className="section-title" style={{ color: 'white' }}>Our Work in <span style={{ color: '#F4C542' }}>Pictures</span></h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Photos from our deliveries, team, and happy customers.</p>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        {/* Category Filter */}
                        <div className={styles.filterRow}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <motion.div className={styles.grid} layout>
                            {filtered.map(({ id, label, emoji, color, image }, i) => (
                                <motion.div
                                    key={id}
                                    className={styles.card}
                                    style={{ '--g-color': color }}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                    onClick={() => setSelected({ id, label, emoji, color })}
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <div className={styles.cardInner}>
                                        {image ? (
                                            <img src={image} alt={label} className={styles.cardImage} />
                                        ) : (
                                            <span className={styles.cardEmoji}>{emoji}</span>
                                        )}
                                        <span className={styles.cardLabel}>{label}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Lightbox */}
                {selected && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            className={styles.lightboxCard}
                            style={{ '--g-color': selected.color }}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {selected.image ? (
                                <img src={selected.image} alt={selected.label} className={styles.lightboxImage} />
                            ) : (
                                <span className={styles.lightboxEmoji}>{selected.emoji}</span>
                            )}
                            <h3>{selected.label}</h3>
                            <p style={{ color: '#888', marginTop: 8 }}>Rider of Faisalabad</p>
                            <button className={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    );
}
