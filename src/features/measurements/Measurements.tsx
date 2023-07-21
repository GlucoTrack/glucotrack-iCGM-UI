import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "./MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import MeasurementChart from "./MeasurementChart"
import MeasurementGrid from "./MeasurementGrid"

const Measurements: React.FC = () => {
  const deviceNames = useAppSelector((state) => state.measurements.deviceNames)
  const groupName = useAppSelector((state) => state.measurements.groupName)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Measurements"
        // subtitle={`Queried measurements: ${status}`}
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm />
      {((deviceNames && deviceNames.length > 0) || groupName) &&
        startTime &&
        endTime && (
          <>
            <MeasurementChart />
            <MeasurementGrid />
          </>
        )}
    </Box>
  )
}

export default Measurements
