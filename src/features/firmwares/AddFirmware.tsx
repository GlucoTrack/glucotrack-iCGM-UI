import Header from "@/components/Header"
import { Box, Button, useTheme } from "@mui/material"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAddFirmwareMutation } from "../api/apiSlice"
import { MuiFileInput } from "mui-file-input"
import TrimmedTextField from "@/components/TrimmedTextField"

interface FormValues {
  name: string
  version: string
  file: string
}

const initialValues: FormValues = {
  name: "",
  version: "",
  file: "",
}

const AddFirmware: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [tempFileValue, setTempFileValue] = useState<File | null>(null)
  const [addMobile, { isLoading, isError, error, isSuccess }] =
    useAddFirmwareMutation()
  const canSave =
    [formValues.name, formValues.version, formValues.file].every(
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

  const handleFileChange = (file: File | null) => {
    if (file) {
      setTempFileValue(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        const base64 = result.split(",")[1]
        setFormValues((prevValues) => ({
          ...prevValues,
          file: base64,
          name: file.name,
        }))
      }
      reader.readAsDataURL(file)
    }
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
      <Header title="Add a new firmware" subtitle="(fill in all fields)" />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TrimmedTextField
            name="version"
            label="Version"
            type="text"
            placeholder="(ex. Rls 0.5.17)"
            value={formValues.version}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <MuiFileInput
            value={tempFileValue}
            placeholder="Select the file"
            onChange={handleFileChange}
            sx={{ mt: 2, mb: 1 }}
            inputProps={{ accept: ".fota" }}
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
