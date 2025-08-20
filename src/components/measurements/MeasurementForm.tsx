import React, { JSX, useContext, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
} from "@mui/material"
import {
  BookmarkRemoveOutlined as RemoveFilter,
  BookmarkAddOutlined as AddFilter,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material"
import { Grid } from "@mui/material"
import { setFilter } from "@/components/measurements/measurementsSlice"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { SnackbarContext } from "@/providers/SnackbarProvider"
dayjs.extend(utc)

const MeasurementForm = ({
  label,
  pageKey,
  query,
  groupQuery = {},
  deviceNameField = "deviceName",
  deviceNameLabelField,
  groupNameField = "groupName",
  deviceNamesField = "deviceNames",
  disableRealtime = false,
}: any) => {
  const dispatch = useDispatch()
  const { openSnackbar, closeSnackbar } = useContext(SnackbarContext)
  const [localStorageKey, setLocalStorageKey] = useState(
    JSON.parse(localStorage.getItem("filters_" + pageKey) || "{}"),
  )
  const [formValues, setFormValues] = useState({
    deviceNames:
      localStorageKey && localStorageKey.deviceNames
        ? localStorageKey.deviceNames
        : (null as string[] | null),
    groupName:
      localStorageKey && localStorageKey.groupName
        ? localStorageKey.groupName
        : "",
    // startTime: "",
    // endTime: "",
    //* REMOVE below after testing and keep above
    // deviceNames: ["lab053", "lab055", "lab052"],
    // groupName: "",
    startTime:
      localStorageKey && localStorageKey.startTime
        ? localStorageKey.startTime
        : dayjs().subtract(30, "minutes").format("YYYY-MM-DDTHH:mm"),
    endTime:
      localStorageKey && localStorageKey.endTime
        ? localStorageKey.endTime
        : dayjs().format("YYYY-MM-DDTHH:mm"),
    realtime:
      localStorageKey && localStorageKey.realtime
        ? localStorageKey.realtime
        : false,
  })
  const [savedFilters, setSavedFilters] = useState<string[]>(
    JSON.parse(localStorage.getItem("filterList_" + pageKey) || "[]"),
  )
  const [filterName, setFilterName] = useState<string>("")
  const [selectedFilter, setSelectedFilter] = useState(
    localStorage.getItem("selected_filter_" + pageKey) || null,
  )
  const [filterApplied, setFilterApplied] = useState(selectedFilter !== null)

  const [currentSelectedOptions, setCurrentSelectedOptions] = useState<any[]>(
    [],
  )

  const {
    data: deviceData,
    // status: deviceStatus,
    isFetching: deviceIsFetching,
    isLoading: deviceIsLoading,
    isSuccess: deviceIsSuccess,
    isError: deviceIsError,
    error: deviceError,
  } = query

  const {
    data: groupData,
    // status: groupStatus,
    isFetching: groupIsFetching,
    isLoading: groupIsLoading,
    isSuccess: groupIsSuccess,
    isError: groupIsError,
    error: groupError,
  } = groupQuery

  let deviceContent: JSX.Element | null = null
  const deviceOptions = React.useMemo(() => {
    if (deviceIsSuccess) {
      return deviceData.map((device: any) => ({
        label:
          device[deviceNameLabelField ? deviceNameLabelField : deviceNameField],
        id: device[deviceNameField],
      }))
    }
    return []
  }, [deviceIsSuccess, deviceData, deviceNameLabelField, deviceNameField])

  if (deviceIsFetching) {
    deviceContent = <h3>Fetching devices...</h3>
  } else if (deviceIsLoading) {
    deviceContent = <h3>Loading devices...</h3>
  } else if (deviceIsError) {
    deviceContent = <p>{JSON.stringify(deviceError)}</p>
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
    groupName = groupData.map((group: any) => {
      return group[groupNameField]
    })
  }

  const handleInputChange = (
    field: string,
    value: string | string[] | boolean | null,
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
      } else if (field === "realtime") {
        if (value !== null && value === true) {
          return {
            ...prevFormValues,
            [field]: true,
            endTime: dayjs().add(6, "hours").format("YYYY-MM-DDTHH:mm"),
          }
        } else {
          return {
            ...prevFormValues,
            [field]: false,
            endTime: dayjs().format("YYYY-MM-DDTHH:mm"),
          }
        }
      } else {
        return {
          ...prevFormValues,
          [field]: value !== null ? (value as string) : "",
        }
      }
    })
    if (filterApplied) {
      setSelectedFilter(null)
      setFilterApplied(false)
    }
  }

  useEffect(() => {
    if (
      formValues.deviceNames ||
      formValues.groupName ||
      formValues.startTime ||
      formValues.endTime ||
      formValues.realtime
    ) {
      let newLocalStorageFilters = {
        ...localStorageKey,
        deviceNames: formValues.deviceNames,
        groupName: formValues.groupName,
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        realtime: formValues.realtime,
      }
      setLocalStorageKey(newLocalStorageFilters)
      localStorage.setItem(
        "filters_" + pageKey,
        JSON.stringify(newLocalStorageFilters),
      )
      /*handleSubmit(
        new Event("submit") as unknown as React.FormEvent<HTMLFormElement>,
      )*/
    }
  }, [formValues, pageKey, localStorageKey])

  useEffect(() => {
    setCurrentSelectedOptions(
      deviceOptions.filter((option: any) =>
        formValues.deviceNames?.includes(option.id),
      ),
    )
  }, [formValues.deviceNames, setCurrentSelectedOptions, deviceOptions])

  const calcCurrentTimeInterval = (): number => {
    if (formValues.endTime && formValues.startTime) {
      const d1 = dayjs(formValues.startTime)
      const d2 = dayjs(formValues.endTime)
      return d2.diff(d1, "minute")
    }
    return 0
  }

  const handleBack = () => {
    const interval = calcCurrentTimeInterval()
    setFormValues((prevFormValues) => {
      return {
        ...prevFormValues,
        startTime: dayjs(prevFormValues.startTime)
          .subtract(interval, "minutes")
          .format("YYYY-MM-DDTHH:mm"),
        endTime: dayjs(prevFormValues.endTime)
          .subtract(interval, "minutes")
          .format("YYYY-MM-DDTHH:mm"),
      }
    })
  }

  const handleForward = () => {
    const interval = calcCurrentTimeInterval()
    setFormValues((prevFormValues) => {
      return {
        ...prevFormValues,
        startTime: dayjs(prevFormValues.startTime)
          .add(interval, "minutes")
          .format("YYYY-MM-DDTHH:mm"),
        endTime: dayjs(prevFormValues.endTime)
          .add(interval, "minutes")
          .format("YYYY-MM-DDTHH:mm"),
      }
    })
  }

  const setPastMinutesRange = (minutes: number) => {
    setFormValues((prevFormValues) => {
      return {
        ...prevFormValues,
        startTime: dayjs()
          .subtract(minutes, "minutes")
          .format("YYYY-MM-DDTHH:mm"),
        endTime: formValues.realtime
          ? prevFormValues.endTime
          : dayjs().format("YYYY-MM-DDTHH:mm"),
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

  const handle24Hours = () => {
    setPastMinutesRange(1440)
  }

  const handle48Hours = () => {
    setPastMinutesRange(2880)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { deviceNames, groupName, startTime, endTime, realtime } = formValues
    let deviceNamesFromGroup: string[] = []

    const utcStartTime = dayjs(startTime).utc().toISOString()
    const utcEndTime = dayjs(endTime).utc().toISOString()

    if (
      (deviceNames && deviceNames.length > 0 && groupName) ||
      ((!deviceNames || deviceNames.length === 0) && !groupName)
    ) {
      openSnackbar("Please select either Device Name(s) OR Group Name", "error")
      return
    }

    if (!startTime || !endTime) {
      openSnackbar("Please select start and end date", "error")
      return
    }

    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const diffHours = Math.abs(end.getTime() - start.getTime()) / 3600000 // Convert milliseconds to hours
      if (diffHours > 24 * 8) {
        openSnackbar(
          "The time difference should not be more than 1 week",
          "error",
        )
        return
      }
    }

    if (groupName && groupData) {
      const groupObject = groupData.find(
        (group: any) => group[groupNameField] === groupName,
      )
      if (!deviceNamesField) {
        throw new Error("deviceNamesField is not defined")
      }
      if (groupObject) {
        deviceNamesFromGroup = groupObject[deviceNamesField]
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
            startTime: utcStartTime,
            endTime: utcEndTime,
            realtime,
          }),
        )
        closeSnackbar(event)
      } catch (error) {
        openSnackbar("Failed to set filter...", "error")
      }
    }
  }

  useEffect(() => {
    if (savedFilters) {
      localStorage.setItem(
        "filterList_" + pageKey,
        JSON.stringify(savedFilters),
      )
    }
  }, [savedFilters, pageKey])

  const handleSaveFilter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!filterName) {
      openSnackbar("Please enter a name to save the filter", "error")
      return
    }
    try {
      const newSavedFilters = [...savedFilters, filterName]
      newSavedFilters.sort((a, b) => a.localeCompare(b))
      setSavedFilters(newSavedFilters)
      localStorage.setItem("savedFilters", JSON.stringify(newSavedFilters))
      localStorage.setItem(
        filterName + "_" + pageKey,
        JSON.stringify(formValues),
      )
      setSelectedFilter(filterName)
      closeSnackbar(event)
      setFilterName("")
    } catch (error) {
      openSnackbar("Failed to save filter...", "error")
    }
  }

  useEffect(() => {
    if (selectedFilter) {
      localStorage.setItem("selected_filter_" + pageKey, selectedFilter)
      setFilterApplied(true)
    } else {
      localStorage.removeItem("selected_filter_" + pageKey)
    }
  }, [selectedFilter, pageKey])

  const handleChangeFilter = (filterName: string) => {
    try {
      const savedFilter = localStorage.getItem(filterName + "_" + pageKey)
      if (savedFilter) {
        setFormValues(JSON.parse(savedFilter))
        setSelectedFilter(filterName)
      }
    } catch (error) {
      openSnackbar("Failed to load filter...", "error")
    }
  }

  const handleDeleteFilter = (deviceToDelete: any) => {
    setSavedFilters((prevFilters) =>
      prevFilters.filter((device) => device !== deviceToDelete),
    )
    setSelectedFilter(null)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <form onSubmit={handleSaveFilter} style={{ marginBottom: 20 }}>
        <Grid container xs={12}>
          <Grid xs={9}>
            <Grid alignItems={"center"} container>
              <TextField
                label="Save filter as"
                value={filterName}
                onChange={(event) => setFilterName(event.target.value)}
                style={{ marginRight: "1rem", width: "150px" }}
              ></TextField>
              <IconButton type="submit">
                <AddFilter />
              </IconButton>
            </Grid>
          </Grid>

          <Grid xs={3}>
            <Autocomplete
              options={savedFilters ? savedFilters : []}
              value={selectedFilter}
              onChange={(event, newValue) => {
                if (newValue !== null) {
                  handleChangeFilter(newValue)
                } else {
                  setSelectedFilter(null)
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filters"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {params.InputProps.endAdornment}
                        {selectedFilter && (
                          <IconButton
                            title="Delete filter"
                            onClick={() =>
                              handleDeleteFilter(params.inputProps.value)
                            }
                          >
                            <RemoveFilter />
                          </IconButton>
                        )}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </form>

      <Divider sx={{ mt: 3, mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4} alignItems={"start"}>
          <Grid container xs={8} spacing={2}>
            <Grid xs={groupData ? 5 : 12}>
              <Autocomplete
                multiple
                loading={deviceIsLoading || deviceIsFetching}
                options={deviceOptions ? deviceOptions : []}
                value={currentSelectedOptions}
                isOptionEqualToValue={(option: any, newValue: any) => {
                  return option.id === newValue.id
                }}
                onChange={(event, newValue) => {
                  const newDeviceNames = newValue.map(
                    (option: any) => option.id,
                  )
                  handleInputChange("deviceNames", newDeviceNames)
                }}
                renderInput={(params) => (
                  <TextField {...params} label={label} fullWidth />
                )}
              />
            </Grid>
            {groupData && (
              <>
                <Grid xs={2}>
                  <Box
                    sx={{
                      display: "flex",
                      height: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    OR
                  </Box>
                </Grid>
                <Grid xs={5}>
                  <Autocomplete
                    loading={groupIsLoading || groupIsFetching}
                    options={groupName ? groupName : []}
                    value={
                      formValues.groupName === "" ? null : formValues.groupName
                    }
                    onChange={(event, newValue: any) => {
                      handleInputChange(
                        "groupName",
                        newValue !== null ? newValue : "",
                      )
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Group Name" fullWidth />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid xs={1} alignContent={"center"}>
              <IconButton onClick={handleBack}>
                <ChevronLeft />
              </IconButton>
            </Grid>
            <Grid xs={5}>
              <TextField
                label="Start Time"
                type="datetime-local"
                value={formValues.startTime}
                onChange={(event) => {
                  handleInputChange("startTime", event.target.value)
                }}
                required
                fullWidth
                disabled={formValues.realtime}
                InputLabelProps={{
                  shrink:
                    formValues.startTime !== undefined &&
                    formValues.startTime !== null,
                }}
              />
            </Grid>
            <Grid xs={5}>
              {!formValues.realtime && (
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
                      formValues.endTime !== undefined &&
                      formValues.endTime !== null,
                  }}
                />
              )}
            </Grid>
            <Grid xs={1} alignContent={"center"}>
              <IconButton onClick={handleForward}>
                <ChevronRight />
              </IconButton>
            </Grid>

            <Grid xs={12}></Grid>
          </Grid>
          <Grid xs={4}>
            <Grid container spacing={1}>
              <Grid>
                <Button
                  onClick={handle30Minutes}
                  sx={{ width: 1, mb: 1 }}
                  variant="outlined"
                  color="primary"
                >
                  Past 30 minutes
                </Button>
              </Grid>
              <Grid>
                <Button
                  onClick={handle1Hour}
                  sx={{ width: 1, mb: 1 }}
                  variant="outlined"
                  color="primary"
                >
                  Past 1 hour
                </Button>
              </Grid>
              <Grid>
                <Button
                  onClick={handle2Hours}
                  sx={{ width: 1, mb: 1 }}
                  variant="outlined"
                  color="primary"
                >
                  Past 2 hours
                </Button>
              </Grid>
              <Grid>
                <Button
                  onClick={handle24Hours}
                  sx={{ width: 1, mb: 0 }}
                  variant="outlined"
                  color="primary"
                >
                  Past 24 hours
                </Button>
              </Grid>
              <Grid>
                <Button
                  onClick={handle48Hours}
                  sx={{ width: 1, mb: 0 }}
                  variant="outlined"
                  color="primary"
                >
                  Past 48 hours
                </Button>
              </Grid>
            </Grid>

            <Grid>
              {!disableRealtime && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.realtime || false}
                      onChange={(event) => {
                        handleInputChange("realtime", event.target.checked)
                      }}
                    />
                  }
                  label="Realtime"
                />
              )}
            </Grid>

            <Grid>
              <Button
                sx={{ marginTop: disableRealtime ? 2 : 0 }}
                type="submit"
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {deviceContent}
        {groupContent}
      </form>
    </Box>
  )
}

export default MeasurementForm
