
class TimesheetDAO {
    constructor(handle) {
        this.timesheets = handle.collection('timesheets');
    }

    static async getTimesheet(employeeId) {
        this.timesheets.findOne({ _id: employeeId })
    }
    
    static async updateTimesheet(timesheetId, update) {        
        this.timesheets.findOne({ _id: employeeId })
    }
    
    static async deleteTimesheet(timesheetId) {
        this.timesheets.findOne({ _id: employeeId })

    }
    

}

class AttendancePolicyService {
    constructor({ attendancePolicyModel }) {
    }

    createAttendancePolicy(policy) {}
    setAttendancePolicy(newPolicy) {}
}

class TimesheetService {
    constructor({ attendancePolicyService, timesheetModel }) {
        this.collection = model;
    }

    

    swipe(swipeInfo) {
        const attendancePolicy = { workStartTime: '', workEndTime: '', breakStartTime: '', breakEndTime: '' };
        const employeeTimesheetData = { employeeId, date, checkin: '', checkout: '', breakin: '', breakout: '', status: '' };
        const { employeeId, swipeTime } = swipeInfo;
        // if hasnt checked in yet then update checkin
        // if hasnt gone out for break yet then update breakout
        // if hasnt come in from break yet then update breakin
        // if hasnt checked out yet then update checkout 

        // calculate offset hours 
        // if today is holiday then save all the offset hours as overtime hours
        // else 
        // update workedHours, overtimeHours
        
    }

    clockin(clockinInfo) {
        if (!checkin) {}
        if (!breakin) {}
        if (!breakout) {}
        if (!checkout) {}
    }
    
    breakout(breakoutInfo) {
        // update collection breakout
        // return {}
    }

    breakin(breakinInfo) {
        // 
    }

    clockout(clockoutInfo) {

    }

}


class TimesheetController {
    
    async static get(req, res) {
        
    }

    async static clockin(req, res) {

    }

    async static clockout(req, res) {

    } 
}

module.exports = TimesheetController;