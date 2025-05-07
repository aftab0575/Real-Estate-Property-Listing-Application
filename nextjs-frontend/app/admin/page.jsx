'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
    Box,
    Container,
    Grid,
    GridItem,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Card,
    CardBody,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Icon,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { FiUsers, FiHome, FiDatabase, FiCalendar, FiTrash2, FiEdit, FiEye } from 'react-icons/fi';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/auth');
            return;
        }

        if (user && user.isAdmin) {
            fetchDashboardData();
        }
    }, [user, authLoading, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardData();
            setDashboardData(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load admin dashboard data',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = async (id) => {
        try {
            await adminService.deleteProperty(id);
            toast({
                title: 'Success',
                description: 'Property deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchDashboardData();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete property',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await adminService.deleteUser(id);
            toast({
                title: 'Success',
                description: 'User deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchDashboardData();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleViewProperty = (id) => {
        router.push(`/properties/${id}`);
    };

    if (authLoading || loading) {
        return (
            <Container maxW="container.xl" py={10}>
                <Flex justify="center" align="center" minH="50vh">
                    <Spinner size="xl" />
                </Flex>
            </Container>
        );
    }

    if (!user || !user.isAdmin) {
        return null;
    }

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading>Admin Dashboard</Heading>
                <Text>Welcome, {user.name}. You have administrator access.</Text>

                {/* Stats Overview */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Users</StatLabel>
                                <HStack>
                                    <Icon as={FiUsers} />
                                    <StatNumber>{dashboardData?.counts?.users || 0}</StatNumber>
                                </HStack>
                                <StatHelpText>Registered users</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Properties</StatLabel>
                                <HStack>
                                    <Icon as={FiHome} />
                                    <StatNumber>{dashboardData?.counts?.properties || 0}</StatNumber>
                                </HStack>
                                <StatHelpText>Listed properties</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Property Inquiries</StatLabel>
                                <HStack>
                                    <Icon as={FiDatabase} />
                                    <StatNumber>{dashboardData?.counts?.inquiries || 0}</StatNumber>
                                </HStack>
                                <StatHelpText>
                                    <Button 
                                        size="xs" 
                                        colorScheme="blue" 
                                        variant="link"
                                        onClick={() => router.push('/admin/inquiries')}
                                    >
                                        View all inquiries
                                    </Button>
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Tabs for Users and Properties */}
                <Tabs colorScheme="blue" isLazy>
                    <TabList>
                        <Tab>Recent Properties</Tab>
                        <Tab>Recent Users</Tab>
                        <Tab>Recent Inquiries</Tab>
                    </TabList>

                    <TabPanels>
                        {/* Properties Tab */}
                        <TabPanel>
                            <VStack spacing={4} align="stretch">
                                <Heading size="md">Recently Added Properties</Heading>
                                {dashboardData?.latestProperties?.length > 0 ? (
                                    <Box overflowX="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Title</Th>
                                                    <Th>Price</Th>
                                                    <Th>Location</Th>
                                                    <Th>Type</Th>
                                                    <Th>Owner</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {dashboardData.latestProperties.map((property) => (
                                                    <Tr key={property._id}>
                                                        <Td>{property.title}</Td>
                                                        <Td>${property.price.toLocaleString()}</Td>
                                                        <Td>{property.location}</Td>
                                                        <Td>
                                                            <Badge colorScheme={
                                                                property.type === 'House' ? 'green' :
                                                                property.type === 'Apartment' ? 'blue' : 'purple'
                                                            }>
                                                                {property.type}
                                                            </Badge>
                                                        </Td>
                                                        <Td>{property.owner?.name || 'Unknown'}</Td>
                                                        <Td>
                                                            <HStack spacing={2}>
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    leftIcon={<FiEye />}
                                                                    onClick={() => handleViewProperty(property._id)}
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    leftIcon={<FiTrash2 />}
                                                                    onClick={() => handleDeleteProperty(property._id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Text>No properties found</Text>
                                )}
                                <Button colorScheme="blue" onClick={() => router.push('/admin/properties')}>
                                    View All Properties
                                </Button>
                            </VStack>
                        </TabPanel>

                        {/* Users Tab */}
                        <TabPanel>
                            <VStack spacing={4} align="stretch">
                                <Heading size="md">Recently Joined Users</Heading>
                                {dashboardData?.latestUsers?.length > 0 ? (
                                    <Box overflowX="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Name</Th>
                                                    <Th>Email</Th>
                                                    <Th>Joined</Th>
                                                    <Th>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {dashboardData.latestUsers.map((user) => (
                                                    <Tr key={user._id}>
                                                        <Td>{user.name}</Td>
                                                        <Td>{user.email}</Td>
                                                        <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                                        <Td>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="red"
                                                                leftIcon={<FiTrash2 />}
                                                                onClick={() => handleDeleteUser(user._id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Text>No users found</Text>
                                )}
                                <Button colorScheme="blue" onClick={() => router.push('/admin/users')}>
                                    View All Users
                                </Button>
                            </VStack>
                        </TabPanel>

                        {/* Inquiries Tab */}
                        <TabPanel>
                            <VStack spacing={4} align="stretch">
                                <Heading size="md">Recent Property Inquiries</Heading>
                                {dashboardData?.latestInquiries?.length > 0 ? (
                                    <Box overflowX="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Date</Th>
                                                    <Th>Name</Th>
                                                    <Th>Email</Th>
                                                    <Th>Property</Th>
                                                    <Th>Status</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {dashboardData.latestInquiries.map((inquiry) => (
                                                    <Tr 
                                                        key={inquiry._id} 
                                                        bg={!inquiry.isRead ? "blue.50" : undefined}
                                                    >
                                                        <Td>{new Date(inquiry.createdAt).toLocaleDateString()}</Td>
                                                        <Td>{inquiry.name}</Td>
                                                        <Td>{inquiry.email}</Td>
                                                        <Td>
                                                            {inquiry.property ? inquiry.property.title : 'Unknown Property'}
                                                        </Td>
                                                        <Td>
                                                            <Badge 
                                                                colorScheme={
                                                                    inquiry.status === 'new' ? 'red' : 
                                                                    inquiry.status === 'contacted' ? 'blue' : 'green'
                                                                }
                                                            >
                                                                {inquiry.status}
                                                            </Badge>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Text>No recent inquiries found</Text>
                                )}
                                <Button colorScheme="blue" onClick={() => router.push('/admin/inquiries')}>
                                    View All Inquiries
                                </Button>
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Container>
    );
} 