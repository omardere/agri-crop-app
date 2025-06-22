import axios from "axios";

export const getCrops = () => axios.get("http://localhost:5000/crops");
export const getSensorData = () => axios.get("http://localhost:5000/sensors");
