import React, { createContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export const SnackbarContext = createContext<{
    openSnackbar: (msg: string, severity: 'error' | 'success' | 'info' | 'warning' | undefined) => void,
    closeSnackbar: (event: React.SyntheticEvent | Event, reason?: string) => void
  }>({ 
    openSnackbar: () => {}, 
    closeSnackbar: () => {} 
  });

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'error' | 'success' | 'info' | 'warning' | undefined>(undefined);

    const openSnackbar = (message: string, severity: 'error' | 'success' | 'info' | 'warning' | undefined) => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    };

    const closeSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
      
        setOpen(false);
      };

    return (
        <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
            <Snackbar
                open={open}
                autoHideDuration={5000}
                onClose={closeSnackbar}
            >
                <Alert onClose={closeSnackbar} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            {children}
        </SnackbarContext.Provider>
    );
}