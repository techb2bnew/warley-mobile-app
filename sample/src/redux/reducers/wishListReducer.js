import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST, CLEAR_WISHLIST } from '../actions/types';

const initialState = {
  wishlist: [],
  lastAction: null,
};

const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_WISHLIST:
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload.productId],
        lastAction: ADD_TO_WISHLIST,
      };
      case REMOVE_FROM_WISHLIST:
        console.log('Action payload productId:', action.payload.productId);  // Log the productId
        const updatedWishlist = state.wishlist.filter(item => item.id !== action.payload.productId);
        console.log('Updated wishlist:', updatedWishlist);
        return {
          ...state,
          wishlist: updatedWishlist,
          lastAction: REMOVE_FROM_WISHLIST,
        };
    case CLEAR_WISHLIST: // New case for clearing the wishlist
      return {
        ...state,
        wishlist: [],
        lastAction: CLEAR_WISHLIST,
      };
    default:
      return state;
  }
};

export default wishlistReducer;

