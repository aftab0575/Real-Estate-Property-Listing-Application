'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Grid,
    GridItem,
    Heading,
    VStack,
    HStack,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    useToast,
    Text,
    Flex,
    IconButton,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    useBreakpointValue,
    Spinner,
} from '@chakra-ui/react';
import { FiFilter, FiSearch, FiDollarSign } from 'react-icons/fi';
import { propertyService } from '../../services/propertyService';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';

export default function Properties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchQuery: '',
        propertyType: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to auth page if user is not authenticated
        if (!authLoading && !user) {
            router.push('/auth');
            return;
        }

        // Redirect admin users to admin dashboard
        if (!authLoading && user && user.isAdmin) {
            router.push('/admin');
            return;
        }

        // Fetch properties only if user is authenticated and not an admin
        if (user && !user.isAdmin) {
            fetchProperties();
        }
    }, [user, authLoading, router, filters, sortBy, sortOrder]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await propertyService.getProperties({
                ...filters,
                sortBy,
                sortOrder
            });
            setProperties(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch properties',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSortChange = (value) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    };

    const FilterDrawer = () => (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Filter Properties</DrawerHeader>
                <DrawerBody>
                    <VStack spacing={4}>
                        <Box w="100%">
                            <Text mb={2}>Property Type</Text>
                            <Select
                                value={filters.propertyType}
                                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="House">House</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Condo">Condo</option>
                            </Select>
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Price Range</Text>
                            <HStack>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FiDollarSign />
                                    </InputLeftElement>
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                </InputGroup>
                                <Text>-</Text>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FiDollarSign />
                                    </InputLeftElement>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </InputGroup>
                            </HStack>
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Bedrooms</Text>
                            <Select
                                value={filters.bedrooms}
                                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                            </Select>
                        </Box>
                        <Box w="100%">
                            <Text mb={2}>Bathrooms</Text>
                            <Select
                                value={filters.bathrooms}
                                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                            </Select>
                        </Box>
                        <Button colorScheme="blue" onClick={onClose} w="100%">
                            Apply Filters
                        </Button>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );

    // Show loading spinner while checking authentication
    if (authLoading) {
        return (
            <Container maxW="container.xl" py={10}>
                <Flex justify="center" align="center" minH="50vh">
                    <Spinner size="xl" />
                </Flex>
            </Container>
        );
    }

    // Don't render anything if user is not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading>Property Listings</Heading>

                {/* Search and Filter Controls */}
                <HStack>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <FiSearch />
                        </InputLeftElement>
                        <Input
                            placeholder="Search by location, title..."
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        />
                    </InputGroup>
                    {isMobile ? (
                        <IconButton
                            icon={<FiFilter />}
                            aria-label="Filter properties"
                            onClick={onOpen}
                        />
                    ) : (
                        <>
                            <Select
                                w="200px"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </Select>
                            <Button leftIcon={<FiFilter />} onClick={onOpen}>
                                Filters
                            </Button>
                        </>
                    )}
                </HStack>

                {/* Property Grid */}
                {loading ? (
                    <Flex justify="center" align="center" py={10}>
                        <Spinner size="xl" />
                    </Flex>
                ) : (
                    <Grid
                        templateColumns={{
                            base: '1fr',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                        }}
                        gap={6}
                    >
                        {properties.map((property) => (
                            <GridItem key={property._id}>
                                <PropertyCard property={property} />
                            </GridItem>
                        ))}
                    </Grid>
                )}

                {!loading && properties.length === 0 && (
                    <Text textAlign="center" py={10}>
                        No properties found matching your criteria
                    </Text>
                )}
            </VStack>

            <FilterDrawer />
        </Container>
    );
} 