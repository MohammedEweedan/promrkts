import React, { useState, useEffect } from 'react';
import { Button, VStack, HStack, Text, Divider, Icon } from '@chakra-ui/react';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// ===== SVG Icons =====
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// ===== Google OAuth via GSI =====
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (el: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

type OAuthButtonsProps = {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (msg: string) => void;
};

const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID || '';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ mode = 'login', onSuccess, onError }) => {
  const { setUser, refresh } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (document.getElementById('google-gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handleOAuthSuccess = async (data: any) => {
    const user = data?.data?.user || data?.user;
    const token = data?.data?.accessToken || data?.accessToken || data?.token || '';
    if (token) localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
      setUser(user);
    } else {
      await refresh();
    }
    try { sessionStorage.setItem('auth_splash_once', '1'); } catch {}
    onSuccess?.();
    navigate('/dashboard');
  };

  // ===== Google =====
  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      onError?.('Google sign-in is not configured');
      return;
    }
    setLoading('google');

    if (!window.google?.accounts?.id) {
      onError?.('Google sign-in is loading, please try again');
      setLoading(null);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          const { data } = await api.post('/auth/oauth/google', { credential: response.credential });
          await handleOAuthSuccess(data);
        } catch (e: any) {
          onError?.(e?.response?.data?.message || 'Google sign-in failed');
        } finally {
          setLoading(null);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  // ===== GitHub =====
  const handleGitHub = () => {
    if (!GITHUB_CLIENT_ID) {
      onError?.('GitHub sign-in is not configured');
      return;
    }
    setLoading('github');

    // Open GitHub OAuth in a popup
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'read:user user:email';
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(url, 'github-oauth', `width=${width},height=${height},left=${left},top=${top}`);

    // Listen for the callback
    const interval = setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          setLoading(null);
          return;
        }
        const popupUrl = popup.location.href;
        if (popupUrl.includes('code=')) {
          clearInterval(interval);
          const urlParams = new URLSearchParams(new URL(popupUrl).search);
          const code = urlParams.get('code');
          popup.close();

          if (code) {
            try {
              const { data } = await api.post('/auth/oauth/github', { code });
              await handleOAuthSuccess(data);
            } catch (e: any) {
              onError?.(e?.response?.data?.message || 'GitHub sign-in failed');
            }
          }
          setLoading(null);
        }
      } catch {
        // Cross-origin — popup hasn't redirected back yet, keep waiting
      }
    }, 500);
  };

  // ===== Apple =====
  const handleApple = () => {
    onError?.('Apple sign-in coming soon');
  };

  const label = mode === 'register' ? 'Sign up' : 'Sign in';

  return (
    <VStack spacing={3} w="100%">
      <HStack w="100%" align="center" spacing={3}>
        <Divider borderColor="rgba(101, 168, 191, 0.2)" />
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" px={2}>
          or continue with
        </Text>
        <Divider borderColor="rgba(101, 168, 191, 0.2)" />
      </HStack>

      <HStack spacing={3} w="100%" justify="center">
        {GOOGLE_CLIENT_ID && (
          <Button
            onClick={handleGoogle}
            isLoading={loading === 'google'}
            variant="outline"
            borderColor="rgba(101, 168, 191, 0.3)"
            borderRadius="xl"
            size="lg"
            flex="1"
            _hover={{ bg: 'rgba(101, 168, 191, 0.05)', borderColor: 'rgba(101, 168, 191, 0.5)' }}
            leftIcon={<GoogleIcon />}
          >
            <Text fontSize="sm">Google</Text>
          </Button>
        )}

        {GITHUB_CLIENT_ID && (
          <Button
            onClick={handleGitHub}
            isLoading={loading === 'github'}
            variant="outline"
            borderColor="rgba(101, 168, 191, 0.3)"
            borderRadius="xl"
            size="lg"
            flex="1"
            _hover={{ bg: 'rgba(101, 168, 191, 0.05)', borderColor: 'rgba(101, 168, 191, 0.5)' }}
            leftIcon={<GitHubIcon />}
          >
            <Text fontSize="sm">GitHub</Text>
          </Button>
        )}

        <Button
          onClick={handleApple}
          isLoading={loading === 'apple'}
          variant="outline"
          borderColor="rgba(101, 168, 191, 0.3)"
          borderRadius="xl"
          size="lg"
          flex="1"
          _hover={{ bg: 'rgba(101, 168, 191, 0.05)', borderColor: 'rgba(101, 168, 191, 0.5)' }}
          leftIcon={<AppleIcon />}
        >
          <Text fontSize="sm">Apple</Text>
        </Button>
      </HStack>
    </VStack>
  );
};

export default OAuthButtons;
