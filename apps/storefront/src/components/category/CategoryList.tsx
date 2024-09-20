import { Center, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import { Category, ListPage, Me } from "ordercloud-javascript-sdk";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import CategoryCard from "./CategoryCard";

export interface CategoryListProps {
  renderItem?: (category: Category) => JSX.Element;
}

const CategoryList: FunctionComponent<CategoryListProps> = ({ renderItem }) => {
  const { catalogId, categoryId } = useParams<{ catalogId: string, categoryId?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getCategories = useCallback(async () => {
    if (!catalogId) {
      console.error("No catalogId provided");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const filters:any = {};
      if (categoryId) {
        filters['ParentID'] = categoryId;
      }
      const categoryResult: ListPage<Category> = await Me.ListCategories({
        catalogID: catalogId,
        filters,
        pageSize: 20, // Adjust as needed
      });
      setCategories(categoryResult.Items || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [catalogId, categoryId]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" thickness="10px" />
      </Center>
    );
  }

  if (categories.length === 0) {
    return (
      <Center h="50vh">
        <Heading color="chakra-subtle-color">
          No categories found
        </Heading>
      </Center>
    );
  }

  return (
    <SimpleGrid
      py={12}
      gridTemplateColumns="repeat(auto-fill, minmax(270px, 1fr))"
      spacing={4}
    >
      {categories.map((category) => (
        <React.Fragment key={category.ID}>
          {renderItem ? (
            renderItem(category)
          ) : (
            <CategoryCard category={category} catalogId={catalogId} />
          )}
        </React.Fragment>
      ))}
    </SimpleGrid>
  );
};

export default CategoryList;
