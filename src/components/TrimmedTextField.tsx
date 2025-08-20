import React from "react"
import { TextField, TextFieldProps } from "@mui/material"

type Props = TextFieldProps & {
  collapseInnerSpaces?: boolean
}

const TrimmedTextField: React.FC<Props> = ({
  onBlur,
  collapseInnerSpaces = true,
  ...rest
}) => {
  return (
    <TextField
      {...rest}
      onBlur={(e) => {
        const original = e.target.value
        let cleaned = original.trim()
        if (collapseInnerSpaces) cleaned = cleaned.replace(/\s+/g, " ")
        if (cleaned !== original && rest.name) {
          if (rest.onChange) {
            const synthetic = {
              ...e,
              target: { ...e.target, value: cleaned, name: rest.name },
            }
            rest.onChange(synthetic)
          }
        }
        onBlur && onBlur(e)
      }}
    />
  )
}

export default TrimmedTextField
