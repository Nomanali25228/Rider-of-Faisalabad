import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION = 'orders';

/**
 * Build flexible ID filter that handles MongoDB ObjectId and string IDs/trackingIds.
 */
function buildIdFilter(id) {
    if (!id) return { _id: null };
    const searchId = id.toString().trim();
    const searchIdUpper = searchId.toUpperCase();
    const filters = [
        { id: searchId },
        { trackingId: searchId },
        { trackingId: searchIdUpper },
        { _id: searchId },
    ];

    if (ObjectId.isValid(searchId)) {
        try {
            filters.push({ _id: new ObjectId(searchId) });
        } catch (e) { }
    }

    return { $or: filters };
}

/**
 * Fetch all orders from MongoDB database.
 */
export const getOrders = async () => {
    try {
        const db = await getDb();
        const orders = await db.collection(COLLECTION)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return orders.map(o => ({
            ...o,
            _id: o._id ? o._id.toString() : o.id,
        }));
    } catch (error) {
        console.error('Error in getOrders (MongoDB):', error);
        return [];
    }
};

/**
 * Add a new order and save to MongoDB.
 */
export async function saveOrder(order) {
    try {
        const db = await getDb();
        const orderToInsert = {
            ...order,
            createdAt: order.createdAt || new Date().toISOString(),
        };
        const result = await db.collection(COLLECTION).insertOne(orderToInsert);
        return {
            ...orderToInsert,
            _id: result.insertedId ? result.insertedId.toString() : orderToInsert._id,
        };
    } catch (error) {
        console.error('Error in saveOrder (MongoDB):', error);
        throw error;
    }
}

/**
 * Update an order's status and other fields in MongoDB.
 */
export const updateOrderStatus = async (orderId, status, extraData = {}) => {
    try {
        const db = await getDb();
        const filter = buildIdFilter(orderId);

        const updateDoc = {
            $set: {
                status,
                updatedAt: new Date().toISOString(),
                ...extraData,
            }
        };

        const result = await db.collection(COLLECTION).updateOne(filter, updateDoc);
        return result.matchedCount > 0;
    } catch (error) {
        console.error('Error in updateOrderStatus (MongoDB):', error);
        return false;
    }
};

/**
 * Retrieve a specific order by ID or trackingId from MongoDB.
 */
export const getOrderById = async (id) => {
    if (!id) return null;
    try {
        const db = await getDb();
        const filter = buildIdFilter(id);

        const order = await db.collection(COLLECTION).findOne(filter);
        if (!order) return null;

        return {
            ...order,
            _id: order._id ? order._id.toString() : order.id,
        };
    } catch (error) {
        console.error('Error in getOrderById (MongoDB):', error);
        return null;
    }
};

/**
 * Delete an order by ID or trackingId from MongoDB.
 */
export const deleteOrder = async (id) => {
    if (!id) return false;
    try {
        const db = await getDb();
        const filter = buildIdFilter(id);

        const result = await db.collection(COLLECTION).deleteOne(filter);
        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error in deleteOrder (MongoDB):', error);
        return false;
    }
};
