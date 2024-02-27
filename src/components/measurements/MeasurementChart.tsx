import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  // Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  useTheme,
} from "@mui/material"
import { useAppSelector } from "@/hooks/useStore"
import chroma, { Color } from "chroma-js"
import MeasurementGrid from "./MeasurementGrid"
import Grid from "@mui/system/Unstable_Grid"
import { socket } from "../../utils/socket"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import distinctColors from "distinct-colors"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Boost from 'highcharts/modules/boost';

dayjs.extend(utc)

Boost(Highcharts);

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

  const generateDeviceColors = (
    deviceNames: string[],
    palette: Color[],
  ): Record<string, Color> => {
    const deviceColors: Record<string, Color> = {}
    deviceNames.forEach((device, i) => {
      deviceColors[device] = palette[i % palette.length]
    })
    return deviceColors
  }

  useEffect(() => {
    const palette = distinctColors({
      count: deviceNames.length,
      hueMin: isDarkMode ? 0 : 0,
      hueMax: isDarkMode ? 360 : 360,
      chromaMin: 0,
      chromaMax: 100,
      lightMin: isDarkMode ? 30 : 0,
      lightMax: isDarkMode ? 100 : 90,
      quality: 50,
      samples: 10000,
    })
    const newDeviceColors = generateDeviceColors(deviceNames, palette)
    setLineColors(
      Object.values(newDeviceColors).map((color) => chroma(color).hex()),
    )
  }, [deviceNames, isDarkMode])

  
  const [measurements, setMeasurements] = useState<any>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<any>([])
  const [yAxisMin, setYAxisMin] = useState<Number>()
  const [yAxisMax, setYAxisMax] = useState<Number>()

  const [startZoomArea, setStartZoomArea] = useState<Date | null>()
  const [endZoomArea, setEndZoomArea] = useState<Date | null>()

  const [chartOptions, setChartOptions] = useState({
    title: {
      text: null
    },
    xAxis: {
      type: 'datetime',

    },
    series: [],
    boost: {
      useGPUTranslations: true,
      usePreallocated: true
    },
    chart: {
      zoomType: 'x',
      backgroundColor: null,
      events: {
        selection: function (event: any) {
          if (event.resetSelection) {
            setStartZoomArea(null)
            setEndZoomArea(null)
          } else {
            setStartZoomArea(new Date(event.xAxis[0].min))
            setEndZoomArea(new Date(event.xAxis[0].max))            
          }          
        }
      },
    },
  })

  useEffect(() => {
    if (data?.measurements) {
      setMeasurements(data.measurements)
      setStartZoomArea(null)
      setEndZoomArea(null)
    }
  }, [data?.measurements])



  useEffect(() => {
    let minValue = localStorageKey?.yAxisMin
    let maxValue = localStorageKey?.yAxisMax

    let series: any = []
    for (const measurement of measurements) {
      let data = []
      for (const d of measurement.data) {
        if (minValue === undefined || d.current < minValue) {
          minValue = d.current
        }
        if (maxValue === undefined || d.current > maxValue) {
          maxValue = d.current
        }
        data.push([new Date(d.date).getTime(), d.current])

      }
      series.push({ name: measurement.name, data: data, type: "line" })
    }

    setYAxisMin(minValue ? minValue.toFixed(2) : 0)
    setYAxisMax(maxValue ? maxValue.toFixed(2) : 100)

    setChartOptions((prevOptions: any) => {
      return {
        ...prevOptions,
        series: series
      }
    })

  }, [
    measurements,
    localStorageKey?.yAxisMax,
    localStorageKey?.yAxisMin,
  ])

  // Filtered measurements for table
  useEffect(() => {
    if (startZoomArea && endZoomArea) {
      let filteredMes = []
      for (const measurement of measurements) {
        let filteredData = []
        for (const data of measurement.data) {
          let date = new Date(data.date)

          if (date >= startZoomArea && date <= endZoomArea) {
            filteredData.push(data)
          }

        }
        filteredMes.push({ ...measurement, data: filteredData })
      }

      setFilteredMeasurements(filteredMes)
    } else {
      setFilteredMeasurements(measurements)
    }

  }, [
    measurements,
    startZoomArea,
    endZoomArea,
  ])

  const [chartSettings, setChartSettings] = useState({
    xAxisFormat:
      localStorageKey && localStorageKey.xAxisFormat
        ? localStorageKey.xAxisFormat
        : "HH:mm:ss",
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
  

  function formatValue(value: number) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "k"
    } else {
      return value.toFixed(2)
    }
  }

  const handleSettingChange = (field: string, value: string | number) => {
    setChartSettings((prevSettings) => {
      let newValue = value

      if (field === "yAxisMin" || field === "yAxisMax") {
        const dataValues = filteredMeasurements[0]?.data.map(
          (d: any) => d.current,
        )
        const extremeValue =
          field === "yAxisMin"
            ? Math.min(...dataValues)
            : Math.max(...dataValues)

        if (
          (field === "yAxisMin" && Number(newValue) > extremeValue) ||
          (field === "yAxisMax" && Number(newValue) < extremeValue)
        ) {
          newValue = extremeValue
        }

        const setter = field === "yAxisMin" ? setYAxisMin : setYAxisMax
        setter(parseFloat(Number(newValue).toFixed(2)))
      }
      return {
        ...prevSettings,
        [field]: newValue !== null ? newValue : "",
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
  }, [
    chartSettings.xAxisFormat,
    chartSettings.yAxisMin,
    chartSettings.yAxisMax,
  ])

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

    content = (
      <>
        <Box style={{ userSelect: "none", marginTop: 30 }}>

          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
          />

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
                <MenuItem value="HH:mm:ss">HH:mm:ss</MenuItem>
                <MenuItem value="DD HH:mm:ss">DD HH:mm:ss</MenuItem>
                <MenuItem value="MM-DD HH:mm:ss">MM-DD HH:mm:ss</MenuItem>
                <MenuItem value="YY-MM-DD HH:mm:ss">YY-MM-DD HH:mm:ss</MenuItem>
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

export default React.memo(MeasurementChart)
