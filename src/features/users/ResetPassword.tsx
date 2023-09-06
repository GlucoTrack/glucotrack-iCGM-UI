import Header from "@/components/Header"
import { Box, Button, TextField, Typography, useTheme } from "@mui/material"
import React, { useState, useEffect } from "react"
import { useResetPasswordMutation, useValidateTokenMutation } from "../api/apiSlice"
import { useNavigate, useParams } from "react-router-dom"

interface FormValues {
    oldPassword: string
    newPassword: string
    newPasswordConfirmation: string
}

interface resetPasswordPayload {
    token: string
    password: string
    userId: string
}

const initialValues: FormValues = {
    oldPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
}

interface tokenToVerify {
    token: string
    username: string
    eMail: string
}

const ResetPassword: React.FC = () => {
    const navigate = useNavigate()
    const theme = useTheme()

    let content: JSX.Element | null = null

    const [formValues, setFormValues] = useState<FormValues>(initialValues)

    const [pageState, setPageState] = useState<boolean>(false)

    const { token, email, user } = useParams<Record<string, string>>()

    const [hideOldPassword, setHideOldPassword] = useState<boolean>(true)

    const [pwConfirmWarning, setPwConfirmWarning] = useState("")

    const [
        tokenValidation,
        {
            isLoading: isValidatingToken,
            isError: isValidateTokenError,
            error: validateTokenError,
            isSuccess: isValidateTokenSuccess,
            data: tokenValidationData,
        },
    ] = useValidateTokenMutation()

    const [
        resetPassword,
        {
            isLoading: isResetingPassword,
            isError: isResetPasswordError,
            error: resetPasswordError,
            isSuccess: isResertPasswordSuccess,
        },
    ] = useResetPasswordMutation()

    const isValidPassword = (password: string): boolean => {

        // To validate the complexity of the input password:

        // - Minimum eight characters (8+),
        // - at least one uppercase letter (A-Z), 
        // - one lowercase letter (a-z), 
        // - one number (0-9)
        // - and one special character (*,?,#,% ...)

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return regex.test(password);
    };
    

    /*     const [validateToken, { isLoading, isError, error, isSuccess}] =
        useResetPasswordMutation() */

    const canSave =
        [
            formValues.oldPassword,
            formValues.newPassword,
            formValues.newPasswordConfirmation,
        ].every((value) => value !== undefined && value !== null && value !== "") &&
        isValidPassword(formValues.newPassword) &&
        !isResetingPassword && 
        (formValues.newPassword === formValues.newPasswordConfirmation) &&
        formValues.oldPassword !== formValues.newPassword;      
        //
        // this last check still is not really "working", since we still have to pull the 'old PW' from the DB

    const canSaveToken =
        [
            token,
            email,
            user,
        ].every((value) => value !== undefined && value !== null && value !== "")
    !isValidatingToken



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Check if passwords match:
        if (formValues.newPassword !== formValues.newPasswordConfirmation) {
            setPwConfirmWarning("New password and confirmation pw do not match!");
            return; 
        }
        setPwConfirmWarning("");

        if (canSave) {
            try {
                console.log(tokenValidationData)
                const resetPasswordPayload: resetPasswordPayload =
                {
                    token: token!,
                    password: formValues.newPassword,
                    userId: tokenValidationData,
                }
                await resetPassword(resetPasswordPayload)
            } catch (error: any) {
                console.error(error)
            }
        }
    }

    const handleCancel = () => {
        navigate("/")
    }

    const handleMutationVerificationSuccess = () => {
        setTimeout(() => {
            setFormValues(initialValues)
            setPageState(true)
        }, 0)
    }

    useEffect(() => {
        if (isValidatingToken) {
            if (!(pageState)) {
                content = <h3>Loading...</h3>
                setFormValues((prevValues) => ({
                    ...prevValues,
                    ["oldPassword"]: "Not Used",
                }))
            }
        } else if (isValidateTokenError) {
            console.log(JSON.stringify(validateTokenError))
        } else if (isValidateTokenSuccess) {
            if (!pageState) {
                handleMutationVerificationSuccess
                console.log(email)
                if (email === "false")
                {
                    setHideOldPassword(false)
                }
            }
        }
    }, [isValidatingToken, isValidateTokenError, isValidateTokenSuccess])

    useEffect(() => {
        if (isResetingPassword) {
            if (pageState) {
                content = <h3>Loading...</h3>
            }
        } else if (isResetPasswordError) {
            console.log(JSON.stringify(resetPasswordError))
        } else if (isResertPasswordSuccess) {
            navigate("/users/login")
        }
    }, [isResetingPassword, isResetPasswordError, isResertPasswordSuccess])


    const formLoad = async () => {
        if (!pageState) {
            try {
                console.log("Hello")
                if (canSaveToken) {
                    const tokenPayload: tokenToVerify = {
                        token: token!,
                        username: user!,
                        eMail: email!,
                    }
                    await tokenValidation(tokenPayload)
                }
            } catch (error: any) {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        formLoad() 
    }, [])

    return (
        <Box display="flex" flexDirection="column" height="85vh">
            {content}
            <Header
                title="Reset your password" subtitle={""} />
            <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
                <form onSubmit={handleSubmit}>
                    {!hideOldPassword && (
                    <TextField
                        name="oldPassword"
                        label="Old Password"
                        type="password"
                        value={formValues.oldPassword}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                    />)}
                    <TextField
                        name="newPassword"
                        label="New Password"
                        type="password"
                        value={formValues.newPassword}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                        error={!isValidPassword(formValues.newPassword) && formValues.newPassword !== ""}
                    />
                    {!isValidPassword(formValues.newPassword) && formValues.newPassword !== "" && (
                        <Box mt={1}>
                            <Typography variant="caption" color="error">
                                Password Requirements:
                                <ul>
                                    <li>At least 8 characters</li>
                                    <li>At least one uppercase letter (A-Z)</li>
                                    <li>At least one lowercase letter (a-z)</li>
                                    <li>At least one number (0-9)</li>
                                    <li>At least one special character ($, !, *, ?, #, ...)</li>
                                </ul>
                            </Typography>
                        </Box>
                    )}
                    <TextField
                        name="newPasswordConfirmation"
                        label="Confirm New Password"
                        type="password"
                        value={formValues.newPasswordConfirmation}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                        helperText={pwConfirmWarning}
                        error={!!pwConfirmWarning}
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