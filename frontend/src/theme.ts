export const colors = {
  surface: "#09090B",
  onSurface: "#FAFAFA",
  surfaceSecondary: "#18181B",
  onSurfaceSecondary: "#A1A1AA",
  surfaceTertiary: "#27272A",
  onSurfaceTertiary: "#D4D4D8",
  surfaceInverse: "#FAFAFA",
  onSurfaceInverse: "#09090B",
  brand: "#F59E0B",
  onBrand: "#09090B",
  brandSecondary: "#B45309",
  brandTertiary: "#451A03",
  onBrandTertiary: "#FDE68A",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  border: "#27272A",
  borderStrong: "#3F3F46",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const font = {
  display: "Barlow-Bold",
  displaySemi: "Barlow-SemiBold",
  displayReg: "Barlow-Regular",
  body: "Plex-Regular",
  medium: "Plex-Medium",
  semibold: "Plex-SemiBold",
  bold: "Plex-Bold",
};

export const severityColor: Record<string, string> = {
  minor: colors.success,
  moderate: colors.warning,
  serious: colors.error,
  critical: colors.error,
};
