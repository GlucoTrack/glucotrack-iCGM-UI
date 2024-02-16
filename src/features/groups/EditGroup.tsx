import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Autocomplete, Box, Button, Divider, TextField, useTheme } from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteGroupMutation,
  useEditGroupMutation,
  useGetDevicesQuery,
  useEditDeviceMutation,
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetGroup } from "./groupsSlice"
import { Typography } from '@mui/material'

interface FormValues {
  groupName: string
  groupDescription: string
  deviceNames: string[]
}

const initialValues: FormValues = {
  groupName: "",
  groupDescription: "",
  deviceNames: [],
}

interface DeviceValues {
  _id?: string
  measurementInterval: number
  transmitDelay: number
  checkParametersInterval: number
  pstatVoltage: number
  pstatTIA: number
  glm: number
  enzyme: number
  testStation: number
}

const initialDeviceValues: DeviceValues = {
  measurementInterval: 0,
  transmitDelay: 0,
  checkParametersInterval: 0,
  pstatVoltage: 0,
  pstatTIA: 0,
  glm: 0,
  enzyme: 0,
  testStation: 0,
}

const EditGroup: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [formDeviceValues, setFormDeviceValues] = useState<DeviceValues>(initialDeviceValues)
  const [devicesToUpdate, setDevicesToUpdate] = useState<DeviceValues[]>([]);
  const [isDeviceSubmitting, setIsDeviceSubmitting] = useState(false);
  const { data, isFetching, isLoading } = useGetDevicesQuery({})
  const { groupId } = useParams<Record<string, string>>()
  const { groupName, groupDescription, deviceNames } = useSelector(
    (state: RootState) => state.groups,
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
    editDevice,
    {
      isLoading: isDeviceEditing,
      isError: isDeviceEditError,
      error: editDeviceError,
      isSuccess: isEditDeviceSuccess,
    },
  ] = useEditDeviceMutation()

  useEffect(() => {
    const savedFormValues = localStorage.getItem('groupValues_' + groupId);

    const setDefaultValues = () => {
      localStorage.setItem('groupValues_' + groupId, JSON.stringify({ groupName, groupDescription, deviceNames }));
      setFormValues({ groupName, groupDescription, deviceNames });
    };

    if (savedFormValues) {
      const parsedFormValues = JSON.parse(savedFormValues);
      if (parsedFormValues.groupName && parsedFormValues.groupDescription && parsedFormValues.deviceNames) {
        setFormValues(parsedFormValues);
      } else {
        setDefaultValues();
      }
    } else {
      setDefaultValues();
    }
  }, [groupName, groupDescription, deviceNames]);

  const canSave =
    [
      formValues.groupName,
      formValues.groupDescription,
      formValues.deviceNames,
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

  const canSaveDevice =
    [
      formDeviceValues.measurementInterval,
      formDeviceValues.transmitDelay,
      formDeviceValues.checkParametersInterval,
      formDeviceValues.pstatVoltage,
      formDeviceValues.pstatTIA,
      formDeviceValues.glm,
      formDeviceValues.enzyme,
      formDeviceValues.testStation,
    ].some((value) => value !== undefined && value !== null && value !== 0)

  const handleCancel = () => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editGroup({
          groupId, 
           ...formValues,
           deviceNames: formValues.deviceNames.join(',')  
        })
        localStorage.setItem('groupValues_' + groupId, JSON.stringify(formValues));
      } catch (error: any) {
        console.error(error)
        localStorage.removeItem('groupValues_' + groupId);
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
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
  if (isEditingGroup || isDeletingGroup || isDeviceEditing) {
    content = <h3>Loading...</h3>
  } else if (isEditError || isDeleteError) {
    const errorMessageString = isEditError
      ? JSON.stringify(editError)
      : JSON.stringify(deleteError)
    const errorMessageParsed = JSON.parse(errorMessageString)
    content = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (isEditSuccess || isDeleteSuccess) {
    handleMutationSuccess()
  }

  const editDeviceAsync = async () => {
    try {
      const { _id, ...restOfUpdateDevice } = devicesToUpdate[0] as DeviceValues;
      await editDevice({deviceId: _id, ...restOfUpdateDevice})
      if (!isDeviceEditing) {
        if (editDeviceError) {
          console.error('Failed to edit device:', editDeviceError);
          setIsDeviceSubmitting(false);
        } else {
          setDevicesToUpdate(prevDevices => prevDevices.slice(1));
          console.log('Device edited successfully:', data);
        }
      }              
    } catch (error) {
      console.error('Failed to edit device:', error);
      setIsDeviceSubmitting(false);
    }
  };

  useEffect(() => {
    if (devicesToUpdate.length > 0) {
      editDeviceAsync();      
    }
    if (isDeviceSubmitting && devicesToUpdate.length === 0) {
      setIsDeviceSubmitting(false);
      handleMutationSuccess();
    } 
  }, [devicesToUpdate]);

  const handleDevices = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeviceSubmitting(true);
    if (canSaveDevice) {
      try {
        const devices = [];
        for (const deviceName of formValues.deviceNames) {
          const device = data.devices.find((device: any) => device.deviceName === deviceName);
          const { __v, updatedAt, createdAt, ...restOfDevice } = device;
          const { _id, ...restOfFormDeviceValues } = formDeviceValues;
          const updatedDevice = { ...restOfDevice, ...restOfFormDeviceValues };
          devices.push(updatedDevice);
        }
        setDevicesToUpdate(devices);
      } catch (error: any) {
        console.error('Failed to edit device:', error);
        setIsDeviceSubmitting(false);
      }
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
            options={data && data.devices ? data.devices.map((device: any) => device.deviceName) : []}
            value={formValues.deviceNames ?? []}
            onChange={(_event, newValue) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  deviceNames: newValue,
                }))
            }}
            renderInput={(params) => (
              <TextField {...params} label={'Device Names'} fullWidth />
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
        <Typography sx={{ mb:2 }}>Modify the attributes of every device within this group</Typography>

        <form onSubmit={handleDevices}>
          <TextField
            id="measurementInterval"
            name="measurementInterval"
            label="Measurement Interval"
            value={formDeviceValues.measurementInterval}
            onChange={(e) => { setFormDeviceValues({ ...formDeviceValues, measurementInterval: parseInt(e.target.value) }); }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="transmitDelay"
            name="transmitDelay"
            label="Transmit Delay"
            value={formDeviceValues.transmitDelay}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, transmitDelay: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="checkParametersInterval"
            name="checkParametersInterval"
            label="Check Parameters Interval"
            value={formDeviceValues.checkParametersInterval}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, checkParametersInterval: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="pstatVoltage"
            name="pstatVoltage"
            label="Pstat Voltage"
            value={formDeviceValues.pstatVoltage}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, pstatVoltage: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="pstatTIA"
            name="pstatTIA"
            label="Pstat TIA"
            value={formDeviceValues.pstatTIA}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, pstatTIA: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="glm"
            name="glm"
            label="GLM"
            value={formDeviceValues.glm}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, glm: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="enzyme"
            name="enzyme"
            label="Enzyme"
            value={formDeviceValues.enzyme}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, enzyme: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="testStation"
            name="testStation"
            label="Test Station"
            value={formDeviceValues.testStation}
            onChange={(e) => { 
              if (e.target.value.trim() !== '') {
                setFormDeviceValues({ ...formDeviceValues, testStation: parseInt(e.target.value) }); 
              }
            }}
            type="number"
            margin="normal"
            sx={{ mr: 2 }}
          />
          
          <Box mt={2} display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="flex-start" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {}}
              >
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

export default EditGroup

