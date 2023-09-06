import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import { Select, SelectChangeEvent, MenuItem, FormControl, InputLabel } from '@mui/material';
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useEditUserMutation,
  useGetUserByIdQuery,
  useGetUserByNameQuery,
  useDeleteUserMutation,
  useVerifyRoleAccessMutation,
} from "@/features/api/apiSlice"

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { E164Number } from 'libphonenumber-js/core'

import { useAuth, hasPermission } from '../context/authContext';
import { authenticateRoleEditUser, authenticateRoleUserDelete } from '../../hooks/useRoleAuth';

interface FormValues {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  createdBy: string
  updatedBy: string
}

const initialValues: FormValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "+1",
  role: "Researcher",
  createdBy: "Admin",
  updatedBy: "Admin",
}

const accountRoles = {
  //Superadmin: 'Superadmin',   // not to include as option from UI (just DB admin should set)
  Administrator: 'Administrator',
  Researcher: 'Researcher',
  // other? add options...
  Guest: 'Guest'
};

const EditUser: React.FC = () => {
  const { role, username, permissions } = useAuth();
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const { userId } = useParams<Record<string, string>>()

  // To check WRITE & DELETE permissions in  DB:
  const [userDeletePermission, setDeletePermission] = useState(false);
  const [writePermission, setWritePermission] = useState(false);
  const [verifyRoleAccess, { data: roleAccessData, isLoading: checkroleIsLoading }] = useVerifyRoleAccessMutation();

  // const canWriteUsers = hasPermission(permissions, 'Users', 'Write');
  // const canDeleteUsers = hasPermission(permissions, 'Users', 'Delete');

  const [loading, setLoading] = useState(true);

  const {
    data: getUserData,
    // status: getUserStatus,
    isFetching: getUserIsFetching,
    isLoading: getUserIsLoading,
    isSuccess: getUserIsSuccess,
    isError: getUserIsError,
    error: getUserError,
  } = useGetUserByIdQuery(userId)

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
        username,
        firstName,
        lastName,
        email,
        phone,
        role,
        createdBy,
        updatedBy,

      } = getUserData.user

      setFormValues({
        username,
        firstName,
        lastName,
        email,
        phone,
        role,
        createdBy,
        updatedBy,

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

  const isValidEmail = (email: string) => {
    const emailRegex = /^(?!.*\.\.)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const canSave =
    [
      formValues.username,
      formValues.firstName,
      formValues.lastName,
      formValues.email,
      formValues.phone,
      formValues.role,
      formValues.createdBy,
      formValues.updatedBy,
    ].every((value) => value !== undefined && value !== null && value !== "") &&
    isValidEmail(formValues.email) &&
    !getUserIsLoading &&
    !isDeletingUser &&
    !isEditingUser

  const handlePhoneChange = (e: string) => 
  {
    setFormValues((prevValues) => ({
      ...prevValues,
      ["phone"]: e,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleDropChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (name) {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
};

  const handleCancel = () => {
    navigate("/users")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        console.log(formValues.phone)
        await editUser({ userId, ...formValues })
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
    if (userDeletePermission) {
    // if (deletePermission) {
      try {
        await deleteUser(userId)
      } catch (error: any) {
        console.error(error)
      }
    }
  }


  let content: JSX.Element | null = null
  if (isEditingUser  || isDeletingUser ) {
    content = <h3>Loading...</h3>
  } else if (isEditError || isDeleteError ) {
    const errorMessageString = isEditError
      ? JSON.stringify(editError)
      : JSON.stringify(deleteError) 
    const errorMessageParsed = JSON.parse(errorMessageString)
    content = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (isEditSuccess || isDeleteSuccess ) {
    handleMutationSuccess()
  }


  // ----------   Role-based access control (RBAC): ------------- //
  //
  // Option B: These logic verifies in the DataBase if the given role has permissions for the given feature/access:
  //
  useEffect(() => {
    if (role) {
      verifyRoleAccess([
        { feature: 'Users', levelOfAccess: 'Write' },
        { feature: 'Users', levelOfAccess: 'Delete' },
      ]);
    } else {
      setWritePermission(false);     
      setDeletePermission(false);
      setLoading(false);
    }
  }, [role, verifyRoleAccess]);

  useEffect(() => {
    if (roleAccessData) {
      setWritePermission(roleAccessData?.results[0]);  
      setDeletePermission(roleAccessData?.results[1]);
      setLoading(false);
    }
  }, [roleAccessData]);

  
  // DELETE User:
  const deletePermission = authenticateRoleUserDelete(role);


  // ------------------   Render  ------------------ //

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!writePermission) {
  // if (!authenticateRoleEditUser(role)) {
  // if (!canWriteUsers) { 
    return <p>Forbidden access - no permission to perform action</p>;
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a User"
        subtitle="(complete all fields to edit a device)"
      />
      {getUserContent}
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="User Name"
            value={formValues.username}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          {(formValues.role !== 'Superadmin') ?
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formValues.role}
                onChange={handleDropChange}
              >
                {Object.values(accountRoles).map(role => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            : <TextField
              name="role"
              label="Role"
              value={formValues.role}
              fullWidth
              margin="normal"
              disabled
            />
          } 
          <TextField
            name="firstName"
            label="First Name"
            value={formValues.firstName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="lastName"
            label="Last Name"
            value={formValues.lastName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="email"
            label="User email"
            value={formValues.email}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            error={!isValidEmail(formValues.email) && formValues.email !== ""}
            helperText={!isValidEmail(formValues.email) && formValues.email !== "" ? "Email format is invalid" : ""}
          />
          <PhoneInput
            defaultCountry="US"
            international={false}
            placeholder ="Enter phone number"
            value={formValues.phone}
            onChange={handlePhoneChange}
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
            { userDeletePermission &&
            /* {deletePermission && */
            /* { canDeleteUsers && */
              <Button variant="outlined" color="error" onClick={handleDelete}>
                Delete
              </Button>
            }
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default EditUser
