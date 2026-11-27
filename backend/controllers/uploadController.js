const uploadVillageImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng chọn ảnh làng nghề.",
    });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  return res.status(201).json({
    success: true,
    url,
  });
};

module.exports = { uploadVillageImage };
