import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface MobileGroupsState {
  mobileGroupName: string
  mobileGroupDescription: string
  mobileNames: string[]
}

const initialState: MobileGroupsState = {
  mobileGroupName: "",
  mobileGroupDescription: "",
  mobileNames: [],
}

export const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setMobileGroup: (state, action: PayloadAction<MobileGroupsState>) => {
      const { mobileGroupName, mobileGroupDescription, mobileNames } = action.payload
      state.mobileGroupName = mobileGroupName
      state.mobileGroupDescription = mobileGroupDescription
      state.mobileNames = mobileNames
    },
    resetMobileGroup: (state) => {
      return initialState
    },
  },
})

export const { setMobileGroup, resetMobileGroup } = groupsSlice.actions

export default groupsSlice.reducer

