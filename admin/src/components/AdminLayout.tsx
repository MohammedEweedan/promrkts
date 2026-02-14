'use client';
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  School as SchoolIcon,
  VerifiedUser as VerifiedUserIcon,
  Storage as StorageIcon,
  Campaign as CampaignIcon,
  Work as WorkIcon,
  EmojiEvents as PrizesIcon,
  LocalOffer as PromoIcon,
  Token as TokenIcon,
  BarChart as AnalyticsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useThemeMode } from '@/theme/ThemeProvider';
import { usePathname, useRouter } from 'next/navigation';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Database', icon: <StorageIcon />, path: '/database' },
  { label: 'Users & Verifications', icon: <VerifiedUserIcon />, path: '/verifications' },
  { label: 'Content', icon: <SchoolIcon />, path: '/content' },
  { label: 'Purchases', icon: <ShoppingCartIcon />, path: '/purchases' },
  { label: 'Communications', icon: <CampaignIcon />, path: '/communications' },
  { label: 'Challenges', icon: <PeopleIcon />, path: '/challenges' },
  { label: 'Jobs & Applications', icon: <WorkIcon />, path: '/jobs' },
  { label: 'Prizes', icon: <PrizesIcon />, path: '/prizes' },
  { label: 'Promo Codes', icon: <PromoIcon />, path: '/promos' },
  { label: 'Tokenomics', icon: <TokenIcon />, path: '/tokenomics' },
  { label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { mode, toggleMode } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role?.toLowerCase() !== 'admin') {
        // Not an admin, redirect to login
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleNav = (path: string) => {
    router.push(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo area */}
      <Toolbar sx={{ justifyContent: collapsed && !isMobile ? 'center' : 'space-between', px: collapsed ? 1 : 2 }}>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src="/logo.png"
              sx={{ width: 32, height: 32 }}
              variant="rounded"
            />
            <Typography variant="h6" noWrap sx={{ fontSize: '1rem', fontWeight: 700, color: 'primary.main' }}>
              promrkts
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      {/* Nav items */}
      <List sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const selected = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
          return (
            <Tooltip key={item.path} title={collapsed && !isMobile ? item.label : ''} placement="right" arrow>
              <ListItemButton
                selected={!!selected}
                onClick={() => handleNav(item.path)}
                sx={{ minHeight: 44, justifyContent: collapsed && !isMobile ? 'center' : 'initial', px: collapsed && !isMobile ? 2 : 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 40, justifyContent: 'center', color: selected ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selected ? 600 : 400 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider />
      {/* Theme toggle */}
      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton onClick={toggleMode} size="small">
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', transition: 'width 0.2s' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap sx={{ flex: 1, fontSize: { xs: '1rem', md: '1.15rem' } }}>
              Admin Dashboard
            </Typography>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                  {(user.name || user.email || 'A')[0].toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name || user.email}
                  </Typography>
                )}
              </Box>
            )}
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={toggleMode} size="small">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small" color="error">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
