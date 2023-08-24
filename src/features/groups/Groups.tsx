import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import { useGetGroupsQuery } from "@/features/api/apiSlice"
import { useDispatch } from "react-redux"
import { setGroup } from "@/features/groups/groupsSlice"
import Group from "@/interfaces/Group"

import { useAuth } from '../context/authContext';
import { authenticateRoleGroupsInfo } from '../../hooks/useRoleAuth';

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
    navigate(`edit/${groupId}`)
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

  // // Role-based access control (RBAC):
  // //
  if (!authenticateRoleGroupsInfo(role)) {
    return <p>Forbidden access - no permission to perform action</p>;
  }
  
  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <p>
        Welcome, {username}. <br></br>
        Role: {role}
      </p>
      <Header title="Groups" subtitle={`List of groups: ${getGroupStatus}`}>
        <Action action="Add" url="add" />
      </Header>
      {content}
    </Box>
  )
}

export default Groups
