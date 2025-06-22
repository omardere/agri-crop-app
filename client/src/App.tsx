import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CropDetails from "./pages/CropDetails";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/crop/:id" element={<CropDetails />} />
    </Routes>
  </Router>
);

export default App;
