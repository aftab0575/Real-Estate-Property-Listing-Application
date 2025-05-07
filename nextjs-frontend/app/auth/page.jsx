'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Text,
    Link,
    useToast,
    Container,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Auth() {
    const [isLoading, setIsLoading] = useState(false);
    const { login, register: registerUser } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');

    const loginForm = useForm();
    const registerForm = useForm({
        watch: true
    });

    const password = registerForm.watch('password');

    const handleLogin = async (data) => {
        try {
            setIsLoading(true);
            await login(data.email, data.password);
            toast({
                title: 'Login successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            // Check if user is admin (email is hardcoded in this case)
            if (data.email === 'coresconnect@gmail.com') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.msg || 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (data) => {
        try {
            setIsLoading(true);
            await registerUser(data.name, data.email, data.password);
            toast({
                title: 'Registration successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            router.push('/dashboard');
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.msg || 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.sm" py={10}>
            <VStack spacing={8}>
                <Heading>Welcome</Heading>
                <Box w="100%" p={8} borderWidth={1} borderRadius="lg" bg={bgColor}>
                    <Tabs isFitted variant="enclosed">
                        <TabList mb="1em">
                            <Tab>Login</Tab>
                            <Tab>Register</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                                    <VStack spacing={4}>
                                        <FormControl isInvalid={!!loginForm.formState.errors.email}>
                                            <FormLabel>Email</FormLabel>
                                            <Input
                                                type="email"
                                                {...loginForm.register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address',
                                                    },
                                                })}
                                            />
                                            {loginForm.formState.errors.email && (
                                                <Text color="red.500" fontSize="sm">
                                                    {loginForm.formState.errors.email.message}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isInvalid={!!loginForm.formState.errors.password}>
                                            <FormLabel>Password</FormLabel>
                                            <Input
                                                type="password"
                                                {...loginForm.register('password', {
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Password must be at least 6 characters',
                                                    },
                                                })}
                                            />
                                            {loginForm.formState.errors.password && (
                                                <Text color="red.500" fontSize="sm">
                                                    {loginForm.formState.errors.password.message}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <Button
                                            type="submit"
                                            colorScheme="blue"
                                            width="100%"
                                            isLoading={isLoading}
                                        >
                                            Login
                                        </Button>
                                    </VStack>
                                </form>
                            </TabPanel>
                            <TabPanel>
                                <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                                    <VStack spacing={4}>
                                        <FormControl isInvalid={!!registerForm.formState.errors.name}>
                                            <FormLabel>Name</FormLabel>
                                            <Input
                                                {...registerForm.register('name', {
                                                    required: 'Name is required',
                                                    minLength: {
                                                        value: 2,
                                                        message: 'Name must be at least 2 characters',
                                                    },
                                                })}
                                            />
                                            {registerForm.formState.errors.name && (
                                                <Text color="red.500" fontSize="sm">
                                                    {registerForm.formState.errors.name.message}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isInvalid={!!registerForm.formState.errors.email}>
                                            <FormLabel>Email</FormLabel>
                                            <Input
                                                type="email"
                                                {...registerForm.register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address',
                                                    },
                                                })}
                                            />
                                            {registerForm.formState.errors.email && (
                                                <Text color="red.500" fontSize="sm">
                                                    {registerForm.formState.errors.email.message}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isInvalid={!!registerForm.formState.errors.password}>
                                            <FormLabel>Password</FormLabel>
                                            <Input
                                                type="password"
                                                {...registerForm.register('password', {
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Password must be at least 6 characters',
                                                    },
                                                })}
                                            />
                                            {registerForm.formState.errors.password && (
                                                <Text color="red.500" fontSize="sm">
                                                    {registerForm.formState.errors.password.message}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <FormControl isInvalid={!!registerForm.formState.errors.confirmPassword}>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <Input
                                                type="password"
                                                {...registerForm.register('confirmPassword', {
                                                    required: 'Please confirm your password',
                                                    validate: value =>
                                                        value === password || 'The passwords do not match',
                                                })}
                                            />
                                            {registerForm.formState.errors.confirmPassword && (
                                                <Text color="red.500" fontSize="sm">
                                                    {registerForm.formState.errors.confirmPassword.message}
                                                </Text>
                                            )}
                                        </FormControl>

                                        <Button
                                            type="submit"
                                            colorScheme="blue"
                                            width="100%"
                                            isLoading={isLoading}
                                        >
                                            Register
                                        </Button>
                                    </VStack>
                                </form>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>

                <Link as={NextLink} href="/forgot-password" color="blue.500">
                    Forgot Password?
                </Link>
            </VStack>
        </Container>
    );
} 