'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/propertyService';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    Button,
    useToast,
    Card,
    CardBody,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Spinner,
    Link,
    Image,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Collapse,
    CloseButton,
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [inquiries, setInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [recentStatusUpdates, setRecentStatusUpdates] = useState([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchUserInquiries = async () => {
            if (user && user.email) {
                setIsLoading(true);
                try {
                    const data = await propertyService.getUserInquiries(user.email);
                    setInquiries(data);
                    
                    // Check for recent status changes (in the last 24 hours)
                    const twentyFourHoursAgo = new Date();
                    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
                    
                    const recentUpdates = data.filter(inquiry => {
                        // Check if status is 'contacted' or 'resolved' and updated recently
                        const updatedAt = new Date(inquiry.updatedAt);
                        return (inquiry.status === 'contacted' || inquiry.status === 'resolved') && 
                               updatedAt > twentyFourHoursAgo;
                    });
                    
                    if (recentUpdates.length > 0) {
                        setRecentStatusUpdates(recentUpdates);
                        setShowNotification(true);
                    }
                } catch (error) {
                    console.error('Error fetching inquiries:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch your inquiries',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserInquiries();
    }, [user, toast]);

    const handleLogout = () => {
        logout();
        toast({
            title: 'Logged out successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        router.push('/auth');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new':
                return <Badge colorScheme="blue">New</Badge>;
            case 'contacted':
                return <Badge colorScheme="orange">In Progress</Badge>;
            case 'resolved':
                return <Badge colorScheme="green">Resolved</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/800x600';
        
        // If the URL starts with '/uploads', it's a relative path from the backend
        if (imageUrl.startsWith('/uploads')) {
            return `http://localhost:5000${imageUrl}`;
        }
        
        // Otherwise, return the URL as is (might be a full URL)
        return imageUrl;
    };

    if (loading || isLoading) {
        return (
            <Container maxW="container.xl" py={10}>
                <VStack spacing={8} align="center" justify="center" height="50vh">
                    <Spinner size="xl" />
                    <Text>Loading...</Text>
                </VStack>
            </Container>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={8} align="stretch">
                <Box>
                    <Heading size="lg">Welcome, {user.name}!</Heading>
                    <Text mt={2} color="gray.600">
                        Here's your real estate dashboard
                    </Text>
                </Box>

                {/* Status Update Notification */}
                <Collapse in={showNotification} animateOpacity>
                    <Alert 
                        status="info" 
                        variant="solid" 
                        borderRadius="md"
                        mb={4}
                    >
                        <AlertIcon />
                        <Box flex="1">
                            <AlertTitle>Inquiry Status Updates</AlertTitle>
                            <AlertDescription display="block">
                                {recentStatusUpdates.map((inquiry, index) => (
                                    <Text key={inquiry._id}>
                                        Your inquiry about "{inquiry.property.title}" has been updated to: {" "}
                                        <Badge colorScheme={inquiry.status === 'resolved' ? 'green' : 'orange'}>
                                            {inquiry.status}
                                        </Badge>
                                    </Text>
                                ))}
                            </AlertDescription>
                        </Box>
                        <CloseButton 
                            position="absolute" 
                            right="8px" 
                            top="8px" 
                            onClick={() => setShowNotification(false)} 
                        />
                    </Alert>
                </Collapse>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Saved Properties</StatLabel>
                                <StatNumber>0</StatNumber>
                                <StatHelpText>No properties saved yet</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Active Listings</StatLabel>
                                <StatNumber>0</StatNumber>
                                <StatHelpText>No active listings</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Your Inquiries</StatLabel>
                                <StatNumber>{inquiries.length}</StatNumber>
                                <StatHelpText>
                                    {inquiries.filter(inq => inq.status === 'resolved').length} resolved
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* User Inquiries Section */}
                <Box mt={8}>
                    <Heading size="md" mb={4}>Your Property Inquiries</Heading>
                    
                    {inquiries.length === 0 ? (
                        <Text>You haven't made any inquiries yet.</Text>
                    ) : (
                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Property</Th>
                                        <Th>Message</Th>
                                        <Th>Date</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {inquiries.map((inquiry) => (
                                        <Tr key={inquiry._id}>
                                            <Td>
                                                <Box display="flex" alignItems="center">
                                                    {inquiry.property.images && inquiry.property.images[0] && (
                                                        <Image 
                                                            src={getImageUrl(inquiry.property.images[0])}
                                                            alt={inquiry.property.title}
                                                            boxSize="50px"
                                                            objectFit="cover"
                                                            mr={3}
                                                            borderRadius="md"
                                                        />
                                                    )}
                                                    <NextLink href={`/properties/${inquiry.property._id}`} passHref>
                                                        <Link color="blue.500" fontWeight="medium">
                                                            {inquiry.property.title}
                                                        </Link>
                                                    </NextLink>
                                                </Box>
                                            </Td>
                                            <Td>
                                                <Text noOfLines={2}>{inquiry.message}</Text>
                                            </Td>
                                            <Td>
                                                {new Date(inquiry.createdAt).toLocaleDateString()}
                                            </Td>
                                            <Td>
                                                {getStatusBadge(inquiry.status)}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </Box>

                <Box>
                    <Button
                        colorScheme="red"
                        variant="outline"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
            </VStack>
        </Container>
    );
} 