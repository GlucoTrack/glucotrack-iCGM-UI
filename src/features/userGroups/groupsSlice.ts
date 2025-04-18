import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserGroupsState {
  groupName: string
  groupDescription: string
  userIds: string[]
}

const initialState: UserGroupsState = {
  groupName: "",
  groupDescription: "",
  userIds: [],
}

export const groupsSlice = createSlice({
  name: "userGroups",
  initialState,
  reducers: {
    setUserGroup: (state, action: PayloadAction<UserGroupsState>) => {
      const { groupName, groupDescription, userIds } = action.payload
      state.groupName = groupName
      state.groupDescription = groupDescription
      state.userIds = userIds
    },
    resetUserGroup: (state) => {
      return initialState
    },
  },
})

export const { setUserGroup, resetUserGroup } = groupsSlice.actions

export default groupsSlice.reducer

