import { extendTheme } from '@chakra-ui/react'
import foundations from './foundations/index'

const acceleratorAdminTheme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
    cssVarPrefix: 'schra',
  },
  ...foundations,
})

export default acceleratorAdminTheme
