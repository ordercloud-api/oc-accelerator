import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { startCase } from "lodash";
import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import useBreadcrumbItems from "../../hooks/useBreadcrumbItems";

const Breadcrumbs = () => {
  const params = useParams();
  const location = useLocation();
  const { items } = useBreadcrumbItems();

  const parsedBreadcrumbs = useMemo(() => {
    const [path, query] = (location.pathname ?? "").split("?");
    const partials = path.split("/").slice(1);

    const breadcrumbs = partials.map((partial, index) => {
      const partialPath = `/${partials.slice(0, index + 1).join("/")}${
        query ? `?${query}` : ""
      }`;

      if (Object.values(params).includes(partial)) {
        const item = Object.values(items).find((item) => item?.ID === partial);
        return {
          item: item || { ID: startCase(partial) },
          path: partialPath,
        };
      } else {
        return {
          item: { ID: startCase(partial) },
          path: partialPath,
        };
      }
    });

    return breadcrumbs;
  }, [location, params, items]);

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
      {parsedBreadcrumbs.map((bi, i) => {
        if (!(bi && bi.item)) return null;
        return (
          <BreadcrumbItem
            key={i}
            isCurrentPage={i === parsedBreadcrumbs.length - 1}
          >
            <BreadcrumbLink as={Link} to={bi.path}>
              {bi.item.ID}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
