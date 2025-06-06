import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import { useGetRawMeasurementsByMobileNamesQuery, useGetMobileGroupsQuery, useGetMobilesQuery } from "@/features/api/apiSlice"
import PerformanceChart from "@/components/measurements/PerformanceChart"

const RawMeasurements: React.FC = () => {
  const mobileNames = useAppSelector((state) => state.measurements.deviceNames)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const mobileNamesString: string = mobileNames.join(",")

  const query = useGetRawMeasurementsByMobileNamesQuery(
    {
      deviceNames: mobileNamesString,
      startTime: startTime,
      endTime: endTime,
    },
    { skip: mobileNamesString.length === 0 },
  )

  const mobileQuery = useGetMobilesQuery({})

  const groupQuery = useGetMobileGroupsQuery({});

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Raw Measurements"
        // subtitle={`Queried measurements: ${status}`}
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm
        query={mobileQuery}
        groupQuery={groupQuery}
        label={"Mobile Names"}
        pageKey={"raw_performance"}
        groupsField={"mobileGroups"}
        groupNameField={"mobileGroupName"}
        devicesField={"mobileDevices"}
        deviceNameField={"mobileName"}
        deviceNamesField={"mobileNames"}
        disableRealtime={true}
      />
      <PerformanceChart
        query={query}
        pageKey={"raw_performance"}
        dateField={"time"}
      />
    </Box>
  )
}

export default RawMeasurements
