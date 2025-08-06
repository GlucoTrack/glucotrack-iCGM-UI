import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import { useGetUserGroupsQuery } from "@/features/api/apiSlice"
import { useDispatch } from "react-redux"
import { setUserGroup } from "@/features/userGroups/groupsSlice"
import UserGroup from "@/interfaces/UserGroup"

const UserGroups: React.FC = () => {
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
  } = useGetUserGroupsQuery({})

  const handleCellClick = (params: GridCellParams) => {
    const {
      _id: groupId,
      groupName,
      groupDescription,
      userIds,
    } = params.row

    dispatch(
      setUserGroup({
        groupName,
        groupDescription,
        userIds,
      }),
    )
    navigate(`${groupId}`)
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
      { field: "userIds", headerName: "Users", flex: 2 },
    ]

    content = (
      <Box height={"75vh"}>
        <DataGrid<UserGroup>
          slots={{ toolbar: GridToolbar }}
          rows={data}
          getRowId={(row) => row._id}
          columns={columns}
          onCellClick={handleCellClick}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="User Groups"
        subtitle={`List of groups: ${getGroupStatus}`}
      >
        <Action action="Add" url="add" />
      </Header>
      {content}
    </Box>
  )
}

export default UserGroups
