import { PaletteMode } from "@mui/material"

const themeSettings = (mode: PaletteMode) => {
  return {
    palette: {
      mode,
    },
    typography: {
      fontFamily: "Comfortaa",
    },
  }
}

export default themeSettings
