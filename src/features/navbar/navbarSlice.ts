import { PaletteMode } from "@mui/material"
import { createSlice } from "@reduxjs/toolkit"

interface NavbarState {
  mode: PaletteMode
}

const initialState: NavbarState = {
  mode: "dark",
}

export const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
  },
})

export const { setMode } = navbarSlice.actions

export default navbarSlice.reducer
