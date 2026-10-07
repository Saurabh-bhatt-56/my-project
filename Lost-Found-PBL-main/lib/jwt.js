import jwt from 'jsonwebtoken';

export function generateToken(user) {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
    };
    const secret = process.env.JWT_SECRET;
    const options = {
        expiresIn: '7d'
    };

    return jwt.sign(payload, secret, options);
}

export function verifyToken(token) {
    const secret = process.env.JWT_SECRET; 
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        return null; 
    }
}
