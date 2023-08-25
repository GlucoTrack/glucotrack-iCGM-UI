import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useState } from "react"
import { useResetPasswordMutation } from "../api/apiSlice"
import { useNavigate, useParams } from "react-router-dom"
import sendResetPasswordEmail from "@/components/Email"

interface FormValues {
    oldPassword: string
    newPassword: string
    newPasswordConfirmation: string
}

const initialValues: FormValues = {
    oldPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
}

const ResetPassword: React.FC = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const { token, user, email } = useParams<Record<string, string>>()
    const [formValues, setFormValues] = useState<FormValues>(initialValues)
    const [passwordToken, setPasswordToken] = useState<String>('')

    const [resetPassword, { isLoading, isError, error, isSuccess }] =
        useResetPasswordMutation()

    const canSave =
        [
            formValues.oldPassword,
            formValues.newPassword,
            formValues.newPasswordConfirmation,
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
                await resetPassword(formValues).unwrap()
            } catch (error: any) {
                console.error(error)
            }
        }
    }

    const handleCancel = () => {
        navigate("/")
    }

    return (
        <Box display="flex" flexDirection="column" height="85vh">
            <Header
                title="Reset your password" subtitle={""} />
            <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="oldPassword"
                        label="Old Password"
                        value={formValues.oldPassword}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="newPassword"
                        label="New Password"
                        value={formValues.newPassword}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="confirmNewPassword"
                        label="Confirm New Password"
                        value={formValues.newPasswordConfirmation}
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
                            Submit
                        </Button>
                    </Box>{" "}
                </form>
            </Box>
        </Box>
    )
}

export default ResetPassword