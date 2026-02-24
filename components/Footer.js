import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiInstagram, FiPhone, FiMail, FiMapPin, FiArrowRight } from 'react-icons/fi';
import styles from './Footer.module.css';

const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
    { href: '/track-order', label: 'Track Order' },
];

const services = [
    { label: 'Same Day Delivery' },
    { label: 'Gift Delivery' },
    { label: 'Urgent Delivery' },
    { label: 'Punjab Rider Service' },
    { label: 'Pakistan Courier' },
    { label: 'International Delivery' },
];

export default function Footer({ isAdmin }) {
    return (
        <footer className={styles.footer}>
            {/* CTA Strip */}
            {!isAdmin && (
                <div className={styles.ctaStrip}>
                    <div className="container">
                        <div className={styles.ctaInner}>
                            <div>
                                <h3 className={styles.ctaTitle}>Ready to Send a Parcel?</h3>
                                <p className={styles.ctaSub}>Fast, secure & trusted delivery — anywhere in Pakistan</p>
                            </div>
                            <div className={styles.ctaButtons}>
                                <Link href="/contact" className="btn btn-primary btn-lg" id="footer-book-btn">
                                    Book Delivery
                                </Link>
                                <Link href="/track-order" className="btn btn-secondary btn-lg" id="footer-track-btn">
                                    Track Order
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Footer */}
            <div className={styles.main}>
                <div className="container">
                    <div className={styles.grid}>
                        {/* Brand Column */}
                        <div className={styles.brandCol}>
                            <Link href="/" className={styles.logo}>
                                <div className={styles.logoImage}>
                                    <Image
                                        src="/uploads/logo.png"
                                        alt="Logo"
                                        width={54}
                                        height={54}
                                    />
                                </div>
                                <span className={styles.logoText}>
                                    Rider <span>of Faisalabad</span>
                                </span>
                            </Link>
                            <p className={styles.brandDesc}>
                                Professional private rider & parcel delivery service covering Faisalabad, all Punjab, Pakistan and International routes.
                            </p>
                            <div className={styles.socialLinks}>
                                <a
                                    href="https://www.instagram.com/rider_of_faisalabad"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialBtn}
                                    aria-label="Follow us on Instagram"
                                    id="footer-instagram-link"
                                >
                                    <FiInstagram size={18} />
                                </a>
                                <a href="tel:+923000000000" className={styles.socialBtn} aria-label="Call us">
                                    <FiPhone size={18} />
                                </a>
                                <a href="mailto:info@riderofaisalabad.com" className={styles.socialBtn} aria-label="Email us">
                                    <FiMail size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className={styles.colTitle}>Quick Links</h4>
                            <ul className={styles.linkList}>
                                {quickLinks.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link href={href} className={styles.footerLink}>
                                            <FiArrowRight size={12} />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className={styles.colTitle}>Our Services</h4>
                            <ul className={styles.linkList}>
                                {services.map(({ label }) => (
                                    <li key={label}>
                                        <Link href="/services" className={styles.footerLink}>
                                            <FiArrowRight size={12} />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className={styles.colTitle}>Contact Us</h4>
                            <ul className={styles.contactList}>
                                <li>
                                    <FiMapPin size={16} className={styles.contactIcon} />
                                    <span>Faisalabad, Punjab, Pakistan</span>
                                </li>
                                <li>
                                    <FiPhone size={16} className={styles.contactIcon} />
                                    <a href="tel:+923000000000">+92 300 0000000</a>
                                </li>
                                <li>
                                    <FiMail size={16} className={styles.contactIcon} />
                                    <a href="mailto:info@riderofaisalabad.com">info@riderofaisalabad.com</a>
                                </li>
                                <li>
                                    <FiInstagram size={16} className={styles.contactIcon} />
                                    <a href="https://www.instagram.com/rider_of_faisalabad" target="_blank" rel="noopener noreferrer">@rider_of_faisalabad</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottom}>
                <div className="container">
                    <div className={styles.bottomInner}>
                        <p className={styles.copyright}>
                            &copy; {new Date().getFullYear()} Rider of Faisalabad. All rights reserved.
                        </p>
                        <p className={styles.devBy}>
                            Developed with ❤️ by <strong>Waqas Ahmad</strong>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
