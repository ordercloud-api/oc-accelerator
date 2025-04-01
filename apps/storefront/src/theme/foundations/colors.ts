import {
  BRAND_COLOR_ACCENT,
  BRAND_COLOR_PRIMARY,
  BRAND_COLOR_SECONDARY,
} from "../../constants";
import tinycolor from "tinycolor2";

const basePalette = {
  colors: {
    teal: {
      50: "#EBFAF7",
      100: "#C6F1E8",
      200: "#A1E8D9",
      300: "#7CDFCA",
      400: "#57D6BA",
      500: "#32CDAB",
      600: "#28A489",
      700: "#1E7B67",
      800: "#145245",
      900: "#0A2922",
    },
    cyan: {
      50: "#E9FBFC",
      100: "#C0F4F6",
      200: "#98EDF0",
      300: "#70E6EB",
      400: "#48DEE5",
      500: "#20D7DF",
      600: "#19ACB3",
      700: "#138186",
      800: "#0D5659",
      900: "#062B2D",
    },
    blue: {
      50: "#E6F4FE",
      100: "#B9E2FD",
      200: "#8DCFFC",
      300: "#60BCFB",
      400: "#33A9FA",
      500: "#0696F9",
      600: "#0578C7",
      700: "#045A95",
      800: "#033C63",
      900: "#011E32",
    },
    green: {
      50: "#EFF7EE",
      100: "#D1E8CE",
      200: "#B4DAAF",
      300: "#96CB90",
      400: "#79BD70",
      500: "#5BAE51",
      600: "#498B41",
      700: "#376831",
      800: "#254620",
      900: "#122310",
    },
    purple: {
      50: "#EBEBFA",
      100: "#C6C7F1",
      200: "#A1A3E7",
      300: "#7D7FDE",
      400: "#585BD5",
      500: "#3337CC",
      600: "#292CA3",
      700: "#1F217A",
      800: "#141652",
      900: "#0A0B29",
    },
    pink: {
      50: "#FBE9F6",
      100: "#F4C2E6",
      200: "#EE9BD7",
      300: "#E774C7",
      400: "#E04DB7",
      500: "#D926A7",
      600: "#AE1E86",
      700: "#821764",
      800: "#570F43",
      900: "#2B0821",
    },
    red: {
      50: "#FCE9E9",
      100: "#F7C3C0",
      200: "#F19C98",
      300: "#EC756F",
      400: "#E64E47",
      500: "#E1281E",
      600: "#B42018",
      700: "#871812",
      800: "#5A100C",
      900: "#2D0806",
    },
    orange: {
      50: "#FDF2E7",
      100: "#FADBBD",
      200: "#F6C592",
      300: "#F3AE68",
      400: "#F0973D",
      500: "#ED8012",
      600: "#BD670F",
      700: "#8E4D0B",
      800: "#5F3307",
      900: "#2F1A04",
    },
    yellow: {
      50: "#FFF7E5",
      100: "#FFE8B8",
      200: "#FFD98A",
      300: "#FFCB5C",
      400: "#FFBC2E",
      500: "#FFAD00",
      600: "#CC8A00",
      700: "#996800",
      800: "#664500",
      900: "#332300",
    },
    gray: {
      50: "#faf6f3",
      100: "#f4e8e0",
      200: "#e4d6c8",
      300: "#d4c2b5",
      400: "#9E9A95",
      500: "#8C8A83",
      600: "#6F6D66",
      700: "#58574D",
      800: "#3B3A32",
      900: "#252422",
    },
    blackAlpha: {
      50: "rgba(244, 232, 224, 0.10)",
      100: "rgba(228, 214, 200, 0.20)",
      200: "rgba(212, 194, 181, 0.30)",
      300: "rgba(158, 154, 149, 0.45)",
      400: "rgba(140, 138, 131, 0.60)",
      500: "rgba(111, 109, 102, 0.70)",
      600: "rgba(88, 87, 77, 0.80)",
      700: "rgba(59, 58, 50, 0.90)",
      800: "rgba(37, 36, 34, 0.95)",
      900: "rgba(25, 24, 22, 0.99)",
    },
    whiteAlpha: {
      50: "rgba(255,255,255,0.02)",
      100: "rgba(255,255,255,0.04)",
      200: "rgba(255,255,255,0.10)",
      300: "rgba(255,255,255,0.17)",
      400: "rgba(255,255,255,0.42)",
      500: "rgba(255,255,255,0.55)",
      600: "rgba(255,255,255,0.68)",
      700: "rgba(255,255,255,0.75)",
      800: "rgba(255,255,255,0.85)",
      900: "rgba(255,255,255,0.91)",
    },
    white: "#ffffff",
  },
};

const generateColorScale = (baseColor: string) => {
  const color = tinycolor(baseColor);

  return {
    50: color.clone().lighten(40).toHexString(),
    100: color.clone().lighten(30).toHexString(),
    200: color.clone().lighten(20).toHexString(),
    300: color.clone().lighten(10).toHexString(),
    400: color.clone().lighten(5).toHexString(),
    500: color.toHexString(),
    600: color.clone().darken(5).toHexString(),
    700: color.clone().darken(10).toHexString(),
    800: color.clone().darken(20).toHexString(),
    900: color.clone().darken(30).toHexString(),
  };
};

const isValidHex = (color: string): boolean =>
  /^#([0-9A-F]{3}){1,2}$/i.test(color);

const getColorOrDefault = (brandColor: string, defaultColor: object) =>
  isValidHex(brandColor) ? generateColorScale(brandColor) : defaultColor;

// THESE ARE SETTING DEFAULT COLORS IN THE UI, UNCOMMENT IF/WHEN WE WANT TO ADD THIS FUNCTIONALITY
// REFERENCE SCHRA FOR HOW THIS IS DONE

// export const DEFAULT_THEME_PRIMARY = basePalette.colors.green;
// export const DEFAULT_THEME_SECONDARY = basePalette.colors.gray;
// export const DEFAULT_THEME_ACCENT = basePalette.colors.gray;

const colors = {
  primary: getColorOrDefault(BRAND_COLOR_PRIMARY, basePalette.colors.green),
  secondary: getColorOrDefault(BRAND_COLOR_SECONDARY, basePalette.colors.gray),
  accent: getColorOrDefault(BRAND_COLOR_ACCENT, basePalette.colors.gray),

  info: basePalette.colors.cyan,
  warning: basePalette.colors.yellow,
  success: basePalette.colors.green,
  danger: basePalette.colors.red,

  ...basePalette.colors,
};

export default colors;
