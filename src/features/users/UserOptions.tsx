import React, { useContext } from 'react';
//import { Menu, MenuItem, Button } from '@material-ui/core';
import Menu from '@mui/material/Menu';    // from "@mui/material"
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
//import { useHistory } from 'react-router-dom';
import { useNavigate } from "react-router-dom"

import { useAuth } from '../context/authContext';

const UserOption: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  //const { auth, setAuth } = useContext(AuthContext);
  const { role, setRole, username, setUsername } = useAuth();
  //const history = useHistory();
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    //history.push('/login');
    navigate("/login")
    handleClose();
  };

  const handleLogout = () => {
    //setAuth({ token: null, username: null, role: null });
    setRole('');
    setUsername('');

    //localStorage.removeItem('token'); //  wherever  token is stored
    handleClose();
    //history.push('/login'); // redirect to login or home ...
    navigate("/login")
  };

  return (
    <div>
      <Button onClick={handleClick}>
        {username || 'Guest'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogin} disabled={!!username}>
          Login
        </MenuItem>
        <MenuItem onClick={handleLogout} disabled={!username}>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default UserOption;
