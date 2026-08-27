import { MongoClient } from 'mongodb';
import dns from 'dns';

// Fix `querySrv ECONNREFUSED` error by setting reliable public DNS servers (Google & Cloudflare DNS)
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
    console.warn('Could not set custom DNS servers:', e.message);
}

/**
 * Get MongoClient promise dynamically based on process.env.MONGODB_URI.
 */
function getClientPromise() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('⚠️ Please add your MONGODB_URI to .env.local');
    }

    const options = {};

    if (process.env.NODE_ENV === 'development') {
        // If URI changed or not initialized yet, reset cached connection
        if (!global._mongoClientPromise || global._mongoClientUri !== uri) {
            console.log('📡 Connecting to MongoDB Atlas...');
            const client = new MongoClient(uri, options);
            global._mongoClientUri = uri;
            global._mongoClientPromise = client.connect().catch((err) => {
                // If connection fails, clear global cache so it retries on next request
                delete global._mongoClientPromise;
                delete global._mongoClientUri;
                throw err;
            });
        }
        return global._mongoClientPromise;
    } else {
        const client = new MongoClient(uri, options);
        return client.connect();
    }
}

export default getClientPromise();

/**
 * Get MongoDB database instance.
 * @param {string} dbName 
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb(dbName = 'rider_of_faisalabad') {
    const client = await getClientPromise();
    return client.db(dbName);
}
