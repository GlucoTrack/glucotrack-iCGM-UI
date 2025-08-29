import Header from "@/components/Header"
import { Box, Button, MenuItem, TextField, useTheme } from "@mui/material"
import React, { JSX, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAddMobileMutation } from "../api/apiSlice"
import TrimmedTextField from "@/components/TrimmedTextField"

interface FormValues {
  mobileName: string
  baseUri: string
  sensorId: string
  sensorName: string
  measurementInterval: number
  reportInterval: number
  refMillivolts: number
  weMillivolts: number
  filterLength: number
  checkParametersInterval: number
  gain?: number
  slope?: number
  bias?: number
  comment: string
}

const initialValues: FormValues = {
  mobileName: "XXXXXX",
  baseUri: "https://stg-icgm.herokuapp.com/api/v1",
  sensorId: "XX:XX:XX:XX:XX",
  sensorName: "XXXXXX",
  measurementInterval: 30,
  reportInterval: 600,
  refMillivolts: 600,
  weMillivolts: 1200,
  filterLength: 10,
  checkParametersInterval: 60,
  comment: "test",
  gain: 0,
}

const AddMobile: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [addMobile, { isLoading, isError, error, isSuccess }] =
    useAddMobileMutation()
  const canSave =
    [
      formValues.mobileName,
      formValues.baseUri,
      formValues.sensorId,
      formValues.sensorName,
      formValues.measurementInterval,
      formValues.reportInterval,
      formValues.refMillivolts,
      formValues.weMillivolts,
      formValues.filterLength,
      formValues.checkParametersInterval,
      formValues.comment,
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
        await addMobile(formValues)
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/mobiles")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/mobiles")
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

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new mobile"
        subtitle="(add multiple mobiles by separating mobileName with a comma)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TrimmedTextField
            name="mobileName"
            label="Mobile Name(s)"
            type="text"
            value={formValues.mobileName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="baseUri"
            label="Base URI"
            type="text"
            value={formValues.baseUri}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="sensorId"
            label="Sensor ID"
            type="text"
            value={formValues.sensorId}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="sensorName"
            label="Sensor Name"
            type="text"
            value={formValues.sensorName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="measurementInterval"
            label="Measurement Interval"
            type="number"
            value={formValues.measurementInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="reportInterval"
            label="Report Interval"
            type="number"
            value={formValues.reportInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="refMillivolts"
            label="Ref Millivolts"
            type="number"
            value={formValues.refMillivolts}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="weMillivolts"
            label="WE Millivolts"
            type="number"
            value={formValues.weMillivolts}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="filterLength"
            label="Filter Length"
            type="number"
            value={formValues.filterLength}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
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
            name="gain"
            label="Gain"
            select
            value={formValues.gain}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
          </TextField>
          <TrimmedTextField
            name="slope"
            label="Slope"
            value={formValues.slope}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="bias"
            label="Bias"
            value={formValues.bias}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="comment"
            label="Comment"
            type="text"
            value={formValues.comment}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          {content}
          <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
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
          </Box>{" "}
        </form>
      </Box>
    </Box>
  )
}

export default AddMobile
