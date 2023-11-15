import React, { useCallback, useEffect, useState } from "react"
import { Box, useTheme, Button } from "@mui/material"
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
import { cp } from "fs"
import MeasurementGrid from "./MeasurementGrid"


const MeasurementChart = (props: any) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === "dark"
  const [lineColors, setLineColors] = useState<string[]>([])
  const deviceNames: string[] = useAppSelector(
    (state) => state.measurements.deviceNames,
  )

  const { data, isFetching, isLoading, isSuccess, isError, error } = props.query;

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
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [measurements, setMeasurements] = useState<any>([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState<any>([]);

  useEffect(() => {
    if (data?.measurements) {
      console.log(data.measurements)
      setMeasurements(data.measurements);
      setFilteredMeasurements(data.measurements);
    }
  }, [data?.measurements]);

  const [startArea, setStartArea] = useState<string>('');
  const [endArea, setEndArea] = useState<string>('');

  // flag if currently zooming (press and drag)
  const [isZooming, setIsZooming] = useState(false);

  // flag to show the zooming area (ReferenceArea)
  const showZoomBox =
    isZooming && startArea && endArea;

  // reset the states on zoom out
  function handleZoomOut() {
    setFilteredMeasurements(measurements);
    setIsZoomed(false);
  }

  function handleMouseDown(e: any) {
    setIsZooming(true);
    setStartArea(e.activeLabel);
    setEndArea('');
  }

  function handleMouseMove(e: any) {
    if (isZooming) {
      setEndArea(e.activeLabel);
    }
  }

  function handleMouseUp(e: any) {
    if (isZooming) {
      setIsZooming(false);

      if (startArea === endArea || endArea === '') {
        setStartArea('');
        setEndArea('');
        return;
      }

      // Check the date order
      let startDate = new Date(startArea);
      let endDate = new Date(endArea);
      if (startDate > endDate) {
        let temp = startDate;
        startDate = endDate;
        endDate = temp;
      }

      let filtered = [];
      for (let measurement of measurements) {
        let data = measurement.data.filter((d: any) => {
          let date = new Date(d.date);
          return date >= startDate && date <= endDate;
        });
        filtered.push({ name: measurement.name, data: data });
        setIsZoomed(true);
      }
      setFilteredMeasurements(filtered);

    }
  }

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
                type="category"
                allowDuplicatedCategory={false}
              />
              <YAxis dataKey={"current"} />
              <Tooltip />
              <Legend />

              {showZoomBox && (
                <ReferenceArea
                  x1={startArea}
                  x2={endArea}
                  strokeOpacity={0.3}
                  alwaysShow
                />
              )}
              {filteredMeasurements.map((measurement: any, index: number) => (
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
