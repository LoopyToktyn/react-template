import React, { useState, useMemo } from "react";
import {
  Box,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  useTheme,
  Checkbox,
  IconButton,
  Icon,
  Grow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import ArchiveIcon from "@mui/icons-material/Archive";

/** Possible sorting directions (including 'none' to disable). */
type SortDirection = "asc" | "desc" | "none";

/**
 * Defines a column in the table. Supports nesting via `subColumns`.
 */
export interface TableColumn<T> {
  header: string;
  field?: string; // For sorting or direct display
  subColumns?: TableColumn<T>[]; // Nested columns
  width?: string; // e.g. "100px" or "20%"
  customRender?: (item: T) => React.ReactNode;
}

/**
 * Original props for the table.
 */
export interface SearchTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  defaultSortField?: string;
  defaultSortDirection?: SortDirection;
  rowsPerPage?: number;
}

/**
 * Extended props to support row selection and bulk actions.
 */
export interface TableProps<T> extends SearchTableProps<T> {
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  bulkTableActions?: Array<{
    icon: string;
    onClick: (selectedRows: T[]) => void;
  }>;
}

// Map icon string to corresponding MUI icon component
const iconMap: { [key: string]: React.ElementType } = {
  Delete: DeleteIcon,
  Edit: EditIcon,
  Download: DownloadIcon,
  Archive: ArchiveIcon,
};

/** Safely retrieve a nested property (e.g. "person.name.first"). */
function getNestedValue(obj: any, path?: string): any {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
}

/** Recursively count how many "leaf" columns a column contains. */
function countLeafColumns<T>(col: TableColumn<T>): number {
  if (!col.subColumns || col.subColumns.length === 0) return 1;
  return col.subColumns.reduce(
    (sum, child) => sum + countLeafColumns(child),
    0
  );
}

/** Compute the maximum depth of nested columns. */
function getMaxDepth<T>(columns: TableColumn<T>[]): number {
  let depth = 1;
  for (const col of columns) {
    if (col.subColumns && col.subColumns.length > 0) {
      depth = Math.max(depth, 1 + getMaxDepth(col.subColumns));
    }
  }
  return depth;
}

/** Flatten nested columns into an array of leaves for rendering body cells. */
function flattenColumns<T>(columns: TableColumn<T>[]): TableColumn<T>[] {
  return columns.flatMap((col) =>
    col.subColumns && col.subColumns.length > 0
      ? flattenColumns(col.subColumns)
      : [col]
  );
}

/**
 * A reusable table component with:
 * - Nested (multi-level) headers
 * - Sorting (with asc/desc/none states)
 * - Pagination
 * - Row selection and bulk actions (when enabled)
 * - Automatic horizontal scroll when columns are wide
 */
export function Table<T extends object>({
  columns,
  data,
  defaultSortField,
  defaultSortDirection = "asc",
  rowsPerPage = 50,
  selectable = false,
  onSelectionChange,
  bulkTableActions,
}: TableProps<T>) {
  const theme = useTheme();

  // Sorting state
  const [sortField, setSortField] = useState<string | undefined>(
    defaultSortField
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortField ? defaultSortDirection : "none"
  );

  // Pagination state
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(rowsPerPage);

  // Internal selection state (tracked by a unique row id; we assume each row has an 'id' property)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(
    new Set()
  );

  // Helper to get the selected row objects from data based on their id.
  const getSelectedRows = () =>
    data.filter((item) => selectedRowIds.has((item as any).id));

  // Calculate total depth for rowSpan logic
  const totalDepth = useMemo(() => getMaxDepth(columns), [columns]);

  /**
   * Build table header cells for a given level of columns.
   * - If a column has children, it gets colSpan = # of leaves, rowSpan = 1
   * - Leaf columns get rowSpan = remaining depth
   */
  function buildHeaderRow(
    cols: TableColumn<T>[],
    level: number
  ): JSX.Element[] {
    return cols.map((col) => {
      const leafCount = countLeafColumns(col);
      const hasChildren = !!col.subColumns?.length;
      const isSortable = !!col.field;

      const rowSpan = hasChildren ? 1 : totalDepth - level;
      const colSpan = hasChildren ? leafCount : 1;

      const isActiveSort =
        col.field && col.field === sortField && sortDirection !== "none";

      // Determine next direction in the cycle asc -> desc -> none -> asc
      const handleSortClick = () => {
        if (!col.field) return;
        if (sortField !== col.field) {
          setSortField(col.field);
          setSortDirection("asc");
        } else {
          if (sortDirection === "asc") setSortDirection("desc");
          else if (sortDirection === "desc") setSortDirection("none");
          else setSortDirection("asc");
        }
      };

      return (
        <TableCell
          key={`${col.header}-${level}`}
          align="left"
          colSpan={colSpan}
          rowSpan={rowSpan}
          sx={{
            width: col.width || "auto",
            fontWeight: 600,
            verticalAlign: rowSpan > 1 ? "bottom" : "middle",
            borderBottom: `2px solid ${theme.palette.divider}`,
          }}
        >
          {isSortable ? (
            <TableSortLabel
              active={isActiveSort as any}
              direction={
                isActiveSort ? (sortDirection as "asc" | "desc") : "asc"
              }
              onClick={handleSortClick}
            >
              {col.header}
            </TableSortLabel>
          ) : (
            col.header
          )}
        </TableCell>
      );
    });
  }

  // Recursively build each row of the header
  const headerRows: JSX.Element[][] = [];
  function recurseHeaders(cols: TableColumn<T>[], level: number) {
    const rowCells = buildHeaderRow(cols, level);
    if (!headerRows[level]) headerRows[level] = [];
    headerRows[level].push(...rowCells);

    // Recurse for children
    cols.forEach((col) => {
      if (col.subColumns && col.subColumns.length > 0) {
        recurseHeaders(col.subColumns, level + 1);
      }
    });
  }
  recurseHeaders(columns, 0);

  // Flatten columns for body cells
  const leafColumns = useMemo(() => flattenColumns(columns), [columns]);

  // Sort data if a field and direction are set
  const sortedData = useMemo(() => {
    if (!sortField || sortDirection === "none") return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const valA = getNestedValue(a, sortField);
      const valB = getNestedValue(b, sortField);
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortField, sortDirection]);

  // Handle pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const pagedData = useMemo(() => {
    const start = page * perPage;
    return sortedData.slice(start, start + perPage);
  }, [page, perPage, sortedData]);

  // Compute selection state for the current page (for the header checkbox)
  const currentPageRowIds = pagedData.map((item) => (item as any).id);
  const currentPageAllSelected =
    currentPageRowIds.length > 0 &&
    currentPageRowIds.every((id) => selectedRowIds.has(id));
  const currentPageSomeSelected = currentPageRowIds.some((id) =>
    selectedRowIds.has(id)
  );

  // Handlers for row checkbox changes
  const handleRowCheckboxChange = (item: T) => {
    const id = (item as any).id;
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRowIds(newSelected);
    onSelectionChange &&
      onSelectionChange(
        data.filter((item) => newSelected.has((item as any).id))
      );
  };

  // Handler for "Select All" checkbox in header (applies to current page)
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = new Set(selectedRowIds);
    pagedData.forEach((item) => {
      const id = (item as any).id;
      if (e.target.checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
    });
    setSelectedRowIds(newSelected);
    onSelectionChange &&
      onSelectionChange(
        data.filter((item) => newSelected.has((item as any).id))
      );
  };

  // Helper for alternating row style; selected rows override this with theme.palette.action.selected.
  const getRowStyle = (index: number) =>
    index % 2 === 1 ? { backgroundColor: theme.palette.action.hover } : {};

  return (
    <Box sx={{ width: "100%" }}>
      {/* Reserve space above the table to prevent layout jumps */}
      {selectable && bulkTableActions && (
        <Box
          sx={{
            minHeight: 48,
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        >
          <Grow in={selectedRowIds.size > 0} style={{ transformOrigin: "top" }}>
            <Box
              sx={{
                display: "inline-flex",
                gap: 1,
                padding: 1,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {bulkTableActions.map((action, index) => {
                const IconComponent = iconMap[action.icon];
                return (
                  <IconButton
                    key={index}
                    onClick={() => action.onClick(getSelectedRows())}
                  >
                    {IconComponent ? (
                      <IconComponent />
                    ) : (
                      <Icon>{action.icon}</Icon>
                    )}
                  </IconButton>
                );
              })}
            </Box>
          </Grow>
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          // Force horizontal scrolling
          overflowX: "auto",
          maxWidth: "100%",
          "& .MuiTableCell-root": {
            py: 1.2,
            px: 1.5,
            borderColor: theme.palette.divider,
          },
        }}
      >
        <MuiTable
          size="small"
          sx={{
            // Let the columns expand as needed, no wrapping
            tableLayout: "auto",
            minWidth: "max-content",
            whiteSpace: "nowrap",
          }}
        >
          <TableHead>
            {headerRows.map((cells, rowIndex) => (
              <TableRow
                key={`header-row-${rowIndex}`}
                sx={{ backgroundColor: theme.palette.background.default }}
              >
                {/* Add the selection header cell only in the first header row if selectable */}
                {rowIndex === 0 && selectable && (
                  <TableCell rowSpan={totalDepth} padding="checkbox">
                    <Checkbox
                      checked={currentPageAllSelected}
                      indeterminate={
                        !currentPageAllSelected && currentPageSomeSelected
                      }
                      onChange={handleSelectAllChange}
                    />
                  </TableCell>
                )}
                {cells}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {pagedData.map((item, rowIndex) => {
              const id = (item as any).id;
              const isSelected = selectable && selectedRowIds.has(id);
              // Combine alternating row style with selected highlight.
              const rowStyle = isSelected
                ? { backgroundColor: theme.palette.action.selected }
                : getRowStyle(rowIndex);
              return (
                <TableRow key={id || rowIndex} sx={rowStyle}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleRowCheckboxChange(item)}
                      />
                    </TableCell>
                  )}
                  {leafColumns.map((col, colIndex) => {
                    const rawValue = col.field
                      ? getNestedValue(item, col.field)
                      : "";
                    return (
                      <TableCell
                        key={colIndex}
                        sx={{ width: col.width || "auto" }}
                      >
                        {col.customRender
                          ? col.customRender(item)
                          : String(rawValue ?? "")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={perPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </Box>
  );
}
