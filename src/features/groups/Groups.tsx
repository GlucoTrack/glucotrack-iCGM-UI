import { useNavigate } from "react-router-dom"
import { Box, IconButton } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"
import { EditOutlined } from "@mui/icons-material"

import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import { useGetGroupsQuery } from "@/features/api/apiSlice"
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
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetGroupsQuery({})

  let content: JSX.Element | null = null
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  } else if (isSuccess) {
    const handleEditClick = ({ row }: GridCellParams) => {
      const { _id: groupId, groupName, groupDescription, deviceNames } = row
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

    const columns = [
      { field: "groupName", headerName: "Name", flex: 1 },
      { field: "groupDescription", headerName: "Description", flex: 2 },
      { field: "deviceNames", headerName: "Devices", flex: 2 },
      {
        field: "edit",
        headerName: "Edit",
        flex: 1,
        sortable: false,
        renderCell: (params: GridCellParams) => (
          <IconButton
            aria-label="edit group"
            edge="end"
            onClick={() => handleEditClick(params)}
          >
            <EditOutlined />
          </IconButton>
        ),
      },
    ]

    content = (
      <Box height={"75vh"}>
        <DataGrid<Group>
          slots={{ toolbar: GridToolbar }}
          rows={data.groups}
          getRowId={(row) => row._id}
          columns={columns}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Header title="Groups" subtitle={`List of groups: ${status}`}>
        <Action action="Add" url="add" />
      </Header>
      {content}
    </Box>
  )
}

export default Groups
