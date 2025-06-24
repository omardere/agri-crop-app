const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cropRoutes = require("./routes/crops");

const app = express();
const PORT = 5000;

// ✅ Declare the variable to store latest sensor data
let latestSensorData = null;

app.use(cors());
app.use(express.json());

// ✅ Replace with your actual serial port (e.g., COM6 on Windows)
const port = new SerialPort({ path: "COM6", baudRate: 9600 });

port.on("open", () => console.log("🔌 Serial Port Connected"));
port.on("data", (data) => console.log("📨 Raw From Arduino:", data.toString()));

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (line) => {
  try {
    const jsonData = JSON.parse(line.trim());
    latestSensorData = jsonData; // ✅ Store the latest data globally
    console.log("📡 Parsed Sensor Data:", jsonData);
  } catch (err) {
    console.log("❌ Invalid data from Arduino:", line);
  }
});

app.use("/api/crops", cropRoutes);

// ✅ Endpoint to get the latest sensor data
app.get("/api/sensors", (req, res) => {
  if (!latestSensorData) {
    return res.status(503).json({ error: "Sensor data not yet available" });
  }
  res.json(latestSensorData);
});

// ✅ Send a command to the Arduino
app.post("/api/send-command", (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).send("Missing command");

  port.write(command + "\n", (err) => {
    if (err) return res.status(500).send("Failed to send");
    res.send("Command sent");
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
