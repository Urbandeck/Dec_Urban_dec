const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface CompanyInfo {
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  supportEmail: string;
  salesEmail: string;
  privacyEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  businessHours: Record<string, string>;
  socialLinks: Record<string, string>;
  missionStatement: string;
  aboutUs: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface ShippingInfo {
  id: number;
  zone: string;
  deliveryTime: string;
  expressDelivery: string;
  freeShippingThreshold: number;
  standardRate: number;
  expressRate: number;
}

export interface ContentPage {
  id: number;
  slug: string;
  title: string;
  metaDescription: string;
  content: string;
  data: any;
}

export interface SiteConfig {
  siteName: string;
  companyName: string;
  tagline: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    supportEmail: string;
    salesEmail: string;
    privacyEmail: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  businessHours: Record<string, string>;
  socialLinks: Record<string, string>;
  features: Array<{
    title: string;
    description: string;
  }>;
  policies: {
    freeShipping: string;
    returnWindow: string;
    warranty: string;
    support: string;
  };
}

export const contentApi = {
  async getPageContent(slug: string): Promise<ContentPage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/page/${slug}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async getCompanyInfo(): Promise<CompanyInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/company-info`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async getFAQs(category?: string): Promise<FAQ[]> {
    try {
      const url = category
        ? `${API_BASE_URL}/api/content/faqs?category=${category}`
        : `${API_BASE_URL}/api/content/faqs`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async getShippingInfo(): Promise<ShippingInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/shipping-info`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async getWarrantyInfo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/warranty-info`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async getReturnPolicy(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/return-policy`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async getHelpTopics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/help-topics`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return {};
    }
  },

  async getSiteConfig(): Promise<SiteConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/site-config`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }
};