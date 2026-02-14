'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Alert,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '@/lib/api';

const COLORS = ['#65a8bf', '#b7a27d', '#4caf50', '#ff9800', '#e91e63', '#9c27b0'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/db/stats')
      .then((res) => setStats(res.data.stats || {}))
      .catch((err: any) => setError(err?.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  }

  const barData = Object.entries(stats)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([name, value]) => ({ name, value }));

  const pieData = barData.slice(0, 6);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Analytics</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Records by Model</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#65a8bf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Distribution</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>All Counts</Typography>
          <Grid container spacing={2}>
            {Object.entries(stats).map(([name, count]) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={name}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{name}</Typography>
                    <Typography variant="h6" color="primary.main">{count.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
