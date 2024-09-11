import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Center,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Category, ListPage, Me } from "ordercloud-javascript-sdk";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

interface CategoryNode extends Category {
  children: CategoryNode[];
  isLoaded: boolean;
  hasChildren: boolean;
}

interface CategoryListProps {
  renderItem?: (category: CategoryNode, depth: number) => JSX.Element;
}

const CategoryList: FunctionComponent<CategoryListProps> = ({ renderItem }) => {
  const { catalogId } = useParams<{ catalogId: string }>();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const checkForChildren = useCallback(
    async (categoryId: string): Promise<boolean> => {
      if (!catalogId) return false;
      try {
        const childResult = await Me.ListCategories({
          catalogID: catalogId,
          filters: { ParentID: categoryId },
          pageSize: 1,
        });
        return childResult.Items.length > 0;
      } catch (error) {
        console.error("Error checking for children:", error);
        return false;
      }
    },
    [catalogId]
  );

  const fetchCategories = useCallback(
    async (parentId?: string): Promise<CategoryNode[]> => {
      if (!catalogId) {
        console.error("No catalogId provided");
        return [];
      }

      try {
        const filters: { ParentID?: string } = parentId
          ? { ParentID: parentId }
          : {};
        const categoryResult: ListPage<Category> = await Me.ListCategories({
          catalogID: catalogId,
          filters,
          pageSize: 20, // Adjust as needed
        });

        const categoriesWithChildInfo = await Promise.all(
          (categoryResult.Items || []).map(async (category) => {
            const childrenExist = await checkForChildren(category.ID as string);
            return {
              ...category,
              children: [],
              isLoaded: false,
              hasChildren: childrenExist,
            };
          })
        );

        return categoriesWithChildInfo;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    [catalogId, checkForChildren]
  );

  const getCategories = useCallback(async () => {
    setLoading(true);
    const rootCategories = await fetchCategories();
    setCategories(rootCategories);
    setLoading(false);
  }, [fetchCategories]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const loadChildren = async (categoryId: string) => {
    const children = await fetchCategories(categoryId);
    setCategories((prevCategories) => {
      return updateCategoryChildren(prevCategories, categoryId, children);
    });
  };

  const updateCategoryChildren = (
    categories: CategoryNode[],
    categoryId: string,
    children: CategoryNode[]
  ): CategoryNode[] => {
    return categories.map((category) => {
      if (category.ID === categoryId) {
        return { ...category, children, isLoaded: true };
      } else if (category.children.length > 0) {
        return {
          ...category,
          children: updateCategoryChildren(
            category.children,
            categoryId,
            children
          ),
        };
      }
      return category;
    });
  };

  const renderCategory = (category: CategoryNode, depth: number = 0) => {
    if (renderItem) {
      return renderItem(category, depth);
    }

    if (!category.hasChildren) {
      return (
        <Link
          py={0}
          as={RouterLink}
          to={`/shop/${catalogId}/categories/${category.ID}/products`}
          key={category.ID}
          fontWeight={depth === 0 ? "bold" : "normal"}
          ml="auto"
          w="full"
        >
          {category.Name}
        </Link>
      );
    }

    return (
      <Accordion allowMultiple key={category.ID}>
        <AccordionItem border="none">
          <AccordionButton
            px="0"
            py={0}
            display="flex"
            justifyContent="space-between"
            onClick={() =>
              !category.isLoaded && category.ID && loadChildren(category.ID)
            }
          >
            <Link
              as={RouterLink}
              to={`/shop/${catalogId}/categories/${category.ID}/products`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Text fontWeight={depth === 0 ? "bold" : "normal"}>
                {category.Name}
              </Text>
            </Link>
            <AccordionIcon alignSelf="flex-end" />
          </AccordionButton>
          <AccordionPanel py={3}>
            {category.isLoaded ? (
              <VStack align="stretch" spacing={2}>
                {category.children.map((child) =>
                  renderCategory(child, depth + 1)
                )}
              </VStack>
            ) : (
              <Center>
                <Spinner size="sm" color="secondary.300" />
              </Center>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  if (loading) {
    return (
      <Center height="75vh">
        <Spinner size="xl" thickness="10px" color="secondary.300" />
      </Center>
    );
  }

  if (categories.length === 0) {
    return (
      <Center height="75vh">
        <Heading size="lg" color="chakra-subtle-text">
          No categories found
        </Heading>
      </Center>
    );
  }

  return (
    <SimpleGrid
      gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      spacing={12}
      w="full"
    >
      {categories.map((category) => renderCategory(category))}
    </SimpleGrid>
  );
};

export default CategoryList;
