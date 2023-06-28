import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField } from "@mui/material"
import Header from "@/components/Header"
import { useAddGroupMutation } from "@/features/api/apiSlice"

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

const AddGroup: React.FC = () => {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
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
    if (canSave) {
      try {
        e.preventDefault()
        await addGroup(formValues)
        setFormValues(initialValues)
        // navigate("/groups")
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleCancel = () => {
    navigate("/groups")
  }

  let content
  if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  } else if (isSuccess) {
    navigate("/groups")
  }

  return (
    <>
      <Header
        title="Add a new group"
        subtitle="(add multiple devices by separating Device Names with a space)"
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

export default AddGroup
