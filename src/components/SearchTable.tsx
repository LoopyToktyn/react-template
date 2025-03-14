import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  useTheme,
} from "@mui/material";

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

export interface SearchTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  defaultSortField?: string;
  defaultSortDirection?: SortDirection;
  rowsPerPage?: number;
}

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
 * - Automatic horizontal scroll when columns are wide
 */
export function SearchTable<T extends object>({
  columns,
  data,
  defaultSortField,
  defaultSortDirection = "asc",
  rowsPerPage = 50,
}: SearchTableProps<T>) {
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

  // Simple alternating row style
  const getRowStyle = (index: number) =>
    index % 2 === 1 ? { backgroundColor: theme.palette.action.hover } : {};

  return (
    <Box sx={{ width: "100%" }}>
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
        <Table
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
                {cells}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {pagedData.map((item, rowIndex) => (
              <TableRow key={rowIndex} sx={getRowStyle(rowIndex)}>
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
            ))}
          </TableBody>
        </Table>
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
