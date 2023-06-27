import { Box, Typography } from "@mui/material"

type HeaderProps = {
  title: string
  subtitle: string
  children?: React.ReactNode
}

const Header = ({ title, subtitle, children }: HeaderProps) => {
  return (
    <Box display={"flex"} alignItems={"center"} my={"1.5rem"}>
      <Box flex={1}>
        <Typography variant="h4">{title}</Typography>
        <Typography>{subtitle}</Typography>
      </Box>
      <Box>{children}</Box>
    </Box>
  )
}

export default Header
