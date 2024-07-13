import React from "react"
import { useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { DataGrid, GridCellParams, GridToolbar } from "@mui/x-data-grid"

import Header from "@/components/Header"
import HeaderAction from "@/components/HeaderAction"
import Device from "@/interfaces/Device"
import { useGetDevicesQuery } from "@/features/api/apiSlice"

const Devices = () => {
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetDevicesQuery({})

  const handleCellClick = (params: GridCellParams) => {
    const { _id: deviceId } = params.row
    navigate(`edit/${deviceId}`)
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
      { field: "deviceName", headerName: "Name", flex: 0.5 },
      // { field: "sessionStartTime", headerName: "Start", flex: 1 },
      // { field: "sessionEndTime", headerName: "End", flex: 1 },
      {
        field: "measurementInterval",
        headerName: "Meas Int",
        flex: 0.5,
      },
      { field: "transmitDelay", headerName: "Delay", flex: 0.5 },
      {
        field: "checkParametersInterval",
        headerName: "Check Int",
        flex: 0.5,
      },
      { field: "pstatVoltage", headerName: "Voltage", flex: 0.6 },
      { field: "pstatTIA", headerName: "TIA", flex: 0.5 },
      { field: "glm", headerName: "GLM", flex: 0.5 },

      { field: "enzyme", headerName: "Enzyme", flex: 0.5 },
      { field: "testStation", headerName: "Station", flex: 0.5 },
      // { field: "coat", headerName: "Coat", flex: 1 },
      // { field: "onTest", headerName: "On Test", flex: 1 },
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<Device>
          slots={{ toolbar: GridToolbar }}
          rows={data.devices}
          getRowId={(row) => row._id}
          columns={columns}
          onCellClick={handleCellClick}
          sortModel={[{ field: "deviceName", sort: "asc" }]}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Devices" subtitle={`List of devices: ${status}`}>
        <HeaderAction action="Add" url="/devices/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Devices
