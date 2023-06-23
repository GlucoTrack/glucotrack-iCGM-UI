import Header from "@/components/Header"
import { Box } from "@mui/material"
import React from "react"
import { useGetAveragesAndStdsQuery } from "@/features/api/apiSlice"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"

const Measurements = () => {
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetAveragesAndStdsQuery("lab020 lab021")
  console.log("🚀 ~ file: Measurements.tsx:10 ~ Measurements ~ data:", data)

  let content
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>Error: {JSON.stringify(error)}</p>
  } else if (isSuccess) {
    content = (
      <Box height={"75vh"}>
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={data.averagesAndStds}
          getRowId={(row) => row.name}
          columns={[
            { field: "name", headerName: "Name" },
            { field: "statistics", headerName: "Statistics" },
          ]}
        />
      </Box>
    )
  }

  return (
    <main>
      <Header
        title="Measurements"
        subtitle={`Queried measurements: ${status}`}
      />
      {content}
    </main>
  )
}

export default Measurements
