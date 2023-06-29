import { useNavigate } from "react-router-dom"
import { Box, IconButton } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"
import { DeleteOutlined } from "@mui/icons-material"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import {
  useDeleteGroupMutation,
  useGetGroupsQuery,
} from "@/features/api/apiSlice"
import { useDispatch } from "react-redux"
import { setGroup } from "@/features/groups/groupsSlice"

interface Group {
  _id: string
  groupName: string
  groupDescription: string
  deviceNames: string
}

const Groups: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    data,
    status: getGroupStatus,
    isFetching: isFetchingGroups,
    isLoading: isLoadingGroups,
    isSuccess: isSuccessGroups,
    isError: isErrorGroups,
    error: getGroupsError,
  } = useGetGroupsQuery({})
  const [
    deleteGroup,
    { isLoading: isDeletingGroup, isError: isDeleteError, error: deleteError },
  ] = useDeleteGroupMutation()

  const handleCellClick = (params: GridCellParams) => {
    if (
      params.field === "groupName" ||
      params.field === "groupDescription" ||
      params.field === "deviceNames"
    ) {
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
  }

  const handleDeleteClick = async (groupId: string) => {
    try {
      await deleteGroup(groupId)
    } catch (error) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null

  if (isFetchingGroups) {
    content = <h3>Fetching...</h3>
  } else if (isLoadingGroups || isDeletingGroup) {
    content = <h3>Loading...</h3>
  } else if (isErrorGroups || isDeleteError) {
    content = (
      <p>{JSON.stringify(isErrorGroups ? getGroupsError : deleteError)}</p>
    )
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

  return (
    <Box>
      <Header title="Groups" subtitle={`List of groups: ${getGroupStatus}`}>
        <Action action="Add" url="add" />
      </Header>
      {content}
    </Box>
  )
}

export default Groups
