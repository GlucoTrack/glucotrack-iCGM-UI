// import Header from "@/components/Header"
// import { Box, Button, TextField, useTheme } from "@mui/material"
// import React, { useEffect, useState } from "react"
// import { useNavigate, useParams } from "react-router-dom"
// import {
//   useEditUserMutation,
//   useGetUserByIdQuery,
//   useGetUserByNameQuery,
// } from "@/features/api/apiSlice"

// import { useAuth } from '../context/authContext';
// import { authenticateRoleEditUser } from '../../hooks/useRoleAuth';

// interface FormValues {
//   macAddress: string
//   deviceName: string
//   password: string
//   baseUri: string
//   jwtToken: string
//   jwtRefreshToken: string
// }

// const initialValues: FormValues = {
//   macAddress: "XX:XX:XX:XX:XX",
//   deviceName: "",
//   password: "FUTURE-Password",
//   baseUri: "https://prd-icgm.herokuapp.com/api/v1",
//   jwtToken: "FUTURE-JWT",
//   jwtRefreshToken: "FUTURE-JWT-REFRESH",
//   rtc: "2022-11-11T11:11:11",

// }

// const EditUser: React.FC = () => {
//   const { role, username } = useAuth();
//   const navigate = useNavigate()
//   const theme = useTheme()
//   const [formValues, setFormValues] = useState<FormValues>(initialValues)

//   const { deviceId } = useParams<Record<string, string>>()

//   const {
//     data: getUserData,
//     // status: getUserStatus,
//     isFetching: getUserIsFetching,
//     isLoading: getUserIsLoading,
//     isSuccess: getUserIsSuccess,
//     isError: getUserIsError,
//     error: getUserError,
//   } = useGetUserByNameQuery(deviceId)

//   // const [
//   //   deleteUser,
//   //   {
//   //     isLoading: isDeletingUser,
//   //     isError: isDeleteError,
//   //     error: deleteError,
//   //     isSuccess: isDeleteSuccess,
//   //   },
//   // ] = useDeleteUserMutation()

//   const [
//     editUser,
//     {
//       isLoading: isEditingUser,
//       isError: isEditError,
//       error: editError,
//       isSuccess: isEditSuccess,
//     },
//   ] = useEditUserMutation()

//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString)
//     const formattedDate = date.toISOString().slice(0, 16) // Format: "yyyy-MM-ddThh:mm"
//     return formattedDate
//   }

//   useEffect(() => {
//     if (getUserData) {
//       const {
//         macAddress,
//         deviceName,
//         password,

//       } = getUserData.user

//       setFormValues({
//         macAddress,
//         deviceName,
//         password,
//         baseUri,

//       })
//     }
//   }, [getUserData])

//   let getUserContent: JSX.Element | null = null
//   if (getUserIsFetching) {
//     getUserContent = <h3>Fetching...</h3>
//   } else if (getUserIsLoading) {
//     getUserContent = <h3>Loading...</h3>
//   } else if (getUserIsError) {
//     console.log("getUserError:", getUserError)

//     const errorMessageString = JSON.stringify(getUserError)
//     const errorMessageParsed = JSON.parse(errorMessageString)
//     getUserContent = (
//       <p style={{ color: theme.palette.error.main }}>
//         {errorMessageParsed.data.message}
//       </p>
//     )
//   } else if (getUserIsSuccess && getUserData) {
//     getUserContent = null
//   }

//   const canSave =
//     [
//       formValues.macAddress,
//       formValues.deviceName,
//       formValues.password,
//       formValues.baseUri,
//       formValues.jwtToken,
//       formValues.jwtRefreshToken,
//       formValues.rtc,
//       formValues.sessionStartTime,
//       formValues.sessionEndTime,
//       formValues.measurementInterval,
//       formValues.transmitDelay,
//       formValues.checkParametersInterval,
//       formValues.pstatVoltage,
//       formValues.pstatTIA,
//       formValues.glm,
//       formValues.coat,
//       formValues.onTest,
//       formValues.enzyme,
//       formValues.testStation,
//     ].every((value) => value !== undefined && value !== null && value !== "") &&
//     !getUserIsLoading &&
//     !isDeletingUser &&
//     !isEditingUser

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormValues((prevValues) => ({
//       ...prevValues,
//       [name]: value,
//     }))
//   }

//   const handleCancel = () => {
//     navigate("/devices")
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     if (canSave) {
//       try {
//         await editUser({ deviceId, ...formValues })
//       } catch (error: any) {
//         console.error(error)
//       }
//     }
//   }

//   const handleMutationSuccess = () => {
//     setTimeout(() => {
//       navigate("/devices")
//     }, 0)
//   }


//   let content: JSX.Element | null = null
//   if (isEditingUser || isDeletingUser) {
//     content = <h3>Loading...</h3>
//   } else if (isEditError || isDeleteError) {
//     const errorMessageString = isEditError
//       ? JSON.stringify(editError)
//       : JSON.stringify(deleteError)
//     const errorMessageParsed = JSON.parse(errorMessageString)
//     content = (
//       <p style={{ color: theme.palette.error.main }}>
//         {errorMessageParsed.data.message}
//       </p>
//     )
//   } else if (isEditSuccess || isDeleteSuccess) {
//     handleMutationSuccess()
//   }

  // // Role-based access control (RBAC):
  // //
  // if (!authenticateRoleEditUser(role)) {
  //   return <p>Forbidden access - no permission to perform action</p>;
  // }

//   return (
//     <Box display="flex" flexDirection="column" height="85vh">
//       <Header
//         title="Edit a device"
//         subtitle="(complete all fields to edit a device)"
//       />
//       {getUserContent}
//       <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
//         <form onSubmit={handleSubmit}>
//           <TextField
//             name="deviceName"
//             label="User Name"
//             value={formValues.deviceName}
//             onChange={handleChange}
//             required
//             fullWidth
//             margin="normal"
//             InputLabelProps={{
//               shrink: formValues.deviceName !== "",
//             }}
//           />







//           {content}

//           <Box mt={2} display="flex" justifyContent="space-between">
//             <Box display="flex" justifyContent="flex-start" gap={2}>
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" variant="contained" color="primary">
//                 Submit
//               </Button>
//             </Box>

//             <Button variant="outlined" color="error" onClick={handleDelete}>
//               Delete
//             </Button>
//           </Box>
//         </form>
//       </Box>
//     </Box>
//   )
// }

// export default EditUser
