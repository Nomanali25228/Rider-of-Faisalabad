import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiSend, FiMic, FiUpload, FiSquare, FiTrash2 } from 'react-icons/fi';
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
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const voiceRef = useRef();

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const file = new File([blob], `voice-note-contact-${Date.now()}.webm`, { type: 'audio/webm' });

                setAudioUrl(url);
                setVoiceFile(file);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            toast.success('Recording started...');
        } catch (err) {
            console.error('Recording error:', err);
            toast.error('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            toast.success('Recording stopped.');
        }
    };

    const deleteRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setVoiceFile(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.message) {
            toast.error('Please fill Name and Message fields.');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => {
                formData.append(key, val);
            });
            if (voiceFile) {
                formData.append('voiceNote', voiceFile);
            }

            const res = await fetch('/api/contact', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                deleteRecording();
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
                                            {/* Live Voice Note */}
                                            <div className="form-group">
                                                <label className="form-label"><FiMic size={14} /> Live Voice Note (Optional)</label>
                                                <div className={`${styles.voiceRecorder} ${isRecording ? styles.recorderActive : ''}`}>
                                                    {!audioUrl ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={`${styles.micBtn} ${isRecording ? styles.micBtnRecording : ''}`}
                                                                onClick={isRecording ? stopRecording : startRecording}
                                                                title={isRecording ? "Stop Recording" : "Start Recording"}
                                                            >
                                                                {isRecording ? <FiSquare size={18} /> : <FiMic size={20} />}
                                                            </button>
                                                            <div className={styles.recordingInfo}>
                                                                {isRecording ? (
                                                                    <>
                                                                        <span className={styles.timer}>{formatTime(recordingTime)}</span>
                                                                        <span className={styles.recordingText}>Recording live...</span>
                                                                    </>
                                                                ) : (
                                                                    <span className={styles.recordingText}>Click mic to record a message</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <audio src={audioUrl} controls style={{ height: 32, flex: 1, maxWidth: 'calc(100% - 40px)' }} />
                                                            <button type="button" className={styles.deleteVoice} onClick={deleteRecording} title="Delete recording">
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
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
