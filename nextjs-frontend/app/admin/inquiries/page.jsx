'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { adminService } from '../../../services/adminService';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Flex,
    Spinner,
    useToast,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { FiSearch, FiEye, FiMail, FiPhone, FiHome, FiCalendar } from 'react-icons/fi';

export default function AdminInquiries() {
    const { user, loading: authLoading } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/auth');
            return;
        }

        if (user && user.isAdmin) {
            fetchInquiries();
        }
    }, [user, authLoading, router]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const data = await adminService.getInquiries();
            setInquiries(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load inquiries',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewInquiry = async (inquiry) => {
        try {
            setSelectedInquiry(inquiry);
            
            // Mark as read if it's unread
            if (!inquiry.isRead) {
                await adminService.updateInquiry(inquiry._id, { isRead: true });
                
                // Update local state
                setInquiries(prevInquiries => 
                    prevInquiries.map(item => 
                        item._id === inquiry._id ? { ...item, isRead: true } : item
                    )
                );
            }
            
            onOpen();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update inquiry status',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleStatusChange = async (status) => {
        if (!selectedInquiry) return;
        
        try {
            await adminService.updateInquiry(selectedInquiry._id, { status });
            
            // Update local state
            setInquiries(prevInquiries => 
                prevInquiries.map(item => 
                    item._id === selectedInquiry._id ? { ...item, status } : item
                )
            );
            
            setSelectedInquiry({ ...selectedInquiry, status });
            
            toast({
                title: 'Success',
                description: `Inquiry status updated to ${status}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update inquiry status',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'red';
            case 'contacted': return 'blue';
            case 'resolved': return 'green';
            default: return 'gray';
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => 
        (inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inquiry.property && inquiry.property.title && 
         inquiry.property.title.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (statusFilter ? inquiry.status === statusFilter : true)
    );

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
                <Heading>Property Inquiries</Heading>

                <Flex justify="space-between" wrap="wrap" gap={4}>
                    <InputGroup maxW={{ base: "100%", md: "400px" }}>
                        <InputLeftElement pointerEvents="none">
                            <FiSearch />
                        </InputLeftElement>
                        <Input 
                            placeholder="Search inquiries..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    
                    <Select 
                        placeholder="Filter by status" 
                        maxW="200px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                    </Select>
                </Flex>

                <Box overflowX="auto">
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Property</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredInquiries.length > 0 ? (
                                filteredInquiries.map((inquiry) => (
                                    <Tr 
                                        key={inquiry._id} 
                                        bg={!inquiry.isRead ? "blue.50" : undefined}
                                    >
                                        <Td>{formatDate(inquiry.createdAt)}</Td>
                                        <Td>{inquiry.name}</Td>
                                        <Td>{inquiry.email}</Td>
                                        <Td>
                                            {inquiry.property ? inquiry.property.title : 'Unknown Property'}
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(inquiry.status)}>
                                                {inquiry.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                leftIcon={<FiEye />}
                                                onClick={() => handleViewInquiry(inquiry)}
                                            >
                                                View
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={6} textAlign="center">
                                        {searchTerm || statusFilter ? 
                                            'No inquiries match your search/filter' : 
                                            'No inquiries found'}
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>

            {/* Inquiry Detail Modal */}
            {selectedInquiry && (
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Inquiry Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4} align="stretch">
                                <HStack>
                                    <FiCalendar />
                                    <Text><strong>Date:</strong> {formatDate(selectedInquiry.createdAt)}</Text>
                                </HStack>
                                
                                <Box>
                                    <Text fontSize="lg" fontWeight="bold">{selectedInquiry.name}</Text>
                                    <HStack mt={1}>
                                        <FiMail />
                                        <Text>{selectedInquiry.email}</Text>
                                    </HStack>
                                    {selectedInquiry.phone && (
                                        <HStack mt={1}>
                                            <FiPhone />
                                            <Text>{selectedInquiry.phone}</Text>
                                        </HStack>
                                    )}
                                </Box>

                                {selectedInquiry.property && (
                                    <Box p={3} borderWidth="1px" borderRadius="md">
                                        <HStack mb={1}>
                                            <FiHome />
                                            <Text fontWeight="bold">{selectedInquiry.property.title}</Text>
                                        </HStack>
                                        {selectedInquiry.property.location && (
                                            <Text fontSize="sm">{selectedInquiry.property.location}</Text>
                                        )}
                                        {selectedInquiry.property.price && (
                                            <Text fontWeight="bold" color="blue.500">
                                                ${selectedInquiry.property.price.toLocaleString()}
                                            </Text>
                                        )}
                                    </Box>
                                )}

                                <Box p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                                    <Text fontWeight="bold" mb={2}>Message:</Text>
                                    <Text>{selectedInquiry.message}</Text>
                                </Box>

                                <FormControl>
                                    <FormLabel>Status</FormLabel>
                                    <Select 
                                        value={selectedInquiry.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="resolved">Resolved</option>
                                    </Select>
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
} 