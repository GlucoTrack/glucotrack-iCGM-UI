import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface MeasurementState {
  deviceNames: string[]
  groupName: string
  startTime: string
  endTime: string
}

const initialState: MeasurementState = {
  deviceNames: [],
  groupName: "",
  startTime: "",
  endTime: "",
}

export const measurementSlice = createSlice({
  name: "measurements",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<MeasurementState>) => {
      const { deviceNames, groupName, startTime, endTime } = action.payload
      state.deviceNames = deviceNames
      state.groupName = groupName
      state.startTime = startTime
      state.endTime = endTime
    },
    resetFilter: (state) => {
      return initialState
    },
  },
})

export const { setFilter, resetFilter } = measurementSlice.actions

export default measurementSlice.reducer
