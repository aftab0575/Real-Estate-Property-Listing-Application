import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const adminService = {
    // Get dashboard data
    getDashboardData: async () => {
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Get all users
    getUsers: async () => {
        const response = await axios.get(`${API_URL}/admin/users`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Get all properties
    getProperties: async () => {
        const response = await axios.get(`${API_URL}/admin/properties`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Delete a user
    deleteUser: async (userId) => {
        const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Delete a property
    deleteProperty: async (propertyId) => {
        const response = await axios.delete(`${API_URL}/admin/properties/${propertyId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Get all inquiries
    getInquiries: async () => {
        const response = await axios.get(`${API_URL}/contact/inquiries`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Get single inquiry
    getInquiry: async (inquiryId) => {
        const response = await axios.get(`${API_URL}/contact/inquiries/${inquiryId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    },

    // Update inquiry status
    updateInquiry: async (inquiryId, data) => {
        const response = await axios.put(`${API_URL}/contact/inquiries/${inquiryId}`, data, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    }
}; 