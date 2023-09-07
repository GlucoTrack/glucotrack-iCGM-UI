import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, useTheme } from "@mui/material"
import Header from "@/components/Header"
import { useAddGroupMutation, useVerifyRoleAccessMutation } from "@/features/api/apiSlice"

import { useAuth } from '../context/authContext';
import { authenticateRoleAddGroup } from '../../hooks/useRoleAuth';

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
  const { role, username } = useAuth();
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  // To check WRITE permissions in  DB:
  const [writePermission, setWritePermission] = useState(false);
  const [verifyRoleAccess, { data: roleAccessData, isLoading: checkroleIsLoading }] = useVerifyRoleAccessMutation();

  const [loading, setLoading] = useState(true);

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
        await addGroup(formValues)
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/groups")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/groups")
  }

  let content: JSX.Element | null = null
  if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    const errorMessageString = JSON.stringify(error)
    const errorMessageParsed = JSON.parse(errorMessageString)
    content = (
      <p style={{ color: theme.palette.error.main }}>
        {JSON.stringify(errorMessageParsed.data.message)}
      </p>
    )
  } else if (isSuccess) {
    handleMutationSuccess()
  }


  // ----------   Role-based access control (RBAC): ------------- //
  //
  // Option B: These logic verifies in the DataBase if the given role has permissions for the given feature/access:
  //
  useEffect(() => {
    if (role) {
      verifyRoleAccess([
        { feature: 'Groups', levelOfAccess: 'Write' },
      ]);
    } else {
      setWritePermission(false);
      setLoading(false);
    }
  }, [role, verifyRoleAccess]);

  useEffect(() => {
    if (roleAccessData) {
      setWritePermission(roleAccessData?.results[0]);
      setLoading(false);
    }
  }, [roleAccessData]);


  // ------------------   Render  ------------------ //

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!writePermission) {   // using a DB query via API
  // if (!authenticateRoleAddGroup(role)) {
    return <p>Forbidden access - no permission to perform action</p>;
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new group"
        subtitle="(add multiple devices by separating Device Names with a space)"
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
