import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUpload, FiMic, FiSend, FiPackage, FiUser, FiPhone, FiMail, FiMapPin, FiFileText, FiMap, FiTrash2, FiSquare, FiCopy, FiCalendar } from 'react-icons/fi';
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
    deliveryDate: '',
    message: '',
    voiceNote: null,
};

export default function OrderForm({ compact = false, onProductsChange, cartRefresh }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [trackingId, setTrackingId] = useState(null);
    const [mapMode, setMapMode] = useState(null);
    const [errors, setErrors] = useState({});
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);
    const successRef = useRef(null);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Number copied!');
    };

    // Load selected products from localStorage
    useEffect(() => {
        const savedArr = localStorage.getItem('selectedProducts');
        const savedSingle = localStorage.getItem('selectedProduct');

        let products = [];

        // Handle migration from single to array
        if (savedSingle) {
            try {
                products.push(JSON.parse(savedSingle));
                localStorage.removeItem('selectedProduct');
                localStorage.setItem('selectedProducts', JSON.stringify(products));
            } catch (e) { }
        } else if (savedArr) {
            try {
                products = JSON.parse(savedArr);
                if (!Array.isArray(products)) products = [products];
            } catch (e) { }
        }

        if (products.length > 0) {
            setSelectedProducts(products);
            // Auto-fill parcel type if it's the first item
            setForm(prev => ({
                ...prev,
                parcelType: prev.parcelType || products[0].category || 'Gift',
                message: prev.message || `I want to order: ${products.map(p => p.label).join(', ')}`
            }));
        }
        if (onProductsChange) onProductsChange(products.length > 0);
    }, [trackingId, cartRefresh]); // Refresh on reset or cart change

    const removeProduct = (index) => {
        const updated = selectedProducts.filter((_, i) => i !== index);
        setSelectedProducts(updated);
        localStorage.setItem('selectedProducts', JSON.stringify(updated));
        if (onProductsChange) onProductsChange(updated.length > 0);
    };

    const clearAllProducts = () => {
        setSelectedProducts([]);
        localStorage.removeItem('selectedProducts');
        if (onProductsChange) onProductsChange(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large. Max 5MB allowed.');
                return;
            }
            setAttachment(file);
        }
    };

    // Auto-scroll to success message
    useEffect(() => {
        if (trackingId && successRef.current) {
            setTimeout(() => {
                const yOffset = -120;
                const y = successRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 150);
        }
    }, [trackingId]);

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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
        // Validate
        const newErrors = {};
        if (!form.fullName.trim()) newErrors.fullName = '👤 Please enter your full name.';
        if (!form.phone.trim()) newErrors.phone = '📞 Please enter your phone number.';
        else if (!/^[0-9+\s()-]{7,15}$/.test(form.phone.trim())) newErrors.phone = '📞 Please enter a valid phone number.';
        if (selectedProducts.length === 0 && !form.pickupAddress.trim()) newErrors.pickupAddress = '📍 Please enter the pickup address.';
        if (!form.dropAddress.trim()) newErrors.dropAddress = '📍 Please enter the drop/delivery address.';
        if (selectedProducts.length === 0 && !form.parcelType) newErrors.parcelType = '📦 Please select a parcel type.';
        if (form.deliveryType === 'Normal' && !form.deliveryDate) {
            newErrors.deliveryDate = '📅 Please select a preferred delivery date.';
        }



        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstErrorKey = Object.keys(newErrors)[0];
            const el = document.getElementById(firstErrorKey);
            if (el) {
                const yOffset = -120;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => {
                if (val !== null) formData.append(key, val);
            });

            // Add product details if selected
            if (selectedProducts.length > 0) {
                formData.append('productDetails', JSON.stringify(selectedProducts));
            }

            // Add attachment file if present
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setTrackingId(data.trackingId);
                setForm(initialState);
                deleteRecording();
                setAttachment(null);
                clearAllProducts();
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
                ref={successRef}
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
            {/* Multi-Product Section */}
            <AnimatePresence>
                {selectedProducts.length > 0 && (
                    <div className={styles.productsContainer} id="order-products-section">
                        <div className={styles.sectionHeader}>
                            <h4 className={styles.sectionLabel}>📦 Items from Our Shop ({selectedProducts.length})</h4>
                            <button type="button" className={styles.actionBtn} onClick={clearAllProducts} title="Clear all">
                                <FiTrash2 size={14} /> Clear All
                            </button>
                        </div>

                        <div className={styles.productsList}>
                            {selectedProducts.map((product, idx) => (
                                <motion.div
                                    key={`${product.id}-${idx}`}
                                    className={styles.selectedItemCard}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <img src={product.image} className={styles.selectedThumb} alt="" />
                                    <div className={styles.selectedInfo}>
                                        <span className={styles.selectedName}>{product.label}</span>
                                        <span className={styles.selectedPriceLabel}>RS. {product.price}</span>
                                    </div>
                                    <div className={styles.selectedActions}>
                                        <button
                                            type="button"
                                            className={styles.actionBtn}
                                            onClick={() => removeProduct(idx)}
                                            title="Remove item"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Link href="/gallery" className={styles.addMorePremiumBtn}>
                            ➕ Add More Products from Shop
                        </Link>
                    </div>
                )}
            </AnimatePresence>

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
                        className={`form-input ${errors.fullName ? styles.inputError : ''}`}
                        placeholder="Your full name"
                        value={form.fullName}
                        onChange={handleChange}
                    />
                    {errors.fullName && <span className={styles.errorMsg}>{errors.fullName}</span>}
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
                        className={`form-input ${errors.phone ? styles.inputError : ''}`}
                        placeholder="+92 300 0000000"
                        value={form.phone}
                        onChange={handleChange}
                    />
                    {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
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
                {selectedProducts.length === 0 && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="pickupAddress">
                            <FiMapPin size={14} /> Pickup Address <span className={styles.req}>*</span>
                        </label>
                        <div className={styles.inputWithAction}>
                            <input
                                id="pickupAddress"
                                name="pickupAddress"
                                type="text"
                                className={`form-input ${errors.pickupAddress ? styles.inputError : ''}`}
                                placeholder="Pickup location"
                                value={form.pickupAddress}
                                onChange={handleChange}
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
                        {errors.pickupAddress && <span className={styles.errorMsg}>{errors.pickupAddress}</span>}
                    </div>
                )}

                {/* Drop Address */}
                <div className={`form-group ${selectedProducts.length > 0 ? styles.fullWidth : ''}`}>
                    <label className="form-label" htmlFor="dropAddress">
                        <FiMapPin size={14} /> Drop Address <span className={styles.req}>*</span>
                    </label>
                    <div className={styles.inputWithAction}>
                        <input
                            id="dropAddress"
                            name="dropAddress"
                            type="text"
                            className={`form-input ${errors.dropAddress ? styles.inputError : ''}`}
                            placeholder="Delivery destination"
                            value={form.dropAddress}
                            onChange={handleChange}
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
                    {errors.dropAddress && <span className={styles.errorMsg}>{errors.dropAddress}</span>}
                </div>

                {/* Parcel Type */}
                {selectedProducts.length === 0 && (
                    <div className="form-group">
                        <label className="form-label" htmlFor="parcelType">
                            <FiPackage size={14} /> Parcel Type <span className={styles.req}>*</span>
                        </label>
                        <select
                            id="parcelType"
                            name="parcelType"
                            className={`form-input ${errors.parcelType ? styles.inputError : ''}`}
                            value={form.parcelType}
                            onChange={handleChange}
                        >
                            <option value="" disabled>Select type...</option>
                            <option value="Documents">Documents</option>
                            <option value="Clothes">Clothes</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Food">Food</option>
                            <option value="Gift">Gift</option>
                            <option value="Cake">Cake</option>
                            <option value="Bouquet">Bouquet</option>
                            <option value="Custom Basket">Custom Basket</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.parcelType && <span className={styles.errorMsg}>{errors.parcelType}</span>}
                    </div>
                )}

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

                    <AnimatePresence>
                        {form.deliveryType === 'Normal' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className={styles.datePickerSection}
                            >
                                <label className="form-label" htmlFor="deliveryDate">
                                    <FiCalendar size={14} /> Preferred Delivery Date <span className={styles.req}>*</span>
                                </label>
                                <input
                                    id="deliveryDate"
                                    name="deliveryDate"
                                    type="date"
                                    className={`form-input ${errors.deliveryDate ? styles.inputError : ''}`}
                                    min={new Date().toLocaleDateString('en-CA')}
                                    value={form.deliveryDate}
                                    onChange={handleChange}
                                />
                                {errors.deliveryDate && <span className={styles.errorMsg}>{errors.deliveryDate}</span>}
                            </motion.div>
                        )}
                    </AnimatePresence>
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

                {/* Attachment Upload */}
                <div className={`form-group ${styles.fullWidth}`} id="attachment">
                    <label className="form-label">
                        <FiUpload size={14} /> Upload Screenshot/Files (Optional)
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                    />
                    {!attachment ? (
                        <div
                            className={styles.uploadZone}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FiUpload size={24} className={styles.uploadIcon} />
                            <span className={styles.uploadText}>
                                {selectedProducts.length > 0 ? 'Upload Payment Screenshot here' : 'Click or drag file to upload'}
                            </span>
                            <span className={styles.uploadSubtext}>
                                {selectedProducts.length > 0 ? 'JazzCash / EasyPaisa / Bank Transfer (Max 5MB)' : 'JPG, PNG, PDF (Max 5MB)'}
                            </span>
                        </div>
                    ) : (
                        <div className={styles.filePreview}>
                            <FiPackage size={18} color="#2F8F83" />
                            <span className={styles.fileName}>{attachment.name}</span>
                            <button type="button" className={styles.deleteVoice} onClick={() => setAttachment(null)}>
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    )}
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

