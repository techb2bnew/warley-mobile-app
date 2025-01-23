import { combineReducers } from 'redux';
import wishlistReducer from './wishListReducer';
import authReducer from './authReducer';
import cartReducer from './cartReducer';
import menuReducer from './menuReducer';
import { recentlyViewedReducer } from './recentlyViewedReducer';

const rootReducer = combineReducers({
  wishlist: wishlistReducer,
  auth: authReducer,
  cart: cartReducer,
  menu: menuReducer,
  recentlyViewed: recentlyViewedReducer,
});

export default rootReducer;
