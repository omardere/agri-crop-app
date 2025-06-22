import { useEffect, useState } from "react";
import { Container, Grid, Box } from "@mui/material";
import type { Crop } from "../types/crop";
import SearchBar from "../components/SearchBar";
import CropCard from "../components/CropCard";

function Home() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/crops")
      .then((res) => res.json())
      .then((data) => setCrops(data));
  }, []);

  const filtered = crops.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: 'url("/bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 4,
      }}
    >
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <SearchBar value={search} onChange={setSearch} />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filtered.map((crop, index) => (
            <Grid
              sx={{ display: "flex" }}
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={index}
            >
              <CropCard crop={crop} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;
