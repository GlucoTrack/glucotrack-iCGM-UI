import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import {
  DataGrid,
  GridCellParams,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid"

import Header from "@/components/Header"
import HeaderAction from "@/components/HeaderAction"
import User from "@/interfaces/User"
import { useGetUsersQuery } from "@/features/api/apiSlice"

const Users = () => {
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetUsersQuery({})

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "userId", sort: "asc" },
  ])

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel)
  }

  const handleCellClick = (params: GridCellParams) => {
    const { _id: userId } = params.row
    navigate(`edit/${userId}`)
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
      { field: "userId", headerName: "ID", flex: 0.7 },      
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<User>
          slots={{ toolbar: GridToolbar }}
          rows={data.users}
          getRowId={(row) => row._id}
          columns={columns}
          onCellClick={handleCellClick}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Users" subtitle={`List of users: ${status}`}>
        <HeaderAction action="Add" url="/users/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Users
