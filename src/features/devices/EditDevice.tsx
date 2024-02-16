import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useGetDeviceQuery,
  useEditDeviceMutation,
  useDeleteDeviceMutation,
} from "@/features/api/apiSlice"

interface FormValues {
  macAddress: string
  deviceName: string
  password: string
  baseUri: string
  jwtToken: string
  jwtRefreshToken: string
  rtc: string
  sessionStartTime: string
  sessionEndTime: string
  measurementInterval: number
  transmitDelay: number
  checkParametersInterval: number
  pstatVoltage: number
  pstatTIA: number
  glm: number
  coat: string
  onTest: string
  enzyme: number
  testStation: number
}

const initialValues: FormValues = {
  macAddress: "XX:XX:XX:XX:XX",
  deviceName: "",
  password: "FUTURE-Password",
  baseUri: "https://prd-icgm.herokuapp.com/api/v1",
  jwtToken: "FUTURE-JWT",
  jwtRefreshToken: "FUTURE-JWT-REFRESH",
  rtc: "2022-11-11T11:11:11",
  sessionStartTime: "2022-11-11T11:11:11",
  sessionEndTime: "2029-11-11T11:11:11",
  measurementInterval: 10,
  transmitDelay: 0,
  checkParametersInterval: 60,
  pstatVoltage: 0.6,
  pstatTIA: 0,
  glm: 0,
  coat: "2029-11-11T11:11:11",
  onTest: "2029-11-11T11:11:11",
  enzyme: 0,
  testStation: 0,
}

const EditDevice: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const { deviceId } = useParams<Record<string, string>>()

  const {
    data: getDeviceData,
    // status: getDeviceStatus,
    isFetching: getDeviceIsFetching,
    isLoading: getDeviceIsLoading,
    isSuccess: getDeviceIsSuccess,
    isError: getDeviceIsError,
    error: getDeviceError,
  } = useGetDeviceQuery(deviceId)

  //TODO unlike Mobile, getting an error "getting" devices after a Delete

  const [
    deleteDevice,
    {
      isLoading: isDeletingDevice,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteDeviceMutation()

  const [
    editDevice,
    {
      isLoading: isEditingDevice,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditDeviceMutation()

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const formattedDate = date.toISOString().slice(0, 16) // Format: "yyyy-MM-ddThh:mm"
    return formattedDate
  }

  useEffect(() => {
    if (getDeviceData) {
      const {
        macAddress,
        deviceName,
        password,
        baseUri,
        jwtToken,
        jwtRefreshToken,
        rtc,
        sessionStartTime,
        sessionEndTime,
        measurementInterval,
        transmitDelay,
        checkParametersInterval,
        pstatVoltage,
        pstatTIA,
        glm,
        coat,
        onTest,
        enzyme,
        testStation,
      } = getDeviceData

      setFormValues({
        macAddress,
        deviceName,
        password,
        baseUri,
        jwtToken,
        jwtRefreshToken,
        rtc: formatDate(rtc),
        sessionStartTime: formatDate(sessionStartTime),
        sessionEndTime: formatDate(sessionEndTime),
        measurementInterval,
        transmitDelay,
        checkParametersInterval,
        pstatVoltage,
        pstatTIA,
        glm,
        coat: formatDate(coat),
        onTest: formatDate(onTest),
        enzyme,
        testStation,
      })
    }
  }, [getDeviceData])

  let getDeviceContent: JSX.Element | null = null
  if (getDeviceIsFetching) {
    getDeviceContent = <h3>Fetching...</h3>
  } else if (getDeviceIsLoading) {
    getDeviceContent = <h3>Loading...</h3>
  } else if (getDeviceIsError) {
    console.log("getDeviceError:", getDeviceError)

    const errorMessageString = JSON.stringify(getDeviceError)
    const errorMessageParsed = JSON.parse(errorMessageString)
    getDeviceContent = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (getDeviceIsSuccess && getDeviceData) {
    getDeviceContent = null
  }

  const canSave =
    [
      formValues.macAddress,
      formValues.deviceName,
      formValues.password,
      formValues.baseUri,
      formValues.jwtToken,
      formValues.jwtRefreshToken,
      formValues.rtc,
      formValues.sessionStartTime,
      formValues.sessionEndTime,
      formValues.measurementInterval,
      formValues.transmitDelay,
      formValues.checkParametersInterval,
      formValues.pstatVoltage,
      formValues.pstatTIA,
      formValues.glm,
      formValues.coat,
      formValues.onTest,
      formValues.enzyme,
      formValues.testStation,
    ].every((value) => value !== undefined && value !== null && value !== "") &&
    !getDeviceIsLoading &&
    !isDeletingDevice &&
    !isEditingDevice

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    navigate("/devices")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editDevice({ deviceId, ...formValues })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      navigate("/devices")
    }, 0)
  }

  const handleDelete = async () => {
    try {
      await deleteDevice(deviceId)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null
  if (isEditingDevice || isDeletingDevice) {
    content = <h3>Loading...</h3>
  } else if (isEditError || isDeleteError) {
    const errorMessageString = isEditError
      ? JSON.stringify(editError)
      : JSON.stringify(deleteError)
    const errorMessageParsed = JSON.parse(errorMessageString)
    content = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (isEditSuccess || isDeleteSuccess) {
    handleMutationSuccess()
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a device"
        subtitle="(complete all fields to edit a device)"
      />
      {getDeviceContent}
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="deviceName"
            label="Device Name"
            value={formValues.deviceName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: formValues.deviceName !== "",
            }}
          />
          {/* <TextField
            name="macAddress"
            label="MAC Address"
            type="password"
            value={formValues.macAddress}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{
              shrink: formValues.macAddress !== "",
            }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{
              shrink: formValues.password !== "",
            }}
          /> */}
          <TextField
            name="baseUri"
            label="Base URI"
            value={formValues.baseUri}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: formValues.baseUri !== "",
            }}
          />
          {/* <TextField
            name="jwtToken"
            label="JWT Token"
            type="password"
            value={formValues.jwtToken}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{
              shrink: formValues.jwtToken !== "",
            }}
          />
          <TextField
            name="jwtRefreshToken"
            label="JWT Refresh Token"
            type="password"
            value={formValues.jwtRefreshToken}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{
              shrink: formValues.jwtRefreshToken !== "",
            }}
          />
          <TextField
            name="rtc"
            label="RTC"
            type="datetime-local"
            value={formValues.rtc}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{
              shrink: formValues.rtc !== undefined && formValues.rtc !== null,
            }}
          /> */}
          <TextField
            name="measurementInterval"
            label="Measurement Interval"
            type="number"
            value={formValues.measurementInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: Boolean(formValues.measurementInterval),
            }}
          />
          <TextField
            name="transmitDelay"
            label="Transmit Delay"
            type="number"
            value={formValues.transmitDelay}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.transmitDelay !== undefined &&
                formValues.transmitDelay !== null,
            }}
          />
          <TextField
            name="checkParametersInterval"
            label="Check Parameters Interval"
            type="number"
            value={formValues.checkParametersInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.checkParametersInterval !== undefined &&
                formValues.checkParametersInterval !== null,
            }}
          />
          <TextField
            name="pstatVoltage"
            label="Pstat Voltage"
            type="number"
            value={formValues.pstatVoltage}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.pstatVoltage !== undefined &&
                formValues.pstatVoltage !== null,
            }}
          />
          <TextField
            name="pstatTIA"
            label="Pstat TIA"
            type="number"
            value={formValues.pstatTIA}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.pstatTIA !== undefined &&
                formValues.pstatTIA !== null,
            }}
          />
          <TextField
            name="glm"
            label="GLM"
            type="number"
            value={formValues.glm}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: formValues.glm !== undefined && formValues.glm !== null,
            }}
          />
          <TextField
            name="enzyme"
            label="Enzyme"
            type="number"
            value={formValues.enzyme}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.enzyme !== undefined && formValues.enzyme !== null,
            }}
          />
          <TextField
            name="testStation"
            label="Test Station"
            type="number"
            value={formValues.testStation}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.testStation !== undefined &&
                formValues.testStation !== null,
            }}
          />
          <TextField
            name="coat"
            label="Coat"
            type="datetime-local"
            value={formValues.coat}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: formValues.coat !== undefined && formValues.coat !== null,
            }}
          />
          <TextField
            name="onTest"
            label="On Test"
            type="datetime-local"
            value={formValues.onTest}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink:
                formValues.onTest !== undefined && formValues.onTest !== null,
            }}
          />
          {content}

          <Box mt={2} display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="flex-start" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!canSave}
              >
                Submit
              </Button>
            </Box>

            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default EditDevice
