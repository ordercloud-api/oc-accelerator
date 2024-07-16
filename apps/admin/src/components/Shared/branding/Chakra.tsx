import { ChakraProvider, extendTheme, localStorageManager } from '@chakra-ui/react'
import { appSettings } from '../../../config/appSettings'
import useLocalStorage from '../../../hooks/useLocalStorage'
import React, { useMemo } from 'react'
import tinycolor from 'tinycolor2'
import acceleratorAdminTheme from '../../../theme/theme'
// import {buildFontHref} from "../utils/font.utils"

interface ChakraProps {
  children: React.ReactNode
}
interface IBrandContext {
  colors?: {
    accent: string
    primary: string
    secondary: string
  }
  fonts?: {
    heading: string
    body: string
  }
  setFonts?: (newFonts: any) => void
  setColors?: (newColors: any) => void
}

export const brandContext = React.createContext<IBrandContext>({})

export const DEFAULT_THEME_COLORS = {
  accent: appSettings.themeColorAccent,
  primary: appSettings.themeColorPrimary,
  secondary: appSettings.themeColorSecondary,
}

export const Chakra = ({ children }: ChakraProps) => {
  const [colors, setColors] = useLocalStorage('themeColors', DEFAULT_THEME_COLORS)

  function generatePalette(hex: string): any {
    return {
      50: tinycolor(hex).lighten(37.7).saturate(10.4).spin(-13).toHexString(),
      100: tinycolor(hex).lighten(31.8).saturate(10.4).spin(-9.5).toHexString(),
      200: tinycolor(hex).lighten(18.7).desaturate(17).spin(-3.9).toHexString(),
      300: tinycolor(hex).lighten(9.1).desaturate(20.9).spin(-4).toHexString(),
      400: tinycolor(hex).lighten(4.1).desaturate(6.6).spin(-3).toHexString(),
      500: hex,
      600: tinycolor(hex).darken(3.1).desaturate(12.4).spin(-2.7).toHexString(),
      700: tinycolor(hex).darken(7.8).desaturate(24.5).spin(-4).toHexString(),
      800: tinycolor(hex).darken(11.7).desaturate(23.2).spin(-4).toHexString(),
      900: tinycolor(hex).darken(17).desaturate(16.1).spin(-4).toHexString(),
    }
  }

  const currentTheme = useMemo(() => {
    const updatedColors = {
      accent: generatePalette(colors?.accent),
      primary: generatePalette(colors?.primary),
      secondary: generatePalette(colors?.secondary),
    }
    return extendTheme(
      {
        colors: updatedColors,
      },
      acceleratorAdminTheme
    )
  }, [colors])

  return (
    <brandContext.Provider value={{ colors, setColors }}>
      <ChakraProvider
        colorModeManager={localStorageManager}
        theme={currentTheme}
      >
        {children}
      </ChakraProvider>
    </brandContext.Provider>
  )
}
