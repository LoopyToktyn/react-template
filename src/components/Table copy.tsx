import React, { useMemo } from "react";
import {
  Box,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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

/** Possible sorting directions for our external state. */
type SortDirection = "asc" | "desc" | undefined;

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
 * Props for the "dumb" table, with external pagination/sorting.
 */
export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** If you support row selection, keep this. */
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  bulkTableActions?: Array<{
    icon: string;
    onClick: (selectedRows: T[]) => void;
  }>;

  /** Server-side pagination/sorting props */
  page: number;
  rowsPerPage: number;
  totalRows: number;
  sortField?: string;
  sortDirection?: SortDirection;

  /** Callbacks for changes in pagination and sorting */
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSortChange: (field: string, direction: "asc" | "desc") => void;
}

/** Map icon string to MUI icons (for your bulk action buttons). */
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

export function Table<T extends object>({
  columns,
  data,
  selectable = false,
  onSelectionChange,
  bulkTableActions,
  page,
  rowsPerPage,
  totalRows,
  sortField,
  sortDirection,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
}: TableProps<T>) {
  const theme = useTheme();

  // For row selection only
  const [selectedRowIds, setSelectedRowIds] = React.useState<
    Set<string | number>
  >(new Set());

  // Helper to get the selected row objects from data based on their id.
  const getSelectedRows = () =>
    data.filter((item) => selectedRowIds.has((item as any).id));

  // Calculate total depth for multi-row header
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

      // Determine if this column is the active sort column.
      const isActiveSort = col.field && col.field === sortField;

      // Determine the new sort direction:
      // If this column is already active, toggle; otherwise, default to "asc".
      const newDirection =
        isActiveSort && sortDirection === "asc" ? "desc" : "asc";

      const handleSortClick = () => {
        if (col.field) {
          onSortChange(col.field, newDirection);
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
              active={Boolean(isActiveSort)}
              direction={isActiveSort ? sortDirection : "asc"}
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

    cols.forEach((col) => {
      if (col.subColumns && col.subColumns.length > 0) {
        recurseHeaders(col.subColumns, level + 1);
      }
    });
  }
  recurseHeaders(columns, 0);

  // Flatten columns for body cells
  const leafColumns = useMemo(() => flattenColumns(columns), [columns]);

  // Handle page change from TablePagination
  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  // Handle rowsPerPage change from TablePagination
  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onRowsPerPageChange(parseInt(e.target.value, 10));
  };

  const displayData = data;

  // For row selection
  const currentPageRowIds = displayData.map((item) => (item as any).id);
  const currentPageAllSelected =
    currentPageRowIds.length > 0 &&
    currentPageRowIds.every((id) => selectedRowIds.has(id));
  const currentPageSomeSelected = currentPageRowIds.some((id) =>
    selectedRowIds.has(id)
  );

  const handleRowCheckboxChange = (item: T) => {
    const id = (item as any).id;
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRowIds(newSelected);
    onSelectionChange?.(data.filter((d) => newSelected.has((d as any).id)));
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = new Set(selectedRowIds);
    if (e.target.checked) {
      currentPageRowIds.forEach((id) => newSelected.add(id));
    } else {
      currentPageRowIds.forEach((id) => newSelected.delete(id));
    }
    setSelectedRowIds(newSelected);
    onSelectionChange?.(data.filter((d) => newSelected.has((d as any).id)));
  };

  const getRowStyle = (index: number) =>
    index % 2 === 1 ? { backgroundColor: theme.palette.action.hover } : {};

  return (
    <Box sx={{ width: "100%" }}>
      {selectable && bulkTableActions && (
        <Box sx={{ minHeight: 48, position: "sticky", top: 0, zIndex: 2 }}>
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
            {displayData.map((item, rowIndex) => {
              const id = (item as any).id;
              const isSelected = selectable && selectedRowIds.has(id);
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
        count={totalRows}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </Box>
  );
}
