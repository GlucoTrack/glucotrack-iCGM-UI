import Header from "@/components/Header"
import { Box } from "@mui/material"
import React from "react"
import { useGetAveragesAndStdsQuery } from "@/features/api/apiSlice"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import MeasurementForm from "./MeasurementForm"

const Measurements: React.FC = () => {
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetAveragesAndStdsQuery({
      deviceNames: "lab020 lab021 lab022",
      startDate: "2023-04-10",
      endDate: "2023-04-11",
      startTime: "23:29:00",
      endTime: "23:59:59",
    })

  let content: JSX.Element | null = null
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>Error: {JSON.stringify(error)}</p>
  } else if (isSuccess) {
    console.log(
      "🚀 ~ file: Measurements.tsx:10 ~ Measurements ~ data:",
      data.averagesAndStds,
    )

    // const columns = [
    //   { field: "name", headerName: "Name" },
    //   { field: "date", headerName: "Name" },
    // ]

    // const rows = []

    content = (
      <Box height={"75vh"}>
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={data.averagesAndStds}
          getRowId={(row) => row.name}
          columns={[
            { field: "name", headerName: "Name" },
            {
              field: "statistics",
              headerName: "Date",
              renderCell: (params) => (
                <ul>
                  {params.value.map((value: any, index: number) => (
                    <li key={index}>{value.date}</li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Measurements"
        subtitle={`Queried measurements: ${status}`}
      />
      <MeasurementForm />
      {content}
    </Box>
  )
}

export default Measurements
