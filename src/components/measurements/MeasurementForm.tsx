import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { Autocomplete, Box, Button, Grid, MenuItem, TextField, useTheme } from "@mui/material"
import { useGetDevicesQuery, useGetGroupsQuery } from "@/features/api/apiSlice"
import Group from "@/interfaces/Group"
import Device from "@/interfaces/Device"
import { setFilter } from "@/components/measurements/measurementsSlice"

const MeasurementForm: React.FC = () => {
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
    startTime: "2023-11-14T18:35",
    endTime: "2023-11-14T23:59",
  })

  const localStorageData = localStorage.getItem("deviceNames");
  const [filterName, setFilterName] = useState<string>("");
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [selectedSave, setSelectedSave] = useState("");

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
        console.log("deviceNames", value);
        localStorage.setItem("deviceNames", JSON.stringify(value));
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

  const handleSaveFilter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!filterName) {
      setErrorMessage("Please enter a name to save the filter as");
      return;
    }
    //localStorage.setItem(selectedSave, JSON.stringify(formValues));
    //const [savedNames, setSavedNames] = useState<string[]>([]);
    setSavedNames([...savedNames, filterName]);
  }

  return (
    <Box>
      <form 
        onSubmit={handleSaveFilter}
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}
      >
        <Grid container alignItems={"center"}>
          <TextField
            label="Save filter as"
            onChange={(event) => setFilterName(event.target.value)}
            style={{ marginRight: "1rem", width: "150px" }}
          >
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Grid>

        <TextField
          select
          label="Load filters"
          value={selectedSave}
          onChange={(event) => setSelectedSave(event.target.value)}
          style={{ marginLeft: "1rem", width: "150px" }}
        >
          {savedNames.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      </form>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
      >
        <Autocomplete
          multiple
          loading={deviceIsLoading || deviceIsFetching}
          options={deviceNames ? deviceNames : []}
          value={formValues.deviceNames ?? (localStorageData ? JSON.parse(localStorageData) : [])}
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
          options={groupName ? groupName : []}
          value={formValues.groupName === "" ? null : formValues.groupName}
          onChange={(event, newValue) => {
            handleInputChange("groupName", newValue !== null ? newValue : "")
          }}
          renderInput={(params) => (
            <TextField {...params} label="Group Name" fullWidth />
          )}
          style={{ flex: 1, margin: "0 1rem" }}
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
