'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../context/AuthContext';
import { propertyService } from '../../../../services/propertyService';
import { uploadService } from '../../../../services/uploadService';
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    VStack,
    HStack,
    Text,
    SimpleGrid,
    FormErrorMessage,
    useToast,
    InputGroup,
    InputRightAddon,
    Tag,
    TagLabel,
    TagCloseButton,
    Flex,
    Spinner,
    IconButton,
    Image,
    Center,
    Progress,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
import { FiPlus, FiX, FiUpload, FiImage, FiLink } from 'react-icons/fi';

export default function AddProperty() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [features, setFeatures] = useState([]);
    const [newFeature, setNewFeature] = useState('');
    const [imageURLs, setImageURLs] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showURLInput, setShowURLInput] = useState(false);
    const fileInputRef = useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [previewImage, setPreviewImage] = useState(null);
    const router = useRouter();
    const toast = useToast();
    
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/auth');
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            // Combine uploaded image paths and manually entered URLs
            const allImages = [...imageURLs, ...uploadedFiles];
            
            if (allImages.length === 0) {
                toast({
                    title: 'Error',
                    description: 'Please add at least one image',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                setLoading(false);
                return;
            }

            // Prepare property data
            const propertyData = {
                ...data,
                price: Number(data.price),
                bedrooms: Number(data.bedrooms),
                bathrooms: Number(data.bathrooms),
                area: Number(data.area),
                features,
                images: allImages
            };

            await propertyService.createProperty(propertyData);
            
            toast({
                title: 'Success',
                description: 'Property created successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            router.push('/admin/properties');
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.msg || 'Failed to create property',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const addFeature = () => {
        if (newFeature.trim() !== '') {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            setUploadingImages(true);
            // Simulate progress
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await uploadService.uploadPropertyImages(files);
            clearInterval(interval);
            setUploadProgress(100);
            
            // Add the new file URLs to the state
            setUploadedFiles(prev => [...prev, ...response.files]);
            
            toast({
                title: 'Images Uploaded',
                description: response.message,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Upload Error',
                description: error.response?.data?.msg || 'Failed to upload images',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setUploadingImages(false);
            setUploadProgress(0);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const addImageURL = (url) => {
        if (url.trim() !== '') {
            setImageURLs([...imageURLs, url.trim()]);
            setShowURLInput(false);
        }
    };

    const removeImage = (index, type) => {
        if (type === 'url') {
            setImageURLs(imageURLs.filter((_, i) => i !== index));
        } else {
            setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
        }
    };

    const handlePreviewImage = (imageUrl) => {
        setPreviewImage(imageUrl);
        onOpen();
    };

    if (authLoading) {
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
        <Container maxW="container.lg" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading>Add New Property</Heading>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <VStack spacing={6} align="stretch">
                        {/* Basic Information */}
                        <Box p={6} borderWidth="1px" borderRadius="lg">
                            <Heading size="md" mb={4}>Basic Information</Heading>
                            
                            <FormControl isInvalid={errors.title} mb={4}>
                                <FormLabel>Property Title</FormLabel>
                                <Input 
                                    {...register('title', { required: 'Title is required' })} 
                                />
                                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={errors.description} mb={4}>
                                <FormLabel>Description</FormLabel>
                                <Textarea 
                                    {...register('description', { required: 'Description is required' })}
                                    rows={5} 
                                />
                                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={errors.location} mb={4}>
                                <FormLabel>Location</FormLabel>
                                <Input 
                                    {...register('location', { required: 'Location is required' })} 
                                />
                                <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={errors.type} mb={4}>
                                <FormLabel>Property Type</FormLabel>
                                <Select 
                                    placeholder="Select property type"
                                    {...register('type', { required: 'Property type is required' })}
                                >
                                    <option value="House">House</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Condo">Condo</option>
                                </Select>
                                <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
                            </FormControl>
                        </Box>

                        {/* Details & Features */}
                        <Box p={6} borderWidth="1px" borderRadius="lg">
                            <Heading size="md" mb={4}>Details & Features</Heading>
                            
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={4}>
                                <FormControl isInvalid={errors.price}>
                                    <FormLabel>Price ($)</FormLabel>
                                    <NumberInput min={0} step={1000}>
                                        <NumberInputField 
                                            {...register('price', { 
                                                required: 'Price is required',
                                                min: {
                                                    value: 0,
                                                    message: 'Price must be positive'
                                                }
                                            })} 
                                        />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.area}>
                                    <FormLabel>Area (sqft)</FormLabel>
                                    <NumberInput min={0}>
                                        <NumberInputField 
                                            {...register('area', { 
                                                required: 'Area is required',
                                                min: {
                                                    value: 0,
                                                    message: 'Area must be positive'
                                                }
                                            })} 
                                        />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>{errors.area?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.bedrooms}>
                                    <FormLabel>Bedrooms</FormLabel>
                                    <NumberInput min={1}>
                                        <NumberInputField 
                                            {...register('bedrooms', { 
                                                required: 'Bedrooms is required',
                                                min: {
                                                    value: 1,
                                                    message: 'Minimum 1 bedroom'
                                                }
                                            })} 
                                        />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>{errors.bedrooms?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.bathrooms}>
                                    <FormLabel>Bathrooms</FormLabel>
                                    <NumberInput min={1}>
                                        <NumberInputField 
                                            {...register('bathrooms', { 
                                                required: 'Bathrooms is required',
                                                min: {
                                                    value: 1,
                                                    message: 'Minimum 1 bathroom'
                                                }
                                            })} 
                                        />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>{errors.bathrooms?.message}</FormErrorMessage>
                                </FormControl>
                            </SimpleGrid>

                            <FormControl mb={4}>
                                <FormLabel>Features</FormLabel>
                                <InputGroup>
                                    <Input 
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        placeholder="Add a feature (e.g., Swimming Pool)"
                                    />
                                    <InputRightAddon p={0}>
                                        <Button 
                                            onClick={addFeature} 
                                            h="100%" 
                                            borderLeftRadius={0}
                                            leftIcon={<FiPlus />}
                                        >
                                            Add
                                        </Button>
                                    </InputRightAddon>
                                </InputGroup>
                            </FormControl>

                            <Box mb={4}>
                                <Flex wrap="wrap" gap={2}>
                                    {features.map((feature, index) => (
                                        <Tag key={index} size="lg" colorScheme="blue" borderRadius="full">
                                            <TagLabel>{feature}</TagLabel>
                                            <TagCloseButton onClick={() => removeFeature(index)} />
                                        </Tag>
                                    ))}
                                </Flex>
                            </Box>
                        </Box>

                        {/* Images */}
                        <Box p={6} borderWidth="1px" borderRadius="lg">
                            <Heading size="md" mb={4}>Images</Heading>
                            
                            <Text mb={4}>Add property images (at least one required)</Text>
                            
                            {/* Upload controls */}
                            <VStack spacing={4} align="stretch" mb={6}>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                />
                                
                                <HStack>
                                    <Button 
                                        leftIcon={<FiUpload />}
                                        colorScheme="blue"
                                        onClick={() => fileInputRef.current.click()}
                                        isLoading={uploadingImages}
                                        loadingText="Uploading..."
                                        isDisabled={uploadingImages}
                                    >
                                        Upload Images
                                    </Button>
                                    
                                    <Button
                                        leftIcon={<FiLink />}
                                        variant="outline"
                                        onClick={() => setShowURLInput(true)}
                                    >
                                        Add Image URL
                                    </Button>
                                </HStack>
                                
                                {uploadingImages && (
                                    <Box>
                                        <Text mb={1}>Uploading: {uploadProgress}%</Text>
                                        <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                                    </Box>
                                )}
                                
                                {showURLInput && (
                                    <HStack>
                                        <Input 
                                            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                                            id="imageUrl"
                                        />
                                        <Button
                                            onClick={() => addImageURL(document.getElementById('imageUrl').value)}
                                        >
                                            Add
                                        </Button>
                                        <IconButton
                                            icon={<FiX />}
                                            aria-label="Cancel"
                                            onClick={() => setShowURLInput(false)}
                                        />
                                    </HStack>
                                )}
                            </VStack>
                            
                            {/* Display uploaded images */}
                            {(uploadedFiles.length > 0 || imageURLs.length > 0) && (
                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        {uploadedFiles.length + imageURLs.length} {(uploadedFiles.length + imageURLs.length) === 1 ? 'Image' : 'Images'} Added:
                                    </Text>
                                    
                                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                                        {uploadedFiles.map((file, index) => (
                                            <Box 
                                                key={`file-${index}`} 
                                                borderWidth="1px" 
                                                borderRadius="md" 
                                                overflow="hidden"
                                                position="relative"
                                            >
                                                <Image 
                                                    src={`http://localhost:5000${file}`}
                                                    alt={`Uploaded property image ${index + 1}`}
                                                    height="150px"
                                                    width="100%"
                                                    objectFit="cover"
                                                    cursor="pointer"
                                                    onClick={() => handlePreviewImage(`http://localhost:5000${file}`)}
                                                />
                                                <IconButton
                                                    icon={<FiX />}
                                                    aria-label="Remove image"
                                                    position="absolute"
                                                    top={1}
                                                    right={1}
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={() => removeImage(index, 'file')}
                                                />
                                            </Box>
                                        ))}
                                        
                                        {imageURLs.map((url, index) => (
                                            <Box 
                                                key={`url-${index}`} 
                                                borderWidth="1px" 
                                                borderRadius="md" 
                                                overflow="hidden"
                                                position="relative"
                                            >
                                                <Image 
                                                    src={url}
                                                    alt={`Property image URL ${index + 1}`}
                                                    height="150px"
                                                    width="100%"
                                                    objectFit="cover"
                                                    cursor="pointer"
                                                    onClick={() => handlePreviewImage(url)}
                                                    fallback={
                                                        <Center h="150px" bg="gray.100">
                                                            <VStack>
                                                                <FiImage size={40} />
                                                                <Text>URL Image</Text>
                                                            </VStack>
                                                        </Center>
                                                    }
                                                />
                                                <IconButton
                                                    icon={<FiX />}
                                                    aria-label="Remove image"
                                                    position="absolute"
                                                    top={1}
                                                    right={1}
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={() => removeImage(index, 'url')}
                                                />
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            )}
                        </Box>

                        <Button 
                            colorScheme="blue" 
                            size="lg" 
                            type="submit"
                            isLoading={loading}
                            leftIcon={<FiUpload />}
                        >
                            Create Property
                        </Button>
                    </VStack>
                </form>
            </VStack>
            
            {/* Image Preview Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Image Preview</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {previewImage && (
                            <Image 
                                src={previewImage}
                                alt="Preview"
                                maxH="70vh"
                                mx="auto"
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
} 