const colors = require('colors');
const mongoose = require('mongoose');
const _ = require('lodash');
const fs = require('fs');
const ObjectId = mongoose.Types.ObjectId;

const Identifier = require('../models/identifier');
const helpers = require('../helpers');

exports.list = (req, res) => {
	helpers.auth(res, req.headers['authorization'], () => {
		Identifier.find({})
			.exec()
			.then((identifiers) => {
				res.json({
					error: false,
					identifiers
				});
			})
			.catch((error) => {
				res.json({
					error: true,
					message: error.message
				});
			});
	});
};

exports.get = (req, res) => {
	helpers.auth(res, req.headers['authorization'], () => {
		if (ObjectId.isValid(req.params.id)) {
			Identifier.findById(req.params.id)
				.exec()
				.then((identifier) => {
					if (!identifier) res.sendStatus(404);
					else
						res.json({
							error: false,
							identifier
						});
				})
				.catch((error) => {
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
	helpers.auth(res, req.headers['authorization'], () => {
		let data = {};
		_.isEmpty(req.body) ? (data = req.query) : (data = req.body);
		Identifier.create(data)
			.then((identifier) => {
				console.log('POST'.white.bgBlue + ' ' + colors.blue('New identifier - ' + identifier._id));
				req.io.emit('identifier.create', identifier);
				res.json({
					error: false,
					message: 'Identifier created successfully',
					identifier
				});
			})
			.catch((error) => {
				res.json({
					error: true,
					message: error.message
				});
			});
	});
};

exports.update = (req, res) => {
	helpers.auth(res, req.headers['authorization'], () => {
		if (ObjectId.isValid(req.params.id)) {
			Identifier.findById(req.params.id)
				.exec()
				.then((identifier) => {
					if (!identifier) {
						res.sendStatus(404);
					} else {
						console.log('PUT'.white.bgBlue + ' ' + colors.blue('Update identifier - ' + req.params.id));
						let data = {};
						_.isEmpty(req.body) ? (data = req.query) : (data = req.body);
						identifier.content = data.content;
						identifier.save().then(() => {
							req.io.emit('identifier.update', identifier);
							res.json({
								error: false,
								message: 'Identifier updated successfully',
								identifier
							});
						});
					}
				})
				.catch((error) => {
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
	helpers.auth(res, req.headers['authorization'], () => {
		if (ObjectId.isValid(req.params.id)) {
			Identifier.findById(req.params.id)
				.exec()
				.then((identifier) => {
					if (!identifier) {
						res.sendStatus(404);
					} else {
						console.log('DELETE'.white.bgRed + ' ' + colors.red('Remove identifier - ' + req.params.id));
						req.io.emit('identifier.remove', identifier._id);
						identifier.remove();
						res.json({
							error: false,
							message: 'Identifier removed successfully'
						});
					}
				})
				.catch((error) => {
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

exports.dashlane = (req, res) => {
	console.log('here');
	helpers.auth(res, req.headers['authorization'], () => {
		Identifier.remove({}, () => {
			console.log('\n *START* \n');
			var content = fs.readFileSync('./public/files/DashlaneExport.json');
			var json = JSON.parse(content);
			_.each(json.AUTHENTIFIANT, (item) => {
				var data = {
					name: item.title,
					domain: item.domain,
					login: item.login != '' ? item.login : item.email,
					password: item.password,
					note: item.note
				};

				Identifier.create(data)
					.then((identifier) => {
						console.log('POST'.white.bgBlue + ' ' + colors.blue('New identifier - ' + identifier._id));
						req.io.emit('identifier.create', identifier);
					})
					.catch((error) => {
						res.json({
							error: true,
							message: error.message
						});
					});
			});

			res.json({
				error: false,
				message: 'Identifiers imported successfully'
			});
		});
	});
};
