import Header from "@/components/Header"
import {
  Box,
  Button,
  TextField,
  useTheme,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useGetUserQuery,
  useEditUserMutation,
  useDeleteUserMutation,
} from "@/features/api/apiSlice"

interface FormValues {
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

const EditUser: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  const { id } = useParams<Record<string, string>>()

  const {
    data: getUserData,
    // status: getUserStatus,
    isFetching: getUserIsFetching,
    isLoading: getUserIsLoading,
    isSuccess: getUserIsSuccess,
    isError: getUserIsError,
    error: getUserError,
  } = useGetUserQuery(id)

  const [
    deleteUser,
    {
      isLoading: isDeletingUser,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteUserMutation()

  const [
    editUser,
    {
      isLoading: isEditingUser,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditUserMutation()

  useEffect(() => {
    if (getUserData) {
      const {
        baseUri,
        sensorId,
        measurementInterval,
        reportInterval,
        refMillivolts,
        weMillivolts,
        filterLength,
        checkParametersInterval,
        comment,
        blinded,
        userId,
        email,
      } = getUserData

      setUserId(userId)
      setEmail(email)

      setFormValues({
        baseUri,
        sensorId,
        measurementInterval,
        reportInterval,
        refMillivolts,
        weMillivolts,
        filterLength,
        checkParametersInterval,
        comment,
        blinded,
      })
    }
  }, [getUserData])

  let getUserContent: JSX.Element | null = null
  if (getUserIsFetching) {
    getUserContent = <h3>Fetching...</h3>
  } else if (getUserIsLoading) {
    getUserContent = <h3>Loading...</h3>
  } else if (getUserIsError) {
    console.log("getUserError:", getUserError)

    const errorMessageString = JSON.stringify(getUserError)
    const errorMessageParsed = JSON.parse(errorMessageString)
    getUserContent = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (getUserIsSuccess && getUserData) {
    getUserContent = null
  }

  const canSave =
    [
      formValues.baseUri,
      formValues.measurementInterval,
      formValues.reportInterval,
      formValues.refMillivolts,
      formValues.weMillivolts,
      formValues.filterLength,
      formValues.checkParametersInterval,
    ].every((value) => value !== undefined && value !== null && value !== "") &&
    !getUserIsLoading &&
    !isDeletingUser &&
    !isEditingUser

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    navigate("/users")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editUser({ id, ...formValues })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      navigate("/users")
    }, 0)
  }

  const handleDelete = async () => {
    try {
      await deleteUser(id)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null
  if (isEditingUser || isDeletingUser) {
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

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a user"
        subtitle="(complete all fields to edit a user)"
      />
      {getUserContent}
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="userId"
            label="User ID"
            type="text"
            value={userId}            
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="email"
            label="Email"
            type="text"
            value={email}            
            fullWidth
            margin="normal"
            disabled
            InputLabelProps={{ shrink: true }}
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
                onChange={(event) => {
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    blinded: event.target.checked,
                  }))
                }}
              />
            }
            label="Blinded"
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

export default EditUser
