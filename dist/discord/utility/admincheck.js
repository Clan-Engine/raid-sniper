"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function admincheck(message) {
    if (message.member?.hasPermission("ADMINISTRATOR"))
        return true;
    else
        return false;
}
exports.default = admincheck;
