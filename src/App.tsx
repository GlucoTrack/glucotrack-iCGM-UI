import { useMemo } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Box, CssBaseline, ThemeProvider } from "@mui/material"
import { createTheme, responsiveFontSizes } from "@mui/material/styles"

import themeSettings from "@/theme/themeSettings"
import Layout from "@/features/layout/Layout"
import Home from "@/features/home/Home"
import Devices from "@/features/devices/Devices"
import AddDevice from "@/features/devices/AddDevice"
import EditDevice from "@/features/devices/EditDevice"
import Mobiles from "@/features/mobiles/Mobiles"
import AddMobile from "@/features/mobiles/AddMobile"
import EditMobile from "@/features/mobiles/EditMobile"
import Groups from "@/features/groups/Groups"
import AddGroup from "@/features/groups/AddGroup"
import EditGroup from "@/features/groups/EditGroup"
import Measurements from "@/features/measurements/Measurements"
import MobileGroups from "@/features/mobileGroups/MobileGroups"
import EditMobileGroup from "@/features/mobileGroups/EditMobileGroup"
import AddMobileGroup from "@/features/mobileGroups/AddMobileGroup"
import AnimalMeasurements from "@/features/animalMeasurements/AnimalMeasurements"
import RawMeasurements from "@/features/rawMeasurements/RawMeasurements"
import Users from "@/features/users/Users"
import New from "@/features/new/New"
import { useAppSelector } from "@/hooks/useStore"
import { SnackbarProvider } from "@/providers/SnackbarProvider"
import Firmwares from "@/features/firmwares/Firmwares"
import AddFirmware from "@/features/firmwares/AddFirmware"
import EditFirmware from "@/features/firmwares/EditFirmware"
import AddUser from "@/features/users/AddUser"
import EditUser from "@/features/users/EditUser"
import { ClerkProvider } from "@clerk/clerk-react"
import { dark } from "@clerk/themes"
import ProtectedRoute from "@/components/ProtectedRoute"
import AuthAsync from "@/components/AuthAsync"

import "./index.css"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file")
}

function App() {
  const mode = useAppSelector((state) => state.navbar.mode)
  let theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
  theme = responsiveFontSizes(theme)
  const isDarkMode = theme.palette.mode === "dark"
  const clerkApparance: { baseTheme?: typeof dark } = {}
  if (isDarkMode) {
    clerkApparance.baseTheme = dark
  }

  return (
    <ClerkProvider
      appearance={clerkApparance}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <AuthAsync />
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline />
          <BrowserRouter>
            <Box height="100%" width="100%">
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/devices/add" element={<AddDevice />} />
                  <Route
                    path="/devices/edit/:deviceId"
                    element={<EditDevice />}
                  />
                  <Route path="/mobiles" element={<Mobiles />} />
                  <Route path="/mobiles/add" element={<AddMobile />} />
                  <Route
                    path="/mobiles/edit/:mobileId"
                    element={<EditMobile />}
                  />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/add" element={<AddGroup />} />
                  <Route path="/groups/edit/:groupId" element={<EditGroup />} />
                  <Route path="/measurements" element={<Measurements />} />
                  <Route
                    path="/raw-measurements"
                    element={<RawMeasurements />}
                  />
                  <Route path="/mobile-groups" element={<MobileGroups />} />
                  <Route
                    path="/mobile-groups/add"
                    element={<AddMobileGroup />}
                  />
                  <Route
                    path="/mobile-groups/:groupId"
                    element={<EditMobileGroup />}
                  />
                  <Route
                    path="/animal-measurements"
                    element={<AnimalMeasurements />}
                  />
                  <Route path="/firmwares" element={<Firmwares />} />
                  <Route path="/firmwares/add" element={<AddFirmware />} />
                  <Route
                    path="/firmwares/edit/:firmwareId"
                    element={<EditFirmware />}
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={["org:admin"]}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/add"
                    element={
                      <ProtectedRoute allowedRoles={["org:admin"]}>
                        <AddUser />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/edit/:id"
                    element={
                      <ProtectedRoute allowedRoles={["org:admin"]}>
                        <EditUser />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/new" element={<New />} />
                </Route>
              </Routes>
            </Box>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default App
