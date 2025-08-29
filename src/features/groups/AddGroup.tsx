import React, { JSX, useState, useContext, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, Autocomplete } from "@mui/material"
import { useGetDevicesQuery } from "@/features/api/apiSlice"
import Header from "@/components/Header"
import { useAddGroupMutation } from "@/features/api/apiSlice"
import { SnackbarContext } from "../../providers/SnackbarProvider"
import TrimmedTextField from "@/components/TrimmedTextField"

interface FormValues {
  groupName: string
  groupDescription: string
  deviceNames: string[]
}

const initialValues: FormValues = {
  groupName: "",
  groupDescription: "",
  deviceNames: [],
}

const AddGroup: React.FC = () => {
  const navigate = useNavigate()
  const { openSnackbar } = useContext(SnackbarContext)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const { data, isFetching } = useGetDevicesQuery({})
  const [addGroup, { isLoading, isError, error, isSuccess }] =
    useAddGroupMutation()
  const canSave =
    [
      formValues.groupName,
      formValues.groupDescription,
      formValues.deviceNames,
    ].every(Boolean) && !isLoading

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
        await addGroup({
          ...formValues,
          deviceNames: formValues.deviceNames.join(","),
        })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = useCallback(() => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/groups")
    }, 0)
  }, [navigate])

  const handleCancel = () => {
    navigate("/groups")
  }

  useEffect(() => {
    if (isLoading) {
      openSnackbar("loading...", "warning")
    } else if (isError) {
      const errorMessageString = JSON.stringify(error)
      const errorMessageParsed = JSON.parse(errorMessageString)
      const errorMessage = JSON.stringify(errorMessageParsed.data.message)
      openSnackbar(errorMessage, "error")
    } else if (isSuccess) {
      openSnackbar("Group updated successfully", "success")
      handleMutationSuccess()
    }
  }, [
    isError,
    error,
    isLoading,
    isSuccess,
    openSnackbar,
    handleMutationSuccess,
  ])

  let content: JSX.Element | null = null

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new group"
        subtitle="(add multiple devices by separating Device Names with a comma)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TrimmedTextField
            id="groupName"
            name="groupName"
            label="Group Name"
            value={formValues.groupName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            id="groupDescription"
            name="groupDescription"
            label="Group Description"
            value={formValues.groupDescription}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <Autocomplete
            multiple
            loading={isFetching || isLoading}
            options={data ? data.map((device: any) => device.deviceName) : []}
            value={formValues.deviceNames ?? []}
            onChange={(_event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                deviceNames: newValue,
              }))
            }}
            renderInput={(params) => (
              <TrimmedTextField {...params} label={"Device Names"} fullWidth />
            )}
          />
          {content}

          <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default AddGroup
