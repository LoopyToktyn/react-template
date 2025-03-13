import React, { ChangeEvent } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Typography,
  Button,
  Box,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

interface ListFieldProps {
  label: string;
  value: any[];
  onChange: (newValue: any[]) => void;
  columns?: { key: string; label: string }[];
}

/**
 * Renders a compact table for a "list" type field with multiple columns.
 */
const ListField: React.FC<ListFieldProps> = ({
  label,
  value = [],
  onChange,
  columns = [{ key: "value", label: "Value" }], // Default to a single "value" column
}) => {
  // Handle updates to a cell
  const handleCellChange = (
    rowIndex: number,
    key: string,
    newValue: string
  ) => {
    const updatedList = [...value];
    // If items are plain strings, you can store them in updatedList[rowIndex]
    // For multiple columns, store an object.
    // Example approach:
    // If not an object already, convert:
    if (typeof updatedList[rowIndex] !== "object") {
      updatedList[rowIndex] = { value: updatedList[rowIndex] };
    }
    updatedList[rowIndex] = {
      ...updatedList[rowIndex],
      [key]: newValue,
    };
    onChange(updatedList);
  };

  // Add new row
  const handleAddRow = () => {
    onChange([...value, {}]); // add empty object for multi-column
  };

  // Remove row
  const handleRemoveRow = (rowIndex: number) => {
    const updatedList = value.filter((_, i) => i !== rowIndex);
    onChange(updatedList);
  };

  return (
    <Box mb={2}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} style={{ fontWeight: "bold" }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {value.map((item, rowIndex) => {
              // For multiple columns, assume "item" is an object. If single, convert it as needed.
              const rowObject =
                typeof item === "object" ? item : { value: item };

              return (
                <TableRow key={rowIndex}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={rowObject[col.key] || ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleCellChange(rowIndex, col.key, e.target.value)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <IconButton onClick={() => handleRemoveRow(rowIndex)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {!value.length && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No items yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={1} textAlign="right">
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddRow}
        >
          Add Item
        </Button>
      </Box>
    </Box>
  );
};

export default ListField;
