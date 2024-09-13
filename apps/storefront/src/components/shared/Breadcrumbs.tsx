import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { useMemo } from "react";
import { Link, useMatches } from "react-router-dom";

const Breadcrumbs = () => {
  const matches = useMatches();

  const parsedBreadcrumbs = useMemo(() => {
    return matches
      .filter((match) => match.handle && match.handle.crumb)
      .map((match) => {
        const Crumb = match.handle.crumb;
        const params = match.params;

        return {
          element: <Crumb params={params} />,
          path: match.pathname,
        };
      });
  }, [matches]);

  if (parsedBreadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb
      px={8}
      py={1}
      position="sticky"
      top={12}
      zIndex={6}
      background="blackAlpha.200"
      fontSize="sm"
      sx={{
        "&>ol>li:last-of-type>a": {
          color: "primary.400",
        },
      }}
    >
      {parsedBreadcrumbs.map((breadcrumb, idx) => (
        <BreadcrumbItem
          key={idx}
          isCurrentPage={idx === parsedBreadcrumbs.length - 1}
        >
          <BreadcrumbLink as={Link} to={breadcrumb.path}>
            {breadcrumb.element}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
