import * as React from "react"
import { styled, useTheme } from "@mui/material/styles"
import Drawer from "@mui/material/Drawer"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import List from "@mui/material/List"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined"
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined"
import GroupWorkOutlinedIcon from "@mui/icons-material/GroupWorkOutlined"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined"

import logoDarkMode from "@/images/dark-bg.png"
import logoLightMode from "@/images/light-bg.png"
import FlexBetweenCenter from "@/components/FlexBetween"
import Header from "@/components/Header"

const drawerWidth = 240

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}))

export default function PersistentDrawerLeft() {
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index)
  }

  return (
    <FlexBetweenCenter>
      <AppBar position="fixed" open={open} color="transparent">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <img
            src={theme.palette.mode === "dark" ? logoDarkMode : logoLightMode}
            alt={
              theme.palette.mode === "dark" ? "logoDarkMode" : "logoLightMode"
            }
            height={40}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {["Home"].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                onClick={(event) => handleListItemClick(event, 0)}
                selected={selectedIndex === 0}
              >
                <ListItemIcon>
                  <HomeOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Devices", "Groups", "Measurements"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                onClick={(event) => handleListItemClick(event, index + 1)}
                selected={selectedIndex === index + 1}
              >
                <ListItemIcon>
                  {index === 0 ? (
                    <DeviceThermostatOutlinedIcon />
                  ) : index === 1 ? (
                    <GroupWorkOutlinedIcon />
                  ) : (
                    <ShowChartOutlinedIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Users"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                onClick={(event) => handleListItemClick(event, index + 4)}
                selected={selectedIndex === index + 4}
              >
                <ListItemIcon>
                  <GroupOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {/* <Header title="Title Test" /> */}
        {/* <Typography paragraph>Subheading</Typography> */}
      </Main>
    </FlexBetweenCenter>
  )
}
