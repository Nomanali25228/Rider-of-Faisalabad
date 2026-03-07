import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiCamera, FiShoppingCart, FiX, FiCheck, FiPackage } from 'react-icons/fi';
import { useRouter } from 'next/router';
import styles from './gallery.module.css';

import { galleryItems } from '../lib/products';

const categories = ['All', 'Cake', 'Bouquet', 'Acrylic Box', 'Custom Basket'];

import { useState } from 'react';

export default function GalleryPage() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState('All');
    const [selected, setSelected] = useState(null);

    const handleOrderNow = (item) => {
        const existing = localStorage.getItem('selectedProducts');
        let products = [];
        try {
            products = existing ? JSON.parse(existing) : [];
            if (!Array.isArray(products)) products = [];
        } catch (e) { products = []; }

        // Add the new item
        products.push(item);
        localStorage.setItem('selectedProducts', JSON.stringify(products));

        // Also clear the old single product key just in case
        localStorage.removeItem('selectedProduct');

        router.push('/#quick-order');
    };

    const filtered = activeCategory === 'All'
        ? galleryItems
        : galleryItems.filter(g => g.category === activeCategory);

    return (
        <>
            <Head>
                <title>Our Shop — Rider of Faisalabad | Order Cakes, Bouquets & Gifts</title>
                <meta name="description" content="Browse our shop for the best cakes, flower bouquets, and custom gift baskets in Faisalabad. Fast delivery across Pakistan." />
                <link rel="canonical" href="https://riderofaisalabad.com/gallery" />
            </Head>

            <div className="page-wrapper">
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className={styles.heroContent}
                        >
                            <span className="section-badge"><FiCamera size={12} /> Our Shop</span>
                            <h1 className={styles.heroTitle}>Browse Our <span>Products</span></h1>
                            <p className={styles.heroDesc}>Choose from our premium selection of cakes, bouquets, and custom gifts. Fast delivery in Faisalabad.</p>
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
                            {filtered.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    className={styles.card}
                                    style={{ '--g-color': item.color }}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                    onClick={() => setSelected(item)}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className={styles.cardInner}>
                                        <div className={styles.imageWrapper}>
                                            <img src={item.image} alt={item.label} className={styles.cardImage} />
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <span className={styles.cardLabel}>{item.label}</span>
                                            <div className={styles.cardPriceRow}>
                                                <span className={styles.cardPrice}>RS. {item.price}</span>
                                                <button
                                                    className={styles.orderBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOrderNow(item);
                                                    }}
                                                >
                                                    Order Now
                                                </button>
                                            </div>
                                        </div>
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
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            className={styles.lightboxCard}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className={styles.topCloseBtn} onClick={() => setSelected(null)}>
                                <FiX size={24} />
                            </button>

                            <div className={styles.lightboxContent}>
                                <div className={styles.lightboxLeft}>
                                    <img src={selected.image} alt={selected.label} className={styles.lightboxImage} />
                                </div>
                                <div className={styles.lightboxRight}>
                                    <div className={styles.lightboxHeader}>
                                        <span className={styles.categoryBadge}>{selected.category}</span>
                                        <h3>{selected.label}</h3>
                                        <div className={styles.lightboxPrice}>RS. {selected.price}</div>
                                    </div>

                                    <div className={styles.productFeatures}>
                                        <div className={styles.feature}>
                                            <FiCheck className={styles.featureIcon} />
                                            <span>Same day delivery available</span>
                                        </div>
                                        <div className={styles.feature}>
                                            <FiCheck className={styles.featureIcon} />
                                            <span>Premium Quality Assurance</span>
                                        </div>
                                    </div>

                                    <p className={styles.lightboxDesc}>
                                        {selected.description}
                                    </p>

                                    <div className={styles.lightboxActions}>
                                        <button
                                            className={`${styles.mainOrderBtn}`}
                                            onClick={() => handleOrderNow(selected)}
                                        >
                                            <FiPackage size={18} /> Order This Now
                                        </button>
                                        <button className={styles.secondaryBtn} onClick={() => setSelected(null)}>
                                            Continue Shopping
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    );
}
