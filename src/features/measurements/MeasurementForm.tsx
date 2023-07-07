import { Autocomplete, Box, Button, TextField, useTheme } from "@mui/material"
import React, { useState } from "react"
import { useGetDevicesQuery, useGetGroupsQuery } from "../api/apiSlice"

const MeasurementForm: React.FC = () => {
  const theme = useTheme()
  const [errorMessage, setErrorMessage] = useState("")
  const [formValues, setFormValues] = useState({
    deviceNames: [] as string[],
    groupName: [] as string[],
    startDate: "",
    endDate: "",
  })

  const {
    data: deviceData,
    status: deviceStatus,
    isFetching: deviceIsFetching,
    isLoading: deviceIsLoading,
    isSuccess: deviceIsSuccess,
    isError: deviceIsError,
    error: deviceError,
  } = useGetDevicesQuery({})

  const {
    data: groupData,
    status: groupStatus,
    isFetching: groupIsFetching,
    isLoading: groupIsLoading,
    isSuccess: groupIsSuccess,
    isError: groupIsError,
    error: groupError,
  } = useGetGroupsQuery({})

  let deviceContent: JSX.Element | null = null
  let deviceNames: string[] = []
  if (deviceIsFetching) {
    deviceContent = <h3>Fetching...</h3>
  } else if (deviceIsLoading) {
    deviceContent = <h3>Loading...</h3>
  } else if (deviceIsError) {
    deviceContent = <p>{JSON.stringify(deviceError)}</p>
  } else if (deviceIsSuccess) {
    deviceNames = deviceData.devices.map((device) => {
      return device.deviceName
    })
  }

  let groupContent: JSX.Element | null = null
  let groupNames: string[] = []
  if (groupIsFetching) {
    groupContent = <h3>Fetching...</h3>
  } else if (groupIsLoading) {
    groupContent = <h3>Loading...</h3>
  } else if (groupIsError) {
    groupContent = <p>{JSON.stringify(groupError)}</p>
  } else if (groupIsSuccess) {
    groupNames = groupData.groups.map((group) => {
      return group.groupName
    })
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [field]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { deviceNames, groupName, startDate, endDate } = formValues
    if (
      (deviceNames.length > 0 && groupName.length > 0) ||
      (deviceNames.length === 0 && groupName.length === 0)
    ) {
      setErrorMessage("Please select either Device Name(s) or Group Name")
      return
    }

    console.log(formValues)

    setErrorMessage("") // Clear error message if no validation errors
  }

  return (
    <Box>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
      >
        <Autocomplete
          multiple
          options={deviceNames}
          value={formValues.deviceNames}
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
          multiple
          options={groupNames}
          value={formValues.groupName}
          onChange={(event, newValue) => {
            handleInputChange("groupName", newValue)
          }}
          renderInput={(params) => (
            <TextField {...params} label="Group Name" fullWidth />
          )}
          style={{ flex: 1, margin: "0 1rem" }}
          disabled
        />
        <TextField
          label="Start Date"
          type="datetime-local"
          value={formValues.startDate}
          onChange={(event) => {
            handleInputChange("startDate", event.target.value)
          }}
          required
          fullWidth
          InputLabelProps={{
            shrink:
              formValues.startDate !== undefined &&
              formValues.startDate !== null,
          }}
          style={{ flex: 1, margin: "0 1rem" }}
        />
        <TextField
          label="End Date"
          type="datetime-local"
          value={formValues.endDate}
          onChange={(event) => {
            handleInputChange("endDate", event.target.value)
          }}
          required
          fullWidth
          InputLabelProps={{
            shrink:
              formValues.endDate !== undefined && formValues.endDate !== null,
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
