import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
    const phoneNumber = '923027201810';
    const message = encodeURIComponent("Hello Rider of Faisalabad! I want to book a delivery.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.floatBtn}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Chat on WhatsApp"
        >
            <div className={styles.tooltip}>Chat with us</div>
            <FaWhatsapp size={32} />
        </motion.a>
    );
}
