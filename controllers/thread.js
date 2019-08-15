const colors = require('colors');
const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;

const Thread = require('../models/thread');
const helpers = require('../helpers');

exports.list = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        Thread.find({})
            .exec().then((threads) => {
                res.json({
                    error: false,
                    threads
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
            Thread.findById(req.params.id)
                .exec().then((thread) => {
                    if (!thread) res.sendStatus(404);
                    else res.json({
                        error: false,
                        thread
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
        Thread.create(data).then((thread) => {
            console.log('POST'.white.bgBlue + ' ' + colors.blue('New thread - ' + thread._id));
            req.io.emit('thread.create', thread);
            res.json({
                error: false,
                message: "Thread created successfully",
                thread
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
            Thread.findById(req.params.id).exec().then((thread) => {
                if (!thread) {
                    res.sendStatus(404);
                } else {
                    console.log('PUT'.white.bgBlue + ' ' + colors.blue('Update thread - ' + req.params.id));
                    let data = {};
                    _.isEmpty(req.body) ? data = req.query : data = req.body;
                    thread.content = data.content;
                    thread.save().then(() => {
                        req.io.emit('thread.update', thread);
                        res.json({
                            error: false,
                            message: "Thread updated successfully",
                            thread
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
            Thread.findById(req.params.id).exec().then((thread) => {
                if (!thread) {
                    res.sendStatus(404);
                } else {
                    console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove thread - ' + req.params.id));
                    req.io.emit('thread.remove', thread._id);
                    thread.remove();
                    res.json({
                        error: false,
                        message: "Thread removed successfully"
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