import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiGlobe, FiShield, FiMapPin, FiStar, FiCheck } from 'react-icons/fi';
import { BsGift } from 'react-icons/bs';
import { MdOutlineElectricBike } from 'react-icons/md';
import ServiceCard from '../components/ServiceCard';
import styles from './services.module.css';

const services = [
    {
        icon: <FiClock size={28} />,
        title: 'Same Day Delivery',
        description: 'Within Faisalabad, get your parcel delivered on the same day. We guarantee speed without compromising on care.',
        color: '#2F8F83',
        features: ['Available 6 AM – 10 PM', 'Within city limits', 'Real-time tracking', 'Confirmation call'],
    },
    {
        icon: <BsGift size={28} />,
        title: 'Gift Delivery',
        description: 'Valentine\'s Day, birthdays, anniversaries, Eid — we carry your love with personal care and beautiful handling.',
        color: '#e879a0',
        features: ['Gift wrapping optional', 'Special delivery slots', 'Surprise delivery', 'Photo confirmation'],
    },
    {
        icon: <MdOutlineElectricBike size={28} />,
        title: 'Urgent Delivery',
        description: 'Need it there NOW? Our urgent service guarantees delivery within 1-3 hours for critical parcels.',
        color: '#F4C542',
        features: ['Priority handling', '1-3 hour delivery', 'Dedicated rider'],
    },
    {
        icon: <FiShield size={28} />,
        title: 'Confidential Delivery',
        description: 'Legal documents, medical reports, private correspondence — handled with total discretion and security.',
        color: '#7c3aed',
        features: ['Sealed handling', 'Identity verification', 'Chain of custody', 'No record sharing'],
    },
    {
        icon: <FiMapPin size={28} />,
        title: 'Punjab Rider Service',
        description: 'Inter-city delivery across all major Punjab cities: Lahore, Rawalpindi, Multan, Sialkot, Gujranwala and more.',
        color: '#2F8F83',
        features: ['40+ cities covered', 'Next day delivery', 'Bulk discounts', 'Route updates'],
    },
    {
        icon: <FiPackage size={28} />,
        title: 'Pakistan Courier Service',
        description: 'Nationwide delivery to all corners of Pakistan. From KPK to Sindh, every province covered.',
        color: '#0ea5e9',
        features: ['All 4 provinces', '2-3 day delivery', 'Tracking ID'],
    },
    {
        icon: <FiGlobe size={28} />,
        title: 'International Delivery',
        description: 'Send and receive parcels between Pakistan and abroad. UAE, UK, USA, Saudi Arabia and more.',
        color: '#059669',
        features: ['40+ countries', 'Customs handling', 'Door-to-door'],
    },
    {
        icon: <FiStar size={28} />,
        title: 'Event & Corporate Delivery',
        description: 'Bulk deliveries for events, weddings, corporate packages, and promotional material.',
        color: '#d97706',
        features: ['Bulk pricing', 'Scheduled delivery', 'Dedicated team', 'Event support'],
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function ServicesPage() {
    return (
        <>
            <Head>
                <title>Services — Rider of Faisalabad | Same Day, Gift, Urgent & International Delivery</title>
                <meta name="description" content="Rider of Faisalabad offers same-day delivery, gift delivery, urgent parcels, Punjab inter-city courier, Pakistan nationwide delivery, and international shipping. Book now!" />
                <meta name="keywords" content="Same Day Delivery Faisalabad, Gift Delivery Faisalabad, Urgent Delivery Punjab, Pakistan Courier Service, International Delivery Pakistan, Rider Service Punjab" />
                <link rel="canonical" href="https://riderofaisalabad.com/services" />
            </Head>

            <div className="page-wrapper">
                {/* Page Hero */}
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div
                            className={styles.heroContent}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="section-badge"><FiPackage size={12} /> Our Services</span>
                            <h1 className="section-title" style={{ color: 'white' }}>
                                Complete Delivery <span style={{ color: '#F4C542' }}>Solutions</span>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, maxWidth: 540, lineHeight: 1.7 }}>
                                From urgent same-day delivery to international shipping — we have the right service for every need.
                            </p>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                {/* Services Grid */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <div className={styles.servicesGrid}>
                            {services.map(({ icon, title, description, color }, i) => (
                                <ServiceCard key={title} icon={icon} title={title} description={description} color={color} delay={i * 0.06} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Detailed Service List */}
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <span className="section-badge">What&apos;s Included</span>
                            <h2 className="section-title">Every Service <span>In Detail</span></h2>
                        </motion.div>
                        <div className={styles.detailedList}>
                            {services.map(({ icon, title, description, color, features }, i) => (
                                <motion.div
                                    key={title}
                                    className={styles.detailedCard}
                                    style={{ '--srv-color': color }}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i % 3}
                                    viewport={{ once: true }}
                                >
                                    <div className={styles.detailTop}>
                                        <div className={styles.detailIcon} style={{ background: `${color}18`, color }}>
                                            {icon}
                                        </div>
                                        <div>
                                            <h3>{title}</h3>
                                            <p>{description}</p>
                                        </div>
                                    </div>
                                    <div className={styles.featureList}>
                                        {features.map(f => (
                                            <span key={f} className={styles.feature}>
                                                <FiCheck size={12} style={{ color }} />
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
