import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  // useTheme,
} from "@mui/material"
import {
  ChevronLeft,
  DeviceThermostatOutlined,
  GroupOutlined,
  GroupWorkOutlined,
  HomeOutlined,
  TimelineOutlined,
  TipsAndUpdatesOutlined,
} from "@mui/icons-material"
import FlexBetweenCenter from "@/components/FlexBetweenCenter"

const navItems = [
  {
    text: "Home",
    icon: <HomeOutlined />,
  },
  {
    text: "Divider",
    icon: null,
  },
  {
    text: "Devices",
    icon: <DeviceThermostatOutlined />,
  },
  {
    text: "Groups",
    icon: <GroupWorkOutlined />,
  },
  {
    text: "Measurements",
    icon: <TimelineOutlined />,
  },
  {
    text: "Animal",
    icon: <TimelineOutlined />,
    path: "animal-measurements",
  },
  {
    text: "Divider",
    icon: null,
  },
  {
    text: "Users",
    icon: <GroupOutlined />,
  },
  {
    text: "Divider",
    icon: null,
  },
  {
    text: "New",
    icon: <TipsAndUpdatesOutlined />,
  },
]

interface SidebarProps {
  drawerWidth: string
  isNonMobile: boolean
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  isNonMobile,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const navigate = useNavigate()
  // const theme = useTheme()
  const { pathname } = useLocation()
  const [active, setActive] = useState("")

  useEffect(() => {
    setActive(pathname.substring(1))
  }, [pathname])

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetweenCenter>
                <Box display="flex" alignItems="center" gap="0.5rem"></Box>
                <IconButton
                  aria-label="close drawer"
                  edge="end"
                  sx={{ my: 0, py: 0 }}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <ChevronLeft />
                </IconButton>
              </FlexBetweenCenter>
            </Box>

            <Divider />

            <List>
              {navItems.map(({ text, icon, path }, index) => {
                if (!icon) {
                  return <Divider key={index} />
                }

                const lcText = path ? path : text.toLowerCase()

                return (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${lcText}`)
                        setActive(lcText)
                      }}
                      sx={{
                        backgroundColor:
                          active === lcText ? "blueGrey" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={
                          {
                            //   ml: "0.5rem",
                            //   color:
                            //     active === lcText
                            //       ? theme.palette.primary
                            //       : theme.palette.secondary,
                          }
                        }
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText
                        color={active === lcText ? "red" : "blue"}
                        primary={text}
                      ></ListItemText>
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  )
}

export default Sidebar
