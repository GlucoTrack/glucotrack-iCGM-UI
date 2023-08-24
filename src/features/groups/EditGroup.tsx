import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Box, Button, TextField, useTheme } from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteGroupMutation,
  useEditGroupMutation,
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetGroup } from "./groupsSlice"

import { useAuth } from '../context/authContext';
import { authenticateRoleEditGroup } from '../../hooks/useRoleAuth';

interface FormValues {
  groupName: string
  groupDescription: string
  deviceNames: string
}

const initialValues: FormValues = {
  groupName: "",
  groupDescription: "",
  deviceNames: "",
}

const EditGroup: React.FC = () => {
  const { role, username } = useAuth();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const { groupId } = useParams<Record<string, string>>()
  const { groupName, groupDescription, deviceNames } = useSelector(
    (state: RootState) => state.groups,
  )
  const [
    editGroup,
    {
      isLoading: isEditingGroup,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditGroupMutation()
  const [
    deleteGroup,
    {
      isLoading: isDeletingGroup,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteGroupMutation()

  useEffect(() => {
    setFormValues({
      groupName: groupName,
      groupDescription: groupDescription,
      deviceNames: deviceNames,
    })
  }, [groupName, groupDescription, deviceNames])

  const canSave =
    [
      formValues.groupName,
      formValues.groupDescription,
      formValues.deviceNames,
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

  const handleCancel = () => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editGroup({ groupId, ...formValues })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
    }, 0)
  }

  const handleDelete = async () => {
    try {
      await deleteGroup(groupId)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null
  if (isEditingGroup || isDeletingGroup) {
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

  // // Role-based access control (RBAC):
  // //
  // if (!authenticateRoleEditGroup(role)) {
  //   return <p>Forbidden access - no permission to perform action</p>;
  // }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a group"
        subtitle="(compete each field below to edit a group)"
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
          <TextField
            id="deviceNames"
            name="deviceNames"
            label="Device Names"
            value={formValues.deviceNames}
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
    </Box>
  )
}

export default EditGroup
