import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import {
  useGetGlucoseValuesByMobileNamesQuery,
  useGetMobileGroupsQuery,
  useGetMobilesQuery,
} from "@/features/api/apiSlice"

const fields = [
  { label: "Glucose", field: "bloodGlucose" },
  { label: "Trend", field: "trend" },
]

const GlucoseValues: React.FC = () => {
  const mobileNames = useAppSelector((state) => state.measurements.deviceNames)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const mobileNamesString: string = mobileNames.join(",")

  const query = useGetGlucoseValuesByMobileNamesQuery(
    {
      deviceNames: mobileNamesString,
      startTime: startTime,
      endTime: endTime,
    },
    { skip: mobileNamesString.length === 0 },
  )

  const mobileQuery = useGetMobilesQuery({})

  const groupQuery = useGetMobileGroupsQuery({})

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Glucose Values"
        // subtitle={`Queried measurements: ${status}`}
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm
        query={mobileQuery}
        groupQuery={groupQuery}
        label={"Mobile Names"}
        pageKey={"mobile"}
        groupsField={"mobileGroups"}
        groupNameField={"mobileGroupName"}
        deviceNameField={"mobileName"}
        deviceNamesField={"mobileNames"}
      />
      <MeasurementChart
        query={query}
        eventName={"new_glucose_value__"}
        pageKey={"mobile"}
        fields={fields}
        dateField={"date"}
      />
    </Box>
  )
}

export default GlucoseValues
