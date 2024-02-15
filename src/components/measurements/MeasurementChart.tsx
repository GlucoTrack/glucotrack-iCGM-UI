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
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <h4>{dayjs(label).format("YYYY-MM-DD HH:mm:ss")}</h4>
        {payload.map((pl: any, index: number) => (
        <p>
          {pl.name}
          <br />
          Current: {pl.payload[pl.name]}
          <br />          
        </p>
        ))}
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
  const realtime = useAppSelector((state) => state.measurements.realtime)
  const deviceNames: string[] = useAppSelector(
    (state) => state.measurements.deviceNames,
  )
  const devicesDepts = JSON.stringify(deviceNames)
  const { data, isFetching, isLoading, isSuccess, isError, error } = props.query
  const [localStorageKey, setLocalStorageKey] = useState(
    JSON.parse(localStorage.getItem("chart_settings_" + props.page) || "{}"),
  )

  const generateDeviceColors = (deviceNames: string[]) => {
    const colorScale = chroma.scale(['red', 'blue']).mode('lch').colors(deviceNames.length);

    return deviceNames.reduce((colors, deviceName, index) => {
      colors[deviceName] = colorScale[index];
      return colors;
    }, {} as Record<string, string>);
  };

  useEffect(() => {
    const newDeviceColors = generateDeviceColors(deviceNames);
    const colors = Object.values(newDeviceColors);
    setLineColors(colors);
  }, [deviceNames]);

  const [isZoomed, setIsZoomed] = useState(false)
  const [measurements, setMeasurements] = useState<any>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<any>([])
  const [chartData, setChartData] = useState<any>([])
  const [yAxisMin, setYAxisMin] = useState<Number>();
  const [yAxisMax, setYAxisMax] = useState<Number>();

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


  useEffect(() => {
    if (isZooming) {
      return
    }
    let minValue = localStorageKey?.yAxisMin
    let maxValue = localStorageKey?.yAxisMax
    let filteredMes = []

    let startDate = new Date(), endDate = new Date()
    if (isZoomed) {
      startDate = new Date(startZoomArea)
      endDate = new Date(endZoomArea)
      if (startDate > endDate) {
        let temp = startDate
        startDate = endDate
        endDate = temp
      }
    }

    for (const measurement of measurements) {
      let filteredData = []
      const seenDates = new Set();
      for (const data of measurement.data) {
        if (seenDates.has(data.date)) {
          continue
        } else {
          seenDates.add(data.date)
        }
        if (minValue === undefined || data.current < minValue) {
          minValue = data.current;
        }
        if (maxValue === undefined || data.current > maxValue) {
          maxValue = data.current;
        }
        let date = new Date(data.date)
        if (isZoomed) {
          if (date >= startDate && date <= endDate) {
            filteredData.push(data)
          }
        } else {
          filteredData.push(data)
        }
      }
      /*
      filteredData = filteredData.sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })*/
      filteredMes.push({ ...measurement, data: filteredData })
    }

    const unifiedData = new Map()
    for (const measurement of filteredMes) {
      for (const data of measurement.data) {
        if (unifiedData.has(data.date)) {
          let obj = unifiedData.get(data.date)
          obj[measurement.name] = data.current
          unifiedData.set(data.date, obj)
        } else {
          let obj: any = {
            date: data.date,
          }
          obj[measurement.name] = data.current
          unifiedData.set(data.date, obj)
        }
      }
    }
    setChartData(Array.from(unifiedData.values()))

    setFilteredMeasurements(filteredMes)

    setYAxisMin(minValue.toFixed(2))
    setYAxisMax(maxValue.toFixed(2))
  }, [measurements, isZoomed, isZooming])


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

  function formatValue(value: number) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    } else {
      return value.toFixed(2);
    }
  }

  const handleSettingChange = (field: string, value: string | number) => {
    setChartSettings((prevSettings) => {
      let newValue = value;

      if (field === 'yAxisMin' || field === 'yAxisMax') {
        const dataValues = filteredMeasurements[0]?.data.map((d: any) => d.current);
        const extremeValue = field === 'yAxisMin' ? Math.min(...dataValues) : Math.max(...dataValues);

        if ((field === 'yAxisMin' && Number(newValue) > extremeValue) || (field === 'yAxisMax' && Number(newValue) < extremeValue)) {
          newValue = extremeValue;
        }

        const setter = field === 'yAxisMin' ? setYAxisMin : setYAxisMax;
        setter(parseFloat(Number(newValue).toFixed(2)));
      }


      return {
        ...prevSettings,
        [field]: newValue !== null ? newValue : '',
      };
    });
  };

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
      if (realtime) {
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
      } else {
        for (const deviceName of deviceNames) {
          socket.off(props.eventName + deviceName)
        }
      }
    }

    return () => {
      for (const deviceName of deviceNames) {
        socket.off(props.eventName + deviceName)
      }
    }
  }, [devicesDepts, deviceNames, props.eventName, startTime, endTime, realtime])

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
    const measurementsData = filteredMeasurements[0]?.data ?? filteredMeasurements;

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
              data={chartData}
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
                height={50}
              />
              <YAxis
                tickFormatter={(value) => formatValue(value)}
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
                  dataKey={measurement.name}
                  name={measurement.name}
                  stroke={lineColors[index]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <Grid container spacing={3} lg={6}>
            <Grid xs={6}>
              <Select
                label="X-Axis Format"
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
                value={yAxisMin !== undefined ? yAxisMin : 0}
                onChange={(event) => setYAxisMin(Number(event.target.value))}
                onBlur={() => handleSettingChange("yAxisMin", Number(yAxisMin))}
                sx={{ width: 1, mt: 4 }}
                fullWidth
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                label="Y-Axis Max"
                type="number"
                value={yAxisMax !== undefined ? yAxisMax : 0}
                onChange={(event) => setYAxisMax(Number(event.target.value))}
                onBlur={() => handleSettingChange("yAxisMax", Number(yAxisMax))}
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
