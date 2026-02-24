import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiPackage, FiStar, FiShield, FiClock, FiGlobe, FiMapPin, FiCheck } from 'react-icons/fi';
import { MdDeliveryDining, MdOutlineElectricBike } from 'react-icons/md';
import { BsGift } from 'react-icons/bs';
import Hero from '../components/Hero';
import ServiceCard from '../components/ServiceCard';
import ReviewSection from '../components/ReviewSection';
import OrderForm from '../components/OrderForm';
import styles from './index.module.css';

const services = [
    { icon: <FiClock size={28} />, title: 'Same Day Delivery', description: 'Get your parcel delivered within Faisalabad on the same day. Guaranteed speed & safety.', color: '#2F8F83' },
    { icon: <BsGift size={28} />, title: 'Gift Delivery', description: 'Valentine\'s, birthdays, anniversaries — we deliver joy with personal care.', color: '#e879a0' },
    { icon: <FiShield size={28} />, title: 'Confidential Delivery', description: 'Sensitive documents and private parcels handled with full discretion.', color: '#7c3aed' },
    { icon: <MdOutlineElectricBike size={28} />, title: 'Urgent Delivery', description: 'Lightning-fast delivery for time-critical parcels. Available 6 AM – 10 PM.', color: '#F4C542' },
    { icon: <FiMapPin size={28} />, title: 'Punjab Rider Service', description: 'City-to-city delivery across all major Punjab cities at affordable rates.', color: '#2F8F83' },
    { icon: <FiGlobe size={28} />, title: 'International Delivery', description: 'Send and receive parcels between Pakistan and abroad, securely handled.', color: '#0ea5e9' },
];

const whyUs = [
    { icon: '⚡', title: 'Super Fast', desc: 'Same-day & urgent delivery options within hours.' },
    { icon: '🔒', title: '100% Secure', desc: 'Every parcel handled with professional care & security.' },
    { icon: '💰', title: 'Best Rates', desc: 'Competitive pricing with no hidden charges.' },
    { icon: '🤝', title: 'Reliable Riders', desc: 'Experienced, trusted, and verified riders.' },
    { icon: '🌍', title: 'Wide Coverage', desc: 'Faisalabad, Punjab, Pakistan & International.' },
];

const riders = [
    {
        name: 'Waqas Ahmad',
        role: 'Senior Rider & Founder',
        experience: '5+ Years Experience',
        deliveries: '2,500+ Deliveries',
        rating: '4.9/5 Rating',
        areas: 'All Pakistan Routes',
        image: '/uploads/raider waqas.jpg',
        emoji: '🏍️',
        badge: 'Founder',
        color: '#2F8F83',
    },
    {
        name: 'Saad Ijaz',
        role: 'Pro Rider',
        experience: '3+ Years Experience',
        deliveries: '1,800+ Deliveries',
        rating: '4.8/5 Rating',
        areas: 'Faisalabad City',
        image: '/uploads/raider saad.jpeg',
        emoji: '🏆',
        badge: 'Pro',
        color: '#F4C542',
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Handle cross-page scrolling to #quick-order
        if (router.asPath.includes('#quick-order')) {
            const timer = setTimeout(() => {
                const element = document.getElementById('quick-order');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 600); // Small delay to ensure page is rendered
            return () => clearTimeout(timer);
        }
    }, [router.asPath]);

    return (
        <>
            <Head>
                <title>Rider of Faisalabad — Fast, Secure & Trusted Delivery Service in Faisalabad, Punjab & Pakistan</title>
                <meta name="description" content="Rider of Faisalabad offers professional same-day parcel delivery, gift delivery, urgent courier and international shipping across Faisalabad, Punjab and all Pakistan. Book your rider now!" />
                <meta name="keywords" content="Faisalabad Rider, Rider in Faisalabad, Punjab Rider, Pakistan Rider Service, Courier Faisalabad, Gift Delivery Pakistan, Same Day Delivery Faisalabad, Urgent Delivery, Parcel Service Faisalabad" />
                <meta property="og:title" content="Rider of Faisalabad — Fast, Secure & Trusted Delivery Service" />
                <meta property="og:description" content="Professional rider service across Faisalabad, Punjab and Pakistan. Same-day, urgent, gift & international delivery." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://riderofaisalabad.com" />
                <meta property="og:image" content="https://riderofaisalabad.com/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href="https://riderofaisalabad.com" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "DeliveryEvent",
                        "name": "Rider of Faisalabad Delivery Service",
                        "description": "Same day, urgent, gift and Pakistan-wide parcel delivery",
                        "location": { "@type": "Place", "name": "Faisalabad, Punjab, Pakistan" }
                    })
                }} />
            </Head>

            <main>
                {/* Hero */}
                <Hero />

                {/* Why Choose Us */}
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <motion.div
                            className="text-center"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <span className="section-badge"><FiStar size={12} /> Why Choose Us</span>
                            <h2 className="section-title">Faisalabad&apos;s Most <span>Trusted Rider</span></h2>
                            <p className="section-subtitle">We&apos;ve built our reputation on reliability, speed and care for every parcel.</p>
                        </motion.div>

                        <div className={styles.whyGrid}>
                            {whyUs.map(({ icon, title, desc }, i) => (
                                <motion.div
                                    key={title}
                                    className={styles.whyCard}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i}
                                    viewport={{ once: true }}
                                >
                                    <div className={styles.whyIcon}>{icon}</div>
                                    <h3 className={styles.whyTitle}>{title}</h3>
                                    <p className={styles.whyDesc}>{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services Preview */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <motion.div
                            className="text-center"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <span className="section-badge"><FiPackage size={12} /> Our Services</span>
                            <h2 className="section-title">Everything You Need <span>Delivered</span></h2>
                            <p className="section-subtitle">From regular parcels to urgent gifts — we cover every delivery need.</p>
                        </motion.div>
                        <div className={styles.servicesGrid}>
                            {services.map(({ icon, title, description, color }, i) => (
                                <ServiceCard key={title} icon={icon} title={title} description={description} color={color} delay={i * 0.08} />
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 40 }}>
                            <Link href="/services" className="btn btn-teal btn-lg" id="home-all-services-btn">
                                View All Services
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats Banner */}
                <section className={styles.statsBanner}>
                    <div className="container">
                        <div className={styles.statsGrid}>
                            {[
                                { value: '2500+', label: 'Successful Deliveries' },
                                { value: '1500+', label: 'Happy Customers' },
                                { value: '4.9★', label: 'Average Rating' },
                                { value: '2 Hrs', label: 'Average Delivery Time' },
                            ].map(({ value, label }, i) => (
                                <motion.div
                                    key={label}
                                    className={styles.statItem}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i}
                                    viewport={{ once: true }}
                                >
                                    <strong className={styles.statValue}>{value}</strong>
                                    <span className={styles.statLabel}>{label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Senior Riders */}
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <motion.div
                            className="text-center"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <span className="section-badge">Our Team</span>
                            <h2 className="section-title">Meet Our <span>Senior Riders</span></h2>
                            <p className="section-subtitle">Experienced, professional and trusted riders behind every delivery.</p>
                        </motion.div>
                        <div className={styles.ridersGrid}>
                            {riders.map(({ name, role, experience, deliveries, rating, areas, emoji, color, image, badge }, i) => (
                                <motion.div
                                    key={name}
                                    className={styles.riderCard}
                                    style={{ '--rider-color': color }}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -6 }}
                                >
                                    <div className={styles.riderAvatar}>
                                        <div className={styles.riderImageWrapper}>
                                            {image ? (
                                                <img src={image} alt={name} className={styles.riderImage} />
                                            ) : (
                                                <span>{emoji}</span>
                                            )}
                                        </div>
                                        <div className={styles.riderBadge}>
                                            <FiStar size={12} fill="white" />
                                            {badge}
                                        </div>
                                    </div>
                                    <h3 className={styles.riderName}>{name}</h3>
                                    <p className={styles.riderRole}>{role}</p>
                                    <div className={styles.riderStats}>
                                        {[experience, deliveries, rating, areas].map(stat => (
                                            <span key={stat} className={styles.riderStat}>
                                                <FiCheck size={12} />
                                                {stat}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Order Form */}
                <section id="quick-order" className={`section ${styles.orderSection}`}>
                    <div className="container">
                        <div className={styles.orderGrid}>
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                <span className="section-badge"><MdDeliveryDining size={14} /> Quick Order</span>
                                <h2 className="section-title">Book a Delivery <span>Right Now</span></h2>
                                <p className="section-subtitle" style={{ margin: 0 }}>Fill the form and our team will contact you within 6 hours.</p>
                                <ul className={styles.orderFeatures}>
                                    {['Instant tracking ID', 'Email confirmation', 'Secure & insured', 'Available 7 days/week'].map(f => (
                                        <li key={f}><FiCheck color="#2F8F83" size={16} /> {f}</li>
                                    ))}
                                </ul>

                                <div className={styles.orderNotice}>
                                    <div className={styles.noticeIcon}><FiClock size={20} /></div>
                                    <div className={styles.noticeContent}>
                                        <p className={styles.urduText}>بکنگ کے 30 منٹ کے اندر آپ کو کل چارجز بتا دیے جائیں گے۔</p>
                                        <p className={styles.englishText}>Total delivery cost will be shared with you within <strong>30 minutes</strong> of order submission.</p>
                                    </div>
                                </div>
                                <p className={styles.urduSlogan}>فوری سروس، بھروسہ مند سفر - صرف رائیڈر آف فیصل آباد کے ساتھ!</p>
                            </motion.div>
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                custom={1}
                                viewport={{ once: true }}
                                className={styles.formCard}
                            >
                                <h3 className={styles.formCardTitle}>📦 New Order</h3>
                                <OrderForm compact />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Reviews */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <motion.div
                            className="text-center"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <span className="section-badge"><FiStar size={12} /> Reviews</span>
                            <h2 className="section-title">What Customers <span>Say About Us</span></h2>
                            <p className="section-subtitle">Real feedback from our valued customers across Pakistan.</p>
                        </motion.div>
                        <ReviewSection />
                    </div>
                </section>
            </main >
        </>
    );
}
