import { ADD_TO_RECENTLY_VIEWED } from "../actions/types";


const initialState = [];

// Reducer to manage recently viewed products
export const recentlyViewedReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_RECENTLY_VIEWED:
      return action.payload;
    default:
      return state;
  }
};
