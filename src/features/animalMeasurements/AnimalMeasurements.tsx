import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import { useGetAnimalMeasurementsByMobileNamesQuery } from "@/features/api/apiSlice"
import { useGetMobilesQuery } from "@/features/api/apiSlice"

const AnimalMeasurements: React.FC = () => {
  const deviceNames = useAppSelector((state) => state.measurements.deviceNames)
  const groupName = useAppSelector((state) => state.measurements.groupName)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const deviceNamesString: string = deviceNames.join(",")

  const query = useGetAnimalMeasurementsByMobileNamesQuery(
    {
      deviceNames: deviceNamesString,
      startTime: startTime,
      endTime: endTime,
    },
    { skip: deviceNamesString.length === 0 },
  )

  const mobileQuery = useGetMobilesQuery({})

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Animal Measurements"
        // subtitle={`Queried measurements: ${status}`}
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm
        query={mobileQuery}
        label={"Mobile Names"}
        page={"mobile"}
      />
      <MeasurementChart
        query={query}
        eventName={"new_animal_measurement__"}
        page={"mobile"}
      />
    </Box>
  )
}

export default AnimalMeasurements
