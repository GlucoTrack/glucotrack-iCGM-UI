import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import { useGetRawUserMeasurementsByUserIdsQuery, useGetUsersQuery } from "@/features/api/apiSlice"

const fields = [
  { label: "Current", field: "weCurrent" },
  { label: "Voltage", field: "ceVoltage" },
  { label: "we_reVoltage", field: "we_reVoltage" },
  { label: "Gain", field: "gain" },
  { label: "Battery", field: "battery" }
]

const RawUserMeasurements: React.FC = () => {
  const userIds = useAppSelector((state) => state.measurements.deviceNames)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const userIdsString: string = userIds.join(",")

  const query = useGetRawUserMeasurementsByUserIdsQuery(
    {
      userIds: userIdsString,
      startTime: startTime,
      endTime: endTime,
    },
    { skip: userIdsString.length === 0 },
  )

  const userQuery = useGetUsersQuery({})

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Raw User Measurements"
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm
        query={userQuery}
        label={"Users"}
        pageKey={"user"}        
        devicesField={"users"}
        deviceNameField={"userId"}
      />
      <MeasurementChart
        query={query}
        eventName={"new_raw_user_measurement__"}
        pageKey={"user"}
        fields={fields}
        dateField={"time"}
      />
    </Box>
  )
}

export default RawUserMeasurements
