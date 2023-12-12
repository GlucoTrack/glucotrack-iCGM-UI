import React, { useEffect } from "react"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import Measurements from "@/interfaces/Measurement"
import dayjs from "dayjs"

const MeasurementGrid = (props: any) => {
  const [data, setData] = React.useState<Measurements[]>([]);

  useEffect(() => {
    if (props) {
            
      let rowId = 0;
      let mergedMesurements: any[] = []; 
      const allData = props?.measurements.map((measurement: any) => {
        let dd = measurement.data.map((data: any) => {
          rowId++;
          return {
            current: data.current,
            voltage: data.voltage,
            date: data.date,
            _id: rowId,
          }
        });
        for (let d of dd) {
          d.deviceName = measurement.name;
        }
        return dd;
      });           
      for(let d of allData) {
        mergedMesurements = mergedMesurements.concat(d);
      }
      
      setData(mergedMesurements);
    }
  }, [props]);
  
  
  const columns = [
    { field: "deviceName", headerName: "Name", flex: 0.5 },
    { field: "date", headerName: "Date", flex: 1, valueFormatter: (params:any) => dayjs(params?.value).format('YYYY-MM-DD HH:mm:ss'), },
    { field: "voltage", headerName: "Voltage", flex: 1 },
    { field: "current", headerName: "Current", flex: 1 },
  ]

  return <Box sx={{mt:4}} flexGrow={1} overflow="auto" width="100%">
    <DataGrid<Measurements>
      slots={{ toolbar: GridToolbar }}
      rows={data}
      getRowId={(row) => row._id}
      columns={columns}
    />
  </Box>
}

export default MeasurementGrid

