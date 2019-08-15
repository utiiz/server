const colors = require('colors');
const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;

const Company = require('../models/company');
const helpers = require('../helpers');

exports.list = (req, res) => {
    helpers.auth(res, req.headers["authorization"], () => {
        Company.find({})
            .populate({
                path: 'tickets',
                populate: {
                    path: 'user',
                }
            })
            .exec().then((companies) => {
                res.json({
                    error: false,
                    companies
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
            Company.findById(req.params.id)
                .populate({
                    path: 'tickets',
                    populate: {
                        path: 'user',
                    }
                })
                .exec().then((company) => {
                    if (!company) res.sendStatus(404);
                    else res.json({
                        error: false,
                        company
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
        data.address = {
            street: data.street,
            city: data.city,
            zip: data.zip,
        }
        Company.create(data).then((company) => {
            console.log('POST'.white.bgBlue + ' ' + colors.blue('New company - ' + company._id));
            req.io.emit('company.create', company);
            res.json({
                error: false,
                message: "Company created successfully",
                company
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
            Company.findById(req.params.id).exec().then((company) => {
                if (!company) {
                    res.sendStatus(404);
                } else {
                    console.log('PUT'.white.bgBlue + ' ' + colors.blue('Update company - ' + req.params.id));
                    let data = {};
                    _.isEmpty(req.body) ? data = req.query : data = req.body;
                    company.content = data.content;
                    company.save().then(() => {
                        req.io.emit('company.update', company);
                        res.json({
                            error: false,
                            message: "Company updated successfully",
                            company
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
            Company.findById(req.params.id).exec().then((company) => {
                if (!company) {
                    res.sendStatus(404);
                } else {
                    console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove company - ' + req.params.id));
                    company.remove();
                    req.io.emit('company.remove', company);
                    res.json({
                        error: false,
                        message: "Company removed successfully"
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