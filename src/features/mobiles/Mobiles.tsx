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
import Mobile from "@/interfaces/Mobile"
import { useGetMobilesQuery } from "@/features/api/apiSlice"

const Mobiles = () => {
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetMobilesQuery({})

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "mobileName", sort: "asc" },
  ])

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel)
  }

  const handleCellClick = (params: GridCellParams) => {
    const { _id: mobileId } = params.row
    navigate(`edit/${mobileId}`)
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
      { field: "mobileName", headerName: "Name", flex: 0.7 },
      {
        field: "lastSeen",
        headerName: "Last seen",
        flex: 1,
        valueFormatter: (params: { value: string }) => {
          if (!params.value) return "Never"
          return new Date(params.value).toLocaleString()
        },
      },
      // { field: "baseUri", headerName: "URI", flex: 1 },
      { field: "sensorName", headerName: "sName", flex: 0.7 },
      { field: "sensorId", headerName: "sID", flex: 1 },
      {
        field: "measurementInterval",
        headerName: "Meas",
        flex: 0.5,
      },
      {
        field: "reportInterval",
        headerName: "Report",
        flex: 0.5,
      },
      { field: "refMillivolts", headerName: "ref", flex: 0.5 },
      { field: "weMillivolts", headerName: "we", flex: 0.5 },
      { field: "filterLength", headerName: "Filter", flex: 0.5 },
      {
        field: "checkParametersInterval",
        headerName: "Check",
        flex: 0.5,
      },
      { field: "comment", headerName: "Comment", flex: 1 },
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<Mobile>
          slots={{ toolbar: GridToolbar }}
          rows={data}
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
      <Header title="Mobiles" subtitle={`List of mobiles: ${status}`}>
        <HeaderAction action="Add" url="/mobiles/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Mobiles
