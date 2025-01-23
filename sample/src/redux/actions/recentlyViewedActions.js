import { ADD_TO_RECENTLY_VIEWED } from "./types";

export const addToRecentlyViewed = (product, recentlyViewed) => {
    const productExists = recentlyViewed.find((p) => p.id === product.id);
  
    let updatedProducts = [...recentlyViewed];
  
    if (productExists) {
      updatedProducts = updatedProducts.filter((p) => p.id !== product.id);
    }
  
    updatedProducts.unshift(product);
  
    if (updatedProducts.length > 10) {
      updatedProducts = updatedProducts.slice(0, 10);
    }
  
    return {
      type: ADD_TO_RECENTLY_VIEWED,
      payload: updatedProducts,
    };
  };