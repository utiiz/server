const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        validate: {
            validator: (v) => {
                return 3 <= v.length && v.length <= 50;
            },
            message: '{VALUE} is not a valid firstname.'
        }
    },
    lastname: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        validate: {
            validator: (v) => {
                return 3 <= v.length && v.length <= 50;
            },
            message: '{VALUE} is not a valid lastname.'
        }
    },
    username: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        index: {
            unique: true
        },
        validate: {
            validator: (v) => {
                return 3 <= v.length && v.length <= 50;
            },
            message: '{VALUE} is not a valid username.'
        }
    },
    password: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        validate: {
            validator: (v) => {
                return /^(#[0-9A-Fa-f]{6},){7}(#[0-9A-Fa-f]{6})$/g.test(v);
            },
            message: '{VALUE} is not a valid theme.'
        }
    }
});

UserSchema.pre('save', function(next) {

    this.updated_at = Date.now();
    let user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = mongoose.model('User', UserSchema);