import React from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import User, { UserWithId } from "@/interfaces/User"
import { useGetUsersQuery } from "@/features/api/apiSlice"

import { useAuth } from '../context/authContext';
import { authenticateRoleAddUser, authenticateRoleEditUser, authenticateRoleUsersInfo } from '../../hooks/useRoleAuth';
import { access } from "fs"

// internal interface needed to avoid TypeScript check warning for the DataGrid
//
interface TableRow extends User {
  _id: string;
}

const Users = () => {
  const { role, username } = useAuth();
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } = useGetUsersQuery({})

  const handleCellClick = (params: GridCellParams) => {
    const { _id: userId } = params.row
    if (editPermission) {
      navigate(`edit/${userId}`)
    }
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
      // { field: "_id", headerName: "ID", flex: 1 },
      { field: "username", headerName: "Username", flex: 0.5 },
      { field: "firstName", headerName: "First name", flex: 1 },
      { field: "lastName", headerName: "Last name", flex: 1 },
      { field: "email", headerName: "email", flex: 1 },
      { field: "phone", headerName: "Phone", flex: 1 },
      { field: "role", headerName: "Role", flex: 1 },
      // { field: "createdBy", headerName: "Created by", flex: 1 },
      // { field: "updatedBy", headerName: "Updated by", flex: 1 },
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<TableRow>
          slots={{ toolbar: GridToolbar }}
          rows={data.users}
          getRowId={(row) => (row as UserWithId)._id} 
          columns={columns}
          onCellClick={handleCellClick}
        />
      </Box>
    )
  }


  //    Role-based access control (RBAC):
  //
  // View Users:
  if (!authenticateRoleUsersInfo(role)) {
    return <p>Forbidden access - no permission to perform action</p>;
  }

  // CREATE User:
  const addPermission = authenticateRoleAddUser(role);

  // UPDATE User:
  const editPermission = authenticateRoleEditUser(role);

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Users" subtitle={`List of registered users: ${status}`}>
        {addPermission && <Action action="Add" url="/users/add" />}
      </Header>
      {content}
      
    </Box>
  )
}

export default Users
