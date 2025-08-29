import React from "react"
import { Box } from "@mui/material"
import Header from "@/components/Header"
import MeasurementForm from "@/components/measurements/MeasurementForm"
import { useAppSelector } from "@/hooks/useStore"
import MeasurementChart from "@/components/measurements/MeasurementChart"
import {
  useGetRawDataByPatientIdsQuery,
  useGetRawDataPatientIdsQuery,
} from "@/features/api/apiSlice"

const fields = [
  { label: "Current", field: "weCurrent" },
  { label: "Voltage", field: "ceVoltage" },
  { label: "we_reVoltage", field: "we_reVoltage" },
  { label: "Gain", field: "gain" },
  { label: "Battery", field: "battery" },
  { label: "RSSI", field: "rssi" },
]

const RawDataMeasurements: React.FC = () => {
  const patientIds = useAppSelector((state) => state.measurements.deviceNames)
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)

  const patientIdsString: string = patientIds.join(",")

  const query = useGetRawDataByPatientIdsQuery(
    {
      patientIds: patientIdsString,
      startTime: startTime,
      endTime: endTime,
    },
    { skip: patientIdsString.length === 0 },
  )

  const userQuery = useGetRawDataPatientIdsQuery({})

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Raw Data"
        subtitle={`Fill out your criteria and hit submit to see measurements`}
      />
      <MeasurementForm
        query={userQuery}
        label={"Patients"}
        pageKey={"rawData"}
        deviceNameField={"patientId"}
        deviceNameLabelField={"patientId"}
      />
      <MeasurementChart query={query} pageKey={"rawData"} fields={fields} />
    </Box>
  )
}

export default RawDataMeasurements
