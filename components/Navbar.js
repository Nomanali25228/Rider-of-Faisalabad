import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiPackage, FiUser, FiPhone } from 'react-icons/fi';
import styles from './Navbar.module.css';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [router.pathname]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const isLoginPage = router.pathname === '/login';
    const isDashboard = router.pathname === '/dashboard';

    return (
        <>
            <nav className={`${styles.navbar} ${scrolled || isLoginPage || isDashboard ? styles.scrolled : ''}`}>
                <div className={`${styles.inner} container`}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo} aria-label="Rider of Faisalabad Home">
                        <div className={styles.logoImage}>
                            <Image
                                src="/uploads/logo.png"
                                alt="Logo"
                                width={60}
                                height={60}
                                priority
                                className={styles.mainLogo}
                            />
                        </div>
                        <span className={styles.logoText}>
                            Rider <span>of Faisalabad</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <ul className={styles.navLinks}>
                        {navLinks.map(({ href, label }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`${styles.navLink} ${router.pathname === href ? styles.active : ''}`}
                                >
                                    {label}
                                    {router.pathname === href && (
                                        <motion.span
                                            layoutId="nav-underline"
                                            className={styles.activeBar}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop Actions */}
                    <div className={styles.actions}>
                        <Link href="/#quick-order" className="btn btn-teal btn-sm" id="nav-book-btn">
                            <FiPackage size={14} />
                            Order Now
                        </Link>
                        <Link href="/login" className={styles.loginBtn} id="nav-login-btn" aria-label="Admin Login">
                            <FiUser size={18} />
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className={styles.mobileToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle navigation menu"
                        id="mobile-menu-toggle"
                    >
                        {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                        />
                        <motion.aside
                            className={styles.drawer}
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className={styles.drawerHeader}>
                                <div className={styles.logoImage}>
                                    <Image
                                        src="/uploads/logo.png"
                                        alt="Logo"
                                        width={52}
                                        height={52}
                                        className={styles.mainLogo}
                                    />
                                </div>
                                <span className={styles.logoText} style={{ color: '#fff' }}>
                                    Rider <span>of Faisalabad</span>
                                </span>
                                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                                    <FiX size={22} color="#fff" />
                                </button>
                            </div>
                            <ul className={styles.drawerLinks}>
                                {navLinks.map(({ href, label }, i) => (
                                    <motion.li
                                        key={href}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <Link
                                            href={href}
                                            className={`${styles.drawerLink} ${router.pathname === href ? styles.drawerLinkActive : ''}`}
                                        >
                                            {label}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                            <div className={styles.drawerActions}>
                                <Link href="/#quick-order" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
                                    <FiPackage size={18} />
                                    Order Now
                                </Link>
                                <Link href="/login" className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                                    <FiUser size={18} />
                                    Admin Login
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
