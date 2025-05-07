'use client';

import React from 'react';
import {
    Box,
    Flex,
    Button,
    HStack,
    useColorModeValue,
    Container,
    Text,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiHome, FiUsers, FiDatabase, FiMail } from 'react-icons/fi';

export default function Navigation() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleLogout = () => {
        logout();
        router.push('/auth');
    };

    const handleMenuItemClick = (path) => {
        router.push(path);
    };

    return (
        <Box
            bg={bg}
            px={4}
            borderBottom="1px"
            borderColor={borderColor}
            position="sticky"
            top={0}
            zIndex={1000}
        >
            <Container maxW="container.xl">
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    <HStack spacing={8} alignItems="center">
                        {user ? (
                            <>
                                {user.isAdmin ? (
                                    <Menu>
                                        <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="ghost">
                                            Admin Dashboard
                                        </MenuButton>
                                        <MenuList>
                                            <MenuItem 
                                                icon={<FiHome />} 
                                                onClick={() => handleMenuItemClick('/admin')}
                                            >
                                                Dashboard
                                            </MenuItem>
                                            <MenuItem 
                                                icon={<FiHome />} 
                                                onClick={() => handleMenuItemClick('/admin/properties')}
                                            >
                                                Properties
                                            </MenuItem>
                                            <MenuItem 
                                                icon={<FiUsers />} 
                                                onClick={() => handleMenuItemClick('/admin/users')}
                                            >
                                                Users
                                            </MenuItem>
                                            <MenuItem 
                                                icon={<FiMail />} 
                                                onClick={() => handleMenuItemClick('/admin/inquiries')}
                                            >
                                                Inquiries
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                ) : (
                                    <>
                                        <Link href="/dashboard" passHref>
                                            <Button variant="ghost">Dashboard</Button>
                                        </Link>
                                        <Link href="/properties" passHref>
                                            <Button variant="ghost">Properties</Button>
                                        </Link>
                                    </>
                                )}
                            </>
                        ) : (
                            <Link href="/" passHref>
                                <Button variant="ghost">Home</Button>
                            </Link>
                        )}
                    </HStack>

                    <HStack>
                        {user ? (
                            <>
                                <Text fontSize="sm" mr={2}>
                                    Welcome, {user.name}
                                    {user.isAdmin && (
                                        <Badge ml={2} colorScheme="red">
                                            Admin
                                        </Badge>
                                    )}
                                </Text>
                                <Button onClick={handleLogout} size="sm" variant="outline">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/auth" passHref>
                                <Button colorScheme="blue" size="sm">
                                    Login / Register
                                </Button>
                            </Link>
                        )}
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
} 