/**
 * Parts Ordering Tab Screen - React Native / Expo
 * Main interface for browsing and ordering parts with referral links
 * Supports VIN-based search, part number search, and diagnosis suggestions
 * 
 * COMPLIANT WITH: Apple App Store, Google Play Store, FTC Guidelines
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  Image,
} from 'react-native';
import { partsService } from '../services/partsService';

interface PartLink {
  provider: string;
  url: string;
  icon: string;
  priority: number;
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  partNumber?: string;
  estimatedPrice?: number;
  links: PartLink[];
}

export default function PartsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<'name' | 'number' | 'vin'>('name');
  const [vin, setVin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [disclosureDismissed, setDisclosureDismissed] = useState(false);

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await partsService.getSuppliers();
      setSuppliers(suppliersData);
    } catch (err) {
      if (__DEV__) {
        console.error('Error loading suppliers:', err);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && searchMode !== 'vin') {
      Alert.alert('Error', 'Please enter a part name or number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let links: PartLink[] = [];

      if (searchMode === 'name') {
        links = await partsService.searchParts(
          searchQuery,
          partNumber || undefined,
          manufacturer || undefined,
          true
        );
      } else if (searchMode === 'number') {
        links = await partsService.searchParts(
          searchQuery || 'Part',
          partNumber || searchQuery,
          manufacturer || undefined,
          true
        );
      }

      if (links.length === 0) {
        setError('No results found. Try a different search.');
        setSearchResults([]);
      } else {
        // Format results for display
        const formatted: SearchResult[] = links.map((link, idx) => ({
          id: `${idx}-${link.provider}`,
          name: searchQuery,
          description: `Available at ${link.provider}`,
          partNumber: partNumber || undefined,
          estimatedPrice: undefined,
          links: [link],
        }));

        setSearchResults(formatted);
      }
    } catch (err) {
      setError('Failed to search parts. Please try again.');
      if (__DEV__) {
        console.error('Search error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open link');
      if (__DEV__) {
        console.error('Link error:', err);
      }
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    // In production, this would open your privacy policy URL
    Alert.alert(
      'Privacy Policy',
      'Affiliate Disclosure: We earn commissions from parts purchases made through our referral links. This is our primary revenue model. Prices are identical whether you use our links or visit suppliers directly.\n\nFor full details, see our Privacy Policy in the app menu.'
    );
  };

  const getSupplierColors = (provider: string): { primary: string; secondary: string; tertiary?: string } => {
    const colorMap: Record<string, { primary: string; secondary: string; tertiary?: string }> = {
      'AutoZone': { primary: '#FF6B35', secondary: '#FFFFFF' }, // Orange and white
      "O'Reilly Auto Parts": { primary: '#00A651', secondary: '#000000', tertiary: '#DC143C' }, // Green, black, and red
      'Advanced Auto Parts': { primary: '#FFD700', secondary: '#000000', tertiary: '#CC0000' }, // Yellow, black, and red
      'LKQ Pull-A-Part': { primary: '#1E40AF', secondary: '#FFFFFF' }, // Blue and white
      'NAPA Auto Parts': { primary: '#0066CC', secondary: '#FFD700' }, // Blue and yellow
    };
    return colorMap[provider] || { primary: '#6B7280', secondary: '#FFFFFF' };
  };

  const SupplierButton = ({ link }: { link: PartLink }) => {
    const colors = getSupplierColors(link.provider);

    return (
      <TouchableOpacity
        style={[
          styles.supplierButton,
          { 
            borderLeftColor: colors.primary,
            backgroundColor: colors.primary,
          },
        ]}
        onPress={() => handleOpenLink(link.url)}
      >
        <View style={styles.supplierButtonContent}>
          <Text style={[styles.supplierName, { color: '#FFFFFF' }]}>{link.provider}</Text>
          <Text style={[styles.supplierUrl, { color: 'rgba(255, 255, 255, 0.8)' }]} numberOfLines={1}>
            {new URL(link.url).hostname}
          </Text>
        </View>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Affiliate Disclosure Banner - Required for FTC/App Store Compliance */}
        {!disclosureDismissed && (
          <View style={styles.disclosureBanner}>
            <View style={styles.disclosureContent}>
              <Text style={styles.disclosureIcon}>ℹ️</Text>
              <View style={styles.disclosureText}>
                <Text style={styles.disclosureTitle}>Affiliate Disclosure</Text>
                <Text style={styles.disclosureDescription}>
                  We earn commissions from purchases made through our referral links. Prices are not affected.
                </Text>
                <TouchableOpacity onPress={handleOpenPrivacyPolicy}>
                  <Text style={styles.disclosureLink}>Learn More →</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.disclosureCloseButton}
              onPress={() => setDisclosureDismissed(true)}
            >
              <Text style={styles.disclosureCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Parts Ordering</Text>
          <Text style={styles.subtitle}>
            Search parts and order from multiple suppliers
          </Text>
        </View>

        {/* Search Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === 'name' && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode('name')}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === 'name' && styles.modeButtonTextActive,
              ]}
            >
              By Name
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === 'number' && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode('number')}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === 'number' && styles.modeButtonTextActive,
              ]}
            >
              By Number
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === 'vin' && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode('vin')}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === 'vin' && styles.modeButtonTextActive,
              ]}
            >
              By VIN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Inputs */}
        <View style={styles.searchContainer}>
          {searchMode === 'name' && (
            <>
              <Text style={styles.label}>Part Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Brake Pads, Air Filter"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Part Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 34356794823"
                value={partNumber}
                onChangeText={setPartNumber}
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          {searchMode === 'number' && (
            <>
              <Text style={styles.label}>Part Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 34356794823"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Part Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Brake Pads"
                value={partNumber}
                onChangeText={setPartNumber}
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          {searchMode === 'vin' && (
            <>
              <Text style={styles.label}>VIN (Vehicle Identification Number)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1FTFW1ET5DFC10726"
                value={vin}
                onChangeText={setVin}
                placeholderTextColor="#9CA3AF"
                maxLength={17}
              />

              <Text style={styles.label}>Part Name or Description</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Brake Pads"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Manufacturer (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ford, Toyota, Honda"
                value={manufacturer}
                onChangeText={setManufacturer}
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search Parts</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Found {suppliers.length} Suppliers
            </Text>

            {searchResults.map((result) => (
              <View key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View>
                    <Text style={styles.resultName}>{result.name}</Text>
                    {result.partNumber && (
                      <Text style={styles.partNumber}>
                        Part #: {result.partNumber}
                      </Text>
                    )}
                    {result.estimatedPrice && (
                      <Text style={styles.price}>
                        Est. Price: ${result.estimatedPrice.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>

                {result.links.map((link) => (
                  <SupplierButton key={link.provider} link={link} />
                ))}
              </View>
            ))}

            {/* All Suppliers Summary */}
            <View style={styles.suppliersSummary}>
              <Text style={styles.summaryTitle}>Available at:</Text>
              <View style={styles.suppliersList}>
                {suppliers.map((supplier, idx) => {
                  const colors = getSupplierColors(supplier);
                  return (
                    <View 
                      key={idx} 
                      style={[
                        styles.supplierTag,
                        { backgroundColor: colors.primary }
                      ]}
                    >
                      <Text style={styles.supplierTagText}>{supplier}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>Search for Parts</Text>
            <Text style={styles.emptyStateText}>
              Enter a part name, number, or VIN to find available parts across
              multiple suppliers
            </Text>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ About Parts Ordering</Text>
          <Text style={styles.infoText}>
            • Access referral links to major parts suppliers including AutoZone,
            O'Reilly, Advanced Auto Parts, LKQ Pull-A-Part, and NAPA
          </Text>
          <Text style={styles.infoText}>
            • Get OEM (Original Equipment Manufacturer) parts for your specific
            vehicle
          </Text>
          <Text style={styles.infoText}>
            • Compare prices and availability across multiple suppliers
          </Text>
          <Text style={styles.infoText}>
            • After a diagnosis, parts suggestions appear automatically
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  disclosureBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disclosureContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclosureIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  disclosureText: {
    flex: 1,
  },
  disclosureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  disclosureDescription: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
    marginBottom: 6,
  },
  disclosureLink: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  disclosureCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  disclosureCloseIcon: {
    fontSize: 16,
    color: '#B45309',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    marginBottom: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  partNumber: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  supplierButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  supplierButtonContent: {
    flex: 1,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  supplierUrl: {
    fontSize: 12,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  suppliersSummary: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  suppliersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  supplierTag: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  supplierTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  infoSection: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#0C4A6E',
    marginBottom: 6,
    lineHeight: 16,
  },
});
