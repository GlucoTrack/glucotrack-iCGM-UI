import Header from "@/components/Header"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  useTheme,
} from "@mui/material"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAddUserMutation } from "../api/apiSlice"

interface FormValues {
  userId: string
  baseUri: string
  measurementInterval: number
  reportInterval: number
  refMillivolts: number
  weMillivolts: number
  filterLength: number
  checkParametersInterval: number
  blinded: boolean
  sensorId?: string
  comment?: string
}

const initialValues: FormValues = {
  userId: "",
  baseUri: "https://stg-icgm.herokuapp.com/api/v1",
  measurementInterval: 30,
  reportInterval: 600,
  refMillivolts: 600,
  weMillivolts: 1200,
  filterLength: 10,
  checkParametersInterval: 60,
  comment: "test",
  blinded: false,
}

const AddUser: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [addMobile, { isLoading, isError, error, isSuccess }] =
    useAddUserMutation()
  const canSave =
    [
      formValues.userId,
      formValues.baseUri,
      formValues.measurementInterval,
      formValues.reportInterval,
      formValues.refMillivolts,
      formValues.weMillivolts,
      formValues.filterLength,
      formValues.checkParametersInterval,
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
      navigate("/users")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/users")
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
      <Header title="Add a new user" subtitle="(fill in all fields)" />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="userId"
            label="Clerk ID"
            type="text"
            value={formValues.userId}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="baseUri"
            label="Base URI"
            type="text"
            value={formValues.baseUri}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="sensorId"
            label="Sensor ID"
            type="text"
            value={formValues.sensorId}
            onChange={handleChange}
            fullWidth
            margin="normal"
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
            name="reportInterval"
            label="Report Interval"
            type="number"
            value={formValues.reportInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="refMillivolts"
            label="Ref Millivolts"
            type="number"
            value={formValues.refMillivolts}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="weMillivolts"
            label="WE Millivolts"
            type="number"
            value={formValues.weMillivolts}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="filterLength"
            label="Filter Length"
            type="number"
            value={formValues.filterLength}
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
            name="comment"
            label="Comment"
            type="text"
            value={formValues.comment}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formValues.blinded || false}
                onChange={handleChange}
              />
            }
            label="Blinded"
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

export default AddUser
