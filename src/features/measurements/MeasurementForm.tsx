import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { Autocomplete, Box, Button, TextField, useTheme } from "@mui/material"
import { useGetDevicesQuery, useGetGroupsQuery } from "@/features/api/apiSlice"
import Group from "@/interfaces/Group"
import Device from "@/interfaces/Device"
import { setFilter } from "@/features/measurements/measurementsSlice"

const MeasurementForm: React.FC = () => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const [errorMessage, setErrorMessage] = useState("")
  const [formValues, setFormValues] = useState({
    // deviceNames: null as string[] | null,
    // groupName: "",
    // startTime: "",
    // endTime: "",
    deviceNames: ["lab053", "lab055", "lab052"],
    groupName: "",
    startTime: "2023-06-13T23:51",
    endTime: "2023-06-13T23:59",
  })

  const {
    data: deviceData,
    // status: deviceStatus,
    isFetching: deviceIsFetching,
    isLoading: deviceIsLoading,
    isSuccess: deviceIsSuccess,
    isError: deviceIsError,
    error: deviceError,
  } = useGetDevicesQuery({})

  const {
    data: groupData,
    // status: groupStatus,
    isFetching: groupIsFetching,
    isLoading: groupIsLoading,
    isSuccess: groupIsSuccess,
    isError: groupIsError,
    error: groupError,
  } = useGetGroupsQuery({})

  let deviceContent: JSX.Element | null = null
  let deviceNames: string[] = []
  if (deviceIsFetching) {
    deviceContent = <h3>Fetching devices...</h3>
  } else if (deviceIsLoading) {
    deviceContent = <h3>Loading devices...</h3>
  } else if (deviceIsError) {
    deviceContent = <p>{JSON.stringify(deviceError)}</p>
  } else if (deviceIsSuccess) {
    deviceNames = deviceData.devices.map((device: Device) => {
      return device.deviceName
    })
  }

  let groupContent: JSX.Element | null = null
  let groupNames: string[] = []
  if (groupIsFetching) {
    groupContent = <h3>Fetching group...</h3>
  } else if (groupIsLoading) {
    groupContent = <h3>Loading groups...</h3>
  } else if (groupIsError) {
    groupContent = <p>{JSON.stringify(groupError)}</p>
  } else if (groupIsSuccess) {
    groupNames = groupData.groups.map((group: Group) => {
      return group.groupName
    })
  }

  const handleInputChange = (
    field: string,
    value: string | string[] | null,
  ) => {
    setFormValues((prevFormValues) => {
      if (field === "deviceNames") {
        return {
          ...prevFormValues,
          deviceNames: value !== null ? (value as string[]) : [],
        }
      } else {
        return {
          ...prevFormValues,
          [field]: value !== null ? (value as string) : "",
        }
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { deviceNames, groupName, startTime, endTime } = formValues
    if (
      (deviceNames && deviceNames.length > 0 && groupName) ||
      ((!deviceNames || deviceNames.length === 0) && !groupName)
    ) {
      setErrorMessage("Please select either a Device Name(s) OR a Group Name")
      return
    }

    if (!startTime || !endTime) {
      setErrorMessage("Please select start and end date")
      return
    }

    if (
      ((deviceNames && deviceNames.length > 0) || groupName) &&
      startTime &&
      endTime
    ) {
      try {
        dispatch(
          setFilter({
            deviceNames: deviceNames ? deviceNames : [],
            groupName: groupName ? groupName : "",
            startTime,
            endTime,
          }),
        )
        setErrorMessage("")
      } catch (error) {
        setErrorMessage("Failed to set filter...")
      }
    }
  }

  return (
    <Box>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
      >
        <Autocomplete
          multiple
          loading={deviceIsLoading || deviceIsFetching}
          options={deviceNames ? deviceNames : []}
          value={formValues.deviceNames ?? []}
          onChange={(event, newValue) => {
            handleInputChange("deviceNames", newValue)
          }}
          renderInput={(params) => (
            <TextField {...params} label="Device Names" fullWidth />
          )}
          style={{ flex: 1, marginRight: "1rem" }}
        />
        <p style={{ margin: 0 }}>OR</p>
        <Autocomplete
          loading={groupIsLoading || groupIsFetching}
          options={groupNames ? groupNames : []}
          value={formValues.groupName === "" ? null : formValues.groupName}
          onChange={(event, newValue) => {
            handleInputChange("groupName", newValue !== null ? newValue : "")
          }}
          renderInput={(params) => (
            <TextField {...params} label="Group Name" fullWidth />
          )}
          style={{ flex: 1, margin: "0 1rem" }}
          disabled
        />
        <TextField
          label="Start Time"
          type="datetime-local"
          value={formValues.startTime}
          onChange={(event) => {
            handleInputChange("startTime", event.target.value)
          }}
          required
          fullWidth
          InputLabelProps={{
            shrink:
              formValues.startTime !== undefined &&
              formValues.startTime !== null,
          }}
          style={{ flex: 1, margin: "0 1rem" }}
        />
        <TextField
          label="End Time"
          type="datetime-local"
          value={formValues.endTime}
          onChange={(event) => {
            handleInputChange("endTime", event.target.value)
          }}
          required
          fullWidth
          InputLabelProps={{
            shrink:
              formValues.endTime !== undefined && formValues.endTime !== null,
          }}
          style={{ flex: 1, margin: "0 1rem" }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
      {errorMessage && (
        <p style={{ color: theme.palette.error.main, marginLeft: "1rem" }}>
          {errorMessage}
        </p>
      )}
      {deviceContent}
      {groupContent}
    </Box>
  )
}

export default MeasurementForm
