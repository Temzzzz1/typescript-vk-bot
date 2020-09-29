"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    peer_id: {
        type: String,
        required: true,
    },
    group_id: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        min: '2020-09-01',
        required: true,
    }
});
module.exports = mongoose_1.model('Remind', schema);
