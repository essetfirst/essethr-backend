const { PositionDAO } = require("../dao");

class PositionController {
  static async apiCreatePosition(req, res) {
    // Position validation
    const result = await PositionDAO.createPosition({
      org: req.params.org || req.org,
      ...req.body,
    });
    console.log("We have created position!");
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: !result.server && result.error });
    }

    console.log("And there is no error!");
    return res.status(201).json({
      success: true,
      position: result.ops?result.ops:result,
      message: "New position created",
    });
  }

  static async apiGetPositions(req, res) {
    const result = await PositionDAO.getPositions({
      org: req.params.org || req.org,
      ...req.query,
    });
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: !result.server && result.error });
    }

    return res
      .status(200)
      .json({ success: true, total_results: result.length, positions: result });
  }

  static async apiGetPositionById(req, res) {
    const result = await PositionDAO.getPositionById(req.params.id);
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: !result.server && result.error });
    }

    return res.status(200).json({ success: true, position: result });
  }

  static async apiUpdatePosition(req, res) {
    const result = await PositionDAO.updatePosition({
      _id: req.params.id,
      ...req.body,
    });

    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: !result.server && result.error });
    }

    return res.status(200).json({ success: true, message: "Position updated" });
  }

  static async apiDeletePosition(req, res) {
    const result = await PositionDAO.deletePosition(req.params.id);
    if (result.error) {
      return res
        .status(result.server ? 500 : 400)
        .json({ success: false, error: !result.server && result.error });
    }

    return res.status(200).json({ success: true, message: "Position deleted" });
  }
}

module.exports = PositionController;
