import Head from 'next/head';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiSend, FiMic, FiUpload } from 'react-icons/fi';
import MapLocation from '../components/MapLocation';
import styles from './contact.module.css';

const contactInfo = [
    { icon: <FiPhone size={22} />, label: 'Phone', value: '+92 300 0000000', href: 'tel:+923000000000' },
    { icon: <FiMail size={22} />, label: 'Email', value: 'info@riderofaisalabad.com', href: 'mailto:info@riderofaisalabad.com' },
    { icon: <FiInstagram size={22} />, label: 'Instagram', value: '@rider_of_faisalabad', href: 'https://www.instagram.com/rider_of_faisalabad' },
    { icon: <FiMapPin size={22} />, label: 'Location', value: 'Faisalabad, Punjab, Pakistan', href: null },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [voiceFile, setVoiceFile] = useState(null);
    const voiceRef = useRef();

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.message) {
            toast.error('Please fill Name and Message fields.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                toast.success('Message sent! We\'ll respond soon.');
            } else {
                toast.error(data.message || 'Failed to send.');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Contact — Rider of Faisalabad | Get In Touch</title>
                <meta name="description" content="Contact Rider of Faisalabad. Call, email, or message us on Instagram. Located in Faisalabad, Punjab, Pakistan. Book a delivery or get a quote." />
                <meta name="keywords" content="Contact Rider Faisalabad, Faisalabad courier contact, Pakistan delivery service contact, book rider Faisalabad" />
                <link rel="canonical" href="https://riderofaisalabad.com/contact" />
            </Head>

            <div className="page-wrapper">
                <section className={styles.pageHero}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <span className="section-badge"><FiPhone size={12} /> Contact Us</span>
                            <h1 className="section-title" style={{ color: 'white' }}>Get In <span style={{ color: '#F4C542' }}>Touch</span></h1>
                            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>We respond within 6 hours. Ready to serve you!</p>
                        </motion.div>
                    </div>
                    <div className={styles.heroShape} />
                </section>

                <section className="section" style={{ background: 'var(--bg)' }}>
                    <div className="container">
                        <div className={styles.grid}>
                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className={styles.sideTitle}>Let&apos;s Connect</h2>
                                <p className={styles.sideSub}>Book a delivery, track an order, ask a question — we&apos;re here for you 7 days a week.</p>

                                <div className={styles.infoList}>
                                    {contactInfo.map(({ icon, label, value, href }) => (
                                        <div key={label} className={styles.infoCard}>
                                            <div className={styles.infoIcon}>{icon}</div>
                                            <div>
                                                <span className={styles.infoLabel}>{label}</span>
                                                {href ? (
                                                    <a href={href} className={styles.infoValue} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                                                        {value}
                                                    </a>
                                                ) : (
                                                    <span className={styles.infoValue}>{value}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href="https://www.instagram.com/rider_of_faisalabad"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.instagramBtn}
                                    id="contact-instagram-btn"
                                >
                                    <FiInstagram size={22} />
                                    Follow on Instagram
                                </a>
                            </motion.div>

                            {/* Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className={styles.formCard}
                            >
                                {submitted ? (
                                    <div className={styles.successMsg}>
                                        <div className={styles.successEmoji}>✅</div>
                                        <h3>Message Sent!</h3>
                                        <p>We&apos;ll respond within <strong>6 hours</strong>. Thank you for contacting Rider of Faisalabad!</p>
                                        <button className="btn btn-teal" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                                            Send Another
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className={styles.formTitle}>Send a Message</h3>
                                        <form onSubmit={handleSubmit} className={styles.form}>
                                            <div className={styles.halfGrid}>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="contact-name">Name <span style={{ color: 'red' }}>*</span></label>
                                                    <input id="contact-name" name="name" type="text" className="form-input" placeholder="Your name" value={form.name} onChange={handleChange} required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="contact-phone">Phone</label>
                                                    <input id="contact-phone" name="phone" type="tel" className="form-input" placeholder="+92 300..." value={form.phone} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="contact-email">Email</label>
                                                <input id="contact-email" name="email" type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="contact-subject">Subject</label>
                                                <input id="contact-subject" name="subject" type="text" className="form-input" placeholder="How can we help?" value={form.subject} onChange={handleChange} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="contact-message">Message <span style={{ color: 'red' }}>*</span></label>
                                                <textarea id="contact-message" name="message" className="form-input" rows={4} placeholder="Write your message here..." value={form.message} onChange={handleChange} required />
                                            </div>
                                            {/* Voice Note */}
                                            <div className="form-group">
                                                <label className="form-label"><FiMic size={14} /> Voice Note (Optional)</label>
                                                <div className={styles.voiceUpload} onClick={() => voiceRef.current?.click()}>
                                                    <FiUpload size={18} />
                                                    <span>{voiceFile ? voiceFile.name : 'Upload voice message'}</span>
                                                    <input ref={voiceRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setVoiceFile(e.target.files[0])} />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading} id="contact-submit-btn">
                                                {loading ? 'Sending...' : <><FiSend size={18} /> Send Message</>}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </motion.div>
                        </div>

                        {/* Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ marginTop: 48 }}
                        >
                            <MapLocation />
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
}
