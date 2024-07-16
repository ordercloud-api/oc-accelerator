import {
  Button,
  Divider,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Switch,
  useColorMode,
  useColorModeValue,
  useModalContext,
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { brandContext, DEFAULT_THEME_COLORS } from '../Shared/branding/Chakra'
import { ColorPicker } from '../Shared/branding/ColorPicker'

export const ThemeDrawer = () => {
  const { colors, setColors } = useContext(brandContext)
  const [selectedColors, setSelectedColors] = useState(colors || DEFAULT_THEME_COLORS)
  const { colorMode, toggleColorMode } = useColorMode()
  const { onClose } = useModalContext()
  const [currentColorMode, setCurrentColorMode] = useState(colorMode)

  const handleColorChange = (colorID: string, newValue: any) => {
    setSelectedColors((c) => ({
      ...(c || DEFAULT_THEME_COLORS),
      [colorID]: newValue,
    }))
  }

  const handleChangeColorMode = () => {
    setCurrentColorMode((c) => (c === 'light' ? 'dark' : 'light'))
    setTimeout(() => {
      toggleColorMode()
    }, 100)
  }

  const handleApplyTheme = () => {
    if (setColors) setColors(selectedColors)
    // if (setFonts) setFonts(selectedFonts)
    onClose()
  }

  const handleResetTheme = () => {
    if (setColors) setColors(DEFAULT_THEME_COLORS)
    // if (setFonts) setFonts(undefined)
    onClose()
  }

  const color = useColorModeValue('textColor.900', 'textColor.100')

  return (
    <>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader color={color}>Theming</DrawerHeader>
        <DrawerBody
          color={color}
          display="flex"
          flexFlow="column nowrap"
          gap={6}
        >
          <FormControl
            display="flex"
            gap={4}
          >
            <Switch
              isChecked={currentColorMode === 'dark'}
              onChange={handleChangeColorMode}
              colorScheme={'primary'}
              id="toggleColorMode"
              size="lg"
            />
            <FormLabel htmlFor="toggleColorMode">Toggle {colorMode} mode</FormLabel>
          </FormControl>
          <Divider />
          <ColorPicker
            colors={selectedColors}
            onChange={handleColorChange}
          />
        </DrawerBody>
        <DrawerFooter
          gap={4}
          flexFlow="row wrap"
          justifyContent="center"
          alignItems={'center'}
        >
          <Button
            variant="solid"
            colorScheme="primary"
            onClick={handleApplyTheme}
            flexGrow={1}
          >
            Apply Theming
          </Button>

          <Button
            onClick={handleResetTheme}
            variant="outline"
            colorScheme="danger"
            inset="unset"
          >
            Reset
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </>
  )
}
