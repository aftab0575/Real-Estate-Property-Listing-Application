'use client';

import React, { useState } from 'react';
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
    Heading
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { forgotPassword } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            await forgotPassword(data.email);
            toast({
                title: 'Password reset email sent',
                description: 'Please check your email for instructions to reset your password.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
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
                <Heading>Forgot Password</Heading>
                <Box w="100%" p={8} borderWidth={1} borderRadius="lg">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4}>
                            <FormControl isInvalid={!!errors.email}>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <Text color="red.500" fontSize="sm">
                                        {errors.email.message}
                                    </Text>
                                )}
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="blue"
                                width="100%"
                                isLoading={isLoading}
                            >
                                Send Reset Link
                            </Button>
                        </VStack>
                    </form>
                </Box>

                <Text>
                    Remember your password?{' '}
                    <Link as={NextLink} href="/login" color="blue.500">
                        Login here
                    </Link>
                </Text>
            </VStack>
        </Container>
    );
} 