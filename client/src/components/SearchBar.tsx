import { InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

function SearchBar({ value, onChange }: Props) {
  return (
    <TextField
      fullWidth
      label="Search for a crop..."
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: "ButtonText",
          },
        },
      }}
      InputLabelProps={{
        sx: {
          "&.Mui-focused": {
            color: "ButtonText",
          },
        },
      }}
    />
  );
}

export default SearchBar;
