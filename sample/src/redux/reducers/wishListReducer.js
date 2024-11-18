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
      return {
        ...state,
        wishlist: state.wishlist.filter(id => id !== action.payload.productId),
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

