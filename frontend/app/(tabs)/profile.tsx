import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth";
import { colors, spacing, radius, font } from "@/src/theme";

export default function Profile() {
  const insets = useSafeAreaInsets(); const router = useRouter(); const { user, signOut } = useAuth();
  const doSignOut = async () => { await signOut(); router.replace("/(auth)/login"); };
  const initials = (user?.name || "M").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.infoRow}><View style={styles.infoIcon}><Ionicons name={icon} size={18} color={colors.brand} /></View><View style={{flex:1}}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>
  );
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>PROFILE</Text>
        <View style={styles.avatarCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Text style={styles.section}>GARAGE</Text>
        <View style={styles.card}>
          <Pressable testID="my-manuals-link" style={styles.linkRow} onPress={() => router.push("/manuals")}>
            <View style={styles.infoIcon}><Ionicons name="folder-open-outline" size={18} color={colors.brand} /></View>
            <View style={{flex:1}}><Text style={styles.infoValue}>My Manuals</Text><Text style={styles.infoLabel}>Your uploaded PDF documents</Text></View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceSecondary} />
          </Pressable>
        </View>
        <Text style={styles.section}>ACCOUNT</Text>
        <View style={styles.card}>
          <InfoRow icon="person-outline" label="Name" value={user?.name || "\u2014"} />
          <View style={styles.divider} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email || "\u2014"} />
        </View>
        <Text style={styles.section}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}><Ionicons name="information-circle-outline" size={18} color={colors.onSurfaceSecondary} />
            <Text style={styles.aboutText}>MechMate provides AI-generated repair guides and OBD-II diagnostics for reference. Always follow manufacturer torque specs and safety procedures.</Text>
          </View>
        </View>
        <Pressable testID="sign-out-button" style={styles.signOut} onPress={doSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} /><Text style={styles.signOutText}>SIGN OUT</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:colors.surface}, scroll:{padding:spacing.lg,paddingBottom:spacing.xxxl},
  title:{fontFamily:font.display,fontSize:30,color:colors.onSurface,letterSpacing:0.5,marginBottom:spacing.lg},
  avatarCard:{alignItems:"center",backgroundColor:colors.surfaceSecondary,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:spacing.xl},
  avatar:{width:84,height:84,borderRadius:42,backgroundColor:colors.brand,alignItems:"center",justifyContent:"center",marginBottom:spacing.md},
  avatarText:{fontFamily:font.display,fontSize:36,color:colors.onBrand},
  name:{fontFamily:font.displaySemi,fontSize:24,color:colors.onSurface}, email:{fontFamily:font.body,fontSize:14,color:colors.onSurfaceSecondary,marginTop:2},
  section:{fontFamily:font.semibold,fontSize:12,color:colors.brand,letterSpacing:1.5,marginTop:spacing.xl,marginBottom:spacing.sm},
  card:{backgroundColor:colors.surfaceSecondary,borderWidth:1,borderColor:colors.border,borderRadius:radius.md},
  infoRow:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg},
  linkRow:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg},
  infoIcon:{width:36,height:36,borderRadius:radius.sm,backgroundColor:colors.brandTertiary,alignItems:"center",justifyContent:"center"},
  infoLabel:{fontFamily:font.body,fontSize:12,color:colors.onSurfaceSecondary},
  infoValue:{fontFamily:font.semibold,fontSize:16,color:colors.onSurface,marginTop:1},
  divider:{height:1,backgroundColor:colors.border,marginLeft:64},
  aboutRow:{flexDirection:"row",gap:spacing.md,padding:spacing.lg},
  aboutText:{flex:1,fontFamily:font.body,fontSize:14,color:colors.onSurfaceTertiary,lineHeight:21},
  signOut:{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:spacing.sm,borderWidth:1,borderColor:colors.error,borderRadius:radius.md,height:56,marginTop:spacing.xxl},
  signOutText:{fontFamily:font.display,fontSize:18,color:colors.error,letterSpacing:1},
});
