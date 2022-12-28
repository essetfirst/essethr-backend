function computePayableHours(attendance = {}, workHours = {}) {
  const { workStartTime, workEndTime, breakStartTime, breakEndTime } =
    workHours;
  const { checkin, breakin, breakout, checkout } = attendance;

  let workedHours = 0,
    overtimeHours = 0;
  if (checkout) {
    const stdEndTime = new Date(
      `${new Date(checkin).toLocaleDateString()} ${workEndTime}`
    ).getTime();
    const stdBeginTime = new Date(
      `${new Date(checkin).toLocaleDateString()} ${workStartTime}`
    ).getTime();
    const stdBreakBeginTime = new Date(
      `${new Date(breakout).toLocaleDateString()} ${breakStartTime}`
    ).getTime();
    const stdBreakEndTime = new Date(
      `${new Date(breakin).toLocaleDateString()} ${breakEndTime}`
    ).getTime();

    const firstHalf = breakout
      ? breakout - checkin
      : checkout > stdBreakBeginTime
      ? stdBreakBeginTime - checkin
      : checkout - checkin;

    console.dir("First half worked time: ", firstHalf);
    const secondHalf = breakin
      ? checkout - breakin
      : checkout > stdBreakBeginTime
      ? checkout - stdBreakEndTime
      : 0;
    console.dir("Second half worked time: ", secondHalf);

    workedHours = (firstHalf + secondHalf) / 3600000;

    // Calculate overtime hours
    const beforeWorkOT = checkin < stdBeginTime ? stdBeginTime - checkin : 0;
    const breakOT =
      breakout > stdBreakBeginTime ? breakout - stdBreakBeginTime : 0;
    const afterWorkOT = checkout > stdEndTime ? checkout - stdEndTime : 0;

    overtimeHours = (beforeWorkOT + breakOT + afterWorkOT) / 3600000;
  }

  return { firstHalf, secondHalf, overtimeHours, workedHours };
}

module.exports = { computePayableHours };
