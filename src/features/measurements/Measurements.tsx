import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import {
  useGetMeasurementsByDeviceNamesQuery,
  useGetGroupsQuery,
} from "@/features/api/apiSlice"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import { useGetDevicesQuery } from "@/features/api/apiSlice"

const fields = [{ label: "Current", field: "current" }, { label: "Voltage", field: "voltage" }]

const Measurements: React.FC = () => {
  const deviceNames = useAppSelector((state) => state.measurements.deviceNames)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const deviceNamesString: string = deviceNames.join(",")

  const query = useGetMeasurementsByDeviceNamesQuery(
    {
      deviceNames: deviceNamesString,
      startTime: startTime,
      endTime: endTime,
    },
    { skip: deviceNamesString.length === 0 },
  )

  const deviceQuery = useGetDevicesQuery({})

  const groupQuery = useGetGroupsQuery({})

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Measurements"
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm
        query={deviceQuery}
        groupQuery={groupQuery}
        label={"Device Names"}
        pageKey={"device"}
      />
      <MeasurementChart
        query={query}
        eventName={"new_measurement__"}
        pageKey={"device"}
        fields={fields}
      />
    </Box>
  )
}

export default Measurements
