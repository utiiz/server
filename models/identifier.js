const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const _ = require('lodash');
const Schema = mongoose.Schema;

const IdentifierSchema = new Schema({
	name: {
		type: String,
		min: 3,
		max: 50,
		required: true,
		validate: {
			validator: (v) => {
				return 3 <= v.length && v.length <= 50;
			},
			message: '{VALUE} is not a valid name.'
		}
	},
	domain: {
		type: String,
		min: 3,
		max: 50,
		required: true,
		validate: {
			validator: (v) => {
				return 3 <= v.length && v.length <= 50;
			},
			message: '{VALUE} is not a valid name.'
		}
	},
	login: {
		type: String,
		min: 3,
		max: 50,
		required: true,
		validate: {
			validator: (v) => {
				return 3 <= v.length && v.length <= 50;
			},
			message: '{VALUE} is not a valid name.'
		}
	},
	password: {
		type: String,
		required: true
	},
	note: {
		type: String
	}
});

IdentifierSchema.plugin(timestamps, {
	createdAt: 'created_at',
	updatedAt: 'updated_at'
});

module.exports = mongoose.model('Identifier', IdentifierSchema);
