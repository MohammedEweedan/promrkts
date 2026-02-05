import React from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Input,
  Text,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Checkbox,
  IconButton,
  Tooltip,
  Flex,
  Divider,
  Code,
} from "@chakra-ui/react";
import {
  Database,
  Table as TableIcon,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  Copy,
  Eye,
} from "lucide-react";
import api from "../../api/client";

const GOLD = "#65a8bf";

type ModelInfo = {
  name: string;
  count: number;
  available: boolean;
};

type RecordData = Record<string, any>;

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const DatabaseAdminPanel: React.FC = () => {
  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isQueryOpen, onOpen: onQueryOpen, onClose: onQueryClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // State
  const [models, setModels] = React.useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);
  const [records, setRecords] = React.useState<RecordData[]>([]);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = React.useState(false);
  const [modelsLoading, setModelsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [editingRecord, setEditingRecord] = React.useState<RecordData | null>(null);
  const [editFormData, setEditFormData] = React.useState<RecordData>({});
  const [viewingRecord, setViewingRecord] = React.useState<RecordData | null>(null);
  const [sqlQuery, setSqlQuery] = React.useState("SELECT * FROM users LIMIT 10");
  const [queryResult, setQueryResult] = React.useState<any[] | null>(null);
  const [queryLoading, setQueryLoading] = React.useState(false);

  // Load models on mount
  React.useEffect(() => {
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load records when model changes
  React.useEffect(() => {
    if (selectedModel) {
      loadRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, pagination.page, sortBy, sortOrder]);

  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const resp = await api.get("/admin/db/models");
      setModels(resp.data?.models || []);
    } catch (error: any) {
      toast({
        title: "Error loading models",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setModelsLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!selectedModel) return;
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const resp = await api.get(`/admin/db/${selectedModel}`, { params });
      setRecords(resp.data?.records || []);
      setPagination(resp.data?.pagination || pagination);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: "Error loading records",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!selectedModel) return;
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await api.delete(`/admin/db/${selectedModel}/${id}`);
      toast({
        title: "Record deleted",
        status: "success",
        duration: 3000,
      });
      loadRecords();
    } catch (error: any) {
      toast({
        title: "Error deleting record",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedModel || selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} records?`)) return;

    try {
      await api.post(`/admin/db/${selectedModel}/bulk-delete`, {
        ids: Array.from(selectedIds),
      });
      toast({
        title: `${selectedIds.size} records deleted`,
        status: "success",
        duration: 3000,
      });
      loadRecords();
    } catch (error: any) {
      toast({
        title: "Error deleting records",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEdit = (record: RecordData) => {
    setEditingRecord(record);
    setEditFormData({ ...record });
    onEditOpen();
  };

  const handleView = (record: RecordData) => {
    setViewingRecord(record);
    onViewOpen();
  };

  const handleSaveEdit = async () => {
    if (!selectedModel || !editingRecord) return;

    try {
      await api.patch(`/admin/db/${selectedModel}/${editingRecord.id}`, editFormData);
      toast({
        title: "Record updated",
        status: "success",
        duration: 3000,
      });
      onEditClose();
      loadRecords();
    } catch (error: any) {
      toast({
        title: "Error updating record",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setEditFormData({});
    onEditOpen();
  };

  const handleSaveCreate = async () => {
    if (!selectedModel) return;

    try {
      await api.post(`/admin/db/${selectedModel}`, editFormData);
      toast({
        title: "Record created",
        status: "success",
        duration: 3000,
      });
      onEditClose();
      loadRecords();
    } catch (error: any) {
      toast({
        title: "Error creating record",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleExecuteQuery = async () => {
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const resp = await api.post("/admin/db/query", { query: sqlQuery });
      setQueryResult(resp.data?.result || []);
    } catch (error: any) {
      toast({
        title: "Query error",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      status: "info",
      duration: 2000,
    });
  };

  const exportToJson = () => {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedModel}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Get columns from first record
  const columns = React.useMemo(() => {
    if (records.length === 0) return [];
    const sample = records[0];
    return Object.keys(sample).slice(0, 8); // Limit visible columns
  }, [records]);

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "✓" : "✗";
    if (typeof value === "object") return JSON.stringify(value).slice(0, 50) + "...";
    if (typeof value === "string" && value.length > 50) return value.slice(0, 50) + "...";
    return String(value);
  };

  return (
    <Box>
      <HStack mb={6} justify="space-between" flexWrap="wrap" gap={4}>
        <HStack>
          <Icon as={Database} boxSize={6} color={GOLD} />
          <Heading size="md">Database Admin</Heading>
          <Badge colorScheme="purple">TablePlus-like</Badge>
        </HStack>
        <HStack>
          <Button
            size="sm"
            leftIcon={<Icon as={Play} boxSize={4} />}
            onClick={onQueryOpen}
            variant="outline"
          >
            SQL Query
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={RefreshCw} boxSize={4} />}
            onClick={loadModels}
            isLoading={modelsLoading}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Models Sidebar */}
        <Box
          w={{ base: "100%", lg: "250px" }}
          flexShrink={0}
          bg="bg.surface"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={4}
          maxH={{ lg: "70vh" }}
          overflowY="auto"
        >
          <HStack mb={3}>
            <Icon as={TableIcon} boxSize={4} color={GOLD} />
            <Text fontWeight="600" fontSize="sm">
              Tables ({models.length})
            </Text>
          </HStack>
          <Divider mb={3} />

          {modelsLoading ? (
            <Spinner size="sm" />
          ) : (
            <VStack align="stretch" gap={1}>
              {models.map((model) => (
                <Button
                  key={model.name}
                  size="sm"
                  variant={selectedModel === model.name ? "solid" : "ghost"}
                  bg={selectedModel === model.name ? GOLD : undefined}
                  color={selectedModel === model.name ? "white" : undefined}
                  justifyContent="space-between"
                  onClick={() => {
                    setSelectedModel(model.name);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  isDisabled={!model.available}
                >
                  <Text fontSize="xs" isTruncated>
                    {model.name}
                  </Text>
                  <Badge
                    size="sm"
                    colorScheme={model.count > 0 ? "green" : "gray"}
                    ml={2}
                  >
                    {model.count}
                  </Badge>
                </Button>
              ))}
            </VStack>
          )}
        </Box>

        {/* Records Table */}
        <Box flex={1} minW={0}>
          {selectedModel ? (
            <VStack align="stretch" gap={4}>
              {/* Toolbar */}
              <HStack
                bg="bg.surface"
                p={3}
                borderRadius="lg"
                border="1px solid"
                borderColor="border.default"
                flexWrap="wrap"
                gap={3}
              >
                <HStack flex={1} minW="200px">
                  <Input
                    size="sm"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <IconButton
                    aria-label="Search"
                    icon={<Icon as={Search} boxSize={4} />}
                    size="sm"
                    onClick={handleSearch}
                  />
                </HStack>

                <Select
                  size="sm"
                  w="120px"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </Select>

                <Button
                  size="sm"
                  leftIcon={<Icon as={Plus} boxSize={4} />}
                  colorScheme="green"
                  onClick={handleCreate}
                >
                  New
                </Button>

                {selectedIds.size > 0 && (
                  <Button
                    size="sm"
                    leftIcon={<Icon as={Trash2} boxSize={4} />}
                    colorScheme="red"
                    onClick={handleBulkDelete}
                  >
                    Delete ({selectedIds.size})
                  </Button>
                )}

                <Tooltip label="Export JSON">
                  <IconButton
                    aria-label="Export"
                    icon={<Icon as={Download} boxSize={4} />}
                    size="sm"
                    onClick={exportToJson}
                    isDisabled={records.length === 0}
                  />
                </Tooltip>
              </HStack>

              {/* Table */}
              <Box
                bg="bg.surface"
                borderRadius="lg"
                border="1px solid"
                borderColor="border.default"
                overflowX="auto"
              >
                {loading ? (
                  <Flex justify="center" align="center" h="200px">
                    <Spinner />
                  </Flex>
                ) : records.length === 0 ? (
                  <Flex justify="center" align="center" h="200px">
                    <Text color="text.muted">No records found</Text>
                  </Flex>
                ) : (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th w="40px">
                          <Checkbox
                            isChecked={selectedIds.size === records.length}
                            isIndeterminate={
                              selectedIds.size > 0 && selectedIds.size < records.length
                            }
                            onChange={toggleSelectAll}
                          />
                        </Th>
                        {columns.map((col) => (
                          <Th
                            key={col}
                            cursor="pointer"
                            onClick={() => {
                              if (sortBy === col) {
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                              } else {
                                setSortBy(col);
                                setSortOrder("desc");
                              }
                            }}
                            _hover={{ bg: "blackAlpha.50" }}
                          >
                            <HStack>
                              <Text>{col}</Text>
                              {sortBy === col && (
                                <Text fontSize="xs">{sortOrder === "asc" ? "↑" : "↓"}</Text>
                              )}
                            </HStack>
                          </Th>
                        ))}
                        <Th w="100px">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {records.map((record) => (
                        <Tr key={record.id} _hover={{ bg: "blackAlpha.50" }}>
                          <Td>
                            <Checkbox
                              isChecked={selectedIds.has(record.id)}
                              onChange={() => toggleSelect(record.id)}
                            />
                          </Td>
                          {columns.map((col) => (
                            <Td key={col} maxW="200px" isTruncated>
                              <Tooltip label={String(record[col])} placement="top">
                                <Text fontSize="xs">{formatCellValue(record[col])}</Text>
                              </Tooltip>
                            </Td>
                          ))}
                          <Td>
                            <HStack gap={1}>
                              <Tooltip label="View">
                                <IconButton
                                  aria-label="View"
                                  icon={<Icon as={Eye} boxSize={3} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleView(record)}
                                />
                              </Tooltip>
                              <Tooltip label="Edit">
                                <IconButton
                                  aria-label="Edit"
                                  icon={<Icon as={Pencil} boxSize={3} />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleEdit(record)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete">
                                <IconButton
                                  aria-label="Delete"
                                  icon={<Icon as={Trash2} boxSize={3} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDelete(record.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>

              {/* Pagination */}
              <HStack justify="space-between" px={2}>
                <Text fontSize="sm" color="text.muted">
                  Showing {records.length} of {pagination.total} records
                </Text>
                <HStack>
                  <IconButton
                    aria-label="Previous"
                    icon={<Icon as={ChevronLeft} boxSize={4} />}
                    size="sm"
                    isDisabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  />
                  <Text fontSize="sm">
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </Text>
                  <IconButton
                    aria-label="Next"
                    icon={<Icon as={ChevronRight} boxSize={4} />}
                    size="sm"
                    isDisabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  />
                </HStack>
              </HStack>
            </VStack>
          ) : (
            <Flex
              justify="center"
              align="center"
              h="300px"
              bg="bg.surface"
              borderRadius="lg"
              border="1px solid"
              borderColor="border.default"
            >
              <VStack>
                <Icon as={Database} boxSize={12} color="text.muted" />
                <Text color="text.muted">Select a table to view records</Text>
              </VStack>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Edit/Create Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingRecord ? "Edit Record" : "Create Record"}
          </ModalHeader>
          <ModalBody>
            <VStack align="stretch" gap={3} maxH="60vh" overflowY="auto">
              {(editingRecord ? Object.keys(editingRecord) : ["name", "email", "description"]).map(
                (key) => (
                  <Box key={key}>
                    <Text fontSize="sm" fontWeight="500" mb={1}>
                      {key}
                    </Text>
                    {key === "id" ? (
                      <Input
                        size="sm"
                        value={editFormData[key] || ""}
                        isReadOnly
                        bg="blackAlpha.50"
                      />
                    ) : typeof editFormData[key] === "object" ? (
                      <Textarea
                        size="sm"
                        value={JSON.stringify(editFormData[key], null, 2)}
                        onChange={(e) => {
                          try {
                            setEditFormData({
                              ...editFormData,
                              [key]: JSON.parse(e.target.value),
                            });
                          } catch {
                            // Invalid JSON, keep as string
                          }
                        }}
                        rows={4}
                        fontFamily="mono"
                        fontSize="xs"
                      />
                    ) : (
                      <Input
                        size="sm"
                        value={editFormData[key] ?? ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, [key]: e.target.value })
                        }
                      />
                    )}
                  </Box>
                )
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={editingRecord ? handleSaveEdit : handleSaveCreate}
            >
              {editingRecord ? "Save Changes" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Record Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between">
              <Text>Record Details</Text>
              <IconButton
                aria-label="Copy JSON"
                icon={<Icon as={Copy} boxSize={4} />}
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(JSON.stringify(viewingRecord, null, 2))}
              />
            </HStack>
          </ModalHeader>
          <ModalBody>
            <Code
              display="block"
              whiteSpace="pre-wrap"
              p={4}
              borderRadius="md"
              fontSize="xs"
              maxH="60vh"
              overflowY="auto"
            >
              {JSON.stringify(viewingRecord, null, 2)}
            </Code>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* SQL Query Modal */}
      <Modal isOpen={isQueryOpen} onClose={onQueryClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Execute SQL Query</ModalHeader>
          <ModalBody>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="500" mb={2}>
                  Query (SELECT only)
                </Text>
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  fontFamily="mono"
                  fontSize="sm"
                  rows={4}
                  placeholder="SELECT * FROM users LIMIT 10"
                />
              </Box>
              <Button
                leftIcon={<Icon as={Play} boxSize={4} />}
                colorScheme="green"
                onClick={handleExecuteQuery}
                isLoading={queryLoading}
              >
                Execute
              </Button>
              {queryResult && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="500">
                      Results ({queryResult.length} rows)
                    </Text>
                    <IconButton
                      aria-label="Copy"
                      icon={<Icon as={Copy} boxSize={4} />}
                      size="xs"
                      onClick={() => copyToClipboard(JSON.stringify(queryResult, null, 2))}
                    />
                  </HStack>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={4}
                    borderRadius="md"
                    fontSize="xs"
                    maxH="300px"
                    overflowY="auto"
                  >
                    {JSON.stringify(queryResult, null, 2)}
                  </Code>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onQueryClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DatabaseAdminPanel;
