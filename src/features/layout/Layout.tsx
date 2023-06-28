import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Box, useMediaQuery } from "@mui/material"

import Navbar from "@/features/navbar/Navbar"
import Sidebar from "@/features/sidebar/Sidebar"
import Footer from "@/components/Footer"

const Layout = () => {
  const drawerWidth: string = "220px"
  const isNonMobile = useMediaQuery("(min-width: 600px)")
  const [isSideBarOpen, setIsSideBarOpen] = useState(true)
  return (
    <Box height="100%" width="100%" display="flex">
      {isNonMobile && (
        <Sidebar
          drawerWidth={drawerWidth}
          isNonMobile={isNonMobile}
          isSidebarOpen={isSideBarOpen}
          setIsSidebarOpen={setIsSideBarOpen}
        />
      )}
      <Box
        height="100%"
        width="100%"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <Navbar
          isSidebarOpen={isSideBarOpen}
          setIsSidebarOpen={setIsSideBarOpen}
        />
        <Box height="100%" width="100%" px="1.5rem" overflow="auto">
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}

export default Layout
