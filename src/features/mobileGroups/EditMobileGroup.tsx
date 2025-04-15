import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Autocomplete, Box, Button, Divider, TextField } from "@mui/material"
import Header from "@/components/Header"
import {
  useDeleteMobileGroupMutation,
  useEditMobileGroupMutation,
  useGetMobilesQuery,
  useEditMobilesMutation,
} from "@/features/api/apiSlice"
import { RootState } from "@/store/store"
import { resetMobileGroup } from "./groupsSlice"
import { Typography } from "@mui/material"
import { SnackbarContext } from "../../providers/SnackbarProvider"

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

interface MobileValues {
  _id?: string
  measurementInterval: string
  reportInterval: string
  refMillivolts: string
  weMillivolts: string
  filterLength: string
  checkParametersInterval: string
}

const initialMobileValues: MobileValues = {
  measurementInterval: "",
  reportInterval: "",
  refMillivolts: "",
  weMillivolts: "",
  filterLength: "",
  checkParametersInterval: "",
}

const EditMobileGroup: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { openSnackbar } = useContext(SnackbarContext)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [formMobileValues, setFormMobileValues] =
    useState<MobileValues>(initialMobileValues)
  const [isMobileSubmitting, setIsMobileSubmitting] = useState(false)
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
  ] = useEditMobileGroupMutation()
  const [
    deleteGroup,
    {
      isLoading: isDeletingGroup,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteMobileGroupMutation()
  const [editMobiles] = useEditMobilesMutation()

  // Fill the attributes form with the common values of the selected mobiles
  useEffect(() => {
    if (formValues.mobileNames.length > 0 && data && data.mobileDevices) {
      // Get the mobile from the selected mobile names
      const mobiles = formValues.mobileNames
        .map((mobileName) => {
          const device = data.mobileDevices.find(
            (device: any) => device.mobileName === mobileName,
          )
          return device ? device : null
        })
        .filter((device) => device !== null)

      // Get the common values from the first mobile
      const commonValue: MobileValues = {
        measurementInterval: mobiles[0].measurementInterval,
        reportInterval: mobiles[0].reportInterval,
        refMillivolts: mobiles[0].refMillivolts,
        weMillivolts: mobiles[0].weMillivolts,
        filterLength: mobiles[0].filterLength,
        checkParametersInterval: mobiles[0].checkParametersInterval,
      }

      // Check if all the mobiles have the same values, instead i put empty string
      for (let i = 1; i < mobiles.length; i++) {
        const mobile = mobiles[i]
        if (commonValue.measurementInterval !== mobile.measurementInterval) {
          commonValue.measurementInterval = ""
        }
        if (commonValue.reportInterval !== mobile.reportInterval) {
          commonValue.reportInterval = ""
        }
        if (commonValue.refMillivolts !== mobile.refMillivolts) {
          commonValue.refMillivolts = ""
        }
        if (commonValue.weMillivolts !== mobile.weMillivolts) {
          commonValue.weMillivolts = ""
        }
        if (commonValue.filterLength !== mobile.filterLength) {
          commonValue.filterLength = ""
        }
        if (
          commonValue.checkParametersInterval !== mobile.checkParametersInterval
        ) {
          commonValue.checkParametersInterval = ""
        }
      }

      setFormMobileValues(commonValue)
    }
  }, [data, formValues.mobileNames])

  useEffect(() => {
    const savedFormValues = localStorage.getItem("mobileGroupValues_" + groupId)

    const setDefaultValues = () => {
      localStorage.setItem(
        "mobileGroupValues_" + groupId,
        JSON.stringify({
          mobileGroupName,
          mobileGroupDescription,
          mobileNames,
        }),
      )
      setFormValues({ mobileGroupName, mobileGroupDescription, mobileNames })
    }

    if (savedFormValues) {
      const parsedFormValues = JSON.parse(savedFormValues)
      if (
        parsedFormValues.mobileGroupName &&
        parsedFormValues.mobileGroupDescription &&
        parsedFormValues.mobileNames
      ) {
        setFormValues(parsedFormValues)
      } else {
        setDefaultValues()
      }
    } else {
      setDefaultValues()
    }
  }, [mobileGroupName, mobileGroupDescription, mobileNames, groupId])

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

  const canSaveMobile = [
    formMobileValues.measurementInterval,
    formMobileValues.reportInterval,
    formMobileValues.refMillivolts,
    formMobileValues.weMillivolts,
    formMobileValues.filterLength,
    formMobileValues.checkParametersInterval,
  ].some((value) => value !== undefined && value !== null && value !== "")

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

  const handleMutationSuccess = React.useCallback(() => {
    setTimeout(() => {
      dispatch(resetMobileGroup())
      navigate("/mobile-groups")
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
      openSnackbar("Mobile Group updated successfully", "success")
      handleMutationSuccess()
    } else if (isDeleteSuccess) {
      openSnackbar("Mobile Group deleted successfully", "success")
      handleMutationSuccess()
    }
  }, [
    isEditingGroup,
    isDeletingGroup,
    isEditError,
    isDeleteError,
    deleteError,
    editError,
    isEditSuccess,
    isDeleteSuccess,
    openSnackbar,
    handleMutationSuccess,
  ])

  const handleEditMobilesResponse = (response: any, mobiles: any) => {
    if (response?.error?.data) {
      const errorMessage = response.error.data.errors
        ? response.error.data.errors.join(", ")
        : response.error.data.message
      openSnackbar(errorMessage, "error")
    } else {
      if (response?.data?.mobiles?.updatedMobileIds) {
        const updatedMobileIds = response.data.mobiles.updatedMobileIds
        const failedMobileIds = response.data.mobiles.failedMobileIds
        const allMobilesUpdated = mobiles.every((mobileId: any) =>
          updatedMobileIds.includes(mobileId),
        )
        const message = allMobilesUpdated
          ? "All mobiles updated successfully"
          : `The following mobiles were not updated: ${failedMobileIds.join(
              ", ",
            )}`
        setFormMobileValues(initialMobileValues)
        openSnackbar(message, allMobilesUpdated ? "success" : "warning")
      } else {
        openSnackbar("Failed to edit mobiles", "error")
      }
    }
  }

  const handleMobiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsMobileSubmitting(true)
    if (canSaveMobile) {
      try {
        const mobiles = formValues.mobileNames
          .map((mobileName) => {
            const device = data.mobileDevices.find(
              (device: any) => device.mobileName === mobileName,
            )
            return device ? device._id : null
          })
          .filter((id) => id !== null)

        const nonEmptyFormMobileValues = Object.fromEntries(
          Object.entries(formMobileValues).filter(
            ([key, value]) => value !== "",
          ),
        )
        const response = await editMobiles({
          mobileIds: mobiles,
          ...nonEmptyFormMobileValues,
        })
        handleEditMobilesResponse(response, mobiles)
      } catch (error: any) {
        openSnackbar("Failed to edit mobile: " + error.message, "error")
      } finally {
        setIsMobileSubmitting(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (!isNaN(Number(value)) || value === "") {
      setFormMobileValues((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a mobile group"
        subtitle="(compete each field below to edit a group)"
      />
      <Box flexGrow={1} overflow="auto" width="100%">
        <form onSubmit={handleSubmit}>
          <TextField
            id="mobileGroupName"
            name="mobileGroupName"
            label="Mobile Group Name"
            value={formValues.mobileGroupName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            id="mobileGroupDescription"
            name="mobileGroupDescription"
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
              data && data.mobileDevices
                ? data.mobileDevices.map((mobile: any) => mobile.mobileName)
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
              <TextField
                sx={{ mt: 2 }}
                {...params}
                label={"Mobile Names"}
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
          Modify the attributes of every mobile within this group
        </Typography>

        <form onSubmit={handleMobiles}>
          <TextField
            id="measurementInterval"
            name="measurementInterval"
            label="Measurement Interval"
            value={formMobileValues.measurementInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="reportInterval"
            name="reportInterval"
            label="Report Interval"
            value={formMobileValues.reportInterval}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="refMillivolts"
            name="refMillivolts"
            label="Ref Millivolts"
            value={formMobileValues.refMillivolts}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="weMillivolts"
            name="weMillivolts"
            label="We Millivolts"
            value={formMobileValues.weMillivolts}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="filterLength"
            name="filterLength"
            label="Filter Length"
            value={formMobileValues.filterLength}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mr: 2 }}
          />
          <TextField
            id="checkParametersInterval"
            name="checkParametersInterval"
            label="Check Parameters Interval"
            value={formMobileValues.checkParametersInterval}
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
                  setFormMobileValues(initialMobileValues)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isMobileSubmitting || !canSaveMobile}
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
