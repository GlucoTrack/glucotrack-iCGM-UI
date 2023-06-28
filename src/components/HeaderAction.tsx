import React from "react"
import { useNavigate } from "react-router-dom"
import { AddOutlined, EditOutlined } from "@mui/icons-material"
import { Box, Button } from "@mui/material"

type HeaderActionProps = {
  action: "Add" | "Edit"
  url: string
}

const HeaderAction = ({ action, url }: HeaderActionProps) => {
  const navigate = useNavigate()

  const handleHeaderActionClick = () => {
    navigate(url)
  }

  return (
    <Box display={"flex"} alignItems={"center"}>
      <Button
        variant="contained"
        startIcon={action === "Add" ? <AddOutlined /> : <EditOutlined />}
        onClick={handleHeaderActionClick}
      >
        {action}
      </Button>
    </Box>
  )
}

export default HeaderAction
