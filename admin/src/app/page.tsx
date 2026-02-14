'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert,
  Stack, Chip, LinearProgress,
} from '@mui/material';
import {
  TrendingUp, People, ShoppingCart, AttachMoney, VerifiedUser,
  LocalOffer, Star, Timeline,
} from '@mui/icons-material';
import api from '@/lib/api';

interface KPIData {
  revenue: { total: number; currency: string };
  users: { total: number; active: number; activePercentage: string };
  purchases: { total: number; recent: number };
  verifications: { pending: number };
  promoUsage: Array<{ code: string; uses: number }>;
  popularItems: Array<{ type: string; id: string; purchases: number; revenue: number }>;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/kpis')
      .then((res) => {
        setKpis(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'Failed to load KPIs');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!kpis) {
    return <Alert severity="warning">No data available</Alert>;
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${kpis.revenue.total.toLocaleString()}`,
      subtitle: kpis.revenue.currency,
      icon: <AttachMoney />,
      color: '#4caf50',
    },
    {
      title: 'Total Users',
      value: kpis.users.total.toLocaleString(),
      subtitle: `${kpis.users.active} active (${kpis.users.activePercentage}%)`,
      icon: <People />,
      color: '#2196f3',
    },
    {
      title: 'Total Purchases',
      value: kpis.purchases.total.toLocaleString(),
      subtitle: `${kpis.purchases.recent} in last 7 days`,
      icon: <ShoppingCart />,
      color: '#ff9800',
    },
    {
      title: 'Pending Verifications',
      value: kpis.verifications.pending.toLocaleString(),
      subtitle: 'Awaiting review',
      icon: <VerifiedUser />,
      color: '#f44336',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Key performance indicators and metrics
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box sx={{ color: card.color, opacity: 0.8 }}>{card.icon}</Box>
                  <Chip label={<TrendingUp fontSize="small" />} size="small" sx={{ bgcolor: `${card.color}20`, color: card.color }} />
                </Stack>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {card.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Promo Code Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <LocalOffer color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Top Promo Codes
                </Typography>
              </Stack>
              {kpis.promoUsage.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No promo codes used yet</Typography>
              ) : (
                <Stack spacing={2}>
                  {kpis.promoUsage.map((promo, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{promo.code}</Typography>
                        <Chip label={`${promo.uses} uses`} size="small" color="primary" variant="outlined" />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((promo.uses / (kpis.promoUsage[0]?.uses || 1)) * 100, 100)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Star color="warning" />
                <Typography variant="h6" fontWeight={700}>
                  Popular Items
                </Typography>
              </Stack>
              {kpis.popularItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No purchases yet</Typography>
              ) : (
                <Stack spacing={2}>
                  {kpis.popularItems.slice(0, 5).map((item, idx) => (
                    <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {item.type} #{item.id.slice(0, 8)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.purchases} purchases
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        ${item.revenue.toLocaleString()}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Timeline color="info" />
                <Typography variant="h6" fontWeight={700}>
                  User Activity
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={700}>{kpis.users.total}</Typography>
                    <Typography variant="body2">Total Users</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={700}>{kpis.users.active}</Typography>
                    <Typography variant="body2">Active Users (30d)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center" sx={{ p: 2, bgcolor: 'warning.main', color: 'white', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={700}>{kpis.users.activePercentage}%</Typography>
                    <Typography variant="body2">Activity Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
