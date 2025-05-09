import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MantineProvider,
  Table,
  ScrollArea,
  TextInput,
  MultiSelect,
  Pagination,
  Group,
  Text,
  Box,
  Title,
  Space,
} from "@mantine/core";
import { fetchAllGames } from "../api"; // Ensure this path is correct

const columnHelper = createColumnHelper();

// Helper to extract unique, sorted, non-empty items for filter dropdowns
const getUniqueFilterOptions = (data, accessor) => {
  if (!data) return [];
  const allItems = data.flatMap((item) => item[accessor] || []);
  return [...new Set(allItems)].filter(Boolean).sort();
};

function AllGamesPage() {
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter states
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [platformFilter, setPlatformFilter] = useState(
    searchParams.getAll("platforms") || []
  );
  const [genreTagFilter, setGenreTagFilter] = useState(
    searchParams.getAll("genres") || []
  );

  useEffect(() => {
    document.title = "All Games - PAX Pal";
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const games = await fetchAllGames();
        setRawData(games);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch games:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Update URL search params when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (globalFilter) newSearchParams.set("q", globalFilter);
    platformFilter.forEach((p) => newSearchParams.append("platforms", p));
    genreTagFilter.forEach((g) => newSearchParams.append("genres", g));
    setSearchParams(newSearchParams, { replace: true });
  }, [globalFilter, platformFilter, genreTagFilter, setSearchParams]);

  const platformOptions = useMemo(
    () => getUniqueFilterOptions(rawData, "platforms"),
    [rawData]
  );
  const genreTagOptions = useMemo(
    () => getUniqueFilterOptions(rawData, "genres_and_tags"),
    [rawData]
  );

  const columnFilters = useMemo(
    () => [
      { id: "platforms", value: platformFilter },
      { id: "genres_and_tags", value: genreTagFilter },
    ],
    [platformFilter, genreTagFilter]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Title",
        cell: (info) => info.getValue(),
        size: 250,
      }),
      columnHelper.accessor("snappy_summary", {
        header: "Summary",
        cell: (info) => info.getValue() || "-",
        size: 350,
      }),
      columnHelper.accessor("exhibitor", {
        header: "Exhibitor",
        cell: (info) => info.getValue() || "-",
        size: 200,
      }),
      columnHelper.accessor("booth_number", {
        header: "Booth #",
        cell: (info) => {
          const val = info.getValue();
          return val !== null && val !== undefined ? String(val) : "-";
        },
        size: 100,
      }),
      columnHelper.accessor("platforms", {
        header: "Platforms",
        cell: (info) => info.getValue()?.join(", ") || "-",
        enableColumnFilter: true,
        filterFn: "arrIncludesSome",
        size: 200,
      }),
      columnHelper.accessor("genres_and_tags", {
        header: "Genres/Tags",
        cell: (info) => info.getValue()?.join(", ") || "-",
        enableColumnFilter: true,
        filterFn: "arrIncludesAll",
        size: 250,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: rawData,
    columns,
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20, // Default page size
      },
    },
    // Custom filter functions if needed, or rely on global filter for text and manual for selects
    filterFns: {
      arrIncludesAll: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const rowValue = row.getValue(columnId);
        if (!Array.isArray(rowValue)) return false;
        return filterValue.every((val) => rowValue.includes(val));
      },
      arrIncludesSome: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const rowValue = row.getValue(columnId);
        if (!Array.isArray(rowValue)) return false;
        return filterValue.some((val) => rowValue.includes(val));
      },
    },
  });

  if (isLoading) return <Text>Loading games...</Text>;
  if (error) return <Text color="red">Error loading games: {error}</Text>;

  return (
    <MantineProvider>
      {" "}
      {/* Ensure Mantine context is available */}
      <Box p="md">
        <Title order={2} mb="lg">
          All Games
        </Title>

        <Group mb="md">
          <TextInput
            placeholder="Search all fields..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.currentTarget.value)}
            style={{ flexGrow: 1 }}
          />
        </Group>
        <Group mb="md" grow>
          <MultiSelect
            data={platformOptions}
            value={platformFilter}
            onChange={setPlatformFilter}
            placeholder="Filter by platforms"
            clearable
            searchable
            style={{ flexGrow: 1 }}
          />
          <MultiSelect
            data={genreTagOptions}
            value={genreTagFilter}
            onChange={setGenreTagFilter}
            placeholder="Filter by genres/tags"
            clearable
            searchable
            style={{ flexGrow: 1 }}
          />
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.map((row) => (
                <Table.Tr
                  key={row.id}
                  onClick={() =>
                    navigate(`/game_details?id=${row.original.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Space h="md" />

        <Group justify="space-between">
          <Text>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </Text>
          <Pagination
            total={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(page) => table.setPageIndex(page - 1)}
          />
          <Text>
            Total Games: {table.getPrePaginationRowModel().rows.length}
          </Text>
        </Group>
      </Box>
    </MantineProvider>
  );
}

export default AllGamesPage;
