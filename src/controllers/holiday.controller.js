const { HolidayDAO } = require("../dao");

class HolidayController {
  static async apiGetHolidays(req, res) {
    const result = await HolidayDAO.getHolidays({
      org: req.params.org,
      ...req.query,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      holidays: result,
    });
  }

  static async apiGetHolidayById(req, res) {
    const { id } = req.params;
    const result = await HolidayDAO.getHolidayById(id);
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      holiday: result,
    });
  }

  static async apiAddHoliday(req, res) {
    const result = await HolidayDAO.addHoliday({
      ...req.body,
      org: req.params.org || req.org,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }
console.log(result)
    return res.status(201).json({
      success: true,
      holiday: result.ops ? result.ops:result,
      message: "New holiday added!",
    });
  }

  static async apiUpdateHoliday(req, res) {
    const result = await HolidayDAO.updateHolidaay({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    // console.log(result);
    return res.status(200).json({
      success: true,
      holiday: result,
      message: "Holiday updated!",
    });
  }

  static async apiDeleteHoliday(req, res) {
    const result = await HolidayDAO.deleteHoliday({ _id: req.params.id });
    if (result.error) {
      return res.status(result.server ? 500 : 400).json({
        success: false,
        error: result.server ? "Something went wrong." : result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Holiday deleted!",
    });
  }
}

module.exports = HolidayController;
