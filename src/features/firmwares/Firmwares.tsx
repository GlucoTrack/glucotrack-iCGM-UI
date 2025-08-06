import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, IconButton } from "@mui/material"
import {
  DataGrid,
  GridCellParams,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid"
import DownloadIcon from "@mui/icons-material/Download"

import Header from "@/components/Header"
import HeaderAction from "@/components/HeaderAction"
import Firmware from "@/interfaces/Firmware"
import { useGetFirmwaresQuery } from "@/features/api/apiSlice"

const Firmwares = () => {
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetFirmwaresQuery({})

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "version", sort: "asc" },
  ])

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel)
  }

  const handleCellClick = (params: GridCellParams) => {
    const { _id: firmwareId } = params.row
    navigate(`edit/${firmwareId}`)
  }

  let content: JSX.Element | null = null
  if (isFetching) {
    content = <h3>Fetching...</h3>
  } else if (isLoading) {
    content = <h3>Loading...</h3>
  } else if (isError) {
    content = <p>{JSON.stringify(error)}</p>
  } else if (isSuccess) {
    const columns = [
      { field: "name", headerName: "Name", flex: 0.7 },
      { field: "version", headerName: "Version", flex: 0.7 },
      {
        field: "download",
        headerName: "Download",
        flex: 0.7,
        renderCell: (params: any) => (
          <IconButton
            component="a"
            href={params.row.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
            }}
            title="Scarica firmware"
          >
            <DownloadIcon />
          </IconButton>
        ),
      },
      { field: "url", headerName: "url", flex: 1 },
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<Firmware>
          slots={{ toolbar: GridToolbar }}
          rows={data.firmwares}
          getRowId={(row) => row._id}
          columns={columns}
          onCellClick={handleCellClick}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="85vh">
      <Header title="Firmware" subtitle={`List of firmwares: ${status}`}>
        <HeaderAction action="Add" url="/firmwares/add" />
      </Header>
      {content}
    </Box>
  )
}

export default Firmwares
