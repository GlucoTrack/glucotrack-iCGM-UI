import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserGroupsState {
  userGroupName: string
  userGroupDescription: string
  userIds: string[]
}

const initialState: UserGroupsState = {
  userGroupName: "",
  userGroupDescription: "",
  userIds: [],
}

export const groupsSlice = createSlice({
  name: "userGroups",
  initialState,
  reducers: {
    setUserGroup: (state, action: PayloadAction<UserGroupsState>) => {
      const { userGroupName, userGroupDescription, userIds: mobileNames } = action.payload
      state.userGroupName = userGroupName
      state.userGroupDescription = userGroupDescription
      state.userIds = mobileNames
    },
    resetUserGroup: (state) => {
      return initialState
    },
  },
})

export const { setUserGroup, resetUserGroup } = groupsSlice.actions

export default groupsSlice.reducer

