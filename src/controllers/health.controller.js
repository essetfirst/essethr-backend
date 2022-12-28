class HealthController {
  static async up(req, res, next) {
    try {
      res.send({
        status: "UP",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Something went wrong." });
    }
  }
}

module.exports = HealthController;
