import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, useTheme, Autocomplete } from "@mui/material"
import {
  useGetMobilesQuery
} from "@/features/api/apiSlice"
import Header from "@/components/Header"
import { useAddMobileGroupMutation } from "@/features/api/apiSlice"
import { SnackbarContext } from '../../providers/SnackbarProvider';

interface FormValues {
  groupName: string
  groupDescription: string
  mobileNames: string[]
}

const initialValues: FormValues = {
  groupName: "",
  groupDescription: "",
  mobileNames: [],
}

const AddMobileGroup: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { openSnackbar } = useContext(SnackbarContext);
  const [showError, setShowError] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const { data, isFetching } = useGetMobilesQuery({})
  const [addGroup, { isLoading, isError, error, isSuccess }] = useAddMobileGroupMutation()
  const canSave =
    [
      formValues.groupName,
      formValues.groupDescription,
      formValues.mobileNames,
    ].every(Boolean) && !isLoading

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
        await addGroup({
          ...formValues,
          mobileNames: formValues.mobileNames.join(","),
        })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      setFormValues(initialValues)
      navigate("/mobile-groups")
    }, 0)
  }

  const handleCancel = () => {
    navigate("/mobile-groups")
  }

  useEffect(() => {
    if (isLoading) {
      openSnackbar('loading...', 'warning');
    } else if (isError) {
      const errorMessageString = JSON.stringify(error);
      const errorMessageParsed = JSON.parse(errorMessageString);
      const errorMessage = JSON.stringify(errorMessageParsed.data.message);
      openSnackbar(errorMessage, 'error');
    } else if (isSuccess) {
      openSnackbar('Group updated successfully', 'success');
      handleMutationSuccess();
    }
  }, [isError, error, isLoading, isSuccess]);

  let content: JSX.Element | null = null;
  
  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Add a new group"
        subtitle="(add multiple mobiles by separating Mobile Names with a comma)"
      />
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            id="groupName"
            name="groupName"
            label="Group Name"
            value={formValues.groupName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            id="groupDescription"
            name="groupDescription"
            label="Group Description"
            value={formValues.groupDescription}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <Autocomplete
            multiple
            loading={isFetching || isLoading}
            options={
              data && data.mobiles
                ? data.mobiles.map((mobile: any) => mobile.mobileName)
                : []
            }
            value={formValues.mobileNames ?? []}
            onChange={(_event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                mobileNames: newValue,
              }))
            }}
            renderInput={(params) => (
              <TextField {...params} label={"Mobile Names"} fullWidth />
            )}
          />
          {content}

          <Box mt={2} display={"flex"} justifyContent={"flex-start"} gap={2}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default AddMobileGroup
