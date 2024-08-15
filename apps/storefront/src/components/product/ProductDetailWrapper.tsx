import { useParams } from "react-router-dom";
import ProductDetail from "./ProductDetail";

const ProductDetailWrapper = () => {
  const { productId } = useParams<{ productId: string }>();  
  return <ProductDetail productId={productId || ""} />;
};

export default ProductDetailWrapper;
