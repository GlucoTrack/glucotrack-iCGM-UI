import { useMemo } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Box, CssBaseline, ThemeProvider } from "@mui/material"
import { createTheme, responsiveFontSizes } from "@mui/material/styles"

import themeSettings from "@/theme/themeSettings"
import Layout from "@/features/layout/Layout"
import Home from "@/features/home/Home"
import Devices from "@/features/devices/Devices"
import Groups from "@/features/groups/Groups"
import Measurements from "@/features/measurements/Measurements"
import Users from "@/features/users/Users"
import New from "@/features/new/New"
import { useAppSelector } from "@/hooks/useStore"

function App() {
  const mode = useAppSelector((state) => state.navbar.mode)
  let theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
  theme = responsiveFontSizes(theme)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box height="100%" width="100%">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/measurements" element={<Measurements />} />
              <Route path="/users" element={<Users />} />
              <Route path="/new" element={<New />} />
            </Route>
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
