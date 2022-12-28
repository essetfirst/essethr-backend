const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DEFAULT_WORK_DAY_HOURS_FORMAT = {
  workStartTime: "08:30",
  workEndTime: "17:30:00",
  breakStartTime: "12:00:00",
  breakEndTime: "14:00:00",
};

const DEFAULT_ATTENDANCE_POLICY = DAYS_OF_WEEK.map((day) => ({
  [day]:
    day === "saturday"
      ? {
          workDay: true,
          overtimeAllowed: true,
          workHours: Object.assign({}, DEFAULT_WORK_DAY_HOURS_FORMAT, {
            workEndTime: "12:00 AM",
            breakStartTime: "N/A",
            breakEndTime: "N/A",
          }),
        }
      : day === "sunday"
      ? { workDay: false, overtimeAllowed: true, workHours: {} }
      : {
          workDay: true,
          overtimeAllowed: true,
          workHours: DEFAULT_WORK_DAY_HOURS_FORMAT,
        },
})).reduce((prev, next) => Object.assign({}, prev, next), {});

// const TIME_PROBABLE_ACTION = [
//   { action: "checkin", time: workStartTime },
//   { action: "breakout", time: breakStartTime },
//   { action: "breakin", time: breakEndTime },
//   { action: "checkout", time: workEndTime },
// ];

const DEFAULT_ETHIOPIAN_HOLIDAYS = {};

const DEFAULT_LEAVE_TYPES = {
  annual: {
    type: "annual",
    duration: 16,
    daysFromPastAllowed: true,
  },
  special: {
    type: "annual",
    duration: 3,
    daysFromPastAllowed: true,
  },
  maternal: {
    type: "annual",
    duration: 60,
    daysFromPastAllowed: true,
  },
};

module.exports = {
  DEFAULT_LEAVE_TYPES,
  DEFAULT_ATTENDANCE_POLICY,
  DEFAULT_WORK_DAY_HOURS_FORMAT,
  DAYS_OF_WEEK,
  DEFAULT_ETHIOPIAN_HOLIDAYS,
  // TIME_PROBABLE_ACTION,
};
