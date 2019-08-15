const colors = require('colors');
const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;
const Jimp = require('jimp');
const magick = require('imagemagick-cli');

const User = require('../models/user');
const helpers = require('../helpers');

exports.list = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        User.find({}).exec().then((users) => {
            res.json({
                error: false,
                users: users
            });
        }).catch((error) => {
            res.json({
                error: true,
                message: error.message
            });
        });
    });
};

exports.get = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        if (ObjectId.isValid(req.params.id)) {
            User.findById(req.params.id).exec().then((user) => {
                if (!user) res.sendStatus(404);
                else res.json({
                    error: false,
                    user: user
                });
            }).catch((error) => {
                res.json({
                    error: true,
                    message: error.message
                });
            });
        } else {
            res.sendStatus(404);
        }
    });
};

exports.create = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        let data = {};
        _.isEmpty(req.body) ? data = req.query : data = req.body;
        User.create(data).then(async (user) => {
            console.log('POST'.white.bgBlue + ' ' + colors.blue('New user - ' + user._id));
            picture(user, res, true);
        }).catch((error) => {
            res.json({
                error: true,
                message: error.message
            });
        });


    });
};

exports.update = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        if (ObjectId.isValid(req.params.id)) {
            User.findById(req.params.id).exec().then((user) => {
                if (!user) {
                    res.sendStatus(404);
                } else {
                    console.log('PUT'.white.bgBlue + ' ' + colors.blue('Update user - ' + req.params.id));
                    let data = {};
                    _.isEmpty(req.body) ? data = req.query : data = req.body;
                    user = _.merge(user, data);
                    user.save().then(() => {
                        res.json({
                            error: false,
                            message: "User updated successfully",
                            user: user
                        });
                    });
                }
            }).catch((error) => {
                res.json({
                    error: true,
                    message: error.message
                });
            });
        } else {
            res.sendStatus(404);
        }
    });
};

exports.remove = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        if (ObjectId.isValid(req.params.id)) {
            User.findById(req.params.id).exec().then((user) => {
                if (!user) {
                    res.sendStatus(404);
                } else {
                    console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove user - ' + req.params.id));
                    user.remove();
                    res.json({
                        error: false,
                        message: "User removed successfully"
                    });
                }
            }).catch((error) => {
                res.json({
                    error: true,
                    message: error.message
                });
            });
        } else {
            res.sendStatus(404);
        }
    });
};

exports.picture = (req, res) => {

    let data = {};
    _.isEmpty(req.body) ? data = req.query : data = req.body;
    User.findOne({
        username: data.username
    }).exec().then(async (user) => {
        if (user) {
            picture(user, res, false);
        } else {
            res.json({
                error: true,
                message: "No user with this username"
            });
        }
    }).catch((error) => {
        res.json({
            error: true,
            message: error.message
        });
    });
};

picture = (user, res, is_created) => {
    let size = 512;
    let plus = Math.round(Math.random()) == 0 ? '-' : '+';
    let minus = Math.round(Math.random()) == 0 ? '-' : '+';

    magick.exec('convert public/img/generator.png -rotate -' + Math.floor(Math.random() * (360 + 1)) + ' -gravity center -extent ' + size + 'x' + size + plus + Math.floor(Math.random() * (1500 - size * 2 + 1)) + minus + Math.floor(Math.random() * (1500 - size * 2 + 1)) + ' public/img/' + user.username + '.png')
        .then(() => {
            res.json({
                error: false,
                message: is_created ? "User created successfully" : "Picture updated",
                user: user
            });
        })

}