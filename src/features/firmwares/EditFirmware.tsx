import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useGetFirmwaresQuery,
  useEditFirmwareMutation,
  useDeleteFirmwareMutation,
} from "@/features/api/apiSlice"

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

const EditFirmware: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const { firmwareId } = useParams<Record<string, string>>()

  const {
    data: getFirmwareData,
    isFetching: getfirmwareIsFetching,
    isLoading: getfirmwareIsLoading,
    isSuccess: getfirmwareIsSuccess,
    isError: getfirmwareIsError,
    error: getfirmwareError,
  } = useGetFirmwaresQuery(firmwareId)

  const [
    deletefirmware,
    {
      isLoading: isDeletingfirmware,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteFirmwareMutation()

  const [
    editfirmware,
    {
      isLoading: isEditingfirmware,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditFirmwareMutation()

  useEffect(() => {
    if (getFirmwareData) {
      const { name, version, url } = getFirmwareData

      setFormValues({
        name,
        version,
        url,
      })
    }
  }, [getFirmwareData])

  let getfirmwareContent: JSX.Element | null = null
  if (getfirmwareIsFetching) {
    getfirmwareContent = <h3>Fetching...</h3>
  } else if (getfirmwareIsLoading) {
    getfirmwareContent = <h3>Loading...</h3>
  } else if (getfirmwareIsError) {
    console.log("getFirmwareError:", getfirmwareError)

    const errorMessageString = JSON.stringify(getfirmwareError)
    const errorMessageParsed = JSON.parse(errorMessageString)
    getfirmwareContent = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (getfirmwareIsSuccess && getFirmwareData) {
    getfirmwareContent = null
  }

  const canSave =
    [formValues.name, formValues.version, formValues.url].every(
      (value) => value !== undefined && value !== null && value !== "",
    ) &&
    !getfirmwareIsLoading &&
    !isDeletingfirmware &&
    !isEditingfirmware

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    navigate("/firmwares")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editfirmware({ firmwareId, ...formValues })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      navigate("/firmwares")
    }, 0)
  }

  const handleDelete = async () => {
    try {
      await deletefirmware(firmwareId)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null
  if (isEditingfirmware || isDeletingfirmware) {
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

  console.log(content)

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a firmware"
        subtitle="(complete all fields to edit a firmware)"
      />
      {getfirmwareContent}
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="name"
            label="Name("
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

export default EditFirmware
