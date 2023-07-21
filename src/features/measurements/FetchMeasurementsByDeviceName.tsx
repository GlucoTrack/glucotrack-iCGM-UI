import { useEffect } from "react"
import { useTheme } from "@mui/material"
import MeasurementFormInputs from "@/interfaces/MeasurementFormInputs"
import { useGetMeasurementsByDeviceNameQuery } from "@/features/api/apiSlice"

interface FetchMeasurementsByDeviceNameProps {
  form: MeasurementFormInputs
}

const FetchMeasurementsByDeviceName: React.FC<
  FetchMeasurementsByDeviceNameProps
> = ({ form: MeasurementFormInputs }) => {
  const theme = useTheme()
  const { deviceNames, groupName, startDate, endDate } = form

  const { data, isFetching, isLoading, isSuccess, isError, error, refetch } =
    useGetMeasurementsByDeviceNameQuery({
      deviceNames,
      groupName,
      startDate,
      endDate,
    })

  useEffect(() => {
    refetch()
  }, [deviceNames, groupName, startDate, endDate, refetch])

  let content: JSX.Element | null = null
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    const errorMessageString = JSON.stringify(error)
    const errorMessageParsed = JSON.parse(errorMessageString)
    content = (
      <p style={{ color: theme.palette.error.main }}>
        {errorMessageParsed.data.message}
      </p>
    )
  } else if (isSuccess) {
    content = null
    console.log("data:", data)
  }

  return content === null ? data : content
}

export default FetchMeasurementsByDeviceName
