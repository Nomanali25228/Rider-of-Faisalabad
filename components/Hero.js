import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiShield, FiClock, FiStar, FiMapPin } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';
import styles from './Hero.module.css';

const floatingStats = [
    { icon: <FiPackage size={18} />, value: '2.5K+', label: 'Deliveries Done', color: '#2F8F83' },
    { icon: <FiStar size={18} />, value: '4.9★', label: 'Customer Rating', color: '#F4C542' },
    { icon: <FiClock size={18} />, value: '2 Hrs', label: 'Avg Delivery', color: '#2F8F83' },
];

const features = [
    { icon: <FiShield size={20} />, text: 'Secure & Trusted' },
    { icon: <FiClock size={20} />, text: 'Same Day Delivery' },
    { icon: <FiMapPin size={20} />, text: 'Live Tracking' },
];

export default function Hero() {
    return (
        <section className={styles.hero} aria-label="Hero section">
            {/* Animated background shapes */}
            <div className={styles.bgShapes}>
                <div className={styles.shape1} />
                <div className={styles.shape2} />
                <div className={styles.shape3} />
                <div className={styles.dots} />
            </div>

            <div className={`${styles.inner} container`}>
                {/* Left Content */}
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className={styles.badge}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <MdDeliveryDining size={16} />
                        <span>Faisalabad&apos;s #1 Rider Service</span>
                    </motion.div>

                    <motion.h1
                        className={styles.headline}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Fast, Secure &amp; Trusted{' '}
                        <span className={styles.highlight}>Rider Service</span>{' '}
                        in Faisalabad &amp; Pakistan
                    </motion.h1>

                    <motion.p
                        className={styles.subtext}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        Professional parcel delivery across Faisalabad, Punjab, all Pakistan and International. Same-day, urgent, gift, and confidential deliveries handled with care.
                    </motion.p>

                    {/* Feature Pills */}
                    <motion.div
                        className={styles.features}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        {features.map(({ icon, text }) => (
                            <span key={text} className={styles.featurePill}>
                                {icon}
                                {text}
                            </span>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className={styles.ctaGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                    >
                        <Link href="/#quick-order" className="btn btn-primary btn-lg" id="hero-book-btn">
                            <FiPackage size={20} />
                            Order Now
                        </Link>
                        <Link href="/track-order" className={`btn btn-lg ${styles.trackBtn}`} id="hero-track-btn">
                            <FiSearch size={20} />
                            Track My Order
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Right Visual */}
                <motion.div
                    className={styles.visual}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Hero Image */}
                    <div className={styles.heroImageWrapper}>
                        <div className={styles.heroImageGlow} />
                        <Image
                            src="/images/hero-gifts-removebg-preview.png"
                            alt="Bouquets, Cakes & Gifts - Rider of Faisalabad Delivery"
                            width={520}
                            height={520}
                            priority
                            className={styles.heroImage}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            draggable={false}
                        />
                        {/* Transparent overlay to block copy/save */}
                        <div className={styles.imageProtect} />
                    </div>

                    {/* Floating Stats */}
                    {floatingStats.map(({ icon, value, label, color }, i) => (
                        <motion.div
                            key={label}
                            className={`${styles.statCard} ${styles[`statCard${i}`]}`}
                            style={{
                                '--delay': `${i * 0.3}s`,
                                '--stat-color': color
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
                        >
                            <span className={styles.statIcon} style={{ color }}>
                                {icon}
                            </span>
                            <div>
                                <strong className={styles.statValue}>{value}</strong>
                                <span className={styles.statLabel}>{label}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className={styles.scrollIndicator}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                <div className={styles.scrollDot} />
            </motion.div>
        </section>
    );
}
