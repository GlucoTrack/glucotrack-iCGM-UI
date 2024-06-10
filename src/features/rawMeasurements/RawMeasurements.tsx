import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import { useGetRawMeasurementsByMobileNamesQuery, useGetMobileGroupsQuery, useGetMobilesQuery } from "@/features/api/apiSlice"

const fields = [{ label: "Current", field: "weCurrent" }, { label: "Voltage", field: "ceVoltage" }, { label: "we_reVoltage", field: "we_reVoltage" }, { label: "Battery", field: "battery" }]

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
        pageKey={"mobile"}
        groupsField={"mobileGroups"}
        groupNameField={"mobileGroupName"}
        devicesField={"mobileDevices"}
        deviceNameField={"mobileName"}
        deviceNamesField={"mobileNames"}
      />
      <MeasurementChart
        query={query}
        eventName={"new_raw_measurement__"}
        pageKey={"mobile"}
        fields={fields}
      />
    </Box>
  )
}

export default RawMeasurements
