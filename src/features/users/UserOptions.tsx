import React, { useContext } from 'react';
import Menu from '@mui/material/Menu';    // from "@mui/material"
import MenuItem from '@mui/material/MenuItem';
import { Box, Button, Typography }  from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

//import { useHistory } from 'react-router-dom';
import { useNavigate } from "react-router-dom"

import { useAuth } from '../context/authContext';

const UserOption: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  //const { auth, setAuth } = useContext(AuthContext);
  const { role, setRole, username, setUsername, setSessionToken } = useAuth();
  //const history = useHistory();
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccount = () => {
    navigate("/users/account");
    handleClose();
  }

  const handleLogin = () => {
    //history.push('/login');
    navigate("/users/login")
    handleClose();
  };

  const handleLogout = () => {
    
    // Clear the currently stored credentials:
    //
    setRole('');
    setUsername('');
    setSessionToken('');

    // ALso clear session token (wherever it is stored / TBD):
    sessionStorage.removeItem('token');
    //localStorage.removeItem('token'); 

    handleClose();
    navigate("/users/login")
    //history.push('/login'); 
  };

  return (
    <div >
      <Box display="flex" justifyContent="right">
        <Button onClick={handleClick} style={{ marginTop: 8, marginRight: 10 }}>
          <AccountCircleIcon fontSize="large" style={{ marginRight: 8 }} />
          {username || 'User'}
        </Button>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleAccount} disabled={!username}>
            <BadgeIcon fontSize="medium" style={{ marginRight: 10 }} />
            Account
          </MenuItem>
          <MenuItem onClick={handleLogin} disabled={!!username}>
            Login
            <LoginIcon fontSize="medium" style={{ marginLeft: 10 }} />
          </MenuItem>
          <MenuItem onClick={handleLogout} disabled={!username}>
            Logout
            <LogoutIcon fontSize="medium" style={{ marginLeft: 10 }} />
          </MenuItem>
        </Menu>
      </Box>
      <Box display="flex" justifyContent="right" style={{ marginRight: 12 }}>
        {role && (
          <Typography variant="body2"> {role} </Typography>
        )}
      </Box>
    </div>
  );
};

export default UserOption;
