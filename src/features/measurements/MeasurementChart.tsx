import React, { useCallback, useEffect, useState } from "react"
import { Box, useTheme } from "@mui/material"
import { useGetMeasurementsByDeviceNamesQuery } from "@/features/api/apiSlice"
import { useAppSelector } from "@/hooks/useStore"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const MeasurementChart = () => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === "dark"
  const [lineColors, setLineColors] = useState<string[]>([])
  const deviceNames: string[] = useAppSelector(
    (state) => state.measurements.deviceNames,
  )

  const getRandomColor = useCallback((): string => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    const limit = isDarkMode ? 4 : 8

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }

    const brightness = parseInt(color.substring(1), 16)
    if (brightness > parseInt("FFFFFF", 16) / limit) {
      return getRandomColor()
    }

    return color
  }, [isDarkMode])

  useEffect(() => {
    const colors = deviceNames.map(() => getRandomColor())
    setLineColors(colors)
  }, [deviceNames, getRandomColor])

  const deviceNamesString: string = deviceNames.join(",")
  // const groupName: string = useAppSelector(
  //   (state) => state.measurements.groupName,
  // )
  const startTime: string = useAppSelector(
    (state) => state.measurements.startTime,
  )
  const endTime: string = useAppSelector((state) => state.measurements.endTime)

  const { data, isFetching, isLoading, isSuccess, isError, error } =
    useGetMeasurementsByDeviceNamesQuery({
      deviceNames: deviceNamesString,
      startTime: startTime,
      endTime: endTime,
    })

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
    const measurements = data.measurements

    content = (
      <Box>
        <ResponsiveContainer height={500} width={"100%"}>
          <LineChart data={measurements}>
            <CartesianGrid strokeDasharray={"3 3"} />
            <XAxis
              dataKey="date"
              type="category"
              allowDuplicatedCategory={false}
            />
            <YAxis dataKey={"current"} />
            <Tooltip />
            <Legend />
            {measurements.map((measurement: any, index: number) => (
              <Line
                key={measurement.name}
                data={measurement.data}
                dataKey="current"
                name={measurement.name}
                stroke={lineColors[index]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )
  }
  return <Box>{content}</Box>
}

export default MeasurementChart
