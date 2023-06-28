import Header from "@/components/Header"
import { Box, Button, TextField } from "@mui/material"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

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
  password: "########",
  baseUri: "https://prd-icgm.herokuapp.com/api/v1",
  jwtToken: "######################",
  jwtRefreshToken: "######################",
  rtc: "2022-11-11T11:11:11.110Z",
  sessionStartTime: "2022-11-11T11:11:11.110Z",
  sessionEndTime: "2029-11-11T11:11:11.110Z",
  measurementInterval: 10,
  transmitDelay: 0,
  checkParametersInterval: 60,
  pstatVoltage: 0.6,
  pstatTIA: 0,
  glm: 0,
  coat: "2029-11-11T11:11:11.110Z",
  onTest: "2029-11-11T11:11:11.110Z",
  enzyme: 0,
  testStation: 0,
}

const AddDevice: React.FC = () => {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formValues)
  }

  const handleCancel = () => {
    navigate("/devices")
  }

  return (
    <>
      <Header
        title="Add a new device"
        subtitle="(add multiple devices by separating Device Names with a space)"
      />
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
        <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>{" "}
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>
    </>
  )
}

export default AddDevice
