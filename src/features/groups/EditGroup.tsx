import React, { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Autocomplete, Box, Button, Divider, TextField } from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteGroupMutation,
  useEditGroupMutation,
  useGetDevicesQuery,
  useEditDevicesMutation,
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetGroup } from "./groupsSlice"
import { Typography } from "@mui/material"
import { SnackbarContext } from "../../providers/SnackbarProvider"

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
  measurementInterval: "",
  transmitDelay: "",
  checkParametersInterval: "",
  pstatVoltage: "",
  pstatTIA: "",
  glm: "",
  enzyme: "",
  testStation: "",
}

const EditGroup: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { openSnackbar } = useContext(SnackbarContext)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [formDeviceValues, setFormDeviceValues] =
    useState<DeviceValues>(initialDeviceValues)
  const [isDeviceSubmitting, setIsDeviceSubmitting] = useState(false)
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
  const [editDevices] = useEditDevicesMutation()

  // Fill the attributes form with the common values of the selected devices
  useEffect(() => {
    if (formValues.deviceNames.length > 0 && data) {
      // Get the devices from the selected device names
      const devices = formValues.deviceNames
        .map((name) => {
          const device = data.find((device: any) => device.deviceName === name)
          return device ? device : null
        })
        .filter((device) => device !== null)

      // Get the common values from the first device
      const commonValue: DeviceValues = {
        measurementInterval: devices[0].measurementInterval,
        transmitDelay: devices[0].transmitDelay,
        checkParametersInterval: devices[0].checkParametersInterval,
        pstatVoltage: devices[0].pstatVoltage,
        pstatTIA: devices[0].pstatTIA,
        glm: devices[0].glm,
        enzyme: devices[0].enzyme,
        testStation: devices[0].testStation,
      }

      // Check if all the devices have the same values, instead i put empty string
      for (let i = 1; i < devices.length; i++) {
        const device = devices[i]
        if (device.measurementInterval !== commonValue.measurementInterval) {
          commonValue.measurementInterval = ""
        }
        if (device.transmitDelay !== commonValue.transmitDelay) {
          commonValue.transmitDelay = ""
        }
        if (
          device.checkParametersInterval !== commonValue.checkParametersInterval
        ) {
          commonValue.checkParametersInterval = ""
        }
        if (device.pstatVoltage !== commonValue.pstatVoltage) {
          commonValue.pstatVoltage = ""
        }
        if (device.pstatTIA !== commonValue.pstatTIA) {
          commonValue.pstatTIA = ""
        }
        if (device.glm !== commonValue.glm) {
          commonValue.glm = ""
        }
        if (device.enzyme !== commonValue.enzyme) {
          commonValue.enzyme = ""
        }
        if (device.testStation !== commonValue.testStation) {
          commonValue.testStation = ""
        }
      }

      setFormDeviceValues(commonValue)
    }
  }, [data, formValues.deviceNames])

  useEffect(() => {
    const savedFormValues = localStorage.getItem("groupValues_" + groupId)

    const setDefaultValues = () => {
      localStorage.setItem(
        "groupValues_" + groupId,
        JSON.stringify({ groupName, groupDescription, deviceNames }),
      )
      setFormValues({ groupName, groupDescription, deviceNames })
    }

    if (savedFormValues) {
      const parsedFormValues = JSON.parse(savedFormValues)
      if (
        parsedFormValues.groupName &&
        parsedFormValues.groupDescription &&
        parsedFormValues.deviceNames
      ) {
        setFormValues(parsedFormValues)
      } else {
        setDefaultValues()
      }
    } else {
      setDefaultValues()
    }
  }, [groupName, groupDescription, deviceNames, groupId])

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

  const canSaveDevice = [
    formDeviceValues.measurementInterval,
    formDeviceValues.transmitDelay,
    formDeviceValues.checkParametersInterval,
    formDeviceValues.pstatVoltage,
    formDeviceValues.pstatTIA,
    formDeviceValues.glm,
    formDeviceValues.enzyme,
    formDeviceValues.testStation,
  ].some((value) => value !== undefined && value !== null && value !== "")

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
          deviceNames: formValues.deviceNames.join(","),
        })
        localStorage.setItem(
          "groupValues_" + groupId,
          JSON.stringify(formValues),
        )
      } catch (error: any) {
        console.error(error)
        localStorage.removeItem("groupValues_" + groupId)
      }
    }
  }

  const handleMutationSuccess = useCallback(() => {
    setTimeout(() => {
      dispatch(resetGroup())
      navigate("/groups")
    }, 0)
  }, [dispatch, navigate])

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
      openSnackbar("loading...", "warning")
    } else if (isEditError || isDeleteError) {
      const errorMessageString = isEditError
        ? JSON.stringify(editError)
        : JSON.stringify(deleteError)
      const errorMessageParsed = JSON.parse(errorMessageString)
      const errorMessage = JSON.stringify(errorMessageParsed.data.message)
      openSnackbar(errorMessage, "error")
    } else if (isEditSuccess) {
      openSnackbar("Group updated successfully", "success")
      handleMutationSuccess()
    } else if (isDeleteSuccess) {
      openSnackbar("Group deleted successfully", "success")
      handleMutationSuccess()
    }
  }, [
    isEditingGroup,
    isDeletingGroup,
    isEditError,
    isDeleteError,
    isEditSuccess,
    isDeleteSuccess,
    openSnackbar,
    editError,
    deleteError,
    handleMutationSuccess,
  ])

  const handleEditDevicesResponse = (response: any, devices: any) => {
    if (response?.error?.data) {
      const errorMessage = response.error.data.errors
        ? response.error.data.errors.join(", ")
        : response.error.data.message
      openSnackbar(errorMessage, "error")
    } else {
      if (response?.data?.updatedDeviceIds) {
        const updatedDeviceIds = response.data.updatedDeviceIds
        const failedDeviceIds = response.data.failedDeviceIds
        const allDevicesUpdated = devices.every((deviceId: any) =>
          updatedDeviceIds.includes(deviceId),
        )
        const message = allDevicesUpdated
          ? "All devices updated successfully"
          : `The following devices were not updated: ${failedDeviceIds.join(
              ", ",
            )}`
        setFormDeviceValues(initialDeviceValues)
        openSnackbar(message, allDevicesUpdated ? "success" : "warning")
      } else {
        openSnackbar("Failed to edit devices", "error")
      }
    }
  }

  const handleDevices = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsDeviceSubmitting(true)
    if (canSaveDevice) {
      try {
        const devices = formValues.deviceNames
          .map((deviceName) => {
            const device = data.find(
              (device: any) => device.deviceName === deviceName,
            )
            return device ? device._id : null
          })
          .filter((id) => id !== null)

        const nonEmptyFormDeviceValues = Object.fromEntries(
          Object.entries(formDeviceValues).filter(
            ([key, value]) => value !== "",
          ),
        )
        const response = await editDevices({
          deviceIds: devices,
          ...nonEmptyFormDeviceValues,
        })
        handleEditDevicesResponse(response, devices)
      } catch (error: any) {
        openSnackbar("Failed to edit device: " + error.message, "error")
      } finally {
        setIsDeviceSubmitting(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (!isNaN(Number(value)) || value === "") {
      setFormDeviceValues((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

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
            options={data ? data.map((device: any) => device.deviceName) : []}
            value={formValues.deviceNames ?? []}
            onChange={(_event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                deviceNames: newValue,
              }))
            }}
            renderInput={(params) => (
              <TextField
                sx={{ mt: 2 }}
                {...params}
                label={"Device Names"}
                fullWidth
              />
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
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFormDeviceValues(initialDeviceValues)
                }}
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
