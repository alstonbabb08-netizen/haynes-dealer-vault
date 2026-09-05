/**
 * Parts Ordering Service - TypeScript/React Native
 * Client-side service for communicating with the parts ordering API
 * Handles parts search, referral links, and diagnosis integration
 */

import axios, { AxiosInstance } from 'axios';

interface PartLink {
  provider: string;
  url: string;
  icon: string;
  priority: number;
}

interface Part {
  name: string;
  description?: string;
  part_number?: string;
  estimated_price?: number;
  links: PartLink[];
}

interface DiagnosisPart {
  name: string;
  description?: string;
  part_number?: string;
  estimated_price?: number;
}

interface PartsSearchRequest {
  part_name: string;
  part_number?: string;
  manufacturer?: string;
  include_oem?: boolean;
}

interface DiagnosisSuggestionsRequest {
  diagnosis_id: string;
  parts_needed: DiagnosisPart[];
  manufacturer?: string;
  vin?: string;
}

interface DiagnosisSuggestionsResponse {
  parts: Part[];
  suppliers: string[];
  total_parts: number;
  estimated_total_cost?: number;
}

class PartsOrderingService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search for parts across all suppliers
   * @param partName - Name of the part to search
   * @param partNumber - Optional OEM or aftermarket part number
   * @param manufacturer - Optional vehicle manufacturer for OEM prioritization
   * @param includeOEM - Whether to include OEM manufacturer links
   * @returns Array of supplier links with referral URLs
   */
  async searchParts(
    partName: string,
    partNumber?: string,
    manufacturer?: string,
    includeOEM: boolean = true
  ): Promise<PartLink[]> {
    try {
      if (!partName || partName.trim().length === 0) {
        throw new Error('Part name is required');
      }

      const response = await this.api.post<PartLink[]>('/api/parts/search', {
        part_name: partName,
        part_number: partNumber,
        manufacturer: manufacturer,
        include_oem: includeOEM,
      });

      return response.data;
    } catch (error) {
      console.error('Error searching parts:', error);
      throw error;
    }
  }

  /**
   * Search for parts using query parameters (GET endpoint)
   * @param partName - Name of the part to search
   * @param partNumber - Optional part number
   * @param manufacturer - Optional vehicle manufacturer
   * @param includeOEM - Whether to include OEM links
   * @returns Array of supplier links
   */
  async searchPartsQuery(
    partName: string,
    partNumber?: string,
    manufacturer?: string,
    includeOEM: boolean = true
  ): Promise<PartLink[]> {
    try {
      const params = new URLSearchParams({
        part_name: partName,
        ...(partNumber && { part_number: partNumber }),
        ...(manufacturer && { manufacturer: manufacturer }),
        include_oem: includeOEM.toString(),
      });

      const response = await this.api.get<PartLink[]>(
        `/api/parts/search?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error searching parts with query:', error);
      throw error;
    }
  }

  /**
   * Get list of all available suppliers
   * @returns Array of supplier names
   */
  async getSuppliers(): Promise<string[]> {
    try {
      const response = await this.api.post<string[]>('/api/parts/suppliers');
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get parts suggestions from a diagnosis result
   * Automatically generates referral links for all parts needed
   * Called automatically after diagnosis completes
   * @param diagnosisId - ID of the diagnosis
   * @param partsNeeded - Array of parts with descriptions and prices
   * @param manufacturer - Vehicle manufacturer from VIN decoder
   * @param vin - Vehicle VIN number
   * @returns Organized parts suggestions with links and cost estimates
   */
  async getDiagnosisSuggestions(
    diagnosisId: string,
    partsNeeded: DiagnosisPart[],
    manufacturer?: string,
    vin?: string
  ): Promise<DiagnosisSuggestionsResponse> {
    try {
      if (!diagnosisId) {
        throw new Error('Diagnosis ID is required');
      }

      const response = await this.api.post<DiagnosisSuggestionsResponse>(
        '/api/parts/diagnosis-suggestions',
        {
          diagnosis_id: diagnosisId,
          parts_needed: partsNeeded,
          manufacturer: manufacturer,
          vin: vin,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting diagnosis suggestions:', error);
      throw error;
    }
  }

  /**
   * Search a specific supplier for parts
   * @param supplierName - Name of supplier (autozone, oreilly, advance_auto, lkq, napa)
   * @param partName - Name of the part
   * @param partNumber - Optional part number
   * @returns Supplier link with referral URL
   */
  async searchSingleSupplier(
    supplierName: string,
    partName: string,
    partNumber?: string
  ): Promise<PartLink[]> {
    try {
      const params = new URLSearchParams({
        part_name: partName,
        ...(partNumber && { part_number: partNumber }),
      });

      const response = await this.api.get<PartLink[]>(
        `/api/parts/single-supplier/${supplierName}?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error searching ${supplierName}:`, error);
      throw error;
    }
  }

  /**
   * Get OEM manufacturer links for a specific vehicle make
   * @param manufacturer - Vehicle manufacturer (ford, gm, toyota, honda, etc.)
   * @param partName - Name of the part
   * @param partNumber - Optional part number
   * @returns Array of OEM links prioritizing the requested manufacturer
   */
  async getOEMLinks(
    manufacturer: string,
    partName: string,
    partNumber?: string
  ): Promise<PartLink[]> {
    try {
      const params = new URLSearchParams({
        part_name: partName,
        ...(partNumber && { part_number: partNumber }),
      });

      const response = await this.api.get<PartLink[]>(
        `/api/parts/oem-links/${manufacturer}?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching OEM links for ${manufacturer}:`, error);
      throw error;
    }
  }

  /**
   * Check if the parts service is healthy
   * @returns Service status and available endpoints
   */
  async healthCheck(): Promise<Record<string, any>> {
    try {
      const response = await this.api.get('/api/parts/health');
      return response.data;
    } catch (error) {
      console.error('Parts service health check failed:', error);
      throw error;
    }
  }

  /**
   * Open a parts link in the device browser
   * @param url - The URL to open
   */
  async openPartLink(url: string): Promise<void> {
    try {
      // For React Native, use Linking API
      const { Linking } = require('react-native');
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening part link:', error);
      throw error;
    }
  }

  /**
   * Format price for display
   * @param price - Price value
   * @returns Formatted price string
   */
  formatPrice(price?: number): string {
    if (!price) return 'Price unavailable';
    return `$${price.toFixed(2)}`;
  }

  /**
   * Get supplier icon name for UI rendering
   * @param supplierName - Name of supplier
   * @returns Icon identifier
   */
  getSupplierIcon(supplierName: string): string {
    const iconMap: Record<string, string> = {
      'AutoZone': 'autozone',
      "O'Reilly Auto Parts": 'oreilly',
      'Advanced Auto Parts': 'advance',
      'LKQ Pull-A-Part': 'lkq',
      'NAPA Auto Parts': 'napa',
      'OEM Parts': 'oem',
    };
    return iconMap[supplierName] || 'generic';
  }

  /**
   * Sort parts links by priority and category
   * @param links - Array of part links
   * @returns Sorted links (OEM first, then aftermarket)
   */
  sortPartLinks(links: PartLink[]): PartLink[] {
    return links.sort((a, b) => {
      // OEM links first (priority 0-10)
      if (a.priority < 10 && b.priority >= 10) return -1;
      if (a.priority >= 10 && b.priority < 10) return 1;
      // Then sort by priority
      return a.priority - b.priority;
    });
  }
}

// Export singleton instance
export const partsService = new PartsOrderingService(
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'
);

export default PartsOrderingService;
