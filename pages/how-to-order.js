import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingCart, FiClock, FiDollarSign, FiShield, FiTruck, FiCheckCircle, FiPhoneCall } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';
import styles from '../styles/HowToOrder.module.css';

const steps = [
    {
        icon: <FiShoppingCart size={28} />,
        title: 'Step 1: Browse Our Shop',
        desc: 'Visit our "Our Shop" section to explore a wide variety of premium cakes, bouquets, and custom sets.'
    },
    {
        icon: <FiPackage size={28} />,
        title: 'Step 2: Place Your Order',
        desc: 'Click on the "Order Now" button. Fill in your delivery details and provide any special instructions.'
    },
    {
        icon: <FiClock size={28} />,
        title: 'Step 3: Wait for Confirmation',
        desc: 'Once placed, our team will review it. You will receive a tracking link to monitor your order status.'
    },
    {
        icon: <FiCheckCircle size={28} />,
        title: 'Step 4: Safe Delivery',
        desc: 'After confirmation, your order will be delivered to your doorstep within Faisalabad with professional care.'
    }
];

const policies = [
    {
        icon: <FiShield size={28} />,
        title: 'Terms & Conditions',
        desc: 'By placing an order, you agree to provide accurate delivery information. All orders are subject to availability.'
    },
    {
        icon: <FiShield size={28} />,
        title: 'Privacy & Data Protection',
        desc: 'Your personal information is secure with us. We strictly use your data only for delivery and order confirmation. We guarantee that your data will never be used for any other purpose or shared with anyone else.'
    },
    {
        icon: <FiDollarSign size={28} />,
        title: 'Refund Policy',
        desc: 'Full refund available if the order making hasn\'t started or it is not yet in progress.'
    }
];

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function HowToOrder() {
    return (
        <>
            <Head>
                <title>How to Order | Rider of Faisalabad</title>
                <meta name="description" content="Learn how to place an order with Rider of Faisalabad. Detailed information on ordering from our shop and custom gift services." />
            </Head>

            <Navbar />

            <div className="page-wrapper">
                {/* Page Hero - Same as About/Gallery */}
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div
                            className={styles.heroContent}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <span className="section-badge"><MdDeliveryDining size={14} /> Ordering Guide</span>
                            <h1 className={styles.heroTitle}>How to <span>Order</span></h1>
                            <p className={styles.heroDesc}>
                                Follow these simple steps to get your favorite items delivered right to your doorstep. Fast, secure, and hassle-free.
                            </p>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                {/* Practical Steps - Value Cards style from About */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <span className="section-badge"><FiPackage size={12} /> Simple Steps</span>
                            <h2 className="section-title">Ordering from <span>Our Shop</span></h2>
                        </motion.div>
                        <div className="grid-4" style={{ marginTop: 48 }}>
                            {steps.map(({ icon, title, desc }, i) => (
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

                {/* Custom Orders - Mission Grid style from About */}
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <div className={styles.missionGrid}>
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                <span className="section-badge"><FiPhoneCall size={12} /> Personal Service</span>
                                <h2 className="section-title">Custom Orders & <span>Special Requests</span></h2>
                                <p style={{ color: 'var(--gray)', lineHeight: 1.8, fontSize: 16, marginTop: 16 }}>
                                    If you want something unique that isn't listed in our shop, or you want to customize a gift basket for your loved ones, we've got you covered!
                                </p>
                                <ul className={styles.customList}>
                                    <li><FiCheckCircle size={16} /> Contact us via WhatsApp or Phone.</li>
                                    <li><FiCheckCircle size={16} /> Share the description or photos of what you need.</li>
                                    <li><FiCheckCircle size={16} /> We provide a quote and handle everything.</li>
                                </ul>
                                <div className={styles.highlightBadge}>
                                    <FiTruck size={20} /> <strong>Note:</strong> No extra delivery or service charges.
                                </div>
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
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* T&C and Privacy - Policy Cards style */}
                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <span className="section-badge"><FiShield size={12} /> Policies</span>
                            <h2 className="section-title">Trust & <span>Transparency</span></h2>
                        </motion.div>
                        <div className="grid-3" style={{ marginTop: 48, maxWidth: '1200px', margin: '48px auto 0' }}>
                            {policies.map(({ icon, title, desc }, i) => (
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
            </div>

            <Footer />
        </>
    );
}
