import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const propertyService = {
    // Get all properties with filters
    getProperties: async (filters = {}) => {
        const params = new URLSearchParams();
        
        // Add filters to params
        if (filters.searchQuery) params.append('search', filters.searchQuery);
        if (filters.propertyType) params.append('type', filters.propertyType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.bedrooms) params.append('minBedrooms', filters.bedrooms);
        if (filters.bathrooms) params.append('minBathrooms', filters.bathrooms);
        
        // Add sorting
        if (filters.sortBy) {
            params.append('sortBy', filters.sortBy);
            params.append('sortOrder', filters.sortOrder || 'desc');
        }

        const response = await axios.get(`${API_URL}/properties?${params.toString()}`);
        return response.data;
    },

    // Get single property
    getProperty: async (id) => {
        const response = await axios.get(`${API_URL}/properties/${id}`);
        return response.data;
    },

    // Create property
    createProperty: async (propertyData) => {
        // Check if user is admin through JWT token
        const token = localStorage.getItem('token');
        const isAdmin = checkIfAdmin(token);
        
        // Use admin route for admin users, regular route for others
        const url = isAdmin 
            ? `${API_URL}/admin/properties` 
            : `${API_URL}/properties`;
            
        const response = await axios.post(url, propertyData, {
            headers: {
                'x-auth-token': token
            }
        });
        return response.data;
    },

    // Update property
    updateProperty: async (id, propertyData) => {
        // Check if user is admin through JWT token
        const token = localStorage.getItem('token');
        const isAdmin = checkIfAdmin(token);
        
        // Use admin route for admin users, regular route for others
        const url = isAdmin 
            ? `${API_URL}/admin/properties/${id}` 
            : `${API_URL}/properties/${id}`;
            
        const response = await axios.put(url, propertyData, {
            headers: {
                'x-auth-token': token
            }
        });
        return response.data;
    },

    // Delete property
    deleteProperty: async (id) => {
        // Check if user is admin through JWT token
        const token = localStorage.getItem('token');
        const isAdmin = checkIfAdmin(token);
        
        // Use admin route for admin users, regular route for others
        const url = isAdmin 
            ? `${API_URL}/admin/properties/${id}` 
            : `${API_URL}/properties/${id}`;
            
        const response = await axios.delete(url, {
            headers: {
                'x-auth-token': token
            }
        });
        return response.data;
    },

    // Send property inquiry
    sendInquiry: async (inquiryData) => {
        const response = await axios.post(`${API_URL}/contact/inquiry`, inquiryData);
        return response.data;
    },
    
    // Get user's inquiries
    getUserInquiries: async (email) => {
        const response = await axios.get(`${API_URL}/contact/user-inquiries?email=${email}`);
        return response.data;
    }
};

// Helper function to check if user is admin from JWT token
function checkIfAdmin(token) {
    if (!token) return false;
    
    try {
        // Parse the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user && payload.user.isAdmin === true;
    } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
    }
} 