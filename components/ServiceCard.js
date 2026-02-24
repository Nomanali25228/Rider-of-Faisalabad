import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import styles from './ServiceCard.module.css';

export default function ServiceCard({ icon, title, description, color = '#2F8F83', delay = 0, href = '/services' }) {
    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
        >
            <div className={styles.iconWrap} style={{ '--card-color': color }}>
                <span className={styles.icon}>{icon}</span>
                <div className={styles.iconGlow} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.desc}>{description}</p>
            <Link href={href} className={styles.learnMore}>
                Learn More <FiArrowRight size={14} />
            </Link>
        </motion.div>
    );
}
