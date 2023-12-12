import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import { useGetMeasurementsByDeviceNamesQuery } from "@/features/api/apiSlice"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import { useGetDevicesQuery } from "@/features/api/apiSlice"

const Measurements: React.FC = () => {
  const deviceNames = useAppSelector((state) => state.measurements.deviceNames)
  const groupName = useAppSelector((state) => state.measurements.groupName)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const deviceNamesString: string = deviceNames.join(",")

  const query =
    useGetMeasurementsByDeviceNamesQuery({
      deviceNames: deviceNamesString,
      startTime: startTime,
      endTime: endTime,
    }, { skip: deviceNamesString.length === 0 })

  const deviceQuery = useGetDevicesQuery({})

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Measurements"
        // subtitle={`Queried measurements: ${status}`}
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm query={deviceQuery} label={'Device Names'} />
      <MeasurementChart query={query} />
    </Box>
  )
}

export default Measurements
