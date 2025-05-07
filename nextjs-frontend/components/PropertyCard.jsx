'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardBody,
    Image,
    Heading,
    Text,
    HStack,
    VStack,
} from '@chakra-ui/react';
import { FiMapPin, FiHome, FiUser, FiDroplet } from 'react-icons/fi';

const PropertyCard = ({ property }) => {
    const router = useRouter();
    
    const handleClick = () => {
        router.push(`/properties/${property._id}`);
    };
    
    // Helper function to ensure image URL is complete
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/400x300';
        
        // If the URL starts with '/uploads', it's a relative path from the backend
        if (imageUrl.startsWith('/uploads')) {
            return `http://localhost:5000${imageUrl}`;
        }
        
        // Otherwise, return the URL as is (might be a full URL)
        return imageUrl;
    };
    
    return (
        <Card 
            overflow="hidden" 
            variant="outline" 
            cursor="pointer" 
            onClick={handleClick}
            _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.2s' }}
        >
            <Image
                src={property.images && property.images.length > 0 
                    ? getImageUrl(property.images[0]) 
                    : 'https://via.placeholder.com/400x300'}
                alt={property.title}
                height="200px"
                objectFit="cover"
            />
            <CardBody>
                <VStack align="start" spacing={2}>
                    <Heading size="md">{property.title}</Heading>
                    <Text color="blue.600" fontWeight="bold">
                        ${property.price.toLocaleString()}
                    </Text>
                    <HStack spacing={4}>
                        <HStack>
                            <FiMapPin />
                            <Text>{property.location}</Text>
                        </HStack>
                        <HStack>
                            <FiHome />
                            <Text>{property.type}</Text>
                        </HStack>
                    </HStack>
                    <HStack spacing={4}>
                        <HStack>
                            <FiUser />
                            <Text>{property.bedrooms} beds</Text>
                        </HStack>
                        <HStack>
                            <FiDroplet />
                            <Text>{property.bathrooms} baths</Text>
                        </HStack>
                    </HStack>
                </VStack>
            </CardBody>
        </Card>
    );
};

export default PropertyCard; 