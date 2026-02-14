'use client';
import React, { Suspense, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface ModelInfo {
  name: string;
  count: number;
  available: boolean;
}

export default function DatabasePage() {
  return (
    <Suspense fallback={<Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>}>
      <DatabasePageInner />
    </Suspense>
  );
}

function DatabasePageInner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchParams = useSearchParams();

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Load models
  useEffect(() => {
    api.get('/admin/db/models')
      .then((res) => {
        setModels(res.data.models || []);
        const param = searchParams.get('model');
        if (param) setSelectedModel(param);
      })
      .catch(() => setError('Failed to load models'))
      .finally(() => setModelsLoading(false));
  }, [searchParams]);

  // Fetch records when model/page/search changes
  const fetchRecords = useCallback(async () => {
    if (!selectedModel) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/db/${selectedModel}`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });
      const data = res.data;
      setRecords(data.records || []);
      setTotal(data.pagination?.total || 0);
      if (data.records?.length > 0) {
        setColumns(Object.keys(data.records[0]));
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedModel, page, rowsPerPage, search]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setPage(0);
    setSearch('');
    setRecords([]);
    setColumns([]);
  };

  const handleEdit = (record: any) => {
    setEditRecord(record);
    const data: Record<string, string> = {};
    Object.entries(record).forEach(([k, v]) => {
      data[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
    });
    setEditData(data);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editRecord) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      Object.entries(editData).forEach(([k, v]) => {
        if (k === 'id') return;
        try { payload[k] = JSON.parse(v); } catch { payload[k] = v; }
      });
      await api.put(`/admin/db/${selectedModel}/${editRecord.id}`, payload);
      setEditOpen(false);
      fetchRecords();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/db/${selectedModel}/${deleteId}`);
      setDeleteOpen(false);
      setDeleteId('');
      fetchRecords();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const formatCell = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 80);
    const s = String(value);
    return s.length > 60 ? s.slice(0, 57) + '…' : s;
  };

  if (modelsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Database Explorer
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={selectedModel}
            label="Model"
            onChange={(e) => handleModelChange(e.target.value)}
          >
            {models.map((m) => (
              <MenuItem key={m.name} value={m.name}>
                {m.name} ({m.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
          InputProps={{
            endAdornment: (
              <IconButton size="small" onClick={fetchRecords}>
                <SearchIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{ flex: 1, maxWidth: { md: 300 } }}
        />

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRecords}
          size="small"
        >
          Refresh
        </Button>
      </Stack>

      {/* Table */}
      {selectedModel && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columns.slice(0, isMobile ? 3 : undefined).map((col) => (
                      <TableCell key={col} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {col}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, width: 100 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No records found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((row, idx) => (
                      <TableRow key={row.id || idx} hover>
                        {columns.slice(0, isMobile ? 3 : undefined).map((col) => (
                          <TableCell key={col} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={String(row[col] ?? '')} placement="top-start">
                              <span>{formatCell(row[col])}</span>
                            </Tooltip>
                          </TableCell>
                        ))}
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEdit(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => { setDeleteId(row.id); setDeleteOpen(true); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.entries(editData).map(([key, val]) => (
              <TextField
                key={key}
                label={key}
                value={val}
                onChange={(e) => setEditData((prev) => ({ ...prev, [key]: e.target.value }))}
                disabled={key === 'id'}
                size="small"
                fullWidth
                multiline={val.length > 60}
                maxRows={4}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
