'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Heading,
    Text,
    Grid,
    GridItem,
    Button,
    VStack,
    HStack,
    Badge,
    Image,
    Flex,
    Spinner,
    useToast,
    Divider,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    IconButton,
    useBreakpointValue,
} from '@chakra-ui/react';
import { FiUser, FiDroplet, FiHome, FiMapPin, FiMaximize2, FiDollarSign, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { propertyService } from '../../../services/propertyService';
import { useAuth } from '../../../context/AuthContext';

export default function PropertyDetail() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { user, loading: authLoading } = useAuth();

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

        // Fetch property only if user is authenticated and not an admin
        if (user && !user.isAdmin) {
            fetchProperty();
        }
    }, [user, authLoading, router, params.id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const data = await propertyService.getProperty(params.id);
            setProperty(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch property details',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    const handleNextImage = () => {
        if (!property || !property.images || property.images.length <= 1) return;
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % property.images.length);
    };

    const handlePrevImage = () => {
        if (!property || !property.images || property.images.length <= 1) return;
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await propertyService.sendInquiry({
                ...contactForm,
                propertyId: property._id,
                propertyTitle: property.title
            });
            
            toast({
                title: 'Inquiry Sent',
                description: 'Your inquiry has been sent successfully. The agent will contact you shortly.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            
            // Reset form
            setContactForm({
                name: '',
                email: '',
                phone: '',
                message: '',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send inquiry. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Helper function to ensure image URL is complete
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/800x600';
        
        // If the URL starts with '/uploads', it's a relative path from the backend
        if (imageUrl.startsWith('/uploads')) {
            return `http://localhost:5000${imageUrl}`;
        }
        
        // Otherwise, return the URL as is (might be a full URL)
        return imageUrl;
    };

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

    if (loading) {
        return (
            <Container maxW="container.xl" py={10}>
                <Flex justify="center" align="center" minH="50vh">
                    <Spinner size="xl" />
                </Flex>
            </Container>
        );
    }

    if (!property) {
        return (
            <Container maxW="container.xl" py={10}>
                <VStack spacing={4}>
                    <Heading>Property Not Found</Heading>
                    <Text>The property you're looking for does not exist or has been removed.</Text>
                </VStack>
            </Container>
        );
    }

    // Google Maps URL with the property location
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(property.location)}`;

    // For demo purposes, if no images are available
    const placeholderImages = [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb',
        'https://images.unsplash.com/photo-1513584684374-8bab748fbf90'
    ];
    
    const images = property.images && property.images.length > 0 
        ? property.images.map(img => getImageUrl(img))
        : placeholderImages;

    return (
        <Container maxW="container.xl" py={10}>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
                {/* Left side - Property details */}
                <GridItem>
                    <VStack spacing={6} align="stretch">
                        {/* Image Gallery */}
                        <Box position="relative" height={{ base: '250px', md: '400px' }} overflow="hidden" borderRadius="md">
                            <Image 
                                src={images[currentImageIndex]} 
                                alt={`Property image ${currentImageIndex + 1}`}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <IconButton
                                        icon={<FiChevronLeft />}
                                        aria-label="Previous image"
                                        position="absolute"
                                        left={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        onClick={handlePrevImage}
                                        colorScheme="blackAlpha"
                                    />
                                    <IconButton
                                        icon={<FiChevronRight />}
                                        aria-label="Next image"
                                        position="absolute"
                                        right={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        onClick={handleNextImage}
                                        colorScheme="blackAlpha"
                                    />
                                </>
                            )}
                            <Badge position="absolute" bottom={2} right={2} colorScheme="blue">
                                {currentImageIndex + 1} / {images.length}
                            </Badge>
                        </Box>

                        {/* Property Title and Price */}
                        <Box>
                            <Heading size="lg">{property.title}</Heading>
                            <HStack mt={2}>
                                <FiMapPin />
                                <Text>{property.location}</Text>
                            </HStack>
                            <Heading size="lg" color="blue.500" mt={2}>
                                ${property.price.toLocaleString()}
                            </Heading>
                        </Box>

                        {/* Property Features */}
                        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Flex direction="column" align="center">
                                    <FiUser size={24} />
                                    <Text fontWeight="bold" mt={2}>{property.bedrooms} Bedrooms</Text>
                                </Flex>
                            </Box>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Flex direction="column" align="center">
                                    <FiDroplet size={24} />
                                    <Text fontWeight="bold" mt={2}>{property.bathrooms} Bathrooms</Text>
                                </Flex>
                            </Box>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Flex direction="column" align="center">
                                    <FiMaximize2 size={24} />
                                    <Text fontWeight="bold" mt={2}>{property.area} sqft</Text>
                                </Flex>
                            </Box>
                            <Box p={4} borderWidth={1} borderRadius="md">
                                <Flex direction="column" align="center">
                                    <FiHome size={24} />
                                    <Text fontWeight="bold" mt={2}>{property.type}</Text>
                                </Flex>
                            </Box>
                        </Grid>

                        {/* Property Description */}
                        <Box>
                            <Heading size="md" mb={2}>Description</Heading>
                            <Text>{property.description}</Text>
                        </Box>

                        {/* Features List */}
                        {property.features && property.features.length > 0 && (
                            <Box>
                                <Heading size="md" mb={2}>Features</Heading>
                                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
                                    {property.features.map((feature, index) => (
                                        <Box key={index} p={2} borderRadius="md" bg="gray.50">
                                            <Text>{feature}</Text>
                                        </Box>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Google Maps */}
                        <Box>
                            <Heading size="md" mb={2}>Location</Heading>
                            <Box borderRadius="md" overflow="hidden" height="300px">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    src={mapUrl}
                                    allowFullScreen
                                    title="Property Location"
                                ></iframe>
                            </Box>
                        </Box>
                    </VStack>
                </GridItem>

                {/* Right side - Contact form */}
                <GridItem>
                    <Box position="sticky" top="100px">
                        <Box p={6} borderWidth={1} borderRadius="md" shadow="md">
                            <Heading size="md" mb={4}>Interested in this property?</Heading>
                            <Text mb={4}>Fill out this form to schedule a viewing or ask a question</Text>
                            
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Name</FormLabel>
                                        <Input 
                                            name="name" 
                                            value={contactForm.name} 
                                            onChange={handleFormChange} 
                                        />
                                    </FormControl>
                                    
                                    <FormControl isRequired>
                                        <FormLabel>Email</FormLabel>
                                        <Input 
                                            name="email" 
                                            type="email" 
                                            value={contactForm.email} 
                                            onChange={handleFormChange} 
                                        />
                                    </FormControl>
                                    
                                    <FormControl>
                                        <FormLabel>Phone</FormLabel>
                                        <Input 
                                            name="phone" 
                                            value={contactForm.phone} 
                                            onChange={handleFormChange} 
                                        />
                                    </FormControl>
                                    
                                    <FormControl isRequired>
                                        <FormLabel>Message</FormLabel>
                                        <Textarea 
                                            name="message" 
                                            value={contactForm.message} 
                                            onChange={handleFormChange} 
                                            placeholder="I'm interested in viewing this property..."
                                            rows={5}
                                        />
                                    </FormControl>
                                    
                                    <Button 
                                        type="submit" 
                                        colorScheme="blue" 
                                        width="100%"
                                    >
                                        Send Message
                                    </Button>
                                </VStack>
                            </form>
                        </Box>
                    </Box>
                </GridItem>
            </Grid>
        </Container>
    );
} 