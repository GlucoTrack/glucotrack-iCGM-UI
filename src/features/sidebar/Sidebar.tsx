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
  useTheme,
} from "@mui/material"
import {
  ChevronLeft,
  DataSaverOn,
  DeviceThermostatOutlined,
  GroupOutlined,
  GroupWorkOutlined,
  HomeOutlined,
  MobileFriendlyOutlined,
  TimelineOutlined,
} from "@mui/icons-material"
import FlexBetweenCenter from "@/components/FlexBetweenCenter"
import { useUser, useAuth, useOrganizationList } from "@clerk/clerk-react"

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
    text: "Device Groups",
    icon: <GroupWorkOutlined />,
    path: "groups",
  },
  {
    text: "Device Measurements",
    icon: <TimelineOutlined />,
    path: "measurements",
  },
  {
    text: "Divider",
    icon: null,
  },
  {
    text: "Mobiles",
    icon: <MobileFriendlyOutlined />,
  },
  {
    text: "Mobile Groups",
    icon: <GroupWorkOutlined />,
    path: "mobile-groups",
  },
  {
    text: "Mobile Measurements",
    icon: <TimelineOutlined />,
    path: "animal-measurements",
  },
  {
    text: "Raw Measurements",
    icon: <TimelineOutlined />,
    path: "raw-measurements",
  },
  {
    text: "Divider",
    icon: null,
  },
  {
    text: "Firmwares",
    icon: <DataSaverOn />,
    path: "firmwares",
  },
  {
    text: "Divider",
    icon: null,
    requireRole: ["org:admin"],
  },
  {
    text: "Users",
    icon: <GroupOutlined />,
    path: "users",
    requireRole: ["org:admin"],
  },
  {
    text: "Raw User Measurements",
    icon: <TimelineOutlined />,
    path: "raw-user-measurements",
    requireRole: ["org:admin"],
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
  const theme = useTheme()
  const { pathname } = useLocation()
  const [active, setActive] = useState("")
  const { isSignedIn } = useUser()
  const { orgRole } = useAuth()
  const {
    userMemberships,
    setActive: setActiveOrg,
    isLoaded: isOrgListLoaded,
  } = useOrganizationList({
    userMemberships: true,
  })

  useEffect(() => {
    if (!isOrgListLoaded || !isSignedIn) return

    if (!orgRole && userMemberships.data.length > 0) {
      // If there is no active role, I set the first organization as active
      // TODO: set the id in the .env
      setActiveOrg({ organization: userMemberships.data[0].organization.id })
    }
  }, [isOrgListLoaded, userMemberships, setActiveOrg, orgRole, isSignedIn])

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
              transition: "width 1.5s ease",
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
              {navItems.map(({ text, icon, path, requireRole }, index) => {
                if (requireRole && requireRole.length > 0) {
                  if (!isSignedIn || !requireRole.includes(orgRole as string))
                    return null
                }

                if (!icon) {
                  return (
                    <Divider
                      key={index}
                      sx={{ backgroundColor: theme.palette.divider }}
                    />
                  )
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
                        sx={{
                          ml: "0.5rem",
                          color:
                            active === lcText
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          color:
                            active === lcText
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                        }}
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
