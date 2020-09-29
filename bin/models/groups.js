"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user_id: {
        type: String,
        required: true,
    },
    group_id: {
        type: String,
        required: true
    }
});
module.exports = mongoose_1.model('Group', schema);
