import {
  THEME_COLOR_ACCENT,
  THEME_COLOR_PRIMARY,
  THEME_COLOR_SECONDARY,
  THEME_LOGO_URL,
} from '../constants/constants'
import {
  DEFAULT_THEME_ACCENT,
  DEFAULT_THEME_PRIMARY,
  DEFAULT_THEME_SECONDARY,
} from '../theme/foundations/colors'

const getEnvironmentVariable = (
  name: string,
  value?: string,
  defaultValue?: any,
  isRequired = true
): any => {
  if (!value && !defaultValue && isRequired) {
    throw new Error(
      `Please provide value for required environment variable: ${name} and then restart the dev server so that the changes can take effect`
    )
  } else if (!value) {
    return defaultValue
  } else {
    if (typeof defaultValue === 'boolean') {
      return value === 'true'
    }
    return value
  }
}

export const appSettings = {
  themeColorAccent: getEnvironmentVariable(
    'VITE_APP_PUBLIC_THEME_COLOR_ACCENT',
    THEME_COLOR_ACCENT,
    DEFAULT_THEME_ACCENT['500']
  ),
  themeColorPrimary: getEnvironmentVariable(
    'VITE_APP_PUBLIC_THEME_COLOR_PRIMARY',
    THEME_COLOR_PRIMARY,
    DEFAULT_THEME_PRIMARY['500']
  ),
  themeColorSecondary: getEnvironmentVariable(
    'VITE_APP_PUBLIC_THEME_COLOR_SECONDARY',
    THEME_COLOR_SECONDARY,
    DEFAULT_THEME_SECONDARY['500']
  ),
  themeLogoUrl: getEnvironmentVariable('VITE_APP_PUBLIC_THEME_LOGO_URL', THEME_LOGO_URL, '', false),
}
