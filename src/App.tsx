import { useMemo } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Box, CssBaseline, ThemeProvider } from "@mui/material"
import { createTheme, responsiveFontSizes } from "@mui/material/styles"

import themeSettings from "@/theme/themeSettings"
import Layout from "@/features/layout/Layout"
import Home from "@/features/home/Home"
import Devices from "@/features/devices/Devices"
import AddDevice from "./features/devices/AddDevice"
import AddUser from "./features/users/AddUser"
import EditDevice from "./features/devices/EditDevice"
import Groups from "@/features/groups/Groups"
import AddGroup from "./features/groups/AddGroup"
import EditGroup from "@/features/groups/EditGroup"
import Measurements from "@/features/measurements/Measurements"
import Users from "@/features/users/Users"
import EditUser from "@/features/users/EditUser"
import New from "@/features/new/New"
import { useAppSelector } from "@/hooks/useStore"
import ResetPassword from "./features/users/ResetPassword"
import Login from "./features/users/Login"
import { AuthProvider } from './features/context/authContext';

function App() {
  const mode = useAppSelector((state) => state.navbar.mode)
  let theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
  theme = responsiveFontSizes(theme)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box height="100%" width="100%">
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/devices/add" element={<AddDevice />} />
                <Route path="/devices/edit/:deviceId" element={<EditDevice />} />
                <Route path="groups" element={<Groups />} />
                <Route path="/groups/add" element={<AddGroup />} />
                <Route path="/groups/edit/:groupId" element={<EditGroup />} />
                <Route path="/measurements" element={<Measurements />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/add" element={<AddUser />} />
                <Route path="/users/resetpassword" element={<ResetPassword />} />
                <Route path="/users/login" element={<Login />} />
                <Route path="/users/edit/:userId" element={<EditUser />} />
                <Route path="/new" element={<New />} />
              </Route>
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
