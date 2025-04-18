import * as React from "react"
import {
  AppBar,
  Box,
  IconButton,
  Modal,
  Toolbar,
  useTheme,
} from "@mui/material"
import {
  DarkModeOutlined,
  LightModeOutlined,
  SettingsOutlined,
} from "@mui/icons-material"
import MenuIcon from "@mui/icons-material/Menu"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import LogoutIcon from "@mui/icons-material/Logout"

import FlexBetweenCenter from "@/components/FlexBetweenCenter"
import { useAppDispatch } from "@/hooks/useStore"
import logoDarkMode from "@/images/dark-bg.png"
import logoLightMode from "@/images/light-bg.png"
import { setMode } from "@/features/navbar/navbarSlice"
import { useNavigate } from "react-router-dom"
import {
  SignIn,
  SignedOut,
  useClerk,
  SignedIn,
} from "@clerk/clerk-react"

interface NavbarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const loginModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const [isLoginOpen, setIsLoginOpen] = React.useState(false)
  const { signOut } = useClerk()
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
            <SignedOut>
              <IconButton onClick={() => setIsLoginOpen(true)}>
                <PersonOutlineIcon />
              </IconButton>
            </SignedOut>
            <SignedIn>
              <IconButton onClick={() => signOut()} aria-label="Logout">
                <LogoutIcon />
              </IconButton>
            </SignedIn>
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
      <Modal open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <Box sx={loginModalStyle}>
          <SignIn
            appearance={{
              elements: {
                footer: {
                  display: "none",
                },
              },
            }}
          />
        </Box>
      </Modal>
    </AppBar>
  )
}

export default Navbar
