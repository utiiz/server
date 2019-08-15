const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const _ = require('lodash');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    location: {
        type: String,
        min: 1,
        max: 256,
        required: true,
        validate: {
            validator: (v) => {
                return 1 <= v.length && v.length <= 256;
            },
            message: '{VALUE} is not a valid ticket location.'
        }
    },
    description: {
        type: String,
        min: 1,
        max: 2048,
        required: true,
        validate: {
            validator: (v) => {
                return 1 <= v.length && v.length <= 2048;
            },
            message: '{VALUE} is not a valid ticket description.'
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

TicketSchema.pre('save', (next) => {
    this.updated_at = Date.now();
    next();
});

TicketSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = mongoose.model('Ticket', TicketSchema);