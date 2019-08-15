const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const _ = require('lodash');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        min: 1,
        max: 256,
        required: true,
        validate: {
            validator: (v) => {
                return 1 <= v.length && v.length <= 256;
            },
            message: '{VALUE} is not a valid comment location.'
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

CommentSchema.pre('save', (next) => {
    this.updated_at = Date.now();
    next();
});

CommentSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = mongoose.model('Comment', CommentSchema);