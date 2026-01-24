import React from 'react';
import { Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, VStack } from '@chakra-ui/react';
import StudentProgressAnalytics from '../../components/admin/StudentProgressAnalytics';
import BadgeLeaderboard from '../../components/admin/BadgeLeaderboard';

const AdminProgress: React.FC = () => {
  return (
    <Box bg="transparent" py={8}>
      <Container maxW="container.xl">
        <VStack align="stretch" spacing={6}>
          <Heading size="xl">Student Progress & Analytics</Heading>
          
          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>📊 Student Progress</Tab>
              <Tab>🏆 Badge Statistics</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel px={0}>
                <StudentProgressAnalytics />
              </TabPanel>
              
              <TabPanel px={0}>
                <BadgeLeaderboard />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminProgress;
