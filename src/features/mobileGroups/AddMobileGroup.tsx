import React, { useState, useContext, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, Autocomplete } from "@mui/material"
import { useGetMobilesQuery } from "@/features/api/apiSlice"
import Header from "@/components/Header"
import { useAddMobileGroupMutation } from "@/features/api/apiSlice"
import { SnackbarContext } from "../../providers/SnackbarProvider"

interface FormValues {
  mobileGroupName: string
  mobileGroupDescription: string
  mobileNames: string[]
}

const initialValues: FormValues = {
  mobileGroupName: "",
  mobileGroupDescription: "",
  mobileNames: [],
}

const AddMobileGroup: React.FC = () => {
  const navigate = useNavigate()
  const { openSnackbar } = useContext(SnackbarContext)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const { data, isFetching } = useGetMobilesQuery({})
  const [addGroup, { isLoading, isError, error, isSuccess }] =
    useAddMobileGroupMutation()
  const canSave =
    [
      formValues.mobileGroupName,
      formValues.mobileGroupDescription,
      formValues.mobileNames,
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
          mobileNames: formValues.mobileNames.join(","),
        })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = useCallback(() => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/mobile-groups")
    }, 0)
  }, [navigate])

  const handleCancel = () => {
    navigate("/mobile-groups")
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
        title="Add a new mobile group"
        subtitle="(add multiple mobiles by separating Mobile Names with a comma)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            id="mobileGroupName"
            name="mobileGroupName"
            label="Group Name"
            value={formValues.mobileGroupName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            id="mobileGroupDescription"
            name="mobileGroupDescription"
            label="Group Description"
            value={formValues.mobileGroupDescription}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <Autocomplete
            multiple
            loading={isFetching || isLoading}
            options={data ? data.map((mobile: any) => mobile.mobileName) : []}
            value={formValues.mobileNames ?? []}
            onChange={(_event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                mobileNames: newValue,
              }))
            }}
            renderInput={(params) => (
              <TextField {...params} label={"Mobile Names"} fullWidth />
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

export default AddMobileGroup
