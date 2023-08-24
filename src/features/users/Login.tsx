import React, { useEffect, useState } from 'react';
import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import { useNavigate } from "react-router-dom"
//import { useHistory } from 'react-router-dom'; // For navigation

import jwtDecode from 'jwt-decode';

import { useLoginUserMutation } from "../api/apiSlice"

import { useAuth } from '../context/authContext';


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
  //const history = useHistory();
  //const [usernameInput, setUsernameInput] = useState('');
  //const [password, setPassword] = useState('');
  
  const [credentials, setCredentials] = useState<Credentials>(initialValues)
  const [error, setError] = useState('');
  const { setRole, setUsername } = useAuth();

  const [loginResponse, { data, isLoading, isError, isSuccess }] = useLoginUserMutation()

  const navigate = useNavigate()
  const theme = useTheme()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleLogin = async ( ) => {

    // The Role could be set if the API returned a user object (with a role field) -> (decoded) token should contain [ username & role ]

    try {
      // Call API function to validate login:
      //
      //const response = await useLoginUserMutation(credentials);
      await loginResponse(credentials);
      
      if (isSuccess) {
        
        const decodedToken = jwtDecode(data) as DecodedToken;
        
        // set credentials in internal state: username & role
        
        setUsername(decodedToken.username);  // --> should be Global !
        setRole(decodedToken.role);
        //const user = await apiLogin(credentials);
        
        // Successful login, navigate to home
        //history.push('/home');
        handleMutationSuccess;

      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred during login');
    }
    
  };

  const handleMutationSuccess = () => {
    setTimeout(() => {
      //setFormValues(initialValues)
      navigate("/home")  
    }, 0)
  }

  const handleCancel = () => {
   // navigate("/home")
  }


  return (
    <Box display="flex" flexDirection="column" height="85vh">
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