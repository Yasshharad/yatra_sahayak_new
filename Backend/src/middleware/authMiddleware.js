const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Check for token in the request header
        const token = req.header('Authorization');

        // If token is not in the header, check for it in cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Authorization denied. Token not found' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'mySecretKey');

        // Fetch user data from the database based on the decoded user ID
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token - User not found' });
        }

        // Attach user information to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid token or token expired' });
    }
};

module.exports = authMiddleware;
