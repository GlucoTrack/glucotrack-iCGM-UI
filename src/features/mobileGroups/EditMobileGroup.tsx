import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  TextField,
  useTheme,
} from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteGroupMutation,
  useEditGroupMutation,
  useGetMobilesQuery,
  useEditDevicesMutation
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetMobileGroup } from "./groupsSlice"
import { Typography } from "@mui/material"
import { SnackbarContext } from '../../providers/SnackbarProvider';

interface FormValues {
  mobileGroupName: string
  mobileGroupDescription: string
  mobileNames: string[]
}

const initialValues: FormValues = {
  mobileGroupName: "",
  mobileGroupDescription: "",
  mobileNames: [],
}

interface DeviceValues {
  _id?: string
  measurementInterval: string
  transmitDelay: string
  checkParametersInterval: string
  pstatVoltage: string
  pstatTIA: string
  glm: string
  enzyme: string
  testStation: string
}

const initialDeviceValues: DeviceValues = {
  measurementInterval: '',
  transmitDelay: '',
  checkParametersInterval: '',
  pstatVoltage: '',
  pstatTIA: '',
  glm: '',
  enzyme: '',
  testStation: '',
}

const EditMobileGroup: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const { openSnackbar } = useContext(SnackbarContext);
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [formDeviceValues, setFormDeviceValues] = useState<DeviceValues>(initialDeviceValues)
  const [isDeviceSubmitting, setIsDeviceSubmitting] = useState(false)
  const { data, isFetching, isLoading } = useGetMobilesQuery({})
  const { groupId } = useParams<Record<string, string>>()
  const { mobileGroupName, mobileGroupDescription, mobileNames } = useSelector(
    (state: RootState) => state.mobileGroups,
  )
  const [
    editGroup,
    {
      isLoading: isEditingGroup,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditGroupMutation()
  const [
    deleteGroup,
    {
      isLoading: isDeletingGroup,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteGroupMutation()
  const [
    editDevices,
  ] = useEditDevicesMutation()  

  useEffect(() => {
    const savedFormValues = localStorage.getItem("mobilemobileGroupValues_" + groupId)

    const setDefaultValues = () => {
      localStorage.setItem(
        "mobilemobileGroupValues_" + groupId,
        JSON.stringify({ mobileGroupName, mobileGroupDescription, mobileNames }),
      )
      setFormValues({ mobileGroupName, mobileGroupDescription, mobileNames })
    }

    if (savedFormValues) {
      const parsedFormValues = JSON.parse(savedFormValues)
      if (
        parsedFormValues.groupName &&
        parsedFormValues.groupDescription &&
        parsedFormValues.mobileNames
      ) {
        setFormValues(parsedFormValues)
      } else {
        setDefaultValues()
      }
    } else {
      setDefaultValues()
    }
  }, [mobileGroupName, mobileGroupDescription, mobileNames])

  const canSave =
    [
      formValues.mobileGroupName,
      formValues.mobileGroupDescription,
      formValues.mobileNames,
    ].every(Boolean) &&
    !isEditingGroup &&
    !isDeletingGroup

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const canSaveDevice = [
    formDeviceValues.measurementInterval,
    formDeviceValues.transmitDelay,
    formDeviceValues.checkParametersInterval,
    formDeviceValues.pstatVoltage,
    formDeviceValues.pstatTIA,
    formDeviceValues.glm,
    formDeviceValues.enzyme,
    formDeviceValues.testStation,
  ].some((value) => value !== undefined && value !== null && value !== '');

  const handleCancel = () => {
    setTimeout(() => {
      dispatch(resetMobileGroup())
      navigate("/mobile-groups")
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editGroup({
          groupId,
          ...formValues,
          mobileNames: formValues.mobileNames.join(","),
        })
        localStorage.setItem(
          "mobileGroupValues_" + groupId,
          JSON.stringify(formValues),
        )
      } catch (error: any) {
        console.error(error)
        localStorage.removeItem("mobileGroupValues_" + groupId)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      dispatch(resetMobileGroup())
      navigate("/mobile-groups")
    }, 0)
  }

  const handleDelete = async () => {
    try {
      await deleteGroup(groupId)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null

  useEffect(() => {
    if (isEditingGroup || isDeletingGroup) {
      openSnackbar('loading...', 'warning');
    } else if (isEditError || isDeleteError) {
      const errorMessageString = isEditError
        ? JSON.stringify(editError)
        : JSON.stringify(deleteError)
      const errorMessageParsed = JSON.parse(errorMessageString);
      const errorMessage = JSON.stringify(errorMessageParsed.data.message);
      openSnackbar(errorMessage, 'error');
    } else if (isEditSuccess) {
      openSnackbar('Group updated successfully', 'success');
      handleMutationSuccess();
    } else if (isDeleteSuccess) {
      openSnackbar('Group deleted successfully', 'success');
      handleMutationSuccess();
    }
  }, [isEditingGroup, isDeletingGroup, isEditError, isDeleteError]);

  const handleEditDevicesResponse = (response: any, devices: any) => {
    if (response?.error?.data) {
      const errorMessage = response.error.data.errors ? response.error.data.errors.join(', ') : response.error.data.message;
      openSnackbar(errorMessage, 'error');
    } else {
      if (response?.data?.devices?.updatedDeviceIds) {
        const updatedDeviceIds = response.data.devices.updatedDeviceIds;
        const failedDeviceIds = response.data.devices.failedDeviceIds;
        const allDevicesUpdated = devices.every((deviceId: any) => updatedDeviceIds.includes(deviceId));
        const message = allDevicesUpdated ? "All devices updated successfully" : `The following devices were not updated: ${failedDeviceIds.join(', ')}`;
        setFormDeviceValues(initialDeviceValues);
        openSnackbar(message, allDevicesUpdated ? 'success' : 'warning');
      } else {
        openSnackbar("Failed to edit devices", 'error');
      }
    }
  }

  const handleDevices = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsDeviceSubmitting(true)
    if (canSaveDevice) {
      try {
        const devices = formValues.mobileNames.map(mobileName => {
          const device = data.devices.find((device: any) => device.mobileName === mobileName);
          return device ? device._id : null;
        }).filter(id => id !== null);

        const nonEmptyFormDeviceValues = Object.fromEntries(Object.entries(formDeviceValues).filter(([key, value]) => value !== ''));
        const response = await editDevices({ deviceIds: devices, ...nonEmptyFormDeviceValues });        
        handleEditDevicesResponse(response, devices);
      } catch (error: any) {
        openSnackbar("Failed to edit device: " + error.message, 'error');
      } finally {
        setIsDeviceSubmitting(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!isNaN(Number(value)) || value === '') {
      setFormDeviceValues(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a group"
        subtitle="(compete each field below to edit a group)"
      />
      <Box flexGrow={1} overflow="auto" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            id="groupName"
            name="groupName"
            label="Group Name"
            value={formValues.mobileGroupName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            id="groupDescription"
            name="groupDescription"
            label="Group Description"
            value={formValues.mobileGroupDescription}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <Autocomplete
            multiple
            loading={isFetching || isLoading}
            options={
              data && data.devices
                ? data.devices.map((device: any) => device.deviceName)
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
              <TextField {...params} label={"Device Names"} fullWidth />
            )}
          />
          {content}

          <Box mt={2} display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="flex-start" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>

            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </form>
      </Box>

      <Divider sx={{ mt: 3, mb: 3 }} />

      <Box flexGrow={5} overflow="auto" width="100%">
        <Typography sx={{ mb: 2 }}>
          Modify the attributes of every device within this group
        </Typography>

        <form onSubmit={handleDevices}>
          <TextField
            id="measurementInterval"
            name="measurementInterval"
            label="Measurement Interval"
            value={formDeviceValues.measurementInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="transmitDelay"
            name="transmitDelay"
            label="Transmit Delay"
            value={formDeviceValues.transmitDelay}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="checkParametersInterval"
            name="checkParametersInterval"
            label="Check Parameters Interval"
            value={formDeviceValues.checkParametersInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="pstatVoltage"
            name="pstatVoltage"
            label="Pstat Voltage"
            value={formDeviceValues.pstatVoltage}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="pstatTIA"
            name="pstatTIA"
            label="Pstat TIA"
            value={formDeviceValues.pstatTIA}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="glm"
            name="glm"
            label="GLM"
            value={formDeviceValues.glm}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="enzyme"
            name="enzyme"
            label="Enzyme"
            value={formDeviceValues.enzyme}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="testStation"
            name="testStation"
            label="Test Station"
            value={formDeviceValues.testStation}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />

          <Box mt={2} display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="flex-start" gap={2}>
              <Button variant="outlined" color="secondary" onClick={() => {
                setFormDeviceValues(initialDeviceValues);
              }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isDeviceSubmitting || !canSaveDevice}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default EditMobileGroup
