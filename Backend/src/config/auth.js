const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Check for token in the request header or cookies
    const token = req.header('Authorization') || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied. Token not found' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'myPizza');

        // Attach user information to the request object
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
