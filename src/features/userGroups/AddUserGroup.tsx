import React, { useState, useContext, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, Autocomplete } from "@mui/material"
import { useGetUsersQuery } from "@/features/api/apiSlice"
import Header from "@/components/Header"
import { useAddUserGroupMutation } from "@/features/api/apiSlice"
import { SnackbarContext } from "../../providers/SnackbarProvider"

interface FormValues {
  groupName: string
  groupDescription: string
  userIds: string[]
}

const initialValues: FormValues = {
  groupName: "",
  groupDescription: "",
  userIds: [],
}

const AddUserGroup: React.FC = () => {
  const navigate = useNavigate()
  const { openSnackbar } = useContext(SnackbarContext)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const { data, isFetching } = useGetUsersQuery({})
  const [addGroup, { isLoading, isError, error, isSuccess }] =
    useAddUserGroupMutation()
  const canSave =
    [
      formValues.groupName,
      formValues.groupDescription,
      formValues.userIds,
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
        console.log(formValues.userIds)
        await addGroup({
          ...formValues,
          userIds: formValues.userIds.map((user:any) => user.id).join(","),
        })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = useCallback(() => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/user-groups")
    }, 0)
  }, [navigate])

  const handleCancel = () => {
    navigate("/user-groups")
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
    handleMutationSuccess,
    openSnackbar,
  ])

  let content: JSX.Element | null = null

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new user group"
        subtitle="(add multiple user by separating User with a comma)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            id="groupName"
            name="groupName"
            label="Group Name"
            value={formValues.groupName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
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
            options={
              data && data.users
                ? data.users.map((user: any) => {
                    return { label: user.email, id: user.userId }
                  })
                : []
            }
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            value={formValues.userIds ?? []}
            onChange={(_event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                userIds: newValue,
              }))
            }}
            renderInput={(params) => (
              <TextField {...params} label={"Users"} fullWidth />
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

export default AddUserGroup
