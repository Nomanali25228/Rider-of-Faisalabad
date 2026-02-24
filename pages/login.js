import Head from 'next/head';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './login.module.css';

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.username || !form.password) {
            toast.error('Please enter username and password.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                toast.success('Login successful! Redirecting...');
                setTimeout(() => router.push('/dashboard'), 800);
            } else {
                toast.error(data.message || 'Invalid credentials.');
            }
        } catch {
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Admin Login — Rider of Faisalabad</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className={styles.page}>
                {/* Left Panel */}
                <div className={styles.leftPanel}>
                    <div className={styles.branding}>
                        <div className={styles.brandLogoImage}>
                            <Image
                                src="/uploads/logo.png"
                                alt="Logo"
                                width={180}
                                height={180}
                                priority
                            />
                        </div>
                        <h2 className={styles.brandName}>Rider of Faisalabad</h2>
                        <p className={styles.brandTagline}>Admin Dashboard</p>
                    </div>
                    <div className={styles.bgShapes}>
                        <div className={styles.circle1} />
                        <div className={styles.circle2} />
                    </div>
                </div>

                {/* Right Panel */}
                <div className={styles.rightPanel}>
                    <motion.div
                        className={styles.loginCard}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.lockIcon}>
                                <FiLock size={24} color="white" />
                            </div>
                            <h1 className={styles.loginTitle}>Admin Login</h1>
                            <p className={styles.loginSub}>Enter your credentials to access the dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">Username</label>
                                <div className={styles.inputWrap}>
                                    <FiUser size={16} className={styles.inputIcon} />
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        className={`form-input ${styles.inputPadded}`}
                                        placeholder="admin"
                                        value={form.username}
                                        onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <div className={styles.inputWrap}>
                                    <FiLock size={16} className={styles.inputIcon} />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPass ? 'text' : 'password'}
                                        className={`form-input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.showPassBtn}
                                        onClick={() => setShowPass(p => !p)}
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.hintBox}>
                                <strong>Demo credentials:</strong> Username: <code>admin</code> | Password: <code>Rider2024!</code>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-teal btn-lg"
                                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                                disabled={loading}
                                id="admin-login-btn"
                            >
                                {loading ? <span className={styles.spinner} /> : 'Login to Dashboard'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
