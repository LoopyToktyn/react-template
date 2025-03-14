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

/** Sorting direction cycles: asc -> desc -> none -> asc */
type SortDirection = "asc" | "desc" | "none";

/**
 * TableColumn definition with full recursion support:
 * - `header`: label in the header cell
 * - `field`: string path for sorting (e.g. "person.name.first")
 * - `subColumns`: child columns
 * - `width`: optional fixed width
 * - `customRender`: optional custom cell rendering
 */
export interface TableColumn<T> {
  header: string;
  field?: string; // For sorting or direct display
  subColumns?: TableColumn<T>[];
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

/**
 * Safely get a nested property from an object by string path,
 * e.g. getNestedValue(record, "person.name.first")
 */
function getNestedValue(obj: any, path?: string): any {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
}

/** Count the total number of "leaf" columns under a given column. */
function countLeafColumns<T>(col: TableColumn<T>): number {
  if (!col.subColumns || col.subColumns.length === 0) return 1;
  return col.subColumns.reduce(
    (sum, child) => sum + countLeafColumns(child),
    0
  );
}

/**
 * Determine the maximum depth of the entire columns structure.
 * e.g. if you have 3 levels (header → sub → sub), maxDepth = 3.
 */
function getMaxDepth<T>(columns: TableColumn<T>[]): number {
  let depth = 1;
  for (const col of columns) {
    if (col.subColumns && col.subColumns.length > 0) {
      const subDepth = 1 + getMaxDepth(col.subColumns);
      depth = Math.max(depth, subDepth);
    }
  }
  return depth;
}

/**
 * Flatten all subColumns into an array of "leaf" columns (no children).
 * This is for rendering body cells in a single row.
 */
function flattenColumns<T>(columns: TableColumn<T>[]): TableColumn<T>[] {
  return columns.flatMap((col) =>
    col.subColumns && col.subColumns.length > 0
      ? flattenColumns(col.subColumns)
      : [col]
  );
}

/**
 * The main SearchTable with multi-level headers using rowSpan & colSpan:
 * - RowSpan for columns with no children (leaves)
 * - ColSpan for columns with children
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

  // Pre-calculate total depth for rowSpan logic
  const totalDepth = useMemo(() => getMaxDepth(columns), [columns]);

  // Build table header rows. We'll store them in an array of arrays of <TableCell> elements.
  const buildHeader = (
    cols: TableColumn<T>[],
    level: number
  ): JSX.Element[] => {
    const rowCells: JSX.Element[] = [];

    cols.forEach((col) => {
      const leafCount = countLeafColumns(col);
      const hasChildren = col.subColumns && col.subColumns.length > 0;
      const isSortable = !!col.field;

      // If it's a leaf, rowSpan is the remaining levels
      const rowSpan = hasChildren ? 1 : totalDepth - level;
      const colSpan = hasChildren ? leafCount : 1;

      // Check if this column is actively sorted
      const isActiveSort =
        col.field && col.field === sortField && sortDirection !== "none";

      const nextDirection = isActiveSort ? sortDirection : "asc"; // if not sorted, default to "asc"

      // Sorting click handler
      const handleSortClick = () => {
        if (!col.field) return;
        if (sortField !== col.field) {
          // start sorting by this new field ascending
          setSortField(col.field);
          setSortDirection("asc");
        } else {
          // cycle asc -> desc -> none -> asc
          if (sortDirection === "asc") setSortDirection("desc");
          else if (sortDirection === "desc") setSortDirection("none");
          else if (sortDirection === "none") setSortDirection("asc");
        }
      };

      rowCells.push(
        <TableCell
          key={`${col.header}-${level}`}
          align="left"
          colSpan={colSpan}
          rowSpan={rowSpan}
          sx={{
            width: col.width || "auto",
            borderBottom: `2px solid ${theme.palette.divider}`,
            fontWeight: 600,
          }}
        >
          {isSortable ? (
            <TableSortLabel
              active={isActiveSort as any}
              direction={
                nextDirection === undefined
                  ? "asc"
                  : (nextDirection as "asc" | "desc")
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

    return rowCells;
  };

  // We'll recursively build an array-of-arrays for each row level
  const headerRows: JSX.Element[][] = [];
  function recurseHeaders(cols: TableColumn<T>[], level: number) {
    // Build the row for this level
    const row = buildHeader(cols, level);
    headerRows[level] = headerRows[level]
      ? [...headerRows[level], ...row]
      : row;

    // For each column that has children, we go one level deeper
    cols.forEach((col) => {
      if (col.subColumns && col.subColumns.length > 0) {
        recurseHeaders(col.subColumns, level + 1);
      }
    });
  }

  // Build the multi-level headers
  recurseHeaders(columns, 0);

  // Flatten columns for body cells
  const leafColumns = useMemo(() => flattenColumns(columns), [columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortField || sortDirection === "none") return data;
    const sorted = [...data].sort((a, b) => {
      const valA = getNestedValue(a, sortField);
      const valB = getNestedValue(b, sortField);
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortField, sortDirection]);

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const pagedData = useMemo(() => {
    const start = page * perPage;
    return sortedData.slice(start, start + perPage);
  }, [page, perPage, sortedData]);

  // Striped row background
  const getRowStyle = (index: number) => {
    // Use theme.palette.action.hover for alternate row color
    return index % 2 === 1
      ? { backgroundColor: theme.palette.action.hover }
      : {};
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer
        component={Paper}
        sx={{
          "& .MuiTableCell-root": {
            py: 1.2,
            px: 1.5,
            borderColor: theme.palette.divider,
          },
        }}
      >
        <Table size="small">
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
                {leafColumns.map((leaf, colIndex) => {
                  const rawValue = leaf.field
                    ? getNestedValue(item, leaf.field)
                    : undefined;
                  return (
                    <TableCell
                      key={colIndex}
                      sx={{ width: leaf.width || "auto" }}
                    >
                      {leaf.customRender
                        ? leaf.customRender(item)
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
