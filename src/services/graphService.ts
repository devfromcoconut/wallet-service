
import axios, { AxiosInstance } from 'axios';
import { env } from '../utils/envValidator';

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface BackgroundDocument {
  [key: string]: any;
}

export interface PersonPayload {
  name_first: string;
  name_last: string;
  name_other: string;
  phone: string;
  email: string;
  dob: string;
  id_level?: string;
  id_type?: string;
  id_number: string;
  id_country: string;
  bank_id_number?: string;
  kyc_level?: string;
  address: Address;
  // address_line1: string;
  // address_city: string;
  // address_state: string;
  // address_country: string;
  // line1: string;
  // city: string;
  // state: string;
  // country: string;
  // postal_code: string;
  documents: {
    issue_date: string;
    expiry_date: string;
    url: string;
    type: string;
  }[]
  background_information?: {
    documents?: BackgroundDocument[];
  };
}


export interface CreateAccountParams {
  business_id?: string;
  person_id?: string;
  label: string;
  currency?: string;
  autosweep_enabled?: boolean;
}

export interface IGraphService {
  createAccount(params: CreateAccountParams): Promise<any>;
  createBusiness(payload: BusinessPayload): Promise<any>;
  processBankTransfer(transferPayload: any): Promise<any>;
}

export interface BusinessPayload {
  owner_id: string;
  name: string;
  business_type: string;
  industry: string;
  id_type: string;
  id_number: string;
  id_country: string;
  id_upload: string;
  id_level: string;
  dof: string;
  contact_phone: string;
  contact_email: string;
  address: Address;
}


export class GraphService implements IGraphService {
  async createBusiness(payload: BusinessPayload): Promise<any> {
    try {
      const response = await this.apiClient.post('/business', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }
  async createAccount(params: CreateAccountParams): Promise<any> {
    try {
      const { business_id, person_id, label, currency = 'NGN', autosweep_enabled = false } = params;
      // Only one of business_id or person_id should be present
      const payload: any = {
        label,
        currency,
        autosweep_enabled,
      };
      if (business_id) {
        payload.business_id = business_id;
      } else if (person_id) {
        payload.person_id = person_id;
      } else {
        throw new Error('Either business_id or person_id must be provided');
      }
      const response = await this.apiClient.post('/bank_account', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api.useoval.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GRAPH_SECRET_KEY}`,
      },
    });
  }

  async createPerson(payload: PersonPayload): Promise<any> {
    try {
      const finalPayload: PersonPayload = {
        ...payload,
        // id_level: payload.id_level || 'primary',
        id_type: payload.id_type || 'passport',
        kyc_level: payload.kyc_level || 'basic',
      };
      console.log('Creating person with payload: ', JSON.stringify(finalPayload))
      const response = await this.apiClient.post('/person', finalPayload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating account (KYC):', error?.response.data || error?.response || error?.message);
      throw error;
    }
  }


  async processBankTransfer(transferPayload: any): Promise<any> {
    try {
      // TODO: Implement actual bank transfer logic and endpoint
      const response = await this.apiClient.post('/bank/transfer', transferPayload);
      return response.data;
    } catch (error) {
      console.error('Error processing bank transfer:', error);
      throw error;
    }
  }
}