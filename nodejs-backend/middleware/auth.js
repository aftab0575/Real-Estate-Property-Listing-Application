import jwt from 'jsonwebtoken';

// Middleware to check if the user is authenticated
const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check if the user is an admin
const adminAuth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ msg: 'Admin access required' });
        }
        
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export { auth as default, adminAuth }; 