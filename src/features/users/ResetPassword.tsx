import Header from "@/components/Header"
import { Box, Button, TextField, useTheme } from "@mui/material"
import React, { useState, useEffect } from "react"
import { useResetPasswordMutation } from "../api/apiSlice"
import { useNavigate, useParams } from "react-router-dom"
import { useValidateTokenMutation } from "../api/apiSlice"

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

interface tokenToVerify {
    token: string
    username: string
    eMail: string
}



const ResetPassword: React.FC = () => {
    const navigate = useNavigate()
    const theme = useTheme()

    const [formValues, setFormValues] = useState<FormValues>(initialValues)

    const [pageState, setPageState] = useState<boolean>(false)

    const { token, email, user } = useParams<Record<string, string>>()

    if (pageState){
        const [validateToken, { isLoading, isError, error, isSuccess }] =
        useValidateTokenMutation()
    }
    else
    {
        const [resetPassword, { isLoading, isError, error, isSuccess }] =
        useResetPasswordMutation()
    }


    
/*     const [validateToken, { isLoading, isError, error, isSuccess}] =
    useResetPasswordMutation() */

    const canSave =
        [
            formValues.oldPassword,
            formValues.newPassword,
            formValues.newPasswordConfirmation,
        ].every((value) => value !== undefined && value !== null && value !== "") &&
        !isLoading && (formValues.newPassword === formValues.newPasswordConfirmation)


    const canSaveToken =
        [
            token,
            email,
            user,
        ].every((value) => value !== undefined && value !== null && value !== "")



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


    let content: JSX.Element | null = null

    const handleMutationVerificationSuccess = () => {
        setTimeout(() => {
            setFormValues(initialValues)
        }, 0)
    }

    useEffect(() => {
        if (isLoading) {
            if (!(pageState))
            {
                content = <h3>Loading...</h3>
            }
        } else if (isError) {
            console.log(JSON.stringify(error))
        } else if (isSuccess) {
            if (pageState)
            {
                navigate("/users/login")
            }
            else{
                setPageState(true)
            }
        }
    }, [isLoading, isError, isSuccess])

    const formLoad = async () => {
        try {
            console.log("Hello")
            if (canSaveToken) {
                const tokenPayload: tokenToVerify = {
                    token: token!,
                    username: user!,
                    eMail: email!,
                }
                await validateToken(tokenPayload)
            }
        } catch (error: any) {
            console.error(error)
        }
    }

    useEffect(() => { formLoad() }, [])

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
                        name="newPasswordConfirmation"
                        label="Confirm New Password"
                        value={formValues.newPasswordConfirmation}
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

export default ResetPassword