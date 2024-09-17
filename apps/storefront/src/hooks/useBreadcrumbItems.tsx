import { FC, PropsWithChildren, useState, createContext, useContext, useCallback } from 'react'

interface BreadcrumbItems {
  [resourceId: string]: any
}

interface BreadcrumbItemsContext {
  methods: any
  items: BreadcrumbItems
}

const breadCrumbItemsContext = createContext<BreadcrumbItemsContext>({
  methods: {},
  items: {},
})

export const BreadCrumbItemsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<BreadcrumbItems>({})

  const setResourceItem = useCallback((resourceName: string, item: any) => {
    setItems((bi) => ({ ...bi, [resourceName]: item }))
  }, [])

  return (
    <breadCrumbItemsContext.Provider
      value={{
        methods: { setResourceItem },
        items,
      }}
    >
      {children}
    </breadCrumbItemsContext.Provider>
  )
}

const useBreadcrumbItems = () => {
  return useContext(breadCrumbItemsContext)
}

export default useBreadcrumbItems
