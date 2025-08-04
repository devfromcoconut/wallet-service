import axios from 'axios';

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string; // ISO Alpha-2 code, e.g., 'US', 'NG'
  postal_code: string;
}

interface BackgroundDocument {
  // Define document structure based on API requirements
  // Example: document_id: string, document_type: string, etc.
  [key: string]: any;
}

export interface ApiPayload {
  name_first: string;  
  name_last: string;
  name_other: string;
  phone: string; 
  email: string;
  dob: string; 
  id_level?: string; 
  id_type?: string; 
  id_number: string;
  id_country: string; // ISO Alpha-2 code, e.g., 'US', 'NG'
  bank_id_number?: string; // Optional, BVN for Nigerian ID holders
  kyc_level?: string; // Defaults to 'basic'
  address: Address;
  background_information?: {
    documents?: BackgroundDocument[];
  };
}

const apiClient = axios.create({
  baseURL: 'https://api.useoval.com', 
  headers: {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${process.env.GRAPH_SECRET_KEY}`,
  },
});

export const submitKycData = async (payload: ApiPayload) => {
  try {
    // Set default values if not provided
    const finalPayload: ApiPayload = {
      ...payload,
      id_level: payload.id_level || 'primary',
      id_type: payload.id_type || 'passport',
      kyc_level: payload.kyc_level || 'basic',
    };

    const response = await apiClient.post('/person', finalPayload);
    return response.data;
  } catch (error) {
    console.error('Error submitting KYC data:', error);
    throw error;       
  }
};