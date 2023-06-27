import * as React from "react"
import { AppBar, IconButton, Toolbar, useTheme } from "@mui/material"
import {
  DarkModeOutlined,
  LightModeOutlined,
  SettingsOutlined,
} from "@mui/icons-material"
import MenuIcon from "@mui/icons-material/Menu"

import FlexBetweenCenter from "@/components/FlexBetweenCenter"
import { useAppDispatch } from "@/hooks/useStore"
import logoDarkMode from "@/images/dark-bg.png"
import logoLightMode from "@/images/light-bg.png"
import { setMode } from "@/features/navbar/navbarSlice"
import { useNavigate } from "react-router-dom"

interface NavbarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  return (
    <AppBar
      sx={{
        position: "static",
        background: "none",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <FlexBetweenCenter sx={{ width: "100%" }}>
          {/* LEFT SIDE */}
          <FlexBetweenCenter>
            {!isSidebarOpen && (
              <IconButton
                aria-label="open drawer"
                edge="start"
                sx={{ mr: 2 }}
                // sx={{ mr: 2, ...(open && { display: "none" }) }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <img
              src={theme.palette.mode === "dark" ? logoDarkMode : logoLightMode}
              alt={
                theme.palette.mode === "dark" ? "logoDarkMode" : "logoLightMode"
              }
              height={40}
              onClick={() => {
                navigate(`home`)
              }}
            />
          </FlexBetweenCenter>

          {/* RIGHT SIDE */}
          <FlexBetweenCenter gap="1.5rem">
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlined />
              ) : (
                <LightModeOutlined />
              )}
            </IconButton>
            <IconButton>
              <SettingsOutlined />
            </IconButton>
          </FlexBetweenCenter>
        </FlexBetweenCenter>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
