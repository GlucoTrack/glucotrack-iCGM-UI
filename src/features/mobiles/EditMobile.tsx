import Header from "@/components/Header"
import { Box, Button, useTheme } from "@mui/material"
import React, { JSX, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useGetMobileQuery,
  useEditMobileMutation,
  useDeleteMobileMutation,
} from "@/features/api/apiSlice"
import TrimmedTextField from "@/components/TrimmedTextField"

interface FormValues {
  mobileName: string
  baseUri: string
  sensorId: string
  sensorName: string
  measurementInterval: number
  reportInterval: number
  refMillivolts: number
  weMillivolts: number
  filterLength: number
  checkParametersInterval: number
  gain?: number
  slope?: number
  bias?: number
  comment?: string
}

const initialValues: FormValues = {
  mobileName: "XXXXXX",
  baseUri: "https://stg-icgm.herokuapp.com/api/v1",
  sensorId: "XX:XX:XX:XX:XX",
  sensorName: "XXXXXX",
  measurementInterval: 30,
  reportInterval: 600,
  refMillivolts: 600,
  weMillivolts: 1200,
  filterLength: 10,
  checkParametersInterval: 60,
  comment: " ",
  gain: 0,
  slope: 0,
  bias: 0,
}

const EditMobile: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const { mobileId } = useParams<Record<string, string>>()

  const {
    data: getMobileData,
    // status: getMobileStatus,
    isFetching: getMobileIsFetching,
    isLoading: getMobileIsLoading,
    isSuccess: getMobileIsSuccess,
    isError: getMobileIsError,
    error: getMobileError,
  } = useGetMobileQuery(mobileId)

  const [
    deleteMobile,
    {
      isLoading: isDeletingMobile,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: isDeleteSuccess,
    },
  ] = useDeleteMobileMutation()

  const [
    editMobile,
    {
      isLoading: isEditingMobile,
      isError: isEditError,
      error: editError,
      isSuccess: isEditSuccess,
    },
  ] = useEditMobileMutation()

  useEffect(() => {
    if (getMobileData) {
      const {
        mobileName,
        baseUri,
        sensorId,
        sensorName,
        measurementInterval,
        reportInterval,
        refMillivolts,
        weMillivolts,
        filterLength,
        checkParametersInterval,
        gain,
        slope,
        bias,
        comment,
      } = getMobileData

      setFormValues({
        mobileName,
        baseUri,
        sensorId,
        sensorName,
        measurementInterval,
        reportInterval,
        refMillivolts,
        weMillivolts,
        filterLength,
        checkParametersInterval,
        gain,
        slope,
        bias,
        comment,
      })
    }
  }, [getMobileData])

  let getMobileContent: JSX.Element | null = null
  if (getMobileIsFetching) {
    getMobileContent = <h3>Fetching...</h3>
  } else if (getMobileIsLoading) {
    getMobileContent = <h3>Loading...</h3>
  } else if (getMobileIsError) {
    console.log("getMobileError:", getMobileError)

    const errorMessageString = JSON.stringify(getMobileError)
    const errorMessageParsed = JSON.parse(errorMessageString)
    getMobileContent = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (getMobileIsSuccess && getMobileData) {
    getMobileContent = null
  }

  const canSave =
    [
      formValues.mobileName,
      formValues.baseUri,
      formValues.sensorId,
      formValues.sensorName,
      formValues.measurementInterval,
      formValues.reportInterval,
      formValues.refMillivolts,
      formValues.weMillivolts,
      formValues.filterLength,
      formValues.checkParametersInterval,
      formValues.comment,
    ].every((value) => value !== undefined && value !== null && value !== "") &&
    !getMobileIsLoading &&
    !isDeletingMobile &&
    !isEditingMobile

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    navigate("/mobiles")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canSave) {
      try {
        await editMobile({ mobileId, ...formValues })
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleMutationSuccess = () => {
    setTimeout(() => {
      navigate("/mobiles")
    }, 0)
  }

  const handleDelete = async () => {
    try {
      await deleteMobile(mobileId)
    } catch (error: any) {
      console.error(error)
    }
  }

  let content: JSX.Element | null = null
  if (isEditingMobile || isDeletingMobile) {
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

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header
        title="Edit a mobile"
        subtitle="(complete all fields to edit a mobile)"
      />
      {getMobileContent}
      <Box flexGrow={1} overflow="auto" maxWidth="400px" width="100%">
        <form onSubmit={handleSubmit}>
          <TrimmedTextField
            name="mobileName"
            label="Mobile Name(s)"
            type="text"
            value={formValues.mobileName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="baseUri"
            label="Base URI"
            type="text"
            value={formValues.baseUri}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="sensorId"
            label="Sensor ID"
            type="text"
            value={formValues.sensorId}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="sensorName"
            label="Sensor Name"
            type="text"
            value={formValues.sensorName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="measurementInterval"
            label="Measurement Interval"
            type="number"
            value={formValues.measurementInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="reportInterval"
            label="Report Interval"
            type="number"
            value={formValues.reportInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="refMillivolts"
            label="Ref Millivolts"
            type="number"
            value={formValues.refMillivolts}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="weMillivolts"
            label="WE Millivolts"
            type="number"
            value={formValues.weMillivolts}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="filterLength"
            label="Filter Length"
            type="number"
            value={formValues.filterLength}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="checkParametersInterval"
            label="Check Parameters Interval"
            type="number"
            value={formValues.checkParametersInterval}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="gain"
            label="Gain"
            type="number"
            value={formValues.gain}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="slope"
            label="Slope"
            type="number"
            value={formValues.slope}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="bias"
            label="Bias"
            type="number"
            value={formValues.bias}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TrimmedTextField
            name="comment"
            label="Comment"
            type="text"
            value={formValues.comment}
            onChange={handleChange}
            fullWidth
            margin="normal"
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!canSave}
              >
                Submit
              </Button>
            </Box>

            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default EditMobile
