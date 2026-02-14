import React from 'react';
import { Box, HStack, VStack, Text, Icon } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColorMode } from '@chakra-ui/react';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  MessageCircle,
  Settings,
} from 'lucide-react';

const TABS = [
  { key: 'home', path: '/', icon: Home, label: 'Home' },
  { key: 'hub', path: '/hub', icon: LayoutGrid, label: 'Hub' },
  { key: 'store', path: '/products', icon: ShoppingBag, label: 'Store', center: true },
  { key: 'chat', path: '/messages', icon: MessageCircle, label: 'Chat' },
  { key: 'account', path: '/account', icon: Settings, label: 'Account' },
];

const PRIMARY = '#65a8bf';

function useIsStandalone(): boolean {
  const [standalone, setStandalone] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    setStandalone(mq.matches || (navigator as any).standalone === true);
    const handler = (e: MediaQueryListEvent) => setStandalone(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return standalone;
}

export default function PWABottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode } = useColorMode();
  const isStandalone = useIsStandalone();

  if (!isStandalone) return null;

  const isDark = colorMode === 'dark';
  const bgColor = isDark ? '#0d1117' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={9999}
      bg={bgColor}
      borderTop="1px solid"
      borderColor={borderColor}
      pt="8px"
      pb="env(safe-area-inset-bottom, 20px)"
      px={2}
    >
      <HStack justify="space-around" align="flex-end" maxW="500px" mx="auto">
        {TABS.map((tab) => {
          const active = isActive(tab.path);
          const color = active ? PRIMARY : mutedColor;

          if (tab.center) {
            return (
              <Box
                key={tab.key}
                position="relative"
                top="-18px"
                cursor="pointer"
                onClick={() => navigate(tab.path)}
              >
                <Box
                  w="64px"
                  h="64px"
                  borderRadius="full"
                  bg={PRIMARY}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="5px solid"
                  borderColor={bgColor}
                  boxShadow="0 2px 12px rgba(101,168,191,0.3)"
                >
                  <Icon as={tab.icon} boxSize={6} color="white" />
                </Box>
              </Box>
            );
          }

          return (
            <VStack
              key={tab.key}
              spacing={0.5}
              cursor="pointer"
              onClick={() => navigate(tab.path)}
              opacity={active ? 1 : 0.7}
              transition="all 0.2s"
              _hover={{ opacity: 1 }}
              pb={1}
            >
              <Icon as={tab.icon} boxSize={5} color={color} />
              <Text fontSize="10px" fontWeight="600" color={color} mt="2px">
                {tab.label}
              </Text>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
}
