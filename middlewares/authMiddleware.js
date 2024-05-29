const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {
        
        const token = req.headers.authorization?.replace("Bearer ", "");

        // console.log('Token Recieved',token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token not provided"
            });
        }

        // Verify token
        const decryptedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = decryptedToken.userId;
        next();

    } catch (error) {
        
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token"
        });
    }
}