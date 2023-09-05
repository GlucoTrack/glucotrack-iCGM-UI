import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import { useGetGroupsQuery, useVerifyRoleAccessMutation } from "@/features/api/apiSlice"
import { useDispatch } from "react-redux"
import { setGroup } from "@/features/groups/groupsSlice"
import Group from "@/interfaces/Group"

import { useAuth } from '../context/authContext';
import { authenticateRoleAddGroup, authenticateRoleEditGroup, authenticateRoleGroupsInfo } from '../../hooks/useRoleAuth';
import { useEffect, useState } from "react"

const Groups: React.FC = () => {
  const { role, username } = useAuth();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    data,
    status: getGroupStatus,
    isFetching: isFetchingGroups,
    isLoading: isLoadingGroups,
    isSuccess: isSuccessGroups,
    isError: isErrorGroups,
    error: getGroupsError,
  } = useGetGroupsQuery({})

  // To check VIEW & WRITE permissions in  DB:
  const [verifyRoleAccess, { data: roleAccessData, isLoading: checkroleIsLoading }] = useVerifyRoleAccessMutation();
  const [readPermission, setReadPermission] = useState(false);
  const [writePermission, setWritePermission] = useState(false);

  const handleCellClick = (params: GridCellParams) => {
    const {
      _id: groupId,
      groupName,
      groupDescription,
      deviceNames,
    } = params.row
    const deviceNamesString = deviceNames.join(" ")

    dispatch(
      setGroup({
        groupName,
        groupDescription,
        deviceNames: deviceNamesString,
      }),
    )
    if (writePermission) {
    // if (editPermission) {
      navigate(`edit/${groupId}`)
    }
  }

  let content: JSX.Element | null = null

  if (isFetchingGroups) {
    content = <h3>Fetching...</h3>
  } else if (isLoadingGroups) {
    content = <h3>Loading...</h3>
  } else if (isErrorGroups) {
    content = <p>{JSON.stringify(getGroupsError)}</p>
  } else if (isSuccessGroups) {
    const columns = [
      { field: "groupName", headerName: "Name", flex: 1 },
      { field: "groupDescription", headerName: "Description", flex: 2 },
      { field: "deviceNames", headerName: "Devices", flex: 2 },
    ]

    content = (
      <Box height={"75vh"}>
        <DataGrid<Group>
          slots={{ toolbar: GridToolbar }}
          rows={data.groups}
          getRowId={(row) => row._id}
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
        { feature: 'Groups', levelOfAccess: 'Read' },
        { feature: 'Groups', levelOfAccess: 'Write' },
      ]);
    } else {
      setReadPermission(false);
      setWritePermission(false);
    }
  }, [role, verifyRoleAccess]);

  useEffect(() => {
    if (roleAccessData) {
      setReadPermission(roleAccessData?.results[0]);
      setWritePermission(roleAccessData?.results[1]);
    }
  }, [roleAccessData]);


  // CREATE Group:
  const addPermission = authenticateRoleAddGroup(role);

  // UPDATE Group:
  const editPermission = authenticateRoleEditGroup(role);
  

  //
  if (!readPermission) {    // using a DB query via API
  // if (!authenticateRoleGroupsInfo(role)) {
    return <p>Forbidden access - no permission to perform action</p>;
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Groups" subtitle={`List of groups: ${getGroupStatus}`}>
        {/* {addPermission && <Action action="Add" url="add" />} */}
        {writePermission && <Action action="Add" url="add" />}
      </Header>
      {content}
    </Box>
  )
}

export default Groups
