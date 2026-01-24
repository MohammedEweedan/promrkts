/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Heading,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Input,
  Button,
  Flex,
  useColorModeValue,
  Spinner,
  Avatar,
  Progress,
} from '@chakra-ui/react';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';

const GOLD = '#65a8bf';

interface StudentProgressData {
  userId: string;
  userName: string;
  userEmail: string;
  totalXP: number;
  totalLevel: number;
  coursesCompleted: number;
  coursesInProgress: number;
  maxStreak: number;
  badgesUnlocked: number;
  lastActive: string;
}

export const StudentProgressAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<StudentProgressData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'xp' | 'level' | 'courses' | 'streak'>('xp');

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy]);

  const fetchStudentProgress = async () => {
    try {
      // Fetch all users and their progress
      const [usersRes, badgesRes] = await Promise.all([
        api.get('/admin/users'), // Assuming this endpoint exists
        api.get('/badges'),
      ]);

      const users = usersRes.data;
      const allBadges = badgesRes.data;

      // Fetch progress for each user
      const studentData: StudentProgressData[] = [];

      for (const user of users) {
        try {
          const [progressRes, userBadgesRes] = await Promise.all([
            api.get(`/progress/overview`, {
              headers: { 'X-User-Id': user.id }, // Admin override
            }),
            api.get(`/badges/my`, {
              headers: { 'X-User-Id': user.id },
            }),
          ]);

          const progress = progressRes.data;
          const userBadges = userBadgesRes.data;

          studentData.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            totalXP: progress.totalXP || 0,
            totalLevel: progress.totalLevel || 1,
            coursesCompleted: progress.coursesCompleted || 0,
            coursesInProgress: progress.coursesInProgress || 0,
            maxStreak: progress.maxStreak || 0,
            badgesUnlocked: userBadges.length || 0,
            lastActive: progress.recentActivity?.[0]?.activityDate || 'Never',
          });
        } catch (error) {
          // User has no progress yet
          studentData.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            totalXP: 0,
            totalLevel: 1,
            coursesCompleted: 0,
            coursesInProgress: 0,
            maxStreak: 0,
            badgesUnlocked: 0,
            lastActive: 'Never',
          });
        }
      }

      setStudents(studentData);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = students.filter(
      (student) =>
        student.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'xp':
          return b.totalXP - a.totalXP;
        case 'level':
          return b.totalLevel - a.totalLevel;
        case 'courses':
          return b.coursesCompleted - a.coursesCompleted;
        case 'streak':
          return b.maxStreak - a.maxStreak;
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const calculateStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.totalXP > 0).length;
    const avgXP = students.reduce((sum, s) => sum + s.totalXP, 0) / totalStudents || 0;
    const totalBadgesUnlocked = students.reduce((sum, s) => sum + s.badgesUnlocked, 0);

    return {
      totalStudents,
      activeStudents,
      avgXP: Math.round(avgXP),
      totalBadgesUnlocked,
    };
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const stats = calculateStats();

  return (
    <VStack spacing={6} align="stretch">
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card bg={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Users size={20} style={{ marginRight: '8px' }} />
                <StatLabel>Total Students</StatLabel>
              </Flex>
              <StatNumber>{stats.totalStudents}</StatNumber>
              <StatHelpText>
                {stats.activeStudents} active ({Math.round((stats.activeStudents / stats.totalStudents) * 100)}%)
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Trophy size={20} style={{ marginRight: '8px' }} />
                <StatLabel>Average XP</StatLabel>
              </Flex>
              <StatNumber>{stats.avgXP.toLocaleString()}</StatNumber>
              <StatHelpText>per student</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Award size={20} style={{ marginRight: '8px' }} />
                <StatLabel>Badges Unlocked</StatLabel>
              </Flex>
              <StatNumber>{stats.totalBadgesUnlocked}</StatNumber>
              <StatHelpText>across all students</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <TrendingUp size={20} style={{ marginRight: '8px' }} />
                <StatLabel>Engagement Rate</StatLabel>
              </Flex>
              <StatNumber>
                {Math.round((stats.activeStudents / stats.totalStudents) * 100)}%
              </StatNumber>
              <StatHelpText>students with progress</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card bg={GOLD} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4}>
            Student Progress Details
          </Heading>

          <HStack spacing={4} mb={4}>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="400px"
            />

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              maxW="200px"
            >
              <option value="xp">Sort by XP</option>
              <option value="level">Sort by Level</option>
              <option value="courses">Sort by Courses</option>
              <option value="streak">Sort by Streak</option>
            </Select>

            <Button onClick={fetchStudentProgress} colorScheme="blue">
              Refresh
            </Button>
          </HStack>

          {/* Student Table */}
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th isNumeric>Level</Th>
                  <Th isNumeric>XP</Th>
                  <Th isNumeric>Courses</Th>
                  <Th isNumeric>Streak</Th>
                  <Th isNumeric>Badges</Th>
                  <Th>Last Active</Th>
                  <Th>Progress</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredStudents.map((student, index) => (
                  <Tr key={student.userId}>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={student.userName} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">
                            {student.userName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {student.userEmail}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme="blue">{student.totalLevel}</Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold">
                      {student.totalXP.toLocaleString()}
                    </Td>
                    <Td isNumeric>
                      <Text>
                        {student.coursesCompleted} / {student.coursesCompleted + student.coursesInProgress}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      {student.maxStreak > 0 ? (
                        <Badge colorScheme="orange">🔥 {student.maxStreak}</Badge>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td isNumeric>
                      {student.badgesUnlocked > 0 ? (
                        <Badge colorScheme="purple">🏆 {student.badgesUnlocked}</Badge>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="xs">
                        {student.lastActive !== 'Never'
                          ? new Date(student.lastActive).toLocaleDateString()
                          : 'Never'}
                      </Text>
                    </Td>
                    <Td>
                      <Box w="100px">
                        <Progress
                          value={
                            student.coursesCompleted + student.coursesInProgress > 0
                              ? (student.coursesCompleted /
                                  (student.coursesCompleted + student.coursesInProgress)) *
                                100
                              : 0
                          }
                          size="sm"
                          colorScheme="green"
                          borderRadius="full"
                        />
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {filteredStudents.length === 0 && (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No students found</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default StudentProgressAnalytics;
