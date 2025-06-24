import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Crop } from "../types/crop";

interface SensorData {
  temperature: number;
  soilMoisture: string;
  lightLevel: number;
  flowRate: number;
  fanOn: boolean;
}

const CropDetailsPage = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [mode, setMode] = useState<"MODE_AUTO" | "MODE_MANUAL">("MODE_AUTO");
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(false);

  const controls = [
    { label: "Fan", on: "FAN_ON", off: "FAN_OFF" },
    { label: "Water Pump", on: "WATER_ON", off: "WATER_OFF" },
    { label: "Fertilizer", on: "FERTILIZER_ON", off: "FERTILIZER_OFF" },
    { label: "Rain Pump", on: "RAIN_ON", off: "RAIN_OFF" },
    { label: "Light", on: "LIGHT_ON", off: "LIGHT_OFF" },
    { label: "Heater", on: "HEATER_ON", off: "HEATER_OFF" },
    { label: "Window", on: "WINDOW_OPEN", off: "WINDOW_CLOSE" },
  ];

  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/sensors");
      const data = await res.json();
      setSensorData(data);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/crops/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setCrop(res);
      });
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "MODE_AUTO") {
      fetchSensorData();
      interval = setInterval(fetchSensorData, 3000); // fetch every 3 seconds
    }
    return () => clearInterval(interval);
  }, [mode]);

  const sendCommand = async (cmd: string) => {
    try {
      await axios.post("http://localhost:5000/api/send-command", {
        command: cmd,
      });
    } catch (err) {
      console.error(err);
      //   alert("Error sending command");
    }
  };

  const toggleControl = async (
    label: string,
    onCmd: string,
    offCmd: string
  ) => {
    const isOn = states[label] ?? false;
    const command = isOn ? offCmd : onCmd;

    try {
      sendCommand(command);

      setStates((prev) => ({ ...prev, [label]: !isOn }));
    } catch {
      console.error("Failed to send command:", command);
    }
  };

  if (crop === null) return <Typography p={4}>Loading...</Typography>;
  return (
    <Box p={3}>
      <Card sx={{ padding: 3 }}>
        <CardMedia
          component="img"
          height="250"
          image={crop.image}
          alt={crop.name}
          sx={{ objectFit: "fill" }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {crop.name}
          </Typography>

          <Typography>Season: {crop.season}</Typography>
          <Typography>Soil: {crop.soil}</Typography>
          <Typography>Yield: {crop.yield}</Typography>
          <Typography>Top Countries: {crop.countries}</Typography>
        </CardContent>
        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setMode("MODE_AUTO");
              sendCommand("MODE_AUTO");
            }}
            sx={{ mr: 2 }}
            disabled={mode === "MODE_AUTO"}
          >
            Auto Mode
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setMode("MODE_MANUAL");
              sendCommand("MODE_MANUAL");
            }}
            disabled={mode === "MODE_MANUAL"}
          >
            Manual Mode
          </Button>
        </Box>

        {mode === "MODE_MANUAL" && (
          <Grid container spacing={2} mt={2}>
            {controls.map(({ label, on, off }) => {
              const isOn = states[label] ?? false;
              return (
                <Button
                  key={label}
                  className={`h-12 text-white rounded-lg transition ${
                    isOn
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  sx={{
                    backgroundColor: isOn ? "green" : "red",
                    color: "white",
                  }}
                  onClick={() => toggleControl(label, on, off)}
                >
                  {label}: {isOn ? "ON" : "OFF"}
                </Button>
              );
            })}
          </Grid>
        )}
        {mode === "MODE_AUTO" &&
          (loading && !sensorData ? (
            <CircularProgress />
          ) : (
            <Grid sx={{ mt: 2 }} container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Temperature</Typography>
                    <Typography>
                      {sensorData?.temperature ?? "--"} °C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Soil</Typography>
                    <Typography>{sensorData?.soilMoisture ?? "--"}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Light</Typography>
                    <Typography>{sensorData?.lightLevel ?? "--"}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Flow Rate</Typography>
                    <Typography>
                      {sensorData?.flowRate ?? "--"} L/min
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Fan Status</Typography>
                    <Typography>{sensorData?.fanOn ? "On" : "Off"} </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ))}
      </Card>
    </Box>
  );
};

export default CropDetailsPage;
