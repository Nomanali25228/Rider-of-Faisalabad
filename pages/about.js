import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiTarget, FiHeart, FiTruck, FiStar, FiUsers, FiGlobe } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';
import styles from './about.module.css';

const milestones = [
    { year: '2019', title: 'Founded', desc: 'Rider of Faisalabad started with a single rider and a big dream.' },
    { year: '2020', title: 'City Coverage', desc: 'Expanded to cover all major areas of Faisalabad city.' },
    { year: '2021', title: 'Punjab Routes', desc: 'Launched inter-city delivery across all major Punjab cities.' },
    { year: '2022', title: '1000+ Orders', desc: 'Crossed 1,000 successful deliveries milestone.' },
    { year: '2023', title: 'National Platform', desc: 'Extended services to all Pakistan with international partnerships.' },
    { year: '2024', title: '5000+ Deliveries', desc: 'Serving 500+ satisfied customers with 4.9★ rating.' },
];

const values = [
    { icon: <FiHeart size={28} />, title: 'Customer First', desc: 'Every decision we make centers around customer satisfaction and trust.' },
    { icon: <FiTarget size={28} />, title: 'Precision', desc: 'We deliver with accuracy — right address, right time, every time.' },
    { icon: <FiTruck size={28} />, title: 'Speed', desc: 'Urgency is our specialty. Express delivery at your door within hours.' },
    { icon: <FiStar size={28} />, title: 'Excellence', desc: 'We don\'t settle for average. Every delivery is handled with premium care.' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function AboutPage() {
    return (
        <>
            <Head>
                <title>About Us — Rider of Faisalabad | Professional Parcel Delivery Service</title>
                <meta name="description" content="Learn about Rider of Faisalabad — Faisalabad's most trusted rider service founded by Waqas Ahmad. 5+ years of experience, 5000+ deliveries, serving Faisalabad, Punjab and all Pakistan." />
                <meta name="keywords" content="About Rider of Faisalabad, Waqas Ahmad Rider, Faisalabad delivery company, trusted courier service Punjab" />
                <link rel="canonical" href="https://riderofaisalabad.com/about" />
            </Head>

            <div className="page-wrapper">
                {/* Page Hero */}
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div
                            className={styles.heroContent}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <span className="section-badge"><MdDeliveryDining size={14} /> Our Story</span>
                            <h1 className="section-title" style={{ color: 'white' }}>About <span style={{ color: '#F4C542' }}>Rider of Faisalabad</span></h1>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, maxWidth: 560, lineHeight: 1.7 }}>
                                Born in the heart of Faisalabad, we have grown from a single rider to a trusted delivery network serving all of Pakistan and beyond.
                            </p>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                {/* Mission & Vision */}
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <div className={styles.missionGrid}>
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                <span className="section-badge"><FiTarget size={12} /> Our Mission</span>
                                <h2 className="section-title">Delivering More Than <span>Parcels</span></h2>
                                <p style={{ color: 'var(--gray)', lineHeight: 1.8, fontSize: 16, marginTop: 16 }}>
                                    We believe every package carries a story — a gift for a loved one, an important document, a medical need. Our mission is to deliver that story with speed, safety, and a smile.
                                </p>
                                <p style={{ color: 'var(--gray)', lineHeight: 1.8, fontSize: 16, marginTop: 12 }}>
                                    Founded by <strong style={{ color: 'var(--primary)' }}>Waqas Ahmad</strong>, Rider of Faisalabad started as a local service and grew into one of Punjab's most trusted delivery brands through sheer dedication and customer-first approach.
                                </p>
                            </motion.div>
                            <motion.div
                                className={styles.missionVisual}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                custom={1}
                                viewport={{ once: true }}
                            >
                                <div className={styles.bigIcon}>
                                    <MdDeliveryDining size={80} color="white" />
                                </div>
                                <div className={styles.missionStats}>
                                    {[
                                        { v: '5+', l: 'Years' },
                                        { v: '5K+', l: 'Deliveries' },
                                        { v: '500+', l: 'Customers' },
                                        { v: '4.9', l: 'Rating' },
                                    ].map(({ v, l }) => (
                                        <div key={l} className={styles.mStat}>
                                            <strong>{v}</strong>
                                            <span>{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <span className="section-badge"><FiHeart size={12} /> Our Values</span>
                            <h2 className="section-title">Built on <span>These Principles</span></h2>
                        </motion.div>
                        <div className="grid-4" style={{ marginTop: 48 }}>
                            {values.map(({ icon, title, desc }, i) => (
                                <motion.div
                                    key={title}
                                    className={styles.valueCard}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -6 }}
                                >
                                    <div className={styles.valueIcon}>{icon}</div>
                                    <h3>{title}</h3>
                                    <p>{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <span className="section-badge">Our Journey</span>
                            <h2 className="section-title">5 Years of <span>Growth</span></h2>
                        </motion.div>
                        <div className={styles.timeline}>
                            {milestones.map(({ year, title, desc }, i) => (
                                <motion.div
                                    key={year}
                                    className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    custom={i * 0.5}
                                    viewport={{ once: true }}
                                >
                                    <div className={styles.timelineCard}>
                                        <span className={styles.timelineYear}>{year}</span>
                                        <h3 className={styles.timelineTitle}>{title}</h3>
                                        <p className={styles.timelineDesc}>{desc}</p>
                                    </div>
                                    <div className={styles.timelineDot} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Coverage */}
                <section className={`section ${styles.coverageSection}`}>
                    <div className="container">
                        <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <span className="section-badge"><FiGlobe size={12} /> Coverage</span>
                            <h2 className="section-title" style={{ color: 'white' }}>We Deliver <span style={{ color: '#F4C542' }}>Everywhere</span></h2>
                        </motion.div>
                        <div className={styles.coverageGrid}>
                            {['Faisalabad City', 'All of Punjab', 'All Pakistan', 'International'].map((area, i) => (
                                <motion.div key={area} className={styles.areaCard} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }}>
                                    <FiGlobe size={28} />
                                    <span>{area}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
