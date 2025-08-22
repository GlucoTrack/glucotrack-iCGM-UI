import React, { useEffect } from "react"
import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid"
import { Box } from "@mui/material"
import Measurements from "@/interfaces/Measurement"
import dayjs from "dayjs"

function CustomToolbar() {
  const fileName = new Date().toISOString().replace(/:/g, "-")

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport csvOptions={{ fileName }} />
    </GridToolbarContainer>
  )
}

const MeasurementGrid = ({ measurements, fields, dateField }: any) => {
  const [data, setData] = React.useState<Measurements[]>([])

  useEffect(() => {
    if (measurements) {
      let rowId = 0
      let mergedMesurements: any[] = []
      const allData = measurements.map((measurement: any) => {
        let dd = measurement.data.map((data: any) => {
          rowId++
          let d: any = {
            date: data[dateField],
            _id: rowId,
            name: measurement.name,
          }
          for (let field of fields) {
            d[field.field] = data[field.field]
          }
          return d
        })
        return dd
      })
      for (let d of allData) {
        mergedMesurements = mergedMesurements.concat(d)
      }

      setData(mergedMesurements)
    }
  }, [measurements, dateField, fields])

  const columns = [
    { field: "name", headerName: "Name", flex: 0.5 },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueFormatter: (params: any) => {
        return params ? dayjs(params).format("YYYY-MM-DD HH:mm:ss") : "N/A"
      },
    },
  ]

  if (fields) {
    for (let field of fields) {
      columns.push({ field: field.field, headerName: field.label, flex: 1 })
    }
  }

  return (
    <Box sx={{ mt: 4 }} flexGrow={1} overflow="auto" width="100%">
      <DataGrid<Measurements>
        slots={{ toolbar: CustomToolbar }}
        rows={data}
        getRowId={(row) => row._id}
        columns={columns}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        initialState={{
          sorting: {
            sortModel: [{ field: "date", sort: "desc" }],
          },
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
      />
    </Box>
  )
}

export default MeasurementGrid
