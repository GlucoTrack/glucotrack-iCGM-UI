import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Autocomplete, Box, Button, TextField, useTheme } from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteGroupMutation,
  useEditGroupMutation,
  useGetDevicesQuery,
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetGroup } from "./groupsSlice"
import { group } from "console"

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

const EditGroup: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const { data, isFetching, isLoading } = useGetDevicesQuery({})

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
    const savedFormValues = localStorage.getItem('groupValues_' + groupId);

    const setDefaultValues = () => {
      localStorage.setItem('groupValues_' + groupId, JSON.stringify({ groupName, groupDescription, deviceNames }));
      setFormValues({ groupName, groupDescription, deviceNames });
    };

    if (savedFormValues) {
      const parsedFormValues = JSON.parse(savedFormValues);
      if (parsedFormValues.groupName && parsedFormValues.groupDescription && parsedFormValues.deviceNames) {
        setFormValues(parsedFormValues);
      } else {
        setDefaultValues();
      }
    } else {
      setDefaultValues();
    }
  }, [groupName, groupDescription, deviceNames]);

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
        await editGroup({
          groupId, 
           ...formValues,
           deviceNames: formValues.deviceNames.join(',')  
        })
        localStorage.setItem('groupValues_' + groupId, JSON.stringify(formValues));
      } catch (error: any) {
        console.error(error)
        localStorage.removeItem('groupValues_' + groupId);
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

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a group"
        subtitle="(compete each field below to edit a group)"
      />
      <Box flexGrow={1} overflow="auto" width="100%">
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
            options={data && data.devices ? data.devices.map((device: any) => device.deviceName) : []}
            value={formValues.deviceNames ?? []}
            onChange={(_event, newValue) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  deviceNames: newValue,
                }))
            }}
            renderInput={(params) => (
              <TextField {...params} label={'Device Names'} fullWidth />
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
    </Box>
  )
}

export default EditGroup

