import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Box, Button, TextField } from "@mui/material"
import Header from "@/components/Header"
import { useEditGroupMutation } from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetGroup } from "./groupsSlice"

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
  const { groupId } = useParams<Record<string, string>>()
  const { groupName, groupDescription, deviceNames } = useSelector(
    (state: RootState) => state.groups,
  )
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  useEffect(() => {
    setFormValues({
      groupName: groupName,
      groupDescription: groupDescription,
      deviceNames: deviceNames,
    })
  }, [groupName, groupDescription, deviceNames])

  const [editGroup, { isLoading, isError, error, isSuccess }] =
    useEditGroupMutation()
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
        await editGroup({ groupId, ...formValues })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleCancel = () => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
    }, 0)
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
    }, 0)
  }

  let content
  if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  } else if (isSuccess) {
    handleMutationSuccess()
  }

  return (
    <>
      <Header
        title="Edit a group"
        subtitle="(compete each field below to edit a group)"
      />
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

        <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
          {content}
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>
    </>
  )
}

export default EditGroup
