import { githubStore } from './github';

const MODEL = 'orders';

/**
 * Fetch all orders from GitHub "database".
 */
export const getOrders = async () => {
    return await githubStore.getAll(MODEL);
};

/**
 * Add a new order and save to GitHub.
 */
export async function saveOrder(order) {
    const newOrder = await githubStore.add(MODEL, order);
    return newOrder;
}

/**
 * Update an order's status and other fields in GitHub.
 */
export const updateOrderStatus = async (orderId, status, extraData = {}) => {
    return await githubStore.update(MODEL, orderId, (order) => ({
        ...order,
        status,
        ...extraData,
    }));
};

/**
 * Retrieve a specific order by ID or trackingId from GitHub.
 */
export const getOrderById = async (id) => {
    if (!id) return null;
    const searchId = id.toUpperCase();
    const orders = await getOrders();
    return orders.find(o =>
        (o._id && o._id === id) ||
        (o.id && o.id === id) ||
        (o.trackingId && o.trackingId.toUpperCase() === searchId)
    );
};
