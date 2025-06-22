const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const cropRoutes = require("./routes/crops");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// const port = new SerialPort({ path: "COM4", baudRate: 9600 });

// port.on("open", () => console.log("🔌 Serial Port Connected"));
// port.on("data", (data) => console.log("📨 From Arduino:", data.toString()));
// const parser = port.pipe(new Readline({ delimiter: "\n" }));
// parser.on("data", (line) => {
//   try {
//     const jsonData = JSON.parse(line.trim());
//     latestData = jsonData;
//   } catch (err) {
//     console.log("Invalid data from Arduino:", line);
//   }
// });

app.use("/api/crops", cropRoutes);

// app.get("/api/sensors", (req, res) => {
//   res.json(latestSensorData);
// });

// Command API
// app.post("/api/send-command", (req, res) => {
//   const { command } = req.body;
//   if (!command) return res.status(400).send("Missing command");
//   port.write(command + "\n", (err) => {
//     if (err) return res.status(500).send("Failed to send");
//     res.send("Command sent");
//   });
// });

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
