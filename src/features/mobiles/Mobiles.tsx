import React, { JSX, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material"
import { formatDistanceToNow } from "date-fns"
import {
  DataGrid,
  GridCellParams,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid"
import SendIcon from "@mui/icons-material/Send"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import Header from "@/components/Header"
import HeaderAction from "@/components/HeaderAction"
import Mobile from "@/interfaces/Mobile"
import {
  useGetMobilesQuery,
  useEditMobilesMutation,
} from "@/features/api/apiSlice"

const Mobiles = () => {
  const navigate = useNavigate()
  const { data, status, isFetching, isLoading, isSuccess, isError, error } =
    useGetMobilesQuery({})

  // Dialog state
  const [remoteDialogOpen, setRemoteDialogOpen] = useState(false)
  const [selectedMobileId, setSelectedMobileId] = useState<string | null>(null)
  const [selectedMobileName, setSelectedMobileName] = useState<string | null>(
    null,
  )
  const [commandCode, setCommandCode] = useState<string>("")
  const [commandArgument, setCommandArgument] = useState<string>("")
  const [commandPayload, setCommandPayload] = useState<string>("")

  const [editMobiles] = useEditMobilesMutation()

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "mobileName", sort: "asc" },
  ])

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel)
  }

  const handleCellClick = (params: GridCellParams) => {
    const { _id: mobileId } = params.row
    navigate(`edit/${mobileId}`)
  }

  const openRemoteDialog = (row: Mobile) => {
    setSelectedMobileId(row._id)
    setSelectedMobileName(row.mobileName)
    setCommandCode("")
    setCommandArgument("")
    setCommandPayload("")
    setRemoteDialogOpen(true)
  }

  const closeRemoteDialog = () => {
    setRemoteDialogOpen(false)
  }

  const submitRemoteCommand = async () => {
    // Normalize hex fields: 2 chars, uppercase
    const code = commandCode.toUpperCase()
    const arg = commandArgument.toUpperCase()
    const validHex = /^[0-9A-F]{2}$/
    if (!validHex.test(code) || !validHex.test(arg)) return

    const payload = commandPayload.trim()
    const composed = code + arg + (payload ? ` ${payload}` : "")

    await editMobiles({
      mobileIds: [selectedMobileId],
      remoteCommand: composed,
      remoteCommandReply: "",
    })
    setRemoteDialogOpen(false)
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
      // { field: "_id", headerName: "ID", flex: 1 },
      { field: "mobileName", headerName: "Name", flex: 0.7 },
      {
        field: "lastSeen",
        headerName: "Last seen",
        flex: 1,
        valueFormatter: (params: { value: string }) => {
          if (!params.value) return "Never"
          const date = new Date(params.value)
          return `${formatDistanceToNow(date, { addSuffix: true })}`
        },
      },
      // { field: "baseUri", headerName: "URI", flex: 1 },
      { field: "sensorName", headerName: "sName", flex: 0.7 },
      { field: "sensorId", headerName: "sID", flex: 1 },
      {
        field: "measurementInterval",
        headerName: "Meas",
        flex: 0.5,
      },
      {
        field: "reportInterval",
        headerName: "Report",
        flex: 0.5,
      },
      { field: "refMillivolts", headerName: "ref", flex: 0.5 },
      { field: "weMillivolts", headerName: "we", flex: 0.5 },
      {
        field: "checkParametersInterval",
        headerName: "Check",
        flex: 0.5,
      },
      { field: "comment", headerName: "Comment", flex: 1 },
      {
        field: "remoteCommand",
        headerName: "Cmd",
        flex: 0.3,
        sortable: false,
        filterable: false,
        renderCell: (params: any) => (
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation()
              openRemoteDialog(params.row)
            }}
            title="Send remote command"
          >
            <SendIcon />
          </IconButton>
        ),
      },
      {
        field: "remoteCommandReply",
        headerName: "Reply",
        flex: 1,
        renderCell: (params: any) => {
          const { remoteCommand, remoteCommandReply } = params.row as Mobile
          const isPending =
            Boolean(remoteCommand) &&
            (remoteCommandReply === null ||
              remoteCommandReply === undefined ||
              remoteCommandReply === "")

          if (isPending) {
            return (
              <AccessTimeIcon
                color="action"
                titleAccess={"Waiting for reply: " + remoteCommand}
              />
            )
          }

          return <span>{remoteCommandReply ?? ""}</span>
        },
      },
    ]
    content = (
      <Box flexGrow={1} overflow="auto" width="100%">
        <DataGrid<Mobile>
          slots={{ toolbar: GridToolbar }}
          rows={data}
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
      <Header title="Mobiles" subtitle={`List of mobiles: ${status}`}>
        <HeaderAction action="Add" url="/mobiles/add" />
      </Header>
      {content}

      <Dialog
        open={remoteDialogOpen}
        onClose={closeRemoteDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Send command {selectedMobileName ? `to ${selectedMobileName}` : ""}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mt={1} mb={1}>
            <TextField
              autoFocus
              margin="dense"
              label="Code"
              placeholder="00"
              value={commandCode}
              onChange={(e) => {
                const v = e.target.value
                  .toUpperCase()
                  .replace(/[^0-9A-F]/g, "")
                  .slice(0, 2)
                setCommandCode(v)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">0x</InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 2, inputMode: "text" }}
              error={commandCode.length > 0 && commandCode.length !== 2}
              helperText={
                commandCode.length > 0 && commandCode.length !== 2
                  ? "2 hex digits"
                  : "\u00A0"
              }
              sx={{ width: 140 }}
            />
            <TextField
              margin="dense"
              label="Argument"
              placeholder="00"
              value={commandArgument}
              onChange={(e) => {
                const v = e.target.value
                  .toUpperCase()
                  .replace(/[^0-9A-F]/g, "")
                  .slice(0, 2)
                setCommandArgument(v)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">0x</InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 2, inputMode: "text" }}
              error={commandArgument.length > 0 && commandArgument.length !== 2}
              helperText={
                commandArgument.length > 0 && commandArgument.length !== 2
                  ? "2 hex digits"
                  : "\u00A0"
              }
              sx={{ width: 180 }}
            />
          </Box>
          <TextField
            margin="dense"
            label="Payload (optional)"
            fullWidth
            value={commandPayload}
            onChange={(e) => setCommandPayload(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">0x</InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                submitRemoteCommand()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRemoteDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitRemoteCommand}
            disabled={
              !(commandCode.length === 2 && commandArgument.length === 2)
            }
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Mobiles
