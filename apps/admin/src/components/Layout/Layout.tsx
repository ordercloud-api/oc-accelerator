import {
  Button,
  ButtonProps,
  Container,
  Drawer,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { useOrderCloudContext } from '@ordercloud/react-sdk'
import 'overlayscrollbars/overlayscrollbars.css'
import { FC, Fragment, PropsWithChildren, forwardRef, useEffect, useMemo, useRef } from 'react'
import { TbPalette } from 'react-icons/tb'
import { Link, Outlet, matchPath, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/currentUser'
import { resources } from '../../routes/resources'
import LoginModal from '../Authentication/LoginModal'
import { HeaderLogo } from '../Shared/branding/HeaderLogo'
import AdminBreadcrumbs from './AdminBreadcrumbs'
import { ThemeDrawer } from './ThemeDrawer'

interface NavButtonProps extends PropsWithChildren<ButtonProps> {
  to: string
}

export const NavButton = forwardRef<ButtonProps, NavButtonProps>(({ to, ...props }, ref) => {
  const { pathname } = useLocation()

  const isActive = useMemo(() => {
    if(!to) return false
    return matchPath({ path: to, end: false }, pathname) !== null
  }, [pathname, to])

  return (
    <Button
      isActive={isActive}
      ref={ref}
      as={Link}
      w="full"
      to={to}
      {...props}
    />
  )
})

//TODO: added this because the login was flashing on first page load when authenticated
//Unsure if this will persist when in a production environment
let showLoginTimeout: NodeJS.Timeout

const Layout: FC = () => {
  const { data: user } = useCurrentUser()
  const { allowAnonymous, isAuthenticated, isLoggedIn, logout } = useOrderCloudContext()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>(null)

  const loginDisclosure = useDisclosure()

  useEffect(() => {
    if (showLoginTimeout) {
      clearTimeout(showLoginTimeout)
    }
    if (!allowAnonymous && !isAuthenticated) {
      showLoginTimeout = setTimeout(() => {
        loginDisclosure.onOpen()
      }, 300)
    } else if (loginDisclosure.isOpen && isLoggedIn) {
      loginDisclosure.onClose()
    }
  }, [loginDisclosure, allowAnonymous, isAuthenticated, isLoggedIn])

  return (
    <>
      <LoginModal disclosure={loginDisclosure} />
        <GridItem
          as="header"
          area="header"
          zIndex={2}
          borderBottom="1px"
          borderBottomColor="chakra-border-color"
        >
          <Container
            h="100%"
            maxW="full"
          >
            <HStack
              h="100%"
              justify="space-between"
              alignItems="center"
            >
              <HeaderLogo width={['200px', 'auto']} />
              <HStack>
                <Text
                  fontSize="sm"
                  color="chakra-subtle-text"
                >
                  {isLoggedIn ? `Welcome, ${user?.FirstName} ${user?.LastName}` : 'Welcome'}
                </Text>
                <IconButton
                  size="xs"
                  onClick={onOpen}
                  aria-label={`App Theming`}
                  icon={<Icon as={TbPalette} />}
                />
                {isLoggedIn ? (
                  <Button
                    size="xs"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    onClick={loginDisclosure.onOpen}
                  >
                    Login
                  </Button>
                )}
              </HStack>
            </HStack>
          </Container>
        </GridItem>
        <GridItem
          area="nav"
          as="aside"
          zIndex={1}
          borderRight="1px solid"
          borderColor="chakra-border-color"
          bg="chakra-subtle-bg"
          p="3"
        >
          <VStack>
            {resources
              .filter((r) => !!r.label)
              .map((r, idx) => {
                let to = r.path || ''
                if (r.defaultParams) {
                  Object.entries(r.defaultParams).forEach((e) => {
                    to = to.replace(`:${e[0]}`, e[1])
                  })
                }
                return (
                  <Fragment key={idx}>
                    <NavButton
                      to={to}
                      variant="ghost"
                      justifyContent="start"
                    >
                      {r.label}
                    </NavButton>

                    {r.children
                      ?.filter((r) => !!r.label)
                      .map((r, childIdx) => {
                        let to = r.path || ''
                        if (r.defaultParams) {
                          Object.entries(r.defaultParams).forEach((e) => {
                            to = to.replace(`:${e[0]}`, e[1])
                          })
                        }

                        return (
                          <Fragment key={childIdx}>
                            <NavButton
                              to={to}
                              variant="ghost"
                              justifyContent="start"
                            >
                              {r.label}
                            </NavButton>
                          </Fragment>
                        )
                      })}
                  </Fragment>
                )
              })}
          </VStack>
        </GridItem>
        <GridItem
          as="main"
          area="main"
          overflowY="auto"
          overflowX="hidden"
        >
          <AdminBreadcrumbs />
          <Outlet />
        </GridItem>
        <GridItem
          display="flex"
          alignItems="center"
          justifyContent="center"
          as="footer"
          area="footer"
          bg="blackAlpha.50"
        >
          <Text
            fontWeight="normal"
            fontSize="sm"
          >
            © Sitecore Inc. {new Date().getFullYear()}
          </Text>
        </GridItem>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <ThemeDrawer />
      </Drawer>
    </>
  )
}

export default Layout
