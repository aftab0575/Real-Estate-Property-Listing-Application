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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye, FiMoreVertical, FiFilter } from 'react-icons/fi';

export default function AdminProperties() {
    const { user, loading: authLoading } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/auth');
            return;
        }

        if (user && user.isAdmin) {
            fetchProperties();
        }
    }, [user, authLoading, router]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await adminService.getProperties();
            setProperties(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load properties',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddProperty = () => {
        router.push('/admin/properties/add');
    };

    const handleEditProperty = (id) => {
        router.push(`/admin/properties/edit/${id}`);
    };

    const handleViewProperty = (id) => {
        router.push(`/properties/${id}`);
    };

    const handleDeleteClick = (property) => {
        setSelectedProperty(property);
        onOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedProperty) return;
        
        try {
            await adminService.deleteProperty(selectedProperty._id);
            setProperties(properties.filter(p => p._id !== selectedProperty._id));
            
            toast({
                title: 'Success',
                description: 'Property deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            onClose();
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

    const filteredProperties = properties.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Flex justify="space-between" align="center">
                    <Heading>Property Management</Heading>
                    <Button 
                        colorScheme="blue" 
                        leftIcon={<FiPlus />}
                        onClick={handleAddProperty}
                    >
                        Add Property
                    </Button>
                </Flex>

                <Box>
                    <InputGroup mb={4}>
                        <InputLeftElement pointerEvents="none">
                            <FiSearch />
                        </InputLeftElement>
                        <Input 
                            placeholder="Search properties by title, location, or type..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Title</Th>
                                    <Th>Price</Th>
                                    <Th>Location</Th>
                                    <Th>Type</Th>
                                    <Th>Beds/Baths</Th>
                                    <Th>Owner</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredProperties.length > 0 ? (
                                    filteredProperties.map((property) => (
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
                                            <Td>{property.bedrooms} / {property.bathrooms}</Td>
                                            <Td>{property.owner?.name || 'Unknown'}</Td>
                                            <Td>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        icon={<FiEye />}
                                                        aria-label="View property"
                                                        size="sm"
                                                        onClick={() => handleViewProperty(property._id)}
                                                    />
                                                    <IconButton
                                                        icon={<FiEdit />}
                                                        aria-label="Edit property"
                                                        size="sm"
                                                        onClick={() => handleEditProperty(property._id)}
                                                    />
                                                    <IconButton
                                                        icon={<FiTrash2 />}
                                                        aria-label="Delete property"
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteClick(property)}
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center">
                                            {searchTerm ? 'No properties found matching your search' : 'No properties found'}
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </VStack>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Are you sure you want to delete property: <strong>{selectedProperty?.title}</strong>?
                        </Text>
                        <Text mt={2} color="red.500">
                            This action cannot be undone.
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
} 