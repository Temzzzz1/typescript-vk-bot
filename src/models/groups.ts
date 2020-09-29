import { Schema, model } from 'mongoose'

const schema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    group_id: {
        type: String,
        required: true
    }
})

module.exports = model('Group', schema)