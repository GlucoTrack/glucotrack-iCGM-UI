import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAddDeviceMutation, useVerifyRoleAccessMutation } from "../api/apiSlice"

import { useAuth } from '../context/authContext';
import { authenticateRoleAddDevice} from '../../hooks/useRoleAuth';

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

const AddDevice: React.FC = () => {
  const { role, username } = useAuth();
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  // To check WRITE permissions in  DB:
  const [writePermission, setWritePermission] = useState(false);
  const [verifyRoleAccess, { data: roleAccessData, isLoading: checkroleIsLoading }] = useVerifyRoleAccessMutation();

  // const canWriteUsers = hasPermission(permissions, 'Users', 'Write');
  //

  const [addDevice, { isLoading, isError, error, isSuccess }] =
    useAddDeviceMutation()
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
    !isLoading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await addDevice(formValues)
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/devices")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/devices")
  }

  let content: JSX.Element | null = null
  if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    const errorMessageString = JSON.stringify(error)
    const errorMessageParsed = JSON.parse(errorMessageString)
    content = (
      <p style={{ color: theme.palette.error.main }}>
        {JSON.stringify(errorMessageParsed.data.message)}
      </p>
    )
  } else if (isSuccess) {
    handleMutationSuccess()
  }

  // ----------   Role-based access control (RBAC): ------------- //
  //
  // Option B: verify in the DataBase if the given role has permissions for the given feature/access:
  //
  useEffect(() => {
    if (role) {
      verifyRoleAccess([
        { feature: 'Devices', levelOfAccess: 'Write' },
      ]);
    } else {
      setWritePermission(false);
    }
  }, [role, verifyRoleAccess]);

  useEffect(() => {
    if (roleAccessData) {
      setWritePermission(roleAccessData?.results[0]);
    }
  }, [roleAccessData]);


  if (!writePermission) {   // using a DB query via API
  //if (!authenticateRoleAddDevice(role)) {
    return <p>Forbidden access - no permission to perform action</p>;
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new device"
        subtitle="(add multiple devices by separating Device Names with a space)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="deviceName"
            label="Device Name(s)"
            value={formValues.deviceName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="macAddress"
            label="MAC Address"
            type="password"
            value={formValues.macAddress}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
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
          />
          <TextField
            name="baseUri"
            label="Base URI"
            value={formValues.baseUri}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            name="jwtToken"
            label="JWT Token"
            type="password"
            value={formValues.jwtToken}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled
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
              shrink: true,
            }}
          />
          <TextField
            name="measurementInterval"
            label="Measurement Interval"
            type="number"
            value={formValues.measurementInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
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
              shrink: true,
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
              shrink: true,
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
          />
          {content}
          <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>{" "}
        </form>
      </Box>
    </Box>
  )
}

export default AddDevice
