import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAddMobileMutation } from "../api/apiSlice"

interface FormValues {
  name: string
  version: string
  url: string
}

const initialValues: FormValues = {
  name: "XXXXXX",
  version: "",
  url: "",
}

const AddFirmware: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [addMobile, { isLoading, isError, error, isSuccess }] =
    useAddMobileMutation()
  const canSave =
    [formValues.name, formValues.version, formValues.url].every(
      (value) => value !== undefined && value !== null && value !== "",
    ) && !isLoading

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
      navigate("/firmwares")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/firmwares")
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
        title="Add a new firmware"
        subtitle="(fill in all fields)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="name"
            label="Name"
            type="text"
            value={formValues.name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="version"
            label="Version"
            type="text"
            value={formValues.version}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="url"
            label="URL"
            type="text"
            value={formValues.url}
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

export default AddFirmware
