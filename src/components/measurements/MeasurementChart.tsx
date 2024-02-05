import React, { useCallback, useEffect, useState } from "react"
import {
  Box,
  useTheme,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
} from "@mui/material"
import { useAppSelector } from "@/hooks/useStore"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import chroma from "chroma-js"
import MeasurementGrid from "./MeasurementGrid"
import Grid from "@mui/system/Unstable_Grid"
import { socket } from "../../utils/socket"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

function CustomTooltip({ payload, label, active }: any) {
  if (active && payload && payload.length) {
    const pl = payload[0]
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <h4>{pl.name}</h4>
        <p>
          {dayjs(label).format("YYYY-MM-DD HH:mm:ss")}
          <br />
          Current: {pl.payload.current}
          <br />
          Voltage: {pl.payload.voltage}
          <br />
        </p>
      </Paper>
    )
  }

  return null
}

const MeasurementChart = ({ ...props }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === "dark"
  const [lineColors, setLineColors] = useState<string[]>([])
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const endTime = useAppSelector((state) => state.measurements.endTime)
  const deviceNames: string[] = useAppSelector(
    (state) => state.measurements.deviceNames,
  )
  const devicesDepts = JSON.stringify(deviceNames)
  const { data, isFetching, isLoading, isSuccess, isError, error } = props.query
  const [localStorageKey, setLocalStorageKey] = useState(
    JSON.parse(localStorage.getItem("chart_settings_" + props.page) || "{}"),
  )

  const [chartSettings, setChartSettings] = useState({
    xAxisFormat:
      localStorageKey && localStorageKey.xAxisFormat
        ? localStorageKey.xAxisFormat
        : "YY-MM-DD HH:mm:ss",
    yAxisMin:
      localStorageKey && localStorageKey.yAxisMin
        ? localStorageKey.yAxisMin
        : 0,
    yAxisMax:
      localStorageKey && localStorageKey.yAxisMax
        ? localStorageKey.yAxisMax
        : 0,
  })

  const dateFormatter = (date: any) => {
    if (date) {
      return dayjs(date).format(chartSettings.xAxisFormat)
    }
    return date
  }

  const getRandomColor = useCallback((): string => {
    const baseColor = chroma("blue")
    const hueVariation = Math.random() * 360

    // Adjust the lightness based on the theme
    const lightness = isDarkMode ? 75 : 50

    const color = baseColor
      .set("hsl.h", hueVariation)
      .set("hsl.l", lightness / 100)
      .hex()

    return color
  }, [isDarkMode])

  useEffect(() => {
    const colors = deviceNames.map(() => getRandomColor())
    setLineColors(colors)
  }, [deviceNames, getRandomColor])

  const [isZoomed, setIsZoomed] = useState(false)
  const [measurements, setMeasurements] = useState<any>([])

  useEffect(() => {
    if (data?.measurements) {
      setMeasurements(data.measurements)
      setIsZoomed(false)
      setStartZoomArea("")
      setEndZoomArea("")
      setTempStartZoomArea("")
      setTempEndZoomArea("")
    }
  }, [data?.measurements])

  const [tempStartZoomArea, setTempStartZoomArea] = useState<string>("")
  const [tempEndZoomArea, setTempEndZoomArea] = useState<string>("")
  const [startZoomArea, setStartZoomArea] = useState<string>("")
  const [endZoomArea, setEndZoomArea] = useState<string>("")

  // flag if currently zooming (press and drag)
  const [isZooming, setIsZooming] = useState(false)

  // flag to show the zooming area (ReferenceArea)
  const showZoomBox = isZooming && tempStartZoomArea && tempEndZoomArea

  const filteredMeasurements = measurements.map((measurement: any) => {
    return {
      ...measurement,
      data: measurement.data.filter((d: any) => {
        if (isZoomed) {
          let startDate = new Date(startZoomArea)
          let endDate = new Date(endZoomArea)
          if (startDate > endDate) {
            let temp = startDate
            startDate = endDate
            endDate = temp
          }
          let date = new Date(d.date)
          return date >= startDate && date <= endDate
        } else {
          return true
        }
      }),
    }
  })

  // reset the states on zoom out
  function handleZoomOut() {
    setIsZoomed(false)
    setStartZoomArea("")
    setEndZoomArea("")
    setTempStartZoomArea("")
    setTempEndZoomArea("")
  }

  function handleMouseDown(e: any) {
    setIsZooming(true)
    setTempStartZoomArea(e.activeLabel)
    setTempEndZoomArea("")
  }

  function handleMouseMove(e: any) {
    if (isZooming) {
      setTempEndZoomArea(e.activeLabel)
    }
  }

  function handleMouseUp(e: any) {
    if (isZooming) {
      setIsZooming(false)

      if (tempStartZoomArea === tempEndZoomArea || tempStartZoomArea === "") {
        setTempStartZoomArea("")
        setTempEndZoomArea("")
        return
      }

      setEndZoomArea(tempEndZoomArea)
      setStartZoomArea(tempStartZoomArea)
      setTempStartZoomArea("")
      setTempEndZoomArea("")

      setIsZoomed(true)
    }
  }

  const handleSettingChange = (field: string, value: string | Number) => {
    setChartSettings((prevSettings) => {
      return {
        ...prevSettings,
        [field]: value !== null ? value : "",
      }
    })
  }

  useEffect(() => {
    if (
      chartSettings.xAxisFormat ||
      chartSettings.yAxisMin ||
      chartSettings.yAxisMax
    ) {
      let newChartSettings = {
        ...localStorageKey,
        xAxisFormat: chartSettings.xAxisFormat,
        yAxisMin: chartSettings.yAxisMin,
        yAxisMax: chartSettings.yAxisMax,
      }
      setLocalStorageKey(newChartSettings)
      localStorage.setItem(
        "chart_settings_" + props.page,
        JSON.stringify(newChartSettings),
      )
    }
  }, [chartSettings])

  // Handle new measurements events
  useEffect(() => {
    if (props.eventName) {
      for (const deviceName of deviceNames) {
        socket.on(props.eventName + deviceName, (data: any) => {
          let date = new Date(data.date)
          if (
            date >= dayjs(startTime).utc().toDate() &&
            date <= dayjs(endTime).utc().toDate()
          ) {
            setMeasurements((oldMeasurements: any) => {
              let newMeasurements = []
              for (let measurement of oldMeasurements) {
                if (measurement.name === data.deviceName) {
                  let newMeasurement = { ...measurement }
                  newMeasurement.data = [...measurement.data, data]
                  newMeasurements.push(newMeasurement)
                } else {
                  newMeasurements.push(measurement)
                }
              }
              return newMeasurements
            })
          }
        })
      }
    }

    return () => {
      for (const deviceName of deviceNames) {
        socket.off(props.eventName + deviceName)
      }
    }
  }, [devicesDepts, deviceNames, props.eventName, startTime, endTime])

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
    const measurementsData =
      filteredMeasurements[0]?.data ?? filteredMeasurements
    content = (
      <>
        <Box style={{ userSelect: "none", marginTop: 30 }}>
          {isZoomed && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleZoomOut}
              sx={{ mb: 3, alignItems: "center" }}
            >
              Zoom Out
            </Button>
          )}
          <ResponsiveContainer height={500} width={"100%"}>
            <LineChart
              data={measurementsData}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid strokeDasharray={"3 3"} />
              <XAxis
                dataKey="date"
                tickFormatter={dateFormatter}
                type="category"
                angle={-25}
                fontSize={12}
                tick={{ dy: 20 }}
                interval={Math.floor(measurementsData.length / 20)}
                allowDuplicatedCategory={false}
                height={50}
              />
              <YAxis
                dataKey="current"
                type="number"
                domain={[chartSettings.yAxisMin, chartSettings.yAxisMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />

              {showZoomBox && (
                <ReferenceArea
                  x1={tempStartZoomArea}
                  x2={tempEndZoomArea}
                  strokeOpacity={0.3}
                />
              )}
              {filteredMeasurements.map((measurement: any, index: number) => (
                <Line
                  //key={`l_${measurement.name}_${measurement.data.length}`}
                  key={measurement.name}
                  data={measurement.data}
                  dataKey="current"
                  name={measurement.name}
                  stroke={lineColors[index]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <Grid container spacing={3} lg={6}>
            <Grid xs={6}>
              <Select
                label="X-Axis Format"
                type="string"
                value={chartSettings.xAxisFormat}
                onChange={(event) => {
                  handleSettingChange("xAxisFormat", event.target.value)
                }}
                sx={{ width: 1, mt: 4 }}
              >
                <MenuItem value="YY-MM-DD HH:mm:ss">YY-MM-DD HH:mm:ss</MenuItem>
                <MenuItem value="MM-DD HH:mm:ss">MM-DD HH:mm:ss</MenuItem>
                <MenuItem value="DD HH:mm:ss">DD HH:mm:ss</MenuItem>
                <MenuItem value="HH:mm:ss">HH:mm:ss</MenuItem>
              </Select>
            </Grid>
            <Grid xs={3}>
              <TextField
                label="Y-Axis Min"
                type="number"
                defaultValue={chartSettings.yAxisMin}
                onBlur={(event) => {
                  if (event.target.value) {
                    handleSettingChange("yAxisMin", Number(event.target.value))
                  }
                }}
                sx={{ width: 1, mt: 4 }}
                fullWidth
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                label="Y-Axis Max"
                type="number"
                defaultValue={chartSettings.yAxisMax}
                onBlur={(event) => {
                  if (event.target.value) {
                    handleSettingChange("yAxisMax", Number(event.target.value))
                  }
                }}
                sx={{ width: 1, mt: 4 }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <MeasurementGrid measurements={filteredMeasurements} />
        </Box>
      </>
    )
  }
  return <Box>{content}</Box>
}

export default MeasurementChart
