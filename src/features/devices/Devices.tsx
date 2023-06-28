import React from "react"
import { useGetDevicesQuery } from "@/features/api/apiSlice"
import Header from "@/components/Header"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import HeaderAction from "@/components/HeaderAction"

const Devices = () => {
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetDevicesQuery({})

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
          rows={data.devices}
          getRowId={(row) => row._id}
          columns={[
            { field: "_id", headerName: "ID", flex: 1 },
            { field: "deviceName", headerName: "Name", flex: 0.5 },
            { field: "sessionStartTime", headerName: "Start", flex: 1 },
            { field: "sessionEndTime", headerName: "End", flex: 1 },
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
            { field: "coat", headerName: "Coat", flex: 1 },
            { field: "onTest", headerName: "On Test", flex: 1 },
            { field: "enzyme", headerName: "Enzyme", flex: 0.5 },
            { field: "testStation", headerName: "Station", flex: 0.5 },
          ]}
          checkboxSelection={true}
        />
      </Box>
    )
  }

  return (
    <Box>
      <Header title="Devices" subtitle={`List of devices: ${status}`}>
        <HeaderAction action="Add" url="/devices/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Devices
