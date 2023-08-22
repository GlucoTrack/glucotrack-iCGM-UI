import React from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import User from "@/interfaces/User"
import { useGetUsersQuery } from "@/features/api/apiSlice"

const Users = () => {
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } = useGetUsersQuery({})

  const handleCellClick = (params: GridCellParams) => {
    const { _id: userId } = params.row
    //navigate(`edit/${userId}`)
  }

  let content: JSX.Element | null = null
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  } else if (isSuccess) {
    const columns = [
      { field: "_id", headerName: "ID", flex: 1 },
      { field: "username", headerName: "Name", flex: 0.5 },
      { field: "password", headerName: "Start", flex: 1 },
      { field: "firstName", headerName: "End", flex: 1 },
      { field: "lastName", headerName: "End", flex: 1 },
      { field: "email", headerName: "End", flex: 1 },
      { field: "phone", headerName: "End", flex: 1 },
      { field: "role", headerName: "End", flex: 1 },
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<User>
          slots={{ toolbar: GridToolbar }}
          rows={data.users}
          getRowId={(row) => row._id}
          columns={columns}
          onCellClick={handleCellClick}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Users" subtitle={`List of registered users: ${status}`}>
        <Action action="Add" url="/users/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Users
