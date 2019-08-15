const jwt = require('jsonwebtoken');

const secret = "my_secret_key";
const audience = "nodejs-jwt-auth";
const issuer = "http://utiiz.me";

let self = module.exports = {
    auth: (res, authorization, callback) => {
        callback();
        /* if (!authorization) {
            console.log('AUTH'.white.bgRed + ' ' + 'Not allowed'.red);
            res.sendStatus(403);
        } else {
            let token = authorization.split(' ')[1];
            jwt.verify(token, secret, (err, allowed) => {
                if (!err) {
                    console.log('AUTH'.white.bgYellow + ' ' + 'Allowed'.yellow);
                    callback();
                } else {
                    res.json({
                        error: true,
                        message: err.message
                    })
                }
            });
        } */
    },

    createIdToken: (user) => {
        return jwt.sign({
            username: user.username
        }, secret);
    },

    createAccessToken: () => {
        return jwt.sign({
            iss: issuer,
            aud: audience,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            scope: 'full_access',
            jti: self.genJti(), // unique identifier for the token
            alg: 'HS256'
        }, secret);
    },

    // Generate Unique Identifier for the access token
    genJti: () => {
        let jti = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 16; i++) {
            jti += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return jti;
    }
}