import React, { JSX, useContext, useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Autocomplete, Box, Button, Divider, TextField } from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteUserGroupMutation,
  useEditUserGroupMutation,
  useEditUsersMutation,
  useGetUsersQuery,
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetUserGroup } from "./groupsSlice"
import { Typography } from "@mui/material"
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

interface UserValues {
  _id?: string
  measurementInterval: string
  reportInterval: string
  refMillivolts: string
  weMillivolts: string
  filterLength: string
  checkParametersInterval: string
}

const initialUserValues: UserValues = {
  measurementInterval: "",
  reportInterval: "",
  refMillivolts: "",
  weMillivolts: "",
  filterLength: "",
  checkParametersInterval: "",
}

const EditUserGroup: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { openSnackbar } = useContext(SnackbarContext)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [formUserValues, setFormUserValues] =
    useState<UserValues>(initialUserValues)
  const [isUserSubmitting, setIsUserSubmitting] = useState(false)
  const { data, isFetching, isLoading } = useGetUsersQuery({})
  const { groupId } = useParams<Record<string, string>>()
  const { groupName, groupDescription, userIds } = useSelector(
    (state: RootState) => state.userGroups,
  )
  const [currentOptions, setCurrentOptions] = useState<any[]>([])
  const [
    editGroup,
    {
      isLoading: isEditingGroup,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditUserGroupMutation()
  const [
    deleteGroup,
    {
      isLoading: isDeletingGroup,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteUserGroupMutation()
  const [editUsers] = useEditUsersMutation()

  // Fill the attributes form with the common values of the selected users
  useEffect(() => {
    if (formValues.userIds.length > 0 && data) {
      // Get the user from the selected user names
      const users = formValues.userIds
        .map((usr: any) => {
          if (typeof usr === "string") {
            return data.find((user: any) => user.userId === usr)
          }
          return data.find((user: any) => user.userId === usr.id)
        })
        .filter((user) => user !== null)

      setCurrentOptions(
        users.map((user: any) => ({
          label: user.email,
          id: user.userId,
        })),
      )

      if (users.length === 0) {
        return
      }

      // Get the common values from the first user
      const commonValue: UserValues = {
        measurementInterval: users[0].measurementInterval,
        reportInterval: users[0].reportInterval,
        refMillivolts: users[0].refMillivolts,
        weMillivolts: users[0].weMillivolts,
        filterLength: users[0].filterLength,
        checkParametersInterval: users[0].checkParametersInterval,
      }

      // Check if all the users have the same values, instead i put empty string
      for (let i = 1; i < users.length; i++) {
        const user = users[i]
        if (commonValue.measurementInterval !== user.measurementInterval) {
          commonValue.measurementInterval = ""
        }
        if (commonValue.reportInterval !== user.reportInterval) {
          commonValue.reportInterval = ""
        }
        if (commonValue.refMillivolts !== user.refMillivolts) {
          commonValue.refMillivolts = ""
        }
        if (commonValue.weMillivolts !== user.weMillivolts) {
          commonValue.weMillivolts = ""
        }
        if (commonValue.filterLength !== user.filterLength) {
          commonValue.filterLength = ""
        }
        if (
          commonValue.checkParametersInterval !== user.checkParametersInterval
        ) {
          commonValue.checkParametersInterval = ""
        }
      }

      setFormUserValues(commonValue)
    }
  }, [data, formValues.userIds])

  useEffect(() => {
    const savedFormValues = localStorage.getItem("userGroupValues_" + groupId)

    const setDefaultValues = () => {
      localStorage.setItem(
        "userGroupValues_" + groupId,
        JSON.stringify({
          groupName,
          groupDescription,
          userIds,
        }),
      )
      setFormValues({
        groupName,
        groupDescription,
        userIds,
      })
    }

    if (savedFormValues) {
      const parsedFormValues = JSON.parse(savedFormValues)
      if (
        parsedFormValues.groupName &&
        parsedFormValues.groupDescription &&
        parsedFormValues.userIds
      ) {
        setFormValues(parsedFormValues)
      } else {
        setDefaultValues()
      }
    } else {
      setDefaultValues()
    }
  }, [groupName, groupDescription, userIds, groupId])

  const canSave =
    [
      formValues.groupName,
      formValues.groupDescription,
      formValues.userIds,
    ].every(Boolean) &&
    !isEditingGroup &&
    !isDeletingGroup

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const canSaveUser = [
    formUserValues.measurementInterval,
    formUserValues.reportInterval,
    formUserValues.refMillivolts,
    formUserValues.weMillivolts,
    formUserValues.filterLength,
    formUserValues.checkParametersInterval,
  ].some((value) => value !== undefined && value !== null && value !== "")

  const handleCancel = () => {
    setTimeout(() => {
      dispatch(resetUserGroup())
      navigate("/user-groups")
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editGroup({
          groupId,
          ...formValues,
          userIds: formValues.userIds.map((user: any) => user.id).join(","),
        })
        localStorage.setItem(
          "userGroupValues_" + groupId,
          JSON.stringify(formValues),
        )
      } catch (error: any) {
        console.error(error)
        localStorage.removeItem("userGroupValues_" + groupId)
      }
    }
  }

  const handleMutationSuccess = useCallback(() => {
    setTimeout(() => {
      dispatch(resetUserGroup())
      navigate("/user-groups")
    }, 0)
  }, [dispatch, navigate])

  const handleDelete = async () => {
    try {
      await deleteGroup(groupId)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null

  useEffect(() => {
    if (isEditingGroup || isDeletingGroup) {
      openSnackbar("loading...", "warning")
    } else if (isEditError || isDeleteError) {
      const errorMessageString = isEditError
        ? JSON.stringify(editError)
        : JSON.stringify(deleteError)
      const errorMessageParsed = JSON.parse(errorMessageString)
      const errorMessage = JSON.stringify(errorMessageParsed.data.message)
      openSnackbar(errorMessage, "error")
    } else if (isEditSuccess) {
      openSnackbar("User Group updated successfully", "success")
      handleMutationSuccess()
    } else if (isDeleteSuccess) {
      openSnackbar("User Group deleted successfully", "success")
      handleMutationSuccess()
    }
  }, [
    isEditingGroup,
    isDeletingGroup,
    isEditError,
    isDeleteError,
    deleteError,
    editError,
    isEditSuccess,
    isDeleteSuccess,
    openSnackbar,
    handleMutationSuccess,
  ])

  const handleEditUsersResponse = (response: any, users: any) => {
    if (response?.error?.data) {
      const errorMessage = response.error.data.errors
        ? response.error.data.errors.join(", ")
        : response.error.data.message
      openSnackbar(errorMessage, "error")
    } else {
      if (response?.data?.updatedIds) {
        const updatedUserIds = response.data.updatedIds
        const failedUserIds = response.data.failedIds
        const allUsersUpdated = users.every((userId: any) =>
          updatedUserIds.includes(userId),
        )
        const message = allUsersUpdated
          ? "All users updated successfully"
          : `The following users were not updated: ${failedUserIds.join(", ")}`
        setFormUserValues(initialUserValues)
        openSnackbar(message, allUsersUpdated ? "success" : "warning")
      } else {
        openSnackbar("Failed to edit users", "error")
      }
    }
  }

  const handleUsers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUserSubmitting(true)
    if (canSaveUser) {
      try {
        const users = currentOptions
          .map((userSelected: any) => {
            const user = data.find(
              (user: any) => user.userId === userSelected.id,
            )
            return user ? user._id : null
          })
          .filter((id) => id !== null)

        const nonEmptyFormUserValues = Object.fromEntries(
          Object.entries(formUserValues).filter(
            ([_key, value]) => value !== "",
          ),
        )

        const response = await editUsers({
          userIds: users,
          ...nonEmptyFormUserValues,
        })
        handleEditUsersResponse(response, users)
      } catch (error: any) {
        openSnackbar("Failed to edit user: " + error.message, "error")
      } finally {
        setIsUserSubmitting(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (!isNaN(Number(value)) || value === "") {
      setFormUserValues((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a user group"
        subtitle="(compete each field below to edit a group)"
      />
      <Box flexGrow={1} overflow="auto" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            id="groupName"
            name="groupName"
            label="User Group Name"
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
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            options={
              data
                ? data.map((user: any) => {
                    return { label: user.email, id: user.userId }
                  })
                : []
            }
            value={currentOptions}
            onChange={(_event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                userIds: newValue,
              }))
            }}
            renderInput={(params) => (
              <TextField
                sx={{ mt: 2 }}
                {...params}
                label={"User Names"}
                fullWidth
              />
            )}
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
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>

            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </form>
      </Box>

      <Divider sx={{ mt: 3, mb: 3 }} />

      <Box flexGrow={5} overflow="auto" width="100%">
        <Typography sx={{ mb: 2 }}>
          Modify the attributes of every user within this group
        </Typography>

        <form onSubmit={handleUsers}>
          <TextField
            id="measurementInterval"
            name="measurementInterval"
            label="Measurement Interval"
            value={formUserValues.measurementInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="reportInterval"
            name="reportInterval"
            label="Report Interval"
            value={formUserValues.reportInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="refMillivolts"
            name="refMillivolts"
            label="Ref Millivolts"
            value={formUserValues.refMillivolts}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="weMillivolts"
            name="weMillivolts"
            label="We Millivolts"
            value={formUserValues.weMillivolts}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="filterLength"
            name="filterLength"
            label="Filter Length"
            value={formUserValues.filterLength}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="checkParametersInterval"
            name="checkParametersInterval"
            label="Check Parameters Interval"
            value={formUserValues.checkParametersInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />

          <Box mt={2} display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="flex-start" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFormUserValues(initialUserValues)
                }}
              >
                Reset values
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUserSubmitting || !canSaveUser}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default EditUserGroup
