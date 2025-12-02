import { StyleSheet } from "react-native";
import { Theme } from "../../theme";

const parseSpacing = (spacing: string) =>
  parseInt(spacing.replace("px", ""), 10);
const parseFontSize = (size: string) => parseInt(size.replace("px", ""), 10);

const spacing = {
  nano: parseSpacing(Theme.spacing.nano),
  quarck: parseSpacing(Theme.spacing.quarck),
  xs: parseSpacing(Theme.spacing.xs),
  sm16: parseSpacing(Theme.spacing.sm16),
  lg: parseSpacing(Theme.spacing.lg),
};

const fontSize = {
  xs: parseFontSize(Theme.typography.fontSize.xs),
  sm: parseFontSize(Theme.typography.fontSize.sm),
  md: parseFontSize(Theme.typography.fontSize.md),
  lg: parseFontSize(Theme.typography.fontSize.lg),
};

const borderRadius = {
  sm: parseSpacing(Theme.border.borderRadius.sm),
  md: parseSpacing(Theme.border.borderRadius.md),
};

const borderWidth = {
  hairLine: parseFloat(Theme.border.borderWidth.hairLine),
  thin: parseFloat(Theme.border.borderWidth.thin),
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutralLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: spacing.sm16,
    paddingRight: spacing.sm16,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: Theme.colors.neutralVeryLight,
    borderBottomWidth: borderWidth.hairLine,
    borderBottomColor: Theme.colors.neutralMedium,
  },
  backButton: {
    fontSize: fontSize.md,
    color: Theme.colors.auxiliary05Default,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutralVeryDark,
  },
  clearButton: {
    fontSize: fontSize.md,
    color: Theme.colors.errorMedium,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  content: {
    flex: 1,
  },
  requestItem: {
    backgroundColor: Theme.colors.neutralVeryLight,
    marginLeft: spacing.sm16,
    marginRight: spacing.sm16,
    marginTop: spacing.quarck,
    marginBottom: spacing.quarck,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    shadowColor: Theme.colors.neutralVeryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestItemSelected: {
    borderColor: Theme.colors.secondary.pure,
    borderWidth: borderWidth.thin,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodContainer: {
    marginRight: spacing.xs,
  },
  method: {
    fontSize: fontSize.xs,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutralVeryLight,
    paddingLeft: spacing.nano,
    paddingRight: spacing.nano,
    paddingTop: spacing.quarck,
    paddingBottom: spacing.quarck,
    borderRadius: borderRadius.sm,
    minWidth: 50,
    textAlign: "center",
  },
  requestInfo: {
    flex: 1,
  },
  url: {
    fontSize: fontSize.md,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.neutralVeryDark,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: Theme.colors.neutralDark,
    fontFamily: Theme.typography.fontFamily.regular,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  status: {
    fontSize: fontSize.md,
    fontFamily: Theme.typography.fontFamily.bold,
    marginBottom: spacing.quarck,
  },
  duration: {
    fontSize: fontSize.xs,
    color: Theme.colors.neutralDark,
    fontFamily: Theme.typography.fontFamily.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutralDark,
    textAlign: "center",
    marginBottom: spacing.nano,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: Theme.colors.neutralMedium,
    textAlign: "center",
    fontFamily: Theme.typography.fontFamily.regular,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutralVeryLight,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm16,
    borderBottomWidth: borderWidth.hairLine,
    borderBottomColor: Theme.colors.neutralMedium,
  },
  detailTitle: {
    fontSize: fontSize.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutralVeryDark,
    flex: 1,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  closeButton: {
    fontSize: fontSize.lg,
    color: Theme.colors.auxiliary05Default,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  detailContent: {
    flex: 1,
    padding: spacing.sm16,
  },
  section: {
    marginBottom: spacing.sm16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm16,
    paddingRight: spacing.sm16,
    backgroundColor: Theme.colors.primary.light,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutralVeryDark,
  },
  expandIcon: {
    fontSize: fontSize.md,
    color: Theme.colors.neutralDark,
    fontFamily: Theme.typography.fontFamily.regular,
  },
  sectionContent: {
    padding: spacing.sm16,
    backgroundColor: Theme.colors.neutralVeryLight,
    borderWidth: borderWidth.hairLine,
    borderColor: Theme.colors.neutralMedium,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  contentScroll: {
    maxHeight: 300,
  },
  detailText: {
    fontSize: fontSize.md,
    color: Theme.colors.neutralVeryDark,
    fontFamily: "monospace",
  },
  copyButton: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.nano,
    padding: spacing.nano,
    backgroundColor: Theme.colors.secondary.pure,
    borderRadius: borderRadius.sm,
  },
  copyButtonText: {
    color: Theme.colors.neutralVeryLight,
    fontSize: fontSize.sm,
    fontFamily: Theme.typography.fontFamily.bold,
  },
  infoRow: {
    flexDirection: "row",
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    marginBottom: spacing.quarck,
  },
  infoLabel: {
    fontSize: fontSize.md,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutralDark,
    width: 80,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: Theme.colors.neutralVeryDark,
    flex: 1,
    fontFamily: Theme.typography.fontFamily.regular,
  },
});

export const getMethodStyle = (backgroundColor: string) => [
  styles.method,
  { backgroundColor },
];

export const getStatusStyle = (color: string) => [styles.status, { color }];

export const getRequestItemStyle = (isSelected: boolean) => [
  styles.requestItem,
  isSelected && styles.requestItemSelected,
];
