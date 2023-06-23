import { Box, Typography } from "@mui/material"

const Header = ({ title, subtitle }) => {
  return (
    <Box my={"1.5rem"}>
      <Typography variant="h4">{title}</Typography>
      <Typography>{subtitle}</Typography>
    </Box>
  )
}

export default Header
