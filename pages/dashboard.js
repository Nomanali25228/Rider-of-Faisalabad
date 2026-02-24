import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPackage, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiRefreshCw, FiLogOut } from 'react-icons/fi';
import AdminOrderTable from '../components/AdminOrderTable';
import styles from './dashboard.module.css';

const statCards = [
    { key: 'total', label: 'Total Orders', icon: <FiPackage size={22} />, color: '#2F8F83' },
    { key: 'pending', label: 'Pending', icon: <FiClock size={22} />, color: '#d97706' },
    { key: 'inProgress', label: 'In Progress', icon: <FiTruck size={22} />, color: '#7c3aed' },
    { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle size={22} />, color: '#059669' },
];

export default function DashboardPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAuth, setIsAuth] = useState(false);
    const router = useRouter();

    const fetchOrders = async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch('/api/orders/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error(data.message || 'Failed to fetch orders.');
            }
        } catch (err) {
            toast.error('Network error while fetching orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.replace('/login');
        } else {
            setIsAuth(true);
            fetchOrders();
        }
    }, [router]);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        inProgress: orders.filter(o => o.status === 'In Progress').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const handleStatusChange = async (orderId, newStatus, rejectionReason) => {
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch('/api/orders/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: newStatus, rejectionReason }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => (o._id === orderId || o.trackingId === orderId) ? { ...o, status: newStatus, rejectionReason } : o));
                toast.success(`Status updated to ${newStatus}`);
            } else {
                toast.error(data.message || 'Failed to update status.');
            }
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/login');
        toast.success('Logged out successfully.');
    };

    if (!isAuth) return null;

    return (
        <>
            <Head>
                <title>Dashboard — Rider of Faisalabad Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className={styles.dashboard}>
                {/* Dashboard Header */}
                <header className={styles.dbHeader}>
                    <div className={styles.dbHeaderLeft}>
                        <div className={styles.dbLogo}>
                            <Image
                                src="/uploads/logo.png"
                                alt="Logo"
                                width={60}
                                height={60}
                                className={styles.dbLogoImg}
                            />
                        </div>
                        <div>
                            <h1 className={styles.dbTitle}>Admin Dashboard</h1>
                            <p className={styles.dbSub}>Rider of Faisalabad</p>
                        </div>
                    </div>
                    <div className={styles.dbHeaderRight}>
                        <button
                            className={styles.refreshBtn}
                            onClick={fetchOrders}
                            disabled={loading}
                            aria-label="Refresh orders"
                        >
                            <FiRefreshCw size={16} className={loading ? styles.spinning : ''} />
                            Refresh
                        </button>
                        <button className={styles.logoutBtn} onClick={handleLogout} id="dashboard-logout-btn">
                            <FiLogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <main className={styles.dbMain}>
                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        {statCards.map(({ key, label, icon, color }, i) => (
                            <motion.div
                                key={key}
                                className={styles.statCard}
                                style={{ '--stat-color': color }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className={styles.statIcon}>{icon}</div>
                                <div className={styles.statInfo}>
                                    <strong className={styles.statNum}>{stats[key]}</strong>
                                    <span className={styles.statLabel}>{label}</span>
                                </div>
                                <div className={styles.statBar} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Orders Section */}
                    <div className={styles.ordersSection}>
                        <div className={styles.ordersSectionHeader}>
                            <h2 className={styles.sectionTitle}>All Orders</h2>
                            {/* Filter Tabs */}
                            <div className={styles.filterTabs}>
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'Pending', label: 'Pending' },
                                    { key: 'Accepted', label: 'Accepted' },
                                    { key: 'In Progress', label: 'In Progress' },
                                    { key: 'Delivered', label: 'Delivered' },
                                    { key: 'Rejected', label: 'Rejected' },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        className={`${styles.filterTab} ${filter === key ? styles.filterTabActive : ''}`}
                                        onClick={() => setFilter(key)}
                                    >
                                        {label}
                                        {key !== 'all' && (
                                            <span className={styles.tabCount}>
                                                {orders.filter(o => o.status === key).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading && orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                                <FiRefreshCw size={40} className={styles.spinning} style={{ marginBottom: 16 }} />
                                <p>Loading orders...</p>
                            </div>
                        ) : (
                            <AdminOrderTable orders={filtered} onStatusChange={handleStatusChange} />
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
