import React, { useEffect } from 'react';
import { Box, Text, Spinner, VStack } from '@chakra-ui/react';

/**
 * This page is opened in a popup by the OAuthButtons component.
 * GitHub redirects here with ?code=xxx after the user authorizes.
 * The parent window reads the URL and closes this popup.
 * This page just shows a loading spinner while that happens.
 */
const GitHubCallback: React.FC = () => {
  useEffect(() => {
    // The parent window's interval will detect the code in our URL and close us.
    // If opened directly (not in popup), redirect to login after a timeout.
    const timeout = setTimeout(() => {
      if (!window.opener) {
        window.location.href = '/login';
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4}>
        <Spinner size="xl" color="#65a8bf" />
        <Text color="gray.500">Completing sign in...</Text>
      </VStack>
    </Box>
  );
};

export default GitHubCallback;
