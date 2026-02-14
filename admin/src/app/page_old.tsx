'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  School as SchoolIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface ModelStat {
  name: string;
  count: number;
  available: boolean;
}

const HIGHLIGHT_MODELS = ['users', 'purchase', 'courseTier', 'communication'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [models, setModels] = useState<ModelStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/db/stats').catch(() => ({ data: { stats: {} } })),
      api.get('/admin/db/models').catch(() => ({ data: { models: [] } })),
    ]).then(([statsRes, modelsRes]) => {
      setStats(statsRes.data.stats || {});
      setModels(modelsRes.data.models || []);
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

  const iconMap: Record<string, React.ReactElement> = {
    users: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    purchase: <ShoppingCartIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    courseTier: <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    communication: <StorageIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
  };

  const highlights = HIGHLIGHT_MODELS.map((name) => ({
    name,
    count: stats[name] ?? 0,
    icon: iconMap[name] || <StorageIcon sx={{ fontSize: 40 }} />,
  }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Highlight cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {highlights.map((h) => (
          <Grid item xs={6} md={3} key={h.name}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {h.icon}
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {h.count.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                    {h.name.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* All models table */}
      <Typography variant="h6" gutterBottom>
        All Models
      </Typography>
      <Grid container spacing={2}>
        {models.map((m) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={m.name}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
                transition: '0.2s',
              }}
              onClick={() => window.location.href = `/database?model=${m.name}`}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {m.name}
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {m.count.toLocaleString()}
                </Typography>
                <Chip
                  label={m.available ? 'Active' : 'Error'}
                  size="small"
                  color={m.available ? 'success' : 'error'}
                  sx={{ mt: 0.5 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
