export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'Rider2024!';

    if (username === adminUser && password === adminPass) {
        const token = process.env.ADMIN_SECRET || 'admin-secret-2024';
        return res.status(200).json({ success: true, token, message: 'Login successful' });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
