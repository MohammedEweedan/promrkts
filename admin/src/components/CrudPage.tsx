'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress,
  Alert, Stack, IconButton, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import { Edit, Delete, Refresh, Add } from '@mui/icons-material';
import api from '@/lib/api';

interface CrudPageProps {
  title: string;
  endpoint: string;
  columns?: string[];
  idField?: string;
}

export default function CrudPage({ title, endpoint, columns: forcedCols, idField = 'id' }: CrudPageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>(forcedCols || []);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(endpoint, { params: { page: page + 1, limit: 25 } });
      const data = res.data;
      const recs = data.records || data.data || data[Object.keys(data).find((k: string) => Array.isArray(data[k])) || ''] || [];
      setRecords(recs);
      setTotal(data.pagination?.total || data.total || recs.length);
      if (recs.length > 0 && !forcedCols) {
        setColumns(Object.keys(recs[0]));
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, forcedCols]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (record?: any) => {
    if (record) {
      setEditId(record[idField]);
      const d: Record<string, string> = {};
      Object.entries(record).forEach(([k, v]) => {
        d[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
      });
      setEditData(d);
    } else {
      setEditId(null);
      const d: Record<string, string> = {};
      columns.forEach((c) => { d[c] = ''; });
      setEditData(d);
    }
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      Object.entries(editData).forEach(([k, v]) => {
        if (k === idField && editId) return;
        try { payload[k] = JSON.parse(v); } catch { payload[k] = v; }
      });
      if (editId) {
        await api.put(`${endpoint}/${editId}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setEditOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${deleteId}`);
      setDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (v: any): string => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? '✓' : '✗';
    if (typeof v === 'object') return JSON.stringify(v).slice(0, 60);
    const s = String(v);
    return s.length > 50 ? s.slice(0, 47) + '…' : s;
  };

  const visibleCols = isMobile ? columns.slice(0, 3) : columns.slice(0, 8);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">{title}</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Add />} variant="contained" size="small" onClick={() => openEdit()}>New</Button>
          <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={fetchData}>Refresh</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {visibleCols.map((c) => (
                    <TableCell key={c} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{c}</TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 700, width: 90 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={visibleCols.length + 1} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={visibleCols.length + 1} align="center" sx={{ py: 6 }}>No records</TableCell></TableRow>
                ) : records.map((row: any, idx: number) => (
                  <TableRow key={row[idField] || idx} hover>
                    {visibleCols.map((c) => (
                      <TableCell key={c} sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Tooltip title={String(row[c] ?? '')}><span>{fmt(row[c])}</span></Tooltip>
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(row)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => { setDeleteId(row[idField]); setDeleteOpen(true); }}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={total} page={page}
            onPageChange={(_, p) => setPage(p)} rowsPerPage={25} rowsPerPageOptions={[25]}
          />
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{editId ? 'Edit' : 'Create'} Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.entries(editData).map(([key, val]) => (
              <TextField key={key} label={key} value={val}
                onChange={(e) => setEditData((p) => ({ ...p, [key]: e.target.value }))}
                disabled={key === idField && !!editId} size="small" fullWidth
                multiline={val.length > 60} maxRows={4}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Delete this record permanently?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
