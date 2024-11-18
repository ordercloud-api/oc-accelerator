import { extendTheme } from '@chakra-ui/react'
import foundations from './foundations/index'

const acceleratorAdminTheme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
    cssVarPrefix: 'accelerator',
  },
  styles: {
    global: {
      '#root': {
        display: 'grid',
        gridTemplateAreas:`"header header"
                           "nav main"
                           "nav footer"`,
        gridTemplateRows: '50px 1fr 50px',
        gridTemplateColumns: '300px 1fr',
        h: '100vh',
      },
    },
  },
  ...foundations,
})

export default acceleratorAdminTheme
