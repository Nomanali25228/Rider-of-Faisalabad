import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPackage, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiRefreshCw, FiLogOut, FiMail } from 'react-icons/fi';
import AdminOrderTable from '../components/AdminOrderTable';
import AdminContactTable from '../components/AdminContactTable';
import styles from './dashboard.module.css';

const statCards = [
    { key: 'total', label: 'Total Orders', icon: <FiPackage size={22} />, color: '#2F8F83' },
    { key: 'pending', label: 'Pending', icon: <FiClock size={22} />, color: '#d97706' },
    { key: 'inProgress', label: 'In Progress', icon: <FiTruck size={22} />, color: '#7c3aed' },
    { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle size={22} />, color: '#059669' },
];

export default function DashboardPage() {
    const [orders, setOrders] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [view, setView] = useState('orders'); // 'orders' or 'contacts'
    const [isAuth, setIsAuth] = useState(false);
    const router = useRouter();

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        setLoading(true);
        try {
            // Fetch Orders
            const ordersRes = await fetch('/api/orders/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                setOrders(ordersData.orders);
            }

            // Fetch Contacts
            const contactsRes = await fetch('/api/contact/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const contactsData = await contactsRes.json();
            if (contactsData.success) {
                setContacts(contactsData.contacts);
            }
        } catch (err) {
            toast.error('Network error while fetching data.');
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
            fetchDashboardData();
        }
    }, [router]);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        inProgress: orders.filter(o => o.status === 'In Progress').length,
        contacts: contacts.length,
    };

    const displayStatCards = [
        ...statCards.slice(0, 3),
        { key: 'contacts', label: 'Inquiries', icon: <FiMail size={22} />, color: '#7c3aed' }
    ];

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
                            onClick={fetchDashboardData}
                            disabled={loading}
                            aria-label="Refresh data"
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
                        {displayStatCards.map(({ key, label, icon, color }, i) => (
                            <motion.div
                                key={key}
                                className={styles.statCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{ y: -4 }}
                                onClick={() => key === 'contacts' ? setView('contacts') : setView('orders')}
                                style={{ '--stat-color': color }}
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

                    {/* Main Content Sections */}
                    <div className={styles.ordersSection}>
                        <div className={styles.ordersSectionHeader}>
                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.viewBtn} ${view === 'orders' ? styles.viewBtnActive : ''}`}
                                    onClick={() => setView('orders')}
                                >
                                    <FiPackage size={18} /> Orders
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${view === 'contacts' ? styles.viewBtnActive : ''}`}
                                    onClick={() => setView('contacts')}
                                >
                                    <FiMail size={18} /> Inquiries
                                    {contacts.length > 0 && <span className={styles.viewBadge}>{contacts.length}</span>}
                                </button>
                            </div>

                            {view === 'orders' && (
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
                            )}
                        </div>

                        {loading && (orders.length === 0 && contacts.length === 0) ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                                <FiRefreshCw size={40} className={styles.spinning} style={{ marginBottom: 16 }} />
                                <p>Loading data...</p>
                            </div>
                        ) : (
                            view === 'orders' ? (
                                <AdminOrderTable orders={filtered} onStatusChange={handleStatusChange} />
                            ) : (
                                <AdminContactTable contacts={contacts} />
                            )
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
