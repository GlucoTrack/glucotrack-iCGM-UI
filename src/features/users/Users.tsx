import { Box } from "@mui/material"
import Header from "@/components/Header"
import Action from "@/components/HeaderAction"

const Users = () => {
  return (
    <Box>
      <Header title="Users" subtitle="Future user management page...">
        <Action action="Add" url="/users/add" />
      </Header>
    </Box>
  )
}

export default Users
