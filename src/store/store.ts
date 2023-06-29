import { configureStore } from "@reduxjs/toolkit"
import navbarReducer from "@/features/navbar/navbarSlice"
import groupsReducer from "@/features/groups/groupsSlice"
import { apiSlice } from "@/features/api/apiSlice"

export const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    groups: groupsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
