'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress,
  Alert, Stack, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, useMediaQuery, useTheme,
  IconButton, TablePagination,
} from '@mui/material';
import { Check, Close, Refresh, Visibility } from '@mui/icons-material';
import api from '@/lib/api';

interface Verification {
  id: string;
  userId: string;
  user?: { name?: string; email?: string };
  status: string;
  txHash?: string;
  amount?: number;
  tier?: { name?: string };
  createdAt: string;
  screenshotUrl?: string;
}

export default function VerificationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [records, setRecords] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Verification | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/verifications', {
        params: { page: page + 1, limit: 25, status: filter },
      });
      setRecords(res.data.verifications || res.data.records || []);
      setTotal(res.data.pagination?.total || res.data.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/admin/verifications/${id}/${action}`);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || `Failed to ${action}`);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Users & Verifications</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filter} label="Status" onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="">All</MenuItem>
          </Select>
        </FormControl>
        <Button startIcon={<Refresh />} onClick={fetchData} variant="outlined" size="small">Refresh</Button>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 700 }}>Tier</TableCell>}
                  {!isMobile && <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>}
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No verifications found</Typography></TableCell></TableRow>
                ) : records.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{(v.user?.name || 'U')[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{v.user?.name || v.userId}</Typography>
                          {!isMobile && <Typography variant="caption" color="text.secondary">{v.user?.email}</Typography>}
                        </Box>
                      </Stack>
                    </TableCell>
                    {!isMobile && <TableCell>{v.tier?.name || '—'}</TableCell>}
                    {!isMobile && <TableCell>{v.amount ? `$${v.amount}` : '—'}</TableCell>}
                    <TableCell>
                      <Chip
                        label={v.status}
                        size="small"
                        color={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => { setSelected(v); setViewOpen(true); }}><Visibility fontSize="small" /></IconButton>
                        {v.status === 'pending' && (
                          <>
                            <IconButton size="small" color="success" onClick={() => handleAction(v.id, 'approve')}><Check fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleAction(v.id, 'reject')}><Close fontSize="small" /></IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={25}
            rowsPerPageOptions={[25]}
          />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verification Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography><strong>User:</strong> {selected.user?.name || selected.userId}</Typography>
              <Typography><strong>Email:</strong> {selected.user?.email || '—'}</Typography>
              <Typography><strong>Tier:</strong> {selected.tier?.name || '—'}</Typography>
              <Typography><strong>Amount:</strong> {selected.amount ? `$${selected.amount}` : '—'}</Typography>
              <Typography><strong>TX Hash:</strong> {selected.txHash || '—'}</Typography>
              <Typography><strong>Status:</strong> {selected.status}</Typography>
              <Typography><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</Typography>
              {selected.screenshotUrl && (
                <Box component="img" src={selected.screenshotUrl} alt="Screenshot" sx={{ maxWidth: '100%', borderRadius: 2 }} />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
