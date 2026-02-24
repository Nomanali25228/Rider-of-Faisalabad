// Shared in-memory store for development/demo
// In production, this should be replaced with a real database like MongoDB or PostgreSQL

// Using global to persist data across HMR in development
if (!global.orders) {
    global.orders = [];
}

export const getOrders = () => global.orders;

export const addOrder = (order) => {
    global.orders.unshift(order);
    console.log('Order added to store:', order.trackingId, 'Total orders:', global.orders.length);
    return order;
};

export const updateOrderStatus = (orderId, status, extraData = {}) => {
    global.orders = global.orders.map(o => (o._id === orderId || o.trackingId === orderId) ? { ...o, status, ...extraData } : o);
    return true;
};

export const getOrderById = (id) => {
    if (!id) return null;
    const searchId = id.toUpperCase();
    return global.orders.find(o =>
        (o._id && o._id === id) ||
        (o.trackingId && o.trackingId.toUpperCase() === searchId)
    );
};
