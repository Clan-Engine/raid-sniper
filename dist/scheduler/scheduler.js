"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
class _Scheduler {
    async Initialize() {
        this.DefaultLoop = node_cron_1.default.schedule("* * * * *", () => {
            console.log('Cron Task - READ - Time: ' + (new Date()));
        });
    }
}
exports.default = new _Scheduler();
