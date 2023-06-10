import React, { useMemo } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Box, CssBaseline, ThemeProvider } from "@mui/material"
import { createTheme, responsiveFontSizes } from "@mui/material/styles"

import themeSettings from "@/theme/themeSettings"
import Navbar from "@/components/Navbar"

function App() {
  let theme = useMemo(() => createTheme(themeSettings), [])
  theme = responsiveFontSizes(theme)

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box height="100%" width="100%" padding="1rem 2rem 4rem 2rem">
            <Navbar />
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/Devices" element={<div>Devices</div>} />
            </Routes>
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

export default App
