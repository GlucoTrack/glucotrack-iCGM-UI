import Header from "@/components/Header"
import { Box } from "@mui/material"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import { useGetGroupsQuery } from "@/features/api/apiSlice"
import Action from "@/components/HeaderAction"

const Groups = () => {
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetGroupsQuery({})

  let content
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  } else if (isSuccess) {
    content = (
      <Box height={"75vh"}>
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={data.groups}
          getRowId={(row) => row._id}
          columns={[
            { field: "groupName", headerName: "Name", flex: 1 },
            { field: "groupDescription", headerName: "Description", flex: 2 },
            { field: "deviceNames", headerName: "Devices", flex: 2 },
          ]}
          checkboxSelection={true}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Header title="Groups" subtitle={`List of groups: ${status}`}>
        <Action action="Add" url="/groups/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Groups
