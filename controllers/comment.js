const colors = require('colors');
const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;

const Comment = require('../models/comment');
const User = require('../models/user');
const helpers = require('../helpers');

exports.list = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        Comment.find({}).populate('user').exec().then((comments) => {
            res.json({
                error: false,
                comments: comments
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
            Comment.findById(req.params.id).populate('user').exec().then((comment) => {
                if (!comment) res.sendStatus(404);
                else res.json({
                    error: false,
                    comment: comment
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
        Comment.create(data).then((comment) => {
            console.log('POST'.white.bgBlue + ' ' + colors.blue('New comment - ' + comment._id));
            req.io.emit('comment.create', comment);
            res.json({
                error: false,
                message: "Comment created successfully",
                comment: comment
            });
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
            Comment.findById(req.params.id).populate('user').exec().then((comment) => {
                if (!comment) {
                    res.sendStatus(404);
                } else {
                    console.log('PUT'.white.bgBlue + ' ' + colors.blue('Update comment - ' + req.params.id));
                    let data = {};
                    _.isEmpty(req.body) ? data = req.query : data = req.body;
                    comment.content = data.content;
                    comment.save().then(() => {
                        req.io.emit('comment.update', comment);
                        res.json({
                            error: false,
                            message: "Comment updated successfully",
                            comment: comment
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
            Comment.findById(req.params.id).exec().then((comment) => {
                if (!comment) {
                    res.sendStatus(404);
                } else {
                    console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove comment - ' + req.params.id));
                    comment.remove();
                    req.io.emit('comment.remove', comment);
                    res.json({
                        error: false,
                        message: "Comment removed successfully"
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