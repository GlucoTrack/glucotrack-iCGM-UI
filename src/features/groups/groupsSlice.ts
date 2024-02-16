import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface GroupsState {
  groupName: string
  groupDescription: string
  deviceNames: string[]
}

const initialState: GroupsState = {
  groupName: "",
  groupDescription: "",
  deviceNames: [],
}

export const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroup: (state, action: PayloadAction<GroupsState>) => {
      const { groupName, groupDescription, deviceNames } = action.payload
      state.groupName = groupName
      state.groupDescription = groupDescription
      state.deviceNames = deviceNames
    },
    resetGroup: (state) => {
      return initialState
    },
  },
})

export const { setGroup, resetGroup } = groupsSlice.actions

export default groupsSlice.reducer

