import { configureStore } from "@reduxjs/toolkit"
import navbarReducer from "@/features/navbar/navbarSlice"
import groupsReducer from "@/features/groups/groupsSlice"
import mobileGroupsReducer from "@/features/mobileGroups/groupsSlice"
import measurementsReducer from "@/components/measurements/measurementsSlice"
import authReducer from "@/features/auth/authSlice"
import { apiSlice } from "@/features/api/apiSlice"

export const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    groups: groupsReducer,
    mobileGroups: mobileGroupsReducer,
    measurements: measurementsReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
