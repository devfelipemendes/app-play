/**
 * Constantes de Dimensões Responsivas
 *
 * Arquivo centralizado com valores responsivos reutilizáveis para manter
 * consistência no design em diferentes tamanhos de tela.
 *
 * Baseado no sistema de responsividade com useBreakpoint e responsive utils.
 */

import {
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  scale,
  scaleHeight,
  scaleWidth,
  moderateScale,
} from '@/utils/responsive';

/**
 * Dimensões para Bottom Sheets
 */
export const BOTTOM_SHEET = {
  borderRadius: BORDER_RADIUS.large,
  padding: SPACING.double,
  paddingHorizontal: scaleWidth(16),
  paddingVertical: scaleHeight(16),
  handleBarHeight: scaleHeight(4),
  handleBarWidth: scaleWidth(40),
  titleFontSize: TYPOGRAPHY.h3,
  subtitleFontSize: TYPOGRAPHY.bodySmall,
  gap: SPACING.base,
} as const;

/**
 * Dimensões para Cards
 */
export const CARD = {
  borderRadius: BORDER_RADIUS.medium,
  borderRadiusSmall: BORDER_RADIUS.base,
  borderRadiusLarge: BORDER_RADIUS.large,
  padding: moderateScale(16),
  paddingSmall: moderateScale(12),
  paddingLarge: moderateScale(20),
  gap: SPACING.base,
  gapSmall: SPACING.half,
  shadowElevation: 3,
} as const;

/**
 * Dimensões para Botões
 */
export const BUTTON = {
  borderRadius: BORDER_RADIUS.base,
  borderRadiusMedium: BORDER_RADIUS.medium,
  borderRadiusLarge: BORDER_RADIUS.large,
  height: {
    small: scaleHeight(40),
    medium: scaleHeight(48),
    large: scaleHeight(56),
  },
  padding: {
    vertical: scaleHeight(14),
    horizontal: scaleWidth(24),
  },
  paddingSmall: {
    vertical: scaleHeight(10),
    horizontal: scaleWidth(16),
  },
  paddingLarge: {
    vertical: scaleHeight(16),
    horizontal: scaleWidth(32),
  },
  fontSize: TYPOGRAPHY.body,
  fontSizeSmall: TYPOGRAPHY.bodySmall,
  fontSizeLarge: TYPOGRAPHY.h6,
} as const;

/**
 * Dimensões para Inputs
 */
export const INPUT = {
  borderRadius: BORDER_RADIUS.base,
  height: scaleHeight(48),
  heightSmall: scaleHeight(40),
  heightLarge: scaleHeight(56),
  padding: {
    vertical: scaleHeight(14),
    horizontal: scaleWidth(16),
  },
  fontSize: TYPOGRAPHY.body,
  labelFontSize: TYPOGRAPHY.bodySmall,
  errorFontSize: TYPOGRAPHY.caption,
  borderWidth: 1,
} as const;

/**
 * Dimensões para Ícones
 */
export const ICON = {
  xs: scale(16),
  sm: scale(20),
  md: scale(24),
  lg: scale(32),
  xl: scale(48),
  xxl: scale(64),
} as const;

/**
 * Sombras pré-definidas
 */
export const SHADOW = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(6) },
    shadowOpacity: 0.25,
    shadowRadius: scale(12),
    elevation: 8,
  },
} as const;

/**
 * Dimensões para Modais
 */
export const MODAL = {
  borderRadius: BORDER_RADIUS.large,
  padding: moderateScale(24),
  paddingHorizontal: scaleWidth(24),
  paddingVertical: scaleHeight(24),
  titleFontSize: TYPOGRAPHY.h3,
  bodyFontSize: TYPOGRAPHY.body,
  gap: SPACING.double,
  backdropOpacity: 0.5,
} as const;

/**
 * Dimensões para Headers
 */
export const HEADER = {
  height: scaleHeight(60),
  heightLarge: scaleHeight(80),
  padding: {
    vertical: scaleHeight(12),
    horizontal: scaleWidth(16),
  },
  titleFontSize: TYPOGRAPHY.h4,
  subtitleFontSize: TYPOGRAPHY.bodySmall,
  iconSize: ICON.md,
} as const;

/**
 * Dimensões para Tab Bar
 */
export const TAB_BAR = {
  height: scaleHeight(60),
  heightIOS: scaleHeight(62),
  padding: {
    top: scaleHeight(16),
    horizontal: scaleWidth(28),
  },
  borderTopLeftRadius: BORDER_RADIUS.large,
  borderTopRightRadius: BORDER_RADIUS.large,
  iconSize: ICON.md,
  labelFontSize: TYPOGRAPHY.caption,
  indicatorHeight: scaleHeight(3),
  indicatorBorderRadius: BORDER_RADIUS.small,
} as const;

/**
 * Dimensões para Avatares
 */
export const AVATAR = {
  xs: scale(24),
  sm: scale(32),
  md: scale(40),
  lg: scale(48),
  xl: scale(64),
  xxl: scale(80),
  borderRadius: (size: number) => size / 2, // Círculo perfeito
} as const;

/**
 * Dimensões para Badges
 */
export const BADGE = {
  height: scaleHeight(20),
  minWidth: scaleWidth(20),
  borderRadius: BORDER_RADIUS.full,
  padding: {
    vertical: scaleHeight(2),
    horizontal: scaleWidth(6),
  },
  fontSize: TYPOGRAPHY.caption,
} as const;

/**
 * Dimensões para Alertas
 */
export const ALERT = {
  borderRadius: BORDER_RADIUS.base,
  padding: moderateScale(12),
  gap: SPACING.half,
  iconSize: ICON.md,
  titleFontSize: TYPOGRAPHY.body,
  messageFontSize: TYPOGRAPHY.bodySmall,
  borderLeftWidth: scale(4),
} as const;

/**
 * Dimensões para Dividers
 */
export const DIVIDER = {
  height: scale(1),
  marginVertical: SPACING.base,
  marginVerticalSmall: SPACING.half,
  marginVerticalLarge: SPACING.double,
} as const;

/**
 * Dimensões para Listas
 */
export const LIST = {
  itemHeight: scaleHeight(56),
  itemHeightSmall: scaleHeight(44),
  itemHeightLarge: scaleHeight(72),
  itemPadding: {
    vertical: scaleHeight(12),
    horizontal: scaleWidth(16),
  },
  gap: SPACING.half,
  separatorHeight: scale(1),
} as const;

/**
 * Container padrão para telas
 */
export const SCREEN_CONTAINER = {
  padding: moderateScale(16),
  paddingHorizontal: scaleWidth(16),
  paddingVertical: scaleHeight(16),
  gap: SPACING.double,
} as const;

/**
 * Dimensões para Carousels
 */
export const CAROUSEL = {
  itemSpacing: scaleWidth(16),
  itemBorderRadius: BORDER_RADIUS.large,
  indicatorSize: scale(8),
  indicatorSpacing: scale(6),
  indicatorActiveBorderRadius: scale(4),
} as const;

/**
 * Dimensões para Chips/Tags
 */
export const CHIP = {
  height: scaleHeight(32),
  borderRadius: BORDER_RADIUS.full,
  padding: {
    vertical: scaleHeight(6),
    horizontal: scaleWidth(12),
  },
  fontSize: TYPOGRAPHY.bodySmall,
  gap: scale(4),
} as const;

/**
 * Dimensões para Tooltips
 */
export const TOOLTIP = {
  borderRadius: BORDER_RADIUS.base,
  padding: {
    vertical: scaleHeight(6),
    horizontal: scaleWidth(12),
  },
  fontSize: TYPOGRAPHY.caption,
  maxWidth: scaleWidth(200),
} as const;

/**
 * Dimensões para Skeleton Loaders
 */
export const SKELETON = {
  borderRadius: BORDER_RADIUS.base,
  height: {
    text: scaleHeight(16),
    title: scaleHeight(24),
    button: scaleHeight(48),
    card: scaleHeight(120),
  },
} as const;

/**
 * Dimensões para Progress Bars
 */
export const PROGRESS_BAR = {
  height: scaleHeight(4),
  heightLarge: scaleHeight(8),
  borderRadius: BORDER_RADIUS.full,
} as const;

/**
 * Dimensões para Switches/Toggles
 */
export const SWITCH = {
  width: scaleWidth(51),
  height: scaleHeight(31),
  thumbSize: scale(27),
  borderRadius: BORDER_RADIUS.full,
} as const;

/**
 * Dimensões para Checkboxes e Radio Buttons
 */
export const CHECKBOX = {
  size: scale(20),
  borderRadius: BORDER_RADIUS.small,
  borderWidth: scale(2),
  iconSize: scale(14),
} as const;

export const RADIO = {
  size: scale(20),
  borderRadius: BORDER_RADIUS.full,
  borderWidth: scale(2),
  innerDotSize: scale(10),
} as const;

/**
 * Dimensões para FAB (Floating Action Button)
 */
export const FAB = {
  size: scale(56),
  borderRadius: BORDER_RADIUS.full,
  iconSize: ICON.md,
  bottom: scaleHeight(16),
  right: scaleWidth(16),
} as const;

/**
 * Dimensões para Drawer/Menu Lateral
 */
export const DRAWER = {
  width: scaleWidth(280),
  widthLarge: scaleWidth(320),
  itemHeight: scaleHeight(48),
  itemPadding: {
    vertical: scaleHeight(12),
    horizontal: scaleWidth(16),
  },
  headerHeight: scaleHeight(160),
} as const;

/**
 * Dimensões para Stepper
 */
export const STEPPER = {
  circleSize: scale(32),
  lineWidth: scale(2),
  lineHeight: scaleHeight(40),
  fontSize: TYPOGRAPHY.bodySmall,
  gap: SPACING.base,
} as const;

/**
 * Dimensões para Timeline
 */
export const TIMELINE = {
  dotSize: scale(12),
  lineWidth: scale(2),
  itemGap: SPACING.double,
  contentPadding: moderateScale(12),
} as const;

/**
 * Helper: Cria um objeto de espaçamento responsivo customizado
 */
export function createCustomSpacing(base: number) {
  return {
    xs: moderateScale(base * 0.25),
    sm: moderateScale(base * 0.5),
    md: moderateScale(base),
    lg: moderateScale(base * 1.5),
    xl: moderateScale(base * 2),
    xxl: moderateScale(base * 3),
  };
}

/**
 * Helper: Cria shadow personalizado
 */
export function createCustomShadow(
  elevation: number,
  opacity: number = 0.2
) {
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(elevation / 2),
    },
    shadowOpacity: opacity,
    shadowRadius: scale(elevation),
    elevation,
  };
}

/**
 * Export tudo como objeto único também
 */
export const RESPONSIVE_DIMENSIONS = {
  BOTTOM_SHEET,
  CARD,
  BUTTON,
  INPUT,
  ICON,
  SHADOW,
  MODAL,
  HEADER,
  TAB_BAR,
  AVATAR,
  BADGE,
  ALERT,
  DIVIDER,
  LIST,
  SCREEN_CONTAINER,
  CAROUSEL,
  CHIP,
  TOOLTIP,
  SKELETON,
  PROGRESS_BAR,
  SWITCH,
  CHECKBOX,
  RADIO,
  FAB,
  DRAWER,
  STEPPER,
  TIMELINE,
} as const;

export default RESPONSIVE_DIMENSIONS;
