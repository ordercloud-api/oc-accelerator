import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import Case from 'case'
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import useBreadcrumbItems from '../../hooks/useBreadcrumbItems'
import { renderResourceDisplayName } from '../ResourceDetail/ResourceDetail'

const AdminBreadcrumbs = () => {
  const params = useParams()
  const location = useLocation()
  const { items } = useBreadcrumbItems()

  const hasDirectionParam = useMemo(
    () => Object.prototype.hasOwnProperty.call(params, 'direction'),
    [params]
  )

  const parsedBreadcrumbs = useMemo(() => {
    const partials = location.pathname.split('/').slice(1)

    return partials.map((partial, index) => {
      const partialPath = `/${partials.slice(0, index + 1).join('/')}${
        hasDirectionParam && partial === 'orders' ? '/incoming' : ''
      }?${location.search}`

      if (hasDirectionParam && ['incoming', 'outgoing', 'all'].includes(partial.toLowerCase())) {
        return null
      }

      if (Object.values(params).includes(partial)) {
        const item = Object.values(items).find((item) => item.ID === partial)
        return { item: item || { ID: partial }, path: partialPath }
      } else {
        return {
          item: { ID: Case.title(partial) },
          path: partialPath,
        }
      }
    })
  }, [location, params, items, hasDirectionParam])

  if (parsedBreadcrumbs?.filter(b => !!b)?.length <= 1) {
    return null
  }
  return (
    <Breadcrumb
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex={6}
      background="chakra-subtle-bg"
    >
      {parsedBreadcrumbs.map((bi, i) => {
        if (!(bi && bi.item)) return null
        return (
          <BreadcrumbItem
            fontSize="xs"
            key={i}
            isCurrentPage={i === parsedBreadcrumbs.length - 1}
          >
            <BreadcrumbLink
              as={Link}
              to={bi.path}
            >
              {renderResourceDisplayName(bi.item)}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

export default AdminBreadcrumbs
