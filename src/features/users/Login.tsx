import React, { useEffect, useState } from 'react';
import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import { useNavigate } from "react-router-dom"
import logoDarkMode from "@/images/dark-bg.png"
//import { useHistory } from 'react-router-dom'; // For navigation

import jwtDecode from 'jwt-decode';

import { useLoginUserMutation, useGetRolePermissionsQuery } from "../api/apiSlice"

import { useAuth } from '../context/authContext';
import Navbar from '../navbar/Navbar';


interface Credentials {
  username: string
  password: string
}

const initialValues: Credentials = {
  username: "",
  password: "",
}

interface DecodedToken {
  username: string;
  role: string;
}


const Login: React.FC = () => {

  const [credentials, setCredentials] = useState<Credentials>(initialValues)
  const [error, setError] = useState('');
  const { role, setRole, username, setUsername, sessionToken, setSessionToken, setPermissions } = useAuth();

  // console.log('Token :', sessionToken);
  // console.log('Role :', role);
  // console.log('Username :', username);

  const [loginResponse, { data, isLoading, isError, isSuccess }] = useLoginUserMutation()

 // const { data: permissionsData, refetch } = useGetRolePermissionsQuery(undefined/*, { skip: true }*/);   // not fetching correctly!

  const navigate = useNavigate()
  // const theme = useTheme()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Call API function to validate login:
      await loginResponse(credentials);
      //const response = await useLoginUserMutation(credentials);
    } catch (error) {
      setError('An error occurred during login');
    }
  };

  // Handles the aftermath of the validation of credentials by the back-end:
  //
  useEffect(() => {
    if (isSuccess) {

      const token = data.token
      //console.log('Session JWT: ', token);

      setSessionToken(data.token);
      sessionStorage.setItem('token', token);  // localStorage

      //const jwtFromSession = sessionStorage.getItem('token');
      //console.log('Session JWT from local session storage: ', jwtFromSession);
    
      // (decoded) token should contain [ username & role ]
      const decodedToken = jwtDecode(token) as DecodedToken;

      // console.log('Decoded Token: ', decodedToken.toString());
      // console.log('DecodedToken username: ', decodedToken.username);
      // console.log('DecodedToken role: ', decodedToken.role);

      const accountUsername = decodedToken.username;
      const accountRole = decodedToken.role;

      setUsername(accountUsername);
      sessionStorage.setItem('username', accountUsername);

      setRole(accountRole);
      sessionStorage.setItem('role', accountRole); 

      // Fetch permissions for the role (error 501!):
      //refetch();

      navigate("/home")
      //handleMutationSuccess();    // navigate 'home'

    } else if (isError) {
      setError('Invalid credentials');
    }
  }, [isSuccess, isError, data]);

  // Handle the fetched data for user's Permissions:
  // useEffect(() => {
  //   if (permissionsData) {
  //     setPermissions(permissionsData);
  //     //LOGS:
  //     console.log('The users role permissions are', permissionsData);
  //   }
  // }, [permissionsData]);


  // const handleMutationSuccess = () => {
  //   setTimeout(() => {
  //     //setFormValues(initialValues)
  //     navigate("/home")  
  //   }, 0)
  // }

  const handleCancel = () => {
   setCredentials(initialValues);
  }

  const emptyFunction = () => {
    // no statements
  };


  return (
    <Box display="flex" flexDirection="column" height="85vh" style={{ marginTop: 30, marginLeft: 50 }}>
      <Navbar isSidebarOpen={false} setIsSidebarOpen={emptyFunction} />
      <Header
        title="Login" subtitle={""} />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleLogin}>
          <TextField
            name="username"
            label="Username"
            value={credentials.username}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="password"
            label="Password"
			      type="password"
            value={credentials.password}
            onChange={handleChange}   
            required
            fullWidth
            margin="normal"
          />
          <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </Box>{" "}
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </Box>
    </Box>
  );
  
}

export default Login