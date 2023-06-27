import { AddOutlined, EditOutlined } from "@mui/icons-material"
import { Box, Button } from "@mui/material"
import React from "react"

type ActionProps = {
  type: "Create" | "Edit"
}

const Action = ({ type }: ActionProps) => {
  return (
    <Box display={"flex"} alignItems={"center"}>
      <Button
        variant="contained"
        startIcon={type === "Create" ? <AddOutlined /> : <EditOutlined />}
      >
        {type}
      </Button>
    </Box>
  )
}

export default Action
