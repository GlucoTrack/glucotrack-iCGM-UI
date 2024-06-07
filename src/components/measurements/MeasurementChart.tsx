import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  // Grid,
  MenuItem,
  Paper,
  Select,
  Typography,
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
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import Boost from "highcharts/modules/boost"

dayjs.extend(utc)

Boost(Highcharts)

const MeasurementChart = ({ query, pageKey, eventName, fields, dateField='date' }: any) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === "dark"
  const startTime = useAppSelector((state) => state.measurements.startTime)
  const realtime = useAppSelector((state) => state.measurements.realtime)
  const deviceNames: string[] = useAppSelector(
    (state) => state.measurements.deviceNames,
  )
  const devicesDepts = JSON.stringify(deviceNames)
  const { data, isFetching, isLoading, isSuccess, isError, error } = query
  const [localStorageKey, setLocalStorageKey] = useState(
    JSON.parse(localStorage.getItem("chart_settings_" + pageKey) || "{}"),
  )

  function generateLineColors(number: number, isDarkMode: boolean) {
    const palette = distinctColors({
      count: number,
      hueMin: isDarkMode ? 0 : 0,
      hueMax: isDarkMode ? 360 : 360,
      chromaMin: 50,
      chromaMax: 100,
      lightMin: isDarkMode ? 50 : 20,
      lightMax: isDarkMode ? 100 : 90,
      quality: 50,
      samples: 10000,
    })
    return palette.map((color) => chroma(color).hex())
  }

  const [measurements, setMeasurements] = useState<any>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<any>([])

  const [startZoomArea, setStartZoomArea] = useState<Date | null>()
  const [endZoomArea, setEndZoomArea] = useState<Date | null>()

  const [chartSettings, setChartSettings] = useState({
    xAxisFormat:
      localStorageKey && localStorageKey.xAxisFormat
        ? localStorageKey.xAxisFormat
        : "HH:mm:ss",
    yAxisValue:
      localStorageKey && localStorageKey.yAxisValue
        ? localStorageKey.yAxisValue
        : fields[0].field,
  })

  const [chartOptions, setChartOptions] = useState({
    plotOptions: {
      series: {
        marker: {
          enabled: true,
          states: {
            hover: {
              enabled: false,
            },
          },
        },
        lineWidth: 0,
      },
    },
    title: {
      text: null,
    },
    xAxis: {
      type: "datetime",
      minRange: 1000 * 5,
      lineColor: "",
      labels: {
        style: {
          color: "",
        },
        rotation: -30,
        formatter: function (v: any): any {
          return dateFormatter(v.value, chartSettings.xAxisFormat)
        },
      },
      events: {
        afterSetExtremes: function (event: any) {
          if (event.trigger === "zoom") {
            setStartZoomArea(new Date(event.min))
            setEndZoomArea(new Date(event.max))
          } else if (event.trigger === "pan") {
            // TODO probably need a debounce here
            setStartZoomArea(new Date(event.min))
            setEndZoomArea(new Date(event.max))
          }
        },
      },
    },
    yAxis: {
      title: {
        text: null,
      },
      labels: {
        style: {},
        formatter: function (v: any): any {
          return formatValue(v.value)
        },
      },
    },
    series: [],
    boost: {
      useGPUTranslations: true,
      usePreallocated: true,
    },
    tooltip: {
      enabled: false,
    },
    accessibility: {
      enabled: false,
    },
    chart: {
      height: 700,
      zoomType: "xy",
      panKey: "alt",
      panning: true,
      backgroundColor: null,
    },
    legend: {
      itemStyle: {},
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
    let validField = fields.find((field: any) => field.field === chartSettings.yAxisValue)
    if (!validField) {
      setChartSettings((prevSettings) => {
        return {
          ...prevSettings,
          yAxisValue: fields[0].field,
        }
      })
    }
  }, [chartSettings.yAxisValue, fields])

  useEffect(() => {
    const lightChartColor = "#000000"
    const darkChartColor = "#ffffff"
    const selectedChartColor = isDarkMode ? darkChartColor : lightChartColor

    setChartOptions((prevOptions: any) => {
      prevOptions.xAxis.lineColor = selectedChartColor
      prevOptions.xAxis.tickColor = selectedChartColor
      prevOptions.xAxis.labels.style.color = selectedChartColor
      prevOptions.yAxis.lineColor = selectedChartColor
      prevOptions.yAxis.labels.style.color = selectedChartColor
      prevOptions.legend.itemStyle.color = selectedChartColor
      return prevOptions
    })
  }, [isDarkMode])

  useEffect(() => {
    let colors = generateLineColors(measurements.length, isDarkMode)
    let series: any = []
    let index = 0
    for (const measurement of measurements) {
      let data = []

      for (const d of measurement.data) {        
        data.push([new Date(d[dateField]).getTime(), d[chartSettings.yAxisValue]])
      }      
      series.push({
        name: measurement.name,
        data: data,
        type: "line",
        color: colors[index],
      })
      index++
    }

    setChartOptions((prevOptions: any) => {
      return {
        ...prevOptions,
        series: series,
      }
    })
  }, [measurements, isDarkMode, chartSettings.yAxisValue])

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
  }, [measurements, startZoomArea, endZoomArea])

  const dateFormatter = (date: any, format: string) => {
    if (date) {
      return dayjs(date).format(format)
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
    if (field === "xAxisFormat") {
      setChartOptions((prevOptions: any) => {
        let xAxis = prevOptions.xAxis
        xAxis.labels.formatter = function (v: any): any {
          return dateFormatter(v.value, value.toString())
        }
        return {
          ...prevOptions,
          xAxis,
        }
      })
    }
    setChartSettings((prevSettings) => {
      let newValue = value

      return {
        ...prevSettings,
        [field]: newValue !== null ? newValue : "",
      }
    })
  }

  useEffect(() => {
    const updateChartSettings = (key: 'xAxisFormat' | 'yAxisValue') => {
      if (chartSettings[key]) {
        setLocalStorageKey((prevKey: any) => {
          const newChartSettings = {
            ...prevKey,
            [key]: chartSettings[key],
          };
          localStorage.setItem(
            `chart_settings_${pageKey}`,
            JSON.stringify(newChartSettings),
          );
          return newChartSettings;
        });
      }
    };

    updateChartSettings('xAxisFormat');
    updateChartSettings('yAxisValue');
  }, [chartSettings.xAxisFormat, chartSettings.yAxisValue, pageKey]);

  // Handle new measurements events
  useEffect(() => {
    if (eventName) {
      if (realtime) {
        for (const deviceName of deviceNames) {
          socket.on(eventName + deviceName, (data: any) => {
            let date = new Date(data.date)
            if (
              date >= dayjs(startTime).utc().toDate()
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
          socket.off(eventName + deviceName)
        }
      }
    }

    return () => {
      for (const deviceName of deviceNames) {
        socket.off(eventName + deviceName)
      }
    }
  }, [devicesDepts, deviceNames, eventName, startTime, realtime])

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
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />

          <Grid container spacing={3} lg={9}>
            <Grid xs={4}>
              <FormControl fullWidth>
                <InputLabel id="xAxisFormat">X-Axis Format</InputLabel>
                <Select
                  labelId="xAxisFormat"
                  label="X-Axis Format"
                  type="string"
                  value={chartSettings.xAxisFormat}
                  onChange={(event) => {
                    handleSettingChange("xAxisFormat", event.target.value)
                  }}
                >
                  <MenuItem value="HH:mm:ss">HH:mm:ss</MenuItem>
                  <MenuItem value="DD HH:mm:ss">DD HH:mm:ss</MenuItem>
                  <MenuItem value="MM-DD HH:mm:ss">MM-DD HH:mm:ss</MenuItem>
                  <MenuItem value="YY-MM-DD HH:mm:ss">YY-MM-DD HH:mm:ss</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={4}>
              <FormControl fullWidth>
                <InputLabel id="yAxisValue">Y-Axis Value</InputLabel>
                <Select
                  labelId="yAxisValue"
                  label="X-Axis Value"
                  type="string"
                  value={chartSettings.yAxisValue}
                  onChange={(event) => {
                    handleSettingChange("yAxisValue", event.target.value)
                  }}
                >
                  {fields.map((field: any) => (
                    <MenuItem value={field.field} key={field.field}>{field.label}</MenuItem>
                  ))}                  
                </Select>
              </FormControl>
            </Grid>
            {realtime && (
              <Grid xs={4}>
                <Box style={{ animation: 'blink 2s linear infinite', userSelect: "none", marginTop: 16, marginLeft: 10 }}>
                  <Typography variant="body1" color={"#ffeb3b"}>Realtime</Typography>
                </Box>
              </Grid>
            )}

          </Grid>
        </Box>
        <Box>
          <MeasurementGrid measurements={filteredMeasurements} fields={fields} dateField={dateField} />
        </Box>
      </>
    )
  }
  return <Box>{content}</Box>
}

export default React.memo(MeasurementChart)
