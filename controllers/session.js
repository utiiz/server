const colors = require('colors');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const helpers = require('../helpers');

exports.login = (req, res) => {
    let data = {};
    _.isEmpty(req.body) ? data = req.query : data = req.body;

    if (!data.username || !data.password) res.json({
        error: true,
        message: 'Need username and password'
    });

    User.findOne({
        username: data.username
    }).exec().then((user) => {
        if (!user) {
            res.json({
                error: true,
                message: 'Username or password wrong'
            });
        } else {
            bcrypt.compare(data.password, user.password, (err, match) => {
                if (!err) {
                    if (!match) res.json({
                        error: true,
                        message: 'Username or password wrong'
                    });
                    else res.json({
                        error: false,
                        id_token: helpers.createIdToken(user),
                        user: user,
                        //access_token: helpers.createAccessToken()
                    });
                } else {
                    res.sendStatus(500);
                }
            });
        }
    }).catch((error) => {
        res.json({
            error: true,
            message: error.message
        });
    });
}