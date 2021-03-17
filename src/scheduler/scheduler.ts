import cron from "node-cron";

class _Scheduler {
    private DefaultLoop!: cron.ScheduledTask

    public async Initialize() {
        this.DefaultLoop = cron.schedule("* * * * *", () => {
            console.log('Cron Task - READ - Time: ' + (new Date()));
        })
    }
}

export default new _Scheduler();