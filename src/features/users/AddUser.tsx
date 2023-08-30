import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAddUserMutation } from "../api/apiSlice"
import { useAuth } from '../context/authContext';
import { authenticateRoleAddUser } from '../../hooks/useRoleAuth';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { E164Number } from 'libphonenumber-js/core'
import sendResetPasswordEmail from "@/components/Email"

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
  role: "Administrator",
  createdBy: "Admin",
  updatedBy: "Admin",
}

const AddUser: React.FC = () => {
  const jwtFromSession = sessionStorage.getItem('token');
  //console.log('Session JWT from local session storage: ', jwtFromSession);

  const { role, username } = useAuth();
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [passwordToken, setPasswordToken] = useState<String>('')
  const [addUser, { isLoading, isError, error, isSuccess, data }] =
    useAddUserMutation()
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
    !isLoading

  const [countryValue, setValue] = useState<E164Number>();

  useEffect(() => {
    if (!(countryValue === undefined)) {
      formValues.phone = countryValue!.toString();
    } else {
      formValues.phone = "+1";
    }
  }, [countryValue])

  useEffect(() => {
    if (!(passwordToken === ''))
    {
      sendResetPasswordEmail(passwordToken, formValues.username, formValues.email)
    }
  }, [passwordToken])

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
        await addUser(formValues)
        // const resultUser = await addUser(formValues).unwrap()
        // setPasswordToken(resultUser["jwtToken"])
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/users")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/users")
  }

  let content: JSX.Element | null = null

  useEffect(() => {
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
      setPasswordToken(data.jwtToken)
      handleMutationSuccess()
    }
  }, [isLoading, isError, isSuccess])


  // // Role-based access control (RBAC):
  // //
  if (!authenticateRoleAddUser(role)) {
    return <p>Forbidden access - No permission to perform action</p>;
  }

  
  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new User" subtitle={""} />
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
          />
          <PhoneInput
            defaultCountry="US"
            placeholder="Enter phone number"
            value={countryValue}
            onChange={setValue}
          />
          {content}
          <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>{" "}
        </form>
      </Box>
    </Box>
  )
}

export default AddUser
