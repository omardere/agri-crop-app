import { Card, CardContent, Typography, CardMedia } from "@mui/material";
import type { Crop } from "../types/crop";
import { useNavigate } from "react-router-dom";

interface Props {
  crop: Crop;
}

function CropCard({ crop }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: 3,
        minWidth: 400,
        cursor: "pointer",
      }}
      onClick={() => navigate(`/crop/${crop.id}`)}
    >
      <CardMedia
        component="img"
        height="180"
        image={crop.image}
        alt={crop.name}
        sx={{ objectFit: "fill" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {crop.name}
        </Typography>
        <Typography variant="body2">
          <strong>Growing season:</strong> {crop.season}
        </Typography>
        <Typography variant="body2">
          <strong>Soil requirements:</strong> {crop.soil}
        </Typography>
        <Typography variant="body2">
          <strong>Average yield:</strong> {crop.yield}
        </Typography>
        <Typography variant="body2">
          <strong>Top producing countries:</strong> {crop.countries.join(", ")}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default CropCard;
