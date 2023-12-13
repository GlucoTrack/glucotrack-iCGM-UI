import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { Autocomplete, Box, Button, TextField, useTheme } from "@mui/material"
import Grid from '@mui/system/Unstable_Grid';
import { useGetGroupsQuery } from "@/features/api/apiSlice"
import Group from "@/interfaces/Group"
import Device from "@/interfaces/Device"
import { setFilter } from "@/components/measurements/measurementsSlice"
import Mobile from "@/interfaces/Mobile"
import dayjs from "dayjs"

const MeasurementForm = (props: any) => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const [errorMessage, setErrorMessage] = useState("")
  const [formValues, setFormValues] = useState({
    deviceNames: null as string[] | null,
    groupName: "",
    // startTime: "",
    // endTime: "",
    //* REMOVE below after testing and keep above
    // deviceNames: ["lab053", "lab055", "lab052"],
    // groupName: "",
    startTime: dayjs().subtract(30, "minutes").format("YYYY-MM-DDTHH:mm"),
    endTime: dayjs().format("YYYY-MM-DDTHH:mm"),
  })

  const {
    data: deviceData,
    // status: deviceStatus,
    isFetching: deviceIsFetching,
    isLoading: deviceIsLoading,
    isSuccess: deviceIsSuccess,
    isError: deviceIsError,
    error: deviceError,
  } = props.query

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
    if (deviceData.mobileDevices) {
      deviceNames = deviceData.mobileDevices.map((device: Mobile) => {
        return device.mobileName
      })
    } else {
      deviceNames = deviceData.devices.map((device: Device) => {
        return device.deviceName
      })
    }
  }

  let groupContent: JSX.Element | null = null
  let groupName: string[] = []
  if (groupIsFetching) {
    groupContent = <h3>Fetching group...</h3>
  } else if (groupIsLoading) {
    groupContent = <h3>Loading groups...</h3>
  } else if (groupIsError) {
    groupContent = <p>{JSON.stringify(groupError)}</p>
  } else if (groupIsSuccess) {
    groupName = groupData.groups.map((group: Group) => {
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
          groupName: "",
        }
      } else if (field === "groupName") {
        return {
          ...prevFormValues,
          [field]: value !== null ? (value as string) : "",
          deviceNames: [],
        }
      } else {
        return {
          ...prevFormValues,
          [field]: value !== null ? (value as string) : "",
        }
      }
    })
  }

  const setPastMinutesRange = (minutes: number) => {
    setFormValues((prevFormValues) => {
      return {
        ...prevFormValues,
        startTime: dayjs().subtract(minutes, "minutes").format("YYYY-MM-DDTHH:mm"),
        endTime: dayjs().format("YYYY-MM-DDTHH:mm"),
      }
    })
  }

  const handle30Minutes = () => {
    setPastMinutesRange(30)
  }

  const handle1Hour = () => {
    setPastMinutesRange(60)
  }

  const handle2Hours = () => {
    setPastMinutesRange(120)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { deviceNames, groupName, startTime, endTime } = formValues
    let deviceNamesFromGroup: string[] = []

    if (
      (deviceNames && deviceNames.length > 0 && groupName) ||
      ((!deviceNames || deviceNames.length === 0) && !groupName)
    ) {
      setErrorMessage("Please select either Device Name(s) OR Group Name")
      return
    }

    if (!startTime || !endTime) {
      setErrorMessage("Please select start and end date")
      return
    }

    if (groupName) {
      const groupObject = groupData.groups.find(
        (group: Group) => group.groupName === groupName,
      )
      if (groupObject) {
        deviceNamesFromGroup = groupObject.deviceNames
      } else {
        throw new Error(`${groupName} not found.`)
      }
    }

    if (
      ((deviceNames && deviceNames.length > 0) ||
        (deviceNamesFromGroup && deviceNamesFromGroup.length > 0)) &&
      startTime &&
      endTime
    ) {
      try {
        dispatch(
          setFilter({
            deviceNames:
              deviceNamesFromGroup.length > 0
                ? deviceNamesFromGroup
                : deviceNames && deviceNames.length > 0
                  ? deviceNames
                  : [],
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
    <Box sx={{ flexGrow: 1 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid container xs={9} spacing={2}>
            <Grid xs={5}>
              <Autocomplete
                multiple
                loading={deviceIsLoading || deviceIsFetching}
                options={deviceNames ? deviceNames : []}
                value={formValues.deviceNames ?? []}
                onChange={(event, newValue) => {
                  handleInputChange("deviceNames", newValue)
                }}
                renderInput={(params) => (
                  <TextField {...params} label={props.label} fullWidth />
                )}
              />
            </Grid>
            <Grid xs={2}>
              <Box sx={{ display: 'flex', height: 1, justifyContent: 'center', alignItems: 'center' }}>OR</Box>
            </Grid>
            <Grid xs={5}>
              <Autocomplete
                loading={groupIsLoading || groupIsFetching}
                options={groupName ? groupName : []}
                value={formValues.groupName === "" ? null : formValues.groupName}
                onChange={(event, newValue) => {
                  handleInputChange("groupName", newValue !== null ? newValue : "")
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Group Name" fullWidth />
                )}
              />
            </Grid>

            <Grid xs={6}>
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
              />
            </Grid>
            <Grid xs={6}>
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
              />
            </Grid>
            <Grid xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Grid>
          </Grid>
          <Grid xs={3}>
            <Button onClick={handle30Minutes} sx={{ width: 1, mb: 2 }} variant="outlined" color="primary">Past 30 minutes</Button>
            <Button onClick={handle1Hour} sx={{ width: 1, mb: 2 }} variant="outlined" color="primary">Past 1 hour</Button>
            <Button onClick={handle2Hours} sx={{ width: 1, mb: 2 }} variant="outlined" color="primary">Past 2 hour</Button>
          </Grid>
        </Grid>
        {errorMessage && (
          <p style={{ color: theme.palette.error.main, marginLeft: "1rem" }}>
            {errorMessage}
          </p>
        )}
        {deviceContent}
        {groupContent}
      </form >
    </Box>
  )
}

export default MeasurementForm
