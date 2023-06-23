import { Box, Typography } from "@mui/material"

type HeaderProps = {
  title: string
  subtitle: string
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <Box my={"1.5rem"}>
      <Typography variant="h4">{title}</Typography>
      <Typography>{subtitle}</Typography>
    </Box>
  )
}

export default Header
