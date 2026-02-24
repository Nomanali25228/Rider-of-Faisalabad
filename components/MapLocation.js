import styles from './MapLocation.module.css';
import { FiMapPin, FiPhone, FiClock } from 'react-icons/fi';

export default function MapLocation() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.mapCard}>
                {/* Embed */}
                <div className={styles.mapFrame}>
                    <iframe
                        title="Rider of Faisalabad Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108839.02547671427!2d73.06504984453125!3d31.450359099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3922693d37f47647%3A0xab9b91b89c81acfe!2sFaisalabad%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '16px' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                {/* Info */}
                <div className={styles.info}>
                    <h3 className={styles.title}>Our Location</h3>
                    <ul className={styles.list}>
                        <li>
                            <FiMapPin className={styles.icon} />
                            <span>Faisalabad, Punjab, Pakistan</span>
                        </li>
                        <li>
                            <FiPhone className={styles.icon} />
                            <a href="tel:+923000000000">+92 300 0000000</a>
                        </li>
                        <li>
                            <FiClock className={styles.icon} />
                            <span>Mon–Sun: 6:00 AM – 10:00 PM</span>
                        </li>
                    </ul>
                    <p className={styles.coverage}>
                        📍 Serving Faisalabad, all of Punjab, Pakistan-wide and International routes
                    </p>
                </div>
            </div>
        </div>
    );
}
