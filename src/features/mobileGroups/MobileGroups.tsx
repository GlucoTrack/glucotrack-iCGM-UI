import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar} from "@mui/x-data-grid"


import Header from "@/components/Header"
import Action from "@/components/HeaderAction"
import { useGetMobileGroupsQuery } from "@/features/api/apiSlice"
import { useDispatch } from "react-redux"
import { setMobileGroup } from "@/features/mobileGroups/groupsSlice"
import MobileGroup from "@/interfaces/MobileGroup"


const MobileGroups: React.FC = () => {
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
  } = useGetMobileGroupsQuery({})

  const handleCellClick = (params: GridCellParams) => {
    const {
      _id: groupId,
      mobileGroupName,
      mobileGroupDescription,
      mobileNames,
    } = params.row

    dispatch(
      setMobileGroup({
        mobileGroupName,
        mobileGroupDescription,
        mobileNames,
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
      { field: "mobileGroupName", headerName: "Name", flex: 1 },
      { field: "mobileGroupDescription", headerName: "Description", flex: 2 },
      { field: "mobileNames", headerName: "Mobiles", flex: 2 },
    ]

    content = (
      <Box height={"75vh"}>
        <DataGrid<MobileGroup>
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
      <Header title="Mobile Groups" subtitle={`List of groups: ${getGroupStatus}`}>
        <Action action="Add" url="add" />
      </Header>
      {content}
    </Box>
  )
}

export default MobileGroups

