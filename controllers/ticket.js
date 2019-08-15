const colors = require('colors');
const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;

const Ticket = require('../models/ticket');
const Comment = require('../models/comment');
const Company = require('../models/company');
const helpers = require('../helpers');

exports.list = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        Ticket.find({}).sort({
            created_at: 'desc'
        })
            .populate('user')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                }
            }).exec().then((tickets) => {
                res.json({
                    error: false,
                    tickets: tickets
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
            Ticket.findById(req.params.id)
                .populate('user')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                    }
                }).exec().then((ticket) => {
                    if (!ticket) res.sendStatus(404);
                    else res.json({
                        error: false,
                        ticket: ticket
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
        if (ObjectId.isValid(data.company)) {
            Company.findById(data.company)
                .populate({
                    path: 'tickets',
                    populate: {
                        path: 'user',
                    }
                })
                .exec().then((company) => {
                    if (!company) {
                        res.sendStatus(404);
                    } else {
                        Ticket.create(data).then((ticket) => {
                            console.log('POST'.white.bgBlue + ' ' + colors.blue('New ticket - ' + ticket._id));
                            company.tickets = [...company.tickets, ticket]
                            company.save().then(() => {
                                ticket.populate('user').execPopulate().then((ticket) => {
                                    req.io.emit('ticket.create', { ticket, company });
                                    res.json({
                                        error: false,
                                        message: "Ticket created successfully",
                                        ticket: ticket
                                    });
                                }).catch((error) => {
                                    res.json({
                                        error: true,
                                        message: error.message
                                    });
                                });
                            });
                        }).catch((error) => {
                            res.json({
                                error: true,
                                message: error.message
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
            res.json({
                error: true,
                message: "Company id is not valid."
            });
        }
    });
};

exports.update = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        if (ObjectId.isValid(req.params.id)) {
            Ticket.findById(req.params.id).exec().then((ticket) => {
                if (!ticket) {
                    res.sendStatus(404);
                } else {
                    console.log('PUT'.white.bgBlue + ' ' + colors.blue('Update ticket - ' + req.params.id));
                    let data = {};
                    _.isEmpty(req.body) ? data = req.query : data = req.body;
                    ticket.location = data.location;
                    ticket.save().then(() => {
                        res.json({
                            error: false,
                            message: "Ticket updated successfully",
                            ticket: ticket
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
            Ticket.findById(req.params.id).exec().then((ticket) => {
                if (!ticket) {
                    res.sendStatus(404);
                } else {
                    console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove ticket - ' + req.params.id));
                    ticket.remove();
                    res.json({
                        error: false,
                        message: "Ticket removed successfully"
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

exports.comment = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        if (ObjectId.isValid(req.params.id)) {
            let data = {};
            _.isEmpty(req.body) ? data = req.query : data = req.body;
            Ticket.findById(req.params.id).populate('user').populate('comments').exec().then((ticket) => {
                if (!ticket) {
                    res.sendStatus(404);
                } else {
                    Comment.create(data).then((comment) => {
                        console.log('POST'.white.bgBlue + ' ' + colors.blue('New comment - ' + comment._id));
                        ticket.comments.push(comment._id);
                        ticket.save();
                        Comment.findOne(comment).populate('user').then((comment) => {
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
                    }).catch((error) => {
                        res.json({
                            error: true,
                            message: error.message
                        });
                    });
                }

                /*res.json({
                    error: false,
                    ticket: ticket
                });*/
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



exports.uncomment = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        if (ObjectId.isValid(req.params.id)) {
            let data = {};
            _.isEmpty(req.body) ? data = req.query : data = req.body;
            Ticket.findById(req.params.id).populate('user').populate('comments').exec().then((ticket) => {
                if (!ticket) {
                    res.sendStatus(404);
                } else {
                    Comment.findById(req.params.comment_id).exec().then((comment) => {
                        if (!comment) {
                            res.sendStatus(404);
                        } else {
                            console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove comment - ' + req.params.id));
                            ticket.comments.pop(comment._id);
                            ticket.save();
                            comment.remove();
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