import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import User, { UserWithId } from "@/interfaces/User"
import { useGetUsersQuery, useVerifyRoleAccessMutation } from "@/features/api/apiSlice"

import { useAuth, hasPermission } from '../context/authContext';
import { authenticateRoleAddUser, authenticateRoleEditUser, authenticateRoleUsersInfo } from '../../hooks/useRoleAuth';
import { access } from "fs"

// internal interface needed to avoid TypeScript check warning for the DataGrid
//
interface TableRow extends User {
  _id: string;
}

const Users = () => {
  const { role, username, permissions } = useAuth();
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } = useGetUsersQuery({})

  // To check VIEW & WRITE permissions in  DB:
  const [verifyRoleAccess, { data: roleAccessData, isLoading: checkroleIsLoading }] = useVerifyRoleAccessMutation();
  const [readPermission, setReadPermission] = useState(false);
  const [writePermission, setWritePermission] = useState(false);

  // const canReadUsers = hasPermission(permissions, 'Users', 'Read');    // check local cache
  // const canWriteUsers = hasPermission(permissions, 'Users', 'Write');
  //

  const [loading, setLoading] = useState(true);

  const handleCellClick = (params: GridCellParams) => {
    const { _id: userId } = params.row
    // if (editPermission) {
    if (writePermission) {
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


  // ----------   Role-based access control (RBAC): ------------- //
  //

  // Option B: These logic verifies in the DataBase if the given role has permissions for the given feature/access:
  //
  useEffect(() => {
    if (role) {
      verifyRoleAccess([
        { feature: 'Users', levelOfAccess: 'Read' },
        { feature: 'Users', levelOfAccess: 'Write' },
      ]);
    } else {
      setReadPermission(false);
      setWritePermission(false);
      setLoading(false);
    }
  }, [role, verifyRoleAccess]);

  useEffect(() => {
    if (roleAccessData) {
      setReadPermission(roleAccessData?.results[0]);
      setWritePermission(roleAccessData?.results[1]);
      setLoading(false);
    }
  }, [roleAccessData]);

  //const viewPermission = roleAccessData?.results[0];    // deprecated -> now managed as state variables!
  //const writePermission = roleAccessData?.results[1];

  ////
  
  // Option A: these methods verify with local functions (in 'useRoleAuth.ts') the permissions by role -> render UI!
  //
  // CREATE User:
  const addPermission = authenticateRoleAddUser(role);    
  // UPDATE User:
  const editPermission = authenticateRoleEditUser(role);
  ////


  // ------------------   Render  ------------------ //

  if (loading) {
    return <p>Loading...</p>;
  }

  //
  // if (!authenticateRoleUsersInfo(role)) {    // using 'useRoleAuth.ts'
  if (!readPermission) {    // using a DB query via API
    return <p>Forbidden access - no permission to perform action</p>;
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Users" subtitle={`List of registered users: ${status}`}>
        {writePermission && <Action action="Add" url="/users/add" />}
        {/* {addPermission && <Action action="Add" url="/users/add" />} */}
      </Header>
      {content}
      
    </Box>
  )
}

export default Users
