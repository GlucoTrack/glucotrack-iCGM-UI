import React, { useCallback, useEffect, useState } from "react"
import { Box, useTheme, Button, Paper } from "@mui/material"
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
import MeasurementGrid from "./MeasurementGrid"
import { socket } from '../../utils/socket';
import dayjs from "dayjs"

const dateFormatter = (date: any) => {
  if (date) {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }
  return date
}

function CustomTooltip({ payload, label, active }:any) {
  if (active && payload && payload.length) {
    const pl = payload[0]
    return (
      <Paper elevation={3} sx={{p: 2}}>
        <h4>{pl.name}</h4>
        <p>
          {dayjs(label).format('YYYY-MM-DD HH:mm:ss')}<br/>
          Current: {pl.payload.current}<br/>
          Voltage: {pl.payload.voltage}<br/>
        </p>        
      </Paper>      
    );
  }

  return null;
}

const MeasurementChart = (props: any) => {
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
  
  const [isZoomed, setIsZoomed] = useState(false)
  const [measurements, setMeasurements] = useState<any>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<any>([])

  useEffect(() => {
    if (data?.measurements) {
      let fixedMeasurements = []
      for (let measurement of data.measurements) {
        let fixMeasurement = {...measurement}
        fixMeasurement.data = measurement.data.map((d: any) => {
          let fixMeasure = {...d}
          fixMeasure.date = new Date(d.date)
          return d
        })
        fixedMeasurements.push(fixMeasurement)
      }
      setMeasurements(fixedMeasurements);
      setFilteredMeasurements(fixedMeasurements);
      setIsZoomed(false)
      setStartZoomArea('')
      setEndZoomArea('')
    }
  }, [data?.measurements]);
  
  const [startZoomArea, setStartZoomArea] = useState<string>('')
  const [endZoomArea, setEndZoomArea] = useState<string>('')

  // flag if currently zooming (press and drag)
  const [isZooming, setIsZooming] = useState(false)

  // flag to show the zooming area (ReferenceArea)
  const showZoomBox =
    isZooming && startZoomArea && endZoomArea

  // reset the states on zoom out
  function handleZoomOut() {
    setFilteredMeasurements(measurements);
    setIsZoomed(false)
  }

  function handleMouseDown(e: any) {
    setIsZooming(true)
    setStartZoomArea(e.activeLabel)
    setEndZoomArea('')
  }

  function handleMouseMove(e: any) {
    if (isZooming) {
      setEndZoomArea(e.activeLabel)
    }
  }

  function handleMouseUp(e: any) {
    if (isZooming) {
      setIsZooming(false);

      if (startZoomArea === endZoomArea || endZoomArea === '') {
        setStartZoomArea('')
        setEndZoomArea('')
        return
      }
      
      filterMeasurements()
    }
  }

  const filterMeasurements = useCallback( () => {
    // Check the date order
    let startDate = new Date(startZoomArea)
    let endDate = new Date(endZoomArea)
    if (startDate > endDate) {
      let temp = startDate
      startDate = endDate
      endDate = temp
    }

    let filtered = [];
    for (let measurement of measurements) {
      let data = measurement.data.filter((d: any) => {
        return d.date >= startDate && d.date <= endDate
      });
      filtered.push({ name: measurement.name, data: data })
      setIsZoomed(true)
    }
    setFilteredMeasurements(filtered)
  }, [startZoomArea, endZoomArea, measurements])

  // Handle new measurements events
  useEffect(() => {
    if(props.eventName) {
      for (const deviceName of deviceNames) {
        socket.on(props.eventName + deviceName, (data: any) => {                  
          data.date = new Date(data.date)
          if (data.date >= new Date(startTime) && data.date <= new Date(endTime)) {
            let newMeasurements = []
            for (let measurement of measurements) {
              if (measurement.name === data.deviceName) {
                let newMeasurement = {...measurement}
                newMeasurement.data = [...measurement.data, data];
                newMeasurements.push(newMeasurement)
              } else {
                newMeasurements.push(measurement)
              }              
            }
            setMeasurements(newMeasurements)

            if (startZoomArea && endZoomArea) {
              filterMeasurements()
            } else {
              setFilteredMeasurements(newMeasurements)
            }            
          }
        })
      }
    }    

    return () => {
      for (const deviceName of deviceNames) {
        socket.off(props.eventName + deviceName)
      }
    }
  }, [devicesDepts, deviceNames, props.eventName, measurements, startTime, endTime, startZoomArea, endZoomArea, filterMeasurements])

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
        <Box style={{ userSelect: 'none' }}>
          {isZoomed && <Button variant="contained" color="primary" onClick={handleZoomOut} sx={{ mb: 3, alignItems: 'center' }}>Zoom Out</Button>}
          <ResponsiveContainer height={500} width={"100%"}>
            <LineChart
              data={filteredMeasurements}
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
                allowDuplicatedCategory={false}
              />
              <YAxis dataKey={"current"} />
              <Tooltip content={<CustomTooltip />}/>
              <Legend />

              {showZoomBox && (
                <ReferenceArea
                  x1={startZoomArea}
                  x2={endZoomArea}
                  strokeOpacity={0.3}
                  alwaysShow
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
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}

            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box>
          <MeasurementGrid measurements={filteredMeasurements} />
        </Box>
      </>
    )
  }
  return <Box>
    {content}
  </Box>
}

export default MeasurementChart
