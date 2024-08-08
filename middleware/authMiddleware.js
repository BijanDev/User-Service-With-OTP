const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY;

exports.protect = async = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}