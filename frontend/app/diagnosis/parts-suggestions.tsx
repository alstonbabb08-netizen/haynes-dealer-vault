/**
 * Diagnosis Parts Suggestions Screen - React Native / Expo
 * Automatically displays parts recommendations after a diagnosis is completed
 * Shows referral links for ordering parts across all suppliers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { partsService } from '../services/partsService';

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

interface DiagnosisSuggestionsResponse {
  parts: Part[];
  suppliers: string[];
  total_parts: number;
  estimated_total_cost?: number;
}

export default function DiagnosisPartsSuggestions() {
  const route = useRoute();
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState<DiagnosisSuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  // Get diagnosis data from route params
  const diagnosisData = route.params as {
    diagnosis_id: string;
    parts_needed: Array<{
      name: string;
      description?: string;
      part_number?: string;
      estimated_price?: number;
    }>;
    manufacturer?: string;
    vin?: string;
  };

  useEffect(() => {
    loadPartsSuggestions();
  }, []);

  const loadPartsSuggestions = async () => {
    setLoading(true);
    setError('');

    try {
      if (!diagnosisData?.diagnosis_id) {
        throw new Error('Diagnosis ID is required');
      }

      const response = await partsService.getDiagnosisSuggestions(
        diagnosisData.diagnosis_id,
        diagnosisData.parts_needed || [],
        diagnosisData.manufacturer,
        diagnosisData.vin
      );

      setSuggestions(response);
    } catch (err) {
      setError('Failed to load parts suggestions. Please try again.');
      console.error('Error loading suggestions:', err);
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
      console.error('Link error:', err);
    }
  };

  const togglePartExpanded = (partName: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partName)) {
      newExpanded.delete(partName);
    } else {
      newExpanded.add(partName);
    }
    setExpandedParts(newExpanded);
  };

  const getSupplierColors = (provider: string): { primary: string; secondary: string } => {
    const colorMap: Record<string, { primary: string; secondary: string }> = {
      'AutoZone': { primary: '#FF6B35', secondary: '#FFFFFF' },
      "O'Reilly Auto Parts": { primary: '#00A651', secondary: '#FFFFFF' },
      'Advanced Auto Parts': { primary: '#FFD700', secondary: '#000000' },
      'LKQ Pull-A-Part': { primary: '#1E40AF', secondary: '#FFFFFF' },
      'NAPA Auto Parts': { primary: '#0066CC', secondary: '#FFD700' },
    };
    return colorMap[provider] || { primary: '#6B7280', secondary: '#FFFFFF' };
  };

  const PartCard = ({ part, index }: { part: Part; index: number }) => {
    const isExpanded = expandedParts.has(part.name);

    return (
      <View style={styles.partCard}>
        <TouchableOpacity
          style={styles.partCardHeader}
          onPress={() => togglePartExpanded(part.name)}
        >
          <View style={styles.partCardHeaderContent}>
            <Text style={styles.partIndex}>{index + 1}.</Text>
            <View style={styles.partInfo}>
              <Text style={styles.partName}>{part.name}</Text>
              {part.description && (
                <Text style={styles.partDescription}>{part.description}</Text>
              )}
              {part.part_number && (
                <Text style={styles.partNumberText}>
                  Part #: {part.part_number}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.partCardMeta}>
            {part.estimated_price && (
              <Text style={styles.priceTag}>
                ${part.estimated_price.toFixed(2)}
              </Text>
            )}
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.partCardContent}>
            <Text style={styles.suppliersLabel}>Available at:</Text>

            {part.links
              .sort((a, b) => a.priority - b.priority)
              .map((link, linkIdx) => {
                const colors = getSupplierColors(link.provider);
                return (
                  <TouchableOpacity
                    key={`${part.name}-${linkIdx}`}
                    style={[
                      styles.supplierLink,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => handleOpenLink(link.url)}
                  >
                    <View style={styles.supplierLinkContent}>
                      <Text
                        style={[
                          styles.supplierLinkText,
                          { color: colors.secondary },
                        ]}
                      >
                        {link.provider}
                      </Text>
                      <Text
                        style={[
                          styles.supplierLinkUrl,
                          { color: colors.secondary, opacity: 0.8 },
                        ]}
                        numberOfLines={1}
                      >
                        {new URL(link.url).hostname}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.supplierLinkArrow,
                        { color: colors.secondary },
                      ]}
                    >
                      →
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          Finding parts and suppliers for your diagnosis...
        </Text>
      </View>
    );
  }

  if (error && !suggestions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>Unable to Load Parts</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPartsSuggestions}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!suggestions || suggestions.parts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✓</Text>
        <Text style={styles.emptyTitle}>No Parts Needed</Text>
        <Text style={styles.emptyText}>
          This diagnosis doesn't require any parts for repair.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Parts Needed</Text>
          <Text style={styles.subtitle}>
            Tap on a part to see available suppliers
          </Text>
        </View>

        {/* Cost Summary */}
        {suggestions.estimated_total_cost !== null && (
          <View style={styles.costSummary}>
            <View>
              <Text style={styles.costLabel}>Estimated Total Cost</Text>
              <Text style={styles.costValue}>
                ${suggestions.estimated_total_cost.toFixed(2)}
              </Text>
            </View>
            <View style={styles.costDivider} />
            <View>
              <Text style={styles.costLabel}>Total Parts</Text>
              <Text style={styles.costValue}>{suggestions.total_parts}</Text>
            </View>
            <View style={styles.costDivider} />
            <View>
              <Text style={styles.costLabel}>Suppliers</Text>
              <Text style={styles.costValue}>
                {suggestions.suppliers.length}
              </Text>
            </View>
          </View>
        )}

        {/* Available Suppliers */}
        <View style={styles.suppliersSection}>
          <Text style={styles.suppliersSectionTitle}>
            🛒 Shop at These Suppliers
          </Text>
          <View style={styles.suppliersList}>
            {suggestions.suppliers.map((supplier, idx) => {
              const colors = getSupplierColors(supplier);
              return (
                <View
                  key={idx}
                  style={[
                    styles.supplierBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.supplierBadgeText}>{supplier}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Parts List */}
        <View style={styles.partsSection}>
          <Text style={styles.partsSectionTitle}>Parts Required</Text>
          {suggestions.parts.map((part, idx) => (
            <PartCard key={`${part.name}-${idx}`} part={part} index={idx} />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Could expand all parts here
              const allPartNames = new Set(suggestions.parts.map(p => p.name));
              setExpandedParts(allPartNames);
            }}
          >
            <Text style={styles.buttonText}>Expand All Parts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setExpandedParts(new Set())}
          >
            <Text style={styles.secondaryButtonText}>Collapse All</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Shopping Tips</Text>
          <Text style={styles.infoText}>
            • Compare prices across multiple suppliers before purchasing
          </Text>
          <Text style={styles.infoText}>
            • OEM parts are listed first for your specific vehicle manufacturer
          </Text>
          <Text style={styles.infoText}>
            • Each link opens directly to the supplier's website with your
            part search pre-filled
          </Text>
          <Text style={styles.infoText}>
            • Some suppliers offer in-store pickup or free shipping on orders
          </Text>
          <Text style={styles.infoText}>
            • Keep your VIN and diagnosis report handy for phone orders
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.navButtonText}>← Back to Diagnosis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => navigation.navigate('Parts')}
          >
            <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
              Browse More Parts →
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  costSummary: {
    flexDirection: 'row',
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
  costLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  costValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  costDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  suppliersSection: {
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
  suppliersSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  suppliersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  supplierBadge: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  supplierBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  partsSection: {
    marginBottom: 24,
  },
  partsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  partCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  partCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  partCardHeaderContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  partIndex: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 12,
    minWidth: 24,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  partDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  partNumberText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  partCardMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  partCardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suppliersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  supplierLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  supplierLinkContent: {
    flex: 1,
  },
  supplierLinkText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  supplierLinkUrl: {
    fontSize: 11,
  },
  supplierLinkArrow: {
    fontSize: 16,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
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
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  navButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
