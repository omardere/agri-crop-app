const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/crops.json");

function readCropsFromFile() {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// GET all crops
exports.getAllCrops = (req, res) => {
  const crops = readCropsFromFile();
  res.json(crops);
};

// GET crop by ID
exports.getCropById = (req, res) => {
  const crops = readCropsFromFile();
  const crop = crops.find((c) => c.id === req.params.id);
  if (!crop) {
    return res.status(404).json({ message: "Crop not found" });
  }
  res.json(crop);
};
