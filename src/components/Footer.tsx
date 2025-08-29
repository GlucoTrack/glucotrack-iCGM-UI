import { Box } from "@mui/material"

declare const __APP_VERSION__: string

const Footer = () => {
  return (
    <Box bottom={0} width="100%" position="fixed" textAlign="center">
      <h4>Glucotrack Confidential and Proprietary (v{__APP_VERSION__})</h4>
    </Box>
  )
}

export default Footer
