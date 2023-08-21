import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAddUserMutation } from "../api/apiSlice"

interface FormValues {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  //countryCode: number
  phone: string
  role: string
}

const initialValues: FormValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  //countryCode: 0,
  phone: "",
  role: "",
}

const AddUser: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [addUser, { isLoading, isError, error, isSuccess }] =
    useAddUserMutation()
  const canSave =
    [
      formValues.username,
      formValues.password,
      formValues.firstName,
      formValues.lastName,
      formValues.email,
      //formValues.countryCode,
      formValues.phone,
      formValues.role,
    ].every((value) => value !== undefined && value !== null && value !== "") &&
    !isLoading

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
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/users")                  // is this the error?
    }, 0)
  }

  const handleCancel = () => {
    navigate("/users")
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

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new User" subtitle={""}      
      />
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
            name="password"
            label="Password"
            value={formValues.password}
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
          <TextField
            name="phone"
            label="Phone Numer"
            value={formValues.phone}
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
          </Box>{" "}
        </form>
      </Box>
    </Box>
  )
}

export default AddUser

/*
          { <TextField
            name="countryCode"
            label="Country Code"
            type="number"
            value={formValues.countryCode}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          /> }

*/
