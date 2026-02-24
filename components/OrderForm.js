import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUpload, FiMic, FiSend, FiPackage, FiUser, FiPhone, FiMail, FiMapPin, FiFileText, FiMap, FiTrash2, FiSquare } from 'react-icons/fi';
import styles from './OrderForm.module.css';
import dynamic from 'next/dynamic';

// Dynamically import Map component to avoid SSR issues with Leaflet
const LocationPickerModal = dynamic(() => import('./LocationPickerModal'), {
    ssr: false,
    loading: () => null
});

const initialState = {
    fullName: '',
    phone: '',
    email: '',
    pickupAddress: '',
    dropAddress: '',
    parcelType: '',
    deliveryType: 'Normal',
    message: '',
    voiceNote: null,
};

export default function OrderForm({ compact = false }) {
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const [mapMode, setMapMode] = useState(null); // 'pickup' or 'drop'

    // Voice Recorder State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Voice Recorder Logic
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
                const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });

                setAudioUrl(url);
                setForm(prev => ({ ...prev, voiceNote: file }));

                // Stop all tracks to release microphone
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
            toast.error('Could not access microphone. Please check permissions.');
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
        setForm(prev => ({ ...prev, voiceNote: null }));
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.pickupAddress || !form.dropAddress || !form.parcelType) {
            toast.error('Please fill all required fields.');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => {
                if (val !== null) formData.append(key, val);
            });
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setTrackingId(data.trackingId);
                setForm(initialState);
                deleteRecording();
                toast.success('Order placed! Check your email for confirmation.');
            } else {
                toast.error(data.message || 'Something went wrong.');
            }
        } catch {
            toast.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (trackingId) {
        return (
            <motion.div
                className={styles.successCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className={styles.successIcon}>✅</div>
                <h3>Order Placed Successfully!</h3>
                <p>Your tracking ID:</p>
                <div className={styles.trackingId}>{trackingId}</div>
                <p className={styles.successNote}>
                    A confirmation email has been sent. Our team will respond within <strong>6 hours</strong>.
                </p>
                <button className="btn btn-teal" onClick={() => setTrackingId(null)}>
                    Place Another Order
                </button>
            </motion.div>
        );
    }

    return (
        <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={handleSubmit} noValidate>
            <div className={styles.grid}>
                {/* Full Name */}
                <div className={`form-group ${styles.fullWidth}`}>
                    <label className="form-label" htmlFor="fullName">
                        <FiUser size={14} /> Full Name <span className={styles.req}>*</span>
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className="form-input"
                        placeholder="Your full name"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                        <FiPhone size={14} /> Phone <span className={styles.req}>*</span>
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="form-input"
                        placeholder="+92 300 0000000"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Email */}
                <div className="form-group">
                    <label className="form-label" htmlFor="email">
                        <FiMail size={14} /> Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                {/* Pickup Address */}
                <div className="form-group">
                    <label className="form-label" htmlFor="pickupAddress">
                        <FiMapPin size={14} /> Pickup Address <span className={styles.req}>*</span>
                    </label>
                    <div className={styles.inputWithAction}>
                        <input
                            id="pickupAddress"
                            name="pickupAddress"
                            type="text"
                            className="form-input"
                            placeholder="Pickup location"
                            value={form.pickupAddress}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className={styles.mapBtn}
                            onClick={() => setMapMode('pickup')}
                            title="Select on Map"
                        >
                            <FiMap size={18} />
                        </button>
                    </div>
                </div>

                {/* Drop Address */}
                <div className="form-group">
                    <label className="form-label" htmlFor="dropAddress">
                        <FiMapPin size={14} /> Drop Address <span className={styles.req}>*</span>
                    </label>
                    <div className={styles.inputWithAction}>
                        <input
                            id="dropAddress"
                            name="dropAddress"
                            type="text"
                            className="form-input"
                            placeholder="Delivery destination"
                            value={form.dropAddress}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className={styles.mapBtn}
                            onClick={() => setMapMode('drop')}
                            title="Select on Map"
                        >
                            <FiMap size={18} />
                        </button>
                    </div>
                </div>

                {/* Parcel Type */}
                <div className="form-group">
                    <label className="form-label" htmlFor="parcelType">
                        <FiPackage size={14} /> Parcel Type <span className={styles.req}>*</span>
                    </label>
                    <select
                        id="parcelType"
                        name="parcelType"
                        className="form-input"
                        value={form.parcelType}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select type...</option>
                        <option value="Documents">Documents</option>
                        <option value="Clothes">Clothes</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Food">Food</option>
                        <option value="Gift">Gift</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Delivery Type */}
                <div className={`form-group ${styles.fullWidth}`}>
                    <label className="form-label">Delivery Type <span className={styles.req}>*</span></label>
                    <div className={styles.deliveryTypes}>
                        {['Normal', 'Urgent', 'Same Day'].map(type => (
                            <button
                                type="button"
                                key={type}
                                className={`${styles.typeBtn} ${form.deliveryType === type ? styles.typeBtnActive : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, deliveryType: type }))}
                            >
                                {type === 'Urgent' ? '⚡' : type === 'Same Day' ? '🚀' : '📦'} {type}
                            </button>
                        ))}
                    </div>
                    <motion.div
                        key={form.deliveryType}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={styles.typeDescription}
                    >
                        {form.deliveryType === 'Urgent' && '🚀 Delivery within 1 to 2 hours. Priority handling.'}
                        {form.deliveryType === 'Same Day' && '📅 Guaranteed delivery on the same day the order is placed.'}
                        {form.deliveryType === 'Normal' && '📦 Standard delivery within 24 to 48 hours.'}
                    </motion.div>
                </div>

                {/* Message */}
                <div className={`form-group ${styles.fullWidth}`}>
                    <label className="form-label" htmlFor="message">
                        <FiFileText size={14} /> Special Instructions
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        className="form-input"
                        placeholder="Any special instructions for the rider..."
                        rows={3}
                        value={form.message}
                        onChange={handleChange}
                    />
                </div>

                {/* Live Voice Note (WhatsApp Style) */}
                <div className={`form-group ${styles.fullWidth}`}>
                    <label className="form-label">
                        <FiMic size={14} /> Live Voice Note (Optional)
                    </label>
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
                                        <span className={styles.recordingText}>Click mic to record your instructions</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <audio src={audioUrl} controls className={styles.audioPreview} />
                                <button type="button" className={styles.deleteVoice} onClick={deleteRecording} title="Delete recording">
                                    <FiTrash2 size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                disabled={loading || isRecording}
                id="order-submit-btn"
            >
                {loading ? (
                    <span className={styles.spinner} />
                ) : (
                    <>
                        <FiSend size={18} />
                        Place Order
                    </>
                )}
            </button>

            {/* Map Modal */}
            <LocationPickerModal
                isOpen={!!mapMode}
                onClose={() => setMapMode(null)}
                title={mapMode === 'pickup' ? "Select Pickup Location" : "Select Drop Location"}
                onSelect={(addr) => {
                    setForm(prev => ({
                        ...prev,
                        [mapMode === 'pickup' ? 'pickupAddress' : 'dropAddress']: addr
                    }));
                }}
            />
        </form>
    );
}

