import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadService = {
    // Upload property images
    uploadPropertyImages: async (files) => {
        const formData = new FormData();
        
        // Append each file to form data
        files.forEach(file => {
            formData.append('images', file);
        });
        
        const response = await axios.post(`${API_URL}/upload/property-images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-auth-token': localStorage.getItem('token')
            }
        });
        
        return response.data;
    }
}; 