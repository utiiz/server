const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const _ = require('lodash');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
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
    address: {
        type: new Schema({
            street: {
                type: String,
                min: 3,
                max: 50,
                required: true,
                validate: {
                    validator: (v) => {
                        return 3 <= v.length && v.length <= 50;
                    },
                    message: '{VALUE} is not a valid street.'
                }
            },
            zip: {
                type: String,
                required: true,
                validate: {
                    validator: (v) => {
                        return /^[0-9]{5}$/g.test(v);
                    },
                    message: '{VALUE} is not a valid zip code.'
                }
            },
            city: {
                type: String,
                min: 3,
                max: 50,
                required: true,
                validate: {
                    validator: (v) => {
                        return 3 <= v.length && v.length <= 50;
                    },
                    message: '{VALUE} is not a valid city.'
                }
            }
        },
        {
            _id: false
        }),
    },
    tickets: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Ticket'
        }
    ]
});

CompanySchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = mongoose.model('Company', CompanySchema);