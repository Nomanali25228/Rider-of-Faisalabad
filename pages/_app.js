import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollToTop from '../components/ScrollToTop';
import Head from 'next/head';

export default function App({ Component, pageProps, router }) {
    const isAdmin = router.pathname.startsWith('/dashboard') || router.pathname === '/login';

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/favicon.ico" />
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
            </Head>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#2F8F83',
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
                        borderRadius: '12px',
                        fontWeight: 500,
                    },
                }}
            />
            {!isAdmin && <Navbar />}
            <AnimatePresence mode="wait">
                <motion.div
                    key={router.route}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <Component {...pageProps} />
                </motion.div>
            </AnimatePresence>
            {!isAdmin && (
                <>
                    <Footer />
                    <WhatsAppButton />
                    <ScrollToTop />
                </>
            )}
        </>
    );
}
