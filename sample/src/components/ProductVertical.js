// import React, { useState, useEffect } from 'react';
// import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator, Platform, PlatformColor } from 'react-native';
// import { blackColor, grayColor, redColor, whiteColor, lightGreenColor, lightGrayColor, lightGrayOpacityColor } from '../constants/Color'
// import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
// import { spacings, style } from '../constants/Fonts';
// import { BaseStyle } from '../constants/Style';
// import { ADD_TO_CART, INSTOCK, OUT_OF_STOCK } from '../constants/Constants';
// import Ionicons from 'react-native-vector-icons/dist/Ionicons';
// import AntDesign from 'react-native-vector-icons/dist/AntDesign';
// import QuickViewModal from './Modal/QuickViewModal'
// import { useDispatch, useSelector } from 'react-redux';
// import { addToWishlist, removeFromWishlist } from '../redux/actions/wishListActions';
// import { logEvent } from '@amplitude/analytics-react-native';
// import { addProductToCart, removeProductFromCart } from '../redux/actions/cartActions';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useThemes } from '../context/ThemeContext';
// import { lightColors, darkColors } from '../constants/Color';
// import { ADD_TO_CART_IMG } from '../assests/images';
// const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1, textAlign, resizeModeContain, positionAbsolute } = BaseStyle;

// const ProductVertical = ({ product, onAddToCart, inventoryQuantity, loading, onPress, option, ids, width, height, spaceTop }) => {
//   const { isDarkMode } = useThemes();
//   const colors = isDarkMode ? darkColors : lightColors;
//   const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
//   const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
//   const priceAmount = price?.price ? price?.price : price?.amount;
//   const currencyCode = price ? price?.currencyCode : null;
//   const [quantity, setQuantity] = useState(1);
//   const outOfStock = inventoryQuantity && inventoryQuantity[0] === 0;
//   const [modalVisible, setModalVisible] = useState(false);
//   const dispatch = useDispatch();
//   const wishList = useSelector(state => state.wishlist.wishlist);
//   const isSelected = wishList.some(item => item.id === product.id);
//   const cart = useSelector(state => state.cart.cartItems);
//   const isInCart = cart.some(item => item.id === product.id);
//   const [showQuantity, setShowQuantity] = useState(false);
//   const [shopCurrency, setShopCurrency] = useState('');
//   const [customerId, setCustomerId] = useState("")
//   const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
//   useEffect(() => {
//     if (!isInCart) {
//       setShowQuantity(false);
//     }
//   }, [cart, isInCart]);

//   useEffect(() => {
//     const fetchCurrency = async () => {
//       try {
//         const shopCurrency = await AsyncStorage.getItem('shopCurrency');
//         if (shopCurrency) {
//           setShopCurrency(shopCurrency);
//         }
//       } catch (error) {
//         console.error('Error fetching shop currency:', error);
//       }
//     };
//     fetchCurrency();
//     fetchUserDetails()
//   }, []);

//   const fetchUserDetails = async () => {
//     const userDetails = await AsyncStorage.getItem('userDetails')
//     if (userDetails) {
//       const userDetailsObject = JSON.parse(userDetails);
//       const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
//       setCustomerId(userId)
//     }
//   };

//   const addToWishlistApi = async (customerId, productData) => {
//     try {
//       // Retrieve the token from AsyncStorage
//       const token = await AsyncStorage.getItem('authToken');
//       if (!token) {
//         console.error('Token not found');
//         return;
//       }

//       // Set up the request headers
//       const myHeaders = new Headers();
//       myHeaders.append("Content-Type", "application/json");
//       myHeaders.append("Authorization", `Bearer ${token}`);

//       // Prepare the payload for the request
//       const raw = JSON.stringify({
//         "customerId": customerId,
//         "productData": productData
//       });

//       // Set up the request options
//       const requestOptions = {
//         method: "POST",
//         headers: myHeaders,
//         body: raw,
//         redirect: "follow"
//       };

//       // Make the API request
//       const response = await fetch("https://warley-thv5m.ondigitalocean.app/api/addToWishlist", requestOptions);

//       // Check if the response is successful
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Error adding to wishlist:', errorText);
//         return;
//       }

//       // Parse and handle the response
//       const result = await response.json();
//       console.log('Product added to wishlist via API:', result);

//     } catch (error) {
//       console.error('Error adding to wishlist:', error);
//       throw error; // Propagate the error
//     }
//   };

//   const removeFromWishlistAPI = async (customerId, productId) => {
//     try {
//       // Retrieve the token from AsyncStorage
//       const token = await AsyncStorage.getItem('authToken');
//       if (!token) {
//         console.error('Token not found');
//         return;
//       }

//       // Make the API request to remove product from wishlist
//       const response = await fetch(`https://warley-thv5m.ondigitalocean.app/api/wishlist/${customerId}/product/${productId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       // Check if the response is successful
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to remove from wishlist: ${errorText}`);
//       }

//       // Parse and log the response
//       const result = await response.json();
//       console.log('Product removed from wishlist via API:', result);
//       return result;
//     } catch (error) {
//       console.error('Error removing from wishlist:', error);
//       throw error;
//     }
//   };

//   // const handlePress = async () => {
//   //   const productWithInventory = {
//   //     ...product,
//   //     inventoryQuantity: inventoryQuantity,
//   //   };

//   //   try {
//   //     // If already selected, remove from wishlist
//   //     if (isSelected) {
//   //       // Wait for the API response before dispatching Redux action
//   //       const apiResponse = await removeFromWishlistAPI(customerId, product.id);

//   //       // If API request is successful, dispatch to Redux
//   //       if (apiResponse) {
//   //         dispatch(removeFromWishlist(product));
//   //         logEvent(`Product removed from wishlist, ProductId: ${product.id}`);
//   //       }
//   //     } else {
//   //       // If not selected, add to wishlist
//   //       const apiResponse = await addToWishlist(customerId, product);

//   //       // If API request is successful, dispatch to Redux
//   //       if (apiResponse) {
//   //         dispatch(addToWishlist(product));
//   //         logEvent(`Product added to wishlist, ProductId: ${product.id}`);
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.error('Error handling wishlist:', error);
//   //   }
//   // };

//   const handlePress = () => {
//     const productWithInventory = {
//       ...product,
//       inventoryQuantity: inventoryQuantity
//     };
//     if (!isSelected) {
//       dispatch(addToWishlist(product));
//       if (userLoggedIn) {
//         addToWishlistApi(customerId, product)
//       }
//       logEvent(`Product Add to wishlish ProductId: ${product.id}`);
//     } else {
//       dispatch(removeFromWishlist(product));
//       logEvent(`Product remove from wishlist ProductId: ${product.id}`);
//     }
//   };

//   const incrementQuantity = () => {
//     logEvent('Increase Product Quantity');
//     setQuantity(quantity + 1);
//     onAddToCart(product?.variants?.edges ? product?.variants?.edges[0]?.node?.id : product?.variants?.nodes[0]?.id, 1);
//   };

//   const decrementQuantity = () => {
//     logEvent('Decrease Product Quantity');
//     if (quantity > 1) {
//       setQuantity(quantity - 1);
//     }
//   };

//   const showQuickViewModal = () => {
//     setModalVisible(true)
//     logEvent(`Quick view modal open for  ${product.id}`)
//   }

//   const handleAddToCart = () => {
//     logEvent('Add to Cart');
//     onAddToCart(product?.variants?.edges ? product?.variants?.edges[0]?.node?.id : product?.variants?.nodes[0]?.id, quantity);
//     setShowQuantity(true);
//   };

//   const trimcateText = (text, maxLength = 15) => {
//     if (text.length > maxLength) {
//       return text.substring(0, maxLength) + '...';
//     }
//     return text;
//   };

//   return (
//     <Pressable style={[styles.productContainer, {
//       width: width ? width : wp(42), height: height ? height : wp(51), backgroundColor: isDarkMode ? grayColor : whiteColor,
//       marginVertical: isDarkMode ? spacings.normalx : spaceTop, marginHorizontal: spaceTop ? 0 : 5, borderRadius: 10, overflow: "hidden"
//     }]} onPress={onPress}>
//       <View style={{ width: "100%", marginBottom: spacings.small, borderRadius: 10 }}>
//         {/* <TouchableOpacity style={[positionAbsolute, alignJustifyCenter, styles.eyeButton]} onPress={showQuickViewModal}>
//           <Ionicons
//             name="eye-outline"
//             size={18}
//             color={blackColor}
//           />
//         </TouchableOpacity> */}
//         <Image
//           source={{ uri: imageSource }}
//           style={[styles.productImage, resizeModeContain]}
//         />
//       </View>
//       <View style={[styles.contentBox]}>
//         <View style={[{ width: width ? width : wp(43), height: hp(108), alignSelf: "center" }]}>
//           <View style={{ width: "100%", flexDirection: "row", paddingHorizontal: 5, height: Platform === "android" ? hp(10) : hp(4.5) }}>
//             <View style={{ width: "70%", paddingLeft: 3 }}>
//               <Text style={[styles.productName, { paddingRight: spacings.small, color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
//             </View>
//             <TouchableOpacity style={[positionAbsolute, alignJustifyCenter, styles.favButton]} onPress={handlePress}>
//               <AntDesign
//                 name={isSelected ? "heart" : "hearto"}
//                 size={18}
//                 color={isSelected ? redColor : colors.grayColor}
//               />
//             </TouchableOpacity>
//           </View>
//           <View style={{ flexDirection: "row", justifyContent: "space-between", height: hp(4) }}>
//             <View style={{ paddingLeft: 3 }}>
//               {priceAmount && (
//                 <Text style={[styles.productPrice, { color: colors.blackColor, marginTop: 10, paddingLeft: spacings.medium }]}>
//                   {currencyCode ? currencyCode === "GBP" && "£" : shopCurrency} {priceAmount}
//                 </Text>)}
//             </View>
//             <View style={[{}]}>
//               {loading ? (
//                 <View style={[styles.addToCartButton, { padding: spacings.large }]}>
//                   <ActivityIndicator size="small" color={redColor} />
//                 </View>
//               ) : (showQuantity && !outOfStock ? (
//                 <View style={[styles.quantityContainer]}>
//                   <TouchableOpacity onPress={decrementQuantity}>
//                     <AntDesign
//                       name={"minuscircle"}
//                       size={25}
//                       color={"#eb4335"}
//                     />
//                   </TouchableOpacity>
//                   <Text style={styles.quantity}>{quantity}</Text>
//                   <TouchableOpacity onPress={incrementQuantity}  >
//                     <AntDesign
//                       name={"pluscircle"}
//                       size={25}
//                       color={"#eb4335"}
//                     />
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 !outOfStock && (
//                   <Pressable
//                     style={{ position: "absolute", bottom: Platform.OS === "android" ? -18 : -10, right: 0 }}
//                     onPress={handleAddToCart}>
//                     <Image
//                       source={ADD_TO_CART_IMG}
//                       style={{ height: hp(6), width: wp(10), resizeMode: "contain" }}
//                     />
//                   </Pressable>
//                 )
//               ))}
//               {outOfStock && (
//                 <View style={[styles.addToCartButton, { width: isDarkMode ? wp(21) : wp(22) }]}>
//                   <Text style={[styles.addToCartButtonText, { marginTop: spacings.large }]}>{OUT_OF_STOCK}</Text>
//                 </View>
//               )}

//             </View>
//           </View>

//         </View>
//         <QuickViewModal
//           modalVisible={modalVisible}
//           setModalVisible={setModalVisible}
//           product={product}
//           options={option}
//           ids={ids}
//           shopCurrency={shopCurrency}
//         />
//       </View>

//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   productContainer: {
//     paddingBottom: spacings.large,
//     marginRight: 10,
//     borderWidth: .5,
//     borderColor: "#d9d9d9"
//   },
//   productImage: {
//     width: "100%",
//     height: hp(13.5),
//     borderRadius: 10,
//     // alignSelf: "center",
//     marginBottom: spacings.large
//   },
//   productName: {
//     fontSize: style.fontSizeNormal.fontSize,
//     fontWeight: style.fontWeightThin1x.fontWeight,
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   text: {
//     color: "#006400",
//     fontSize: style.fontSizeNormal.fontSize,
//     fontWeight: style.fontWeightThin.fontWeight,
//   },
//   productPrice: {
//     fontSize: style.fontSizeSmall1x.fontSize,
//     fontWeight: style.fontWeightMedium.fontWeight,
//     color:blackColor,
//     fontFamily: 'arialnarrow'
//   },
//   contentBox: {
//     width: "100%",
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: wp(23),
//     // backgroundColor: "red",
//     // paddingHorizontal: 9,
//     paddingVertical: 2,
//     justifyContent: "center",
//   },
//   quantityButton: {
//     paddingHorizontal: 8,
//     paddingTop: 1,
//     borderRadius: 5,
//     color: whiteColor,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   quantity: {
//     paddingHorizontal: 5,
//     paddingVertical: 2,
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: blackColor,
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   addToCartButton: {
//     borderRadius: 10,
//     fontSize: 8,
//   },
//   addToCartButtonText: {
//     fontSize: 10.5,
//     lineHeight: 18,
//     color: redColor,
//     fontWeight: '100',
//     textAlign: 'center',
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   favButton: {
//     width: wp(10),
//     paddingVertical: 4,
//     right: 0,
//     // bottom: 20,
//     zIndex: 10,
//   },
//   eyeButton: {
//     width: wp(8),
//     height: wp(8),
//     right: 3,
//     top: 6,
//     zIndex: 10,
//     borderRadius: 10,
//   },
// });

// export default ProductVertical;


import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator, Platform, PlatformColor } from 'react-native';
import { blackColor, grayColor, redColor, whiteColor, lightGreenColor, lightGrayColor, lightGrayOpacityColor } from '../constants/Color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { ADD_TO_CART, INSTOCK, OUT_OF_STOCK } from '../constants/Constants';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import QuickViewModal from './Modal/QuickViewModal'
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/actions/wishListActions';
import { logEvent } from '@amplitude/analytics-react-native';
import { addProductToCart, removeProductFromCart } from '../redux/actions/cartActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { ADD_TO_CART_IMG, COMING_SOON_IMG } from '../assests/images';
import { useCart } from '../context/Cart';
import useShopify from '../hooks/useShopify';
import Toast from 'react-native-simple-toast';
import { useNavigation } from '@react-navigation/native';
const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1, textAlign, resizeModeContain, positionAbsolute } = BaseStyle;

const ProductVertical = ({ product, onAddToCart, inventoryQuantity, loading, onPress, option, ids, width, height, spaceTop }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
  const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
  const priceAmount = price?.price ? price?.price : price?.amount;
  const currencyCode = price ? price?.currencyCode : null;
  const [quantity, setQuantity] = useState(1);
  const outOfStock = inventoryQuantity <= 0;
  const dispatch = useDispatch();
  const wishList = useSelector(state => state.wishlist.wishlist);
  const isSelected = wishList.some(item => item.id === product.id);
  const cart = useSelector(state => state.cart.cartItems);
  const isInCart = cart.some(item => item.id === product.id);
  const [showQuantity, setShowQuantity] = useState(false);
  const [shopCurrency, setShopCurrency] = useState('');
  const [customerId, setCustomerId] = useState("")
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const { queries } = useShopify();
  const { cartId, removeFromCart, removeOneFromCart, totalQuantity } = useCart();
  const [fetchCart, { data, error }] = queries.cart;
  const navigation = useNavigation()
  useEffect(() => {
    if (!isInCart) {
      setShowQuantity(false);
    }
  }, [cart, isInCart]);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const shopCurrency = await AsyncStorage.getItem('shopCurrency');
        if (shopCurrency) {
          setShopCurrency(shopCurrency);
        }
      } catch (error) {
        console.error('Error fetching shop currency:', error);
      }
    };
    fetchCurrency();
    fetchUserDetails()
  }, []);


  useEffect(() => {
    if (cartId) {
      fetchCart({
        variables: {
          cartId,
        },
      });
    }
  }, [fetchCart, cartId]);

  const fetchUserDetails = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails')
    if (userDetails) {
      const userDetailsObject = JSON.parse(userDetails);
      const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
      setCustomerId(userId)
    }
  };

  const addToWishlistApi = async (customerId, productData) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      // Set up the request headers
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      // Prepare the payload for the request
      const raw = JSON.stringify({
        "customerId": customerId,
        "productData": productData
      });

      // Set up the request options
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      // Make the API request
      const response = await fetch("https://warley-thv5m.ondigitalocean.app/api/addToWishlist", requestOptions);

      // Check if the response is successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding to wishlist:', errorText);
        return;
      }

      // Parse and handle the response
      const result = await response.json();
      console.log('Product added to wishlist via API:', result);

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error; // Propagate the error
    }
  };

  const removeFromWishlistAPI = async (customerId, productId) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      // Make the API request to remove product from wishlist
      const response = await fetch(`https://warley-thv5m.ondigitalocean.app/api/wishlist/${customerId}/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove from wishlist: ${errorText}`);
      }

      // Parse and log the response
      const result = await response.json();
      console.log('Product removed from wishlist via API:', result);
      return result;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const handlePress = () => {
    const productWithInventory = {
      ...product,
      inventoryQuantity: inventoryQuantity
    };

    if (isSelected) {
      console.log("working", isSelected)
      dispatch(removeFromWishlist(product));
      logEvent(`Product remove from wishlist ProductId: ${product.id}`);

    } else {
      dispatch(addToWishlist(product));
      if (userLoggedIn) {
        addToWishlistApi(customerId, product)
      }
      logEvent(`Product Add to wishlish ProductId: ${product.id}`);
    }
  };

  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    setQuantity(quantity + 1);
    onAddToCart(product?.variants?.edges ? product?.variants?.edges[0]?.node?.id : product?.variants?.nodes[0]?.id, 1);
  };

  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');

    if (quantity > 1) {
      // Decrement quantity by 1
      removeOneFromCart(data?.cart?.lines?.edges[0]?.node?.id, 1);
      Toast.show('1 removed from cart');
      setQuantity(quantity - 1);
    } else if (quantity === 1) {
      // Handle the case where total quantity is 1
      removeOneFromCart(data?.cart?.lines?.edges[0]?.node?.id, 1);
      setShowQuantity(false);
      setQuantity(1); // Reset to 1, so it doesn't go below 1
    } else if (totalQuantity = 1) {
      removeFromCart(data?.cart?.lines?.edges[0]?.node?.id);
      setShowQuantity(false);
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    logEvent('Add to Cart');
    onAddToCart(product?.variants?.edges ? product?.variants?.edges[0]?.node?.id : product?.variants?.nodes[0]?.id, quantity);
    setShowQuantity(true);
  };

  const trimcateText = (text, maxLength = 25) => {
    if (text?.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <Pressable style={[styles.productContainer, {
      width: width ? width : wp(28), height: height ? height : wp(48), backgroundColor: whiteColor,
      marginVertical: isDarkMode ? spacings.normalx : spaceTop, borderRadius: 10,
    }]}
      onPress={onPress}
    >
      {/* {userLoggedIn && <> */}

      {loading ? (
        <View style={[{
          padding: spacings.large, position: "absolute",
          top: 0.5,
          right: 1,
          height: hp(4),
          width: wp(8),
          backgroundColor: whiteColor,
          borderRadius: 5,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 999
        }]}>
          <ActivityIndicator size="small" color={redColor} />
        </View>
      ) : (showQuantity && ids?.[0]?.continueSelling === true ? (
        <View style={{
          position: "absolute",
          top: 1,
          right: 1,
          height: hp(12),
          width: wp(9),
          backgroundColor: whiteColor,
          borderRadius: 5,
          alignItems: "center",
          justifyContent: "space-evenly",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 999
        }}>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}
            onPress={incrementQuantity}
          >+</Text>
          <Text
            style={[
              styles.quantityButton, alignJustifyCenter,
              { color: colors.blackColor, backgroundColor: redColor, width: wp(9), textAlign: "center", padding: 5 },
            ]}
          >
            {quantity}
          </Text>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}
            onPress={decrementQuantity}
          >-</Text>
        </View>
      ) : (
        ids?.[0]?.continueSelling === true && priceAmount != 0 && (
          <Pressable
            style={{
              position: "absolute",
              top: 0.5,
              right: -5,
              height: hp(4),
              width: wp(8),
              backgroundColor: whiteColor,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 999
            }}
            onPress={handleAddToCart}>
            <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
          </Pressable>
        )
      ))}
      {(priceAmount <= 0 || ids?.[0]?.continueSelling != true) && (
        <View style={[styles.addToCartButton, { width: wp(9), backgroundColor: redColor }]}>
          <Text style={[styles.addToCartButtonText, { color: whiteColor, padding: spacings.small, fontSize: 9 }]}>Sold Out</Text>
        </View>
      )}
      {/* </>} */}
      <View style={{ width: "100%", marginBottom: spacings.small, borderRadius: 10 }}>
        {imageSource ? <Image
          source={{ uri: imageSource }}
          style={[styles.productImage, resizeModeContain]}
        /> : <Image
          source={COMING_SOON_IMG}
          style={[styles.productImage, resizeModeContain]}
        />}
      </View>
      <View style={[styles.contentBox]}>
        <View style={[{ width: width ? width : wp(43), height: hp(108), alignSelf: "center" }]}>
          <View style={{ width: "100%", flexDirection: "row", paddingHorizontal: 5, height: Platform === "android" ? hp(10) : hp(4.5) }}>
            <View style={{ width: "70%", paddingLeft: 3 }}>
              <Text style={[styles.productName, { paddingRight: spacings.small, color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
            </View>
            <TouchableOpacity style={[positionAbsolute, alignJustifyCenter, styles.favButton]} onPress={handlePress}>
              <AntDesign
                name={isSelected ? "heart" : "hearto"}
                size={18}
                color={isSelected ? redColor : colors.grayColor}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", height: hp(4) }}>
            <View style={{ paddingLeft: 3 }}>
              {(priceAmount) && (
                priceAmount > 0 ? (
                  <Text style={[styles.productPrice, { color: redColor, marginTop: Platform.OS === "android" ? 5 : 0, paddingLeft: spacings.medium }]}>
                    {currencyCode === "GBP" ? "£" : shopCurrency} {priceAmount}
                  </Text>
                ) : (
                  <Text style={[styles.productPrice, { color: redColor, marginTop: Platform.OS === "android" ? 5 : 0, paddingLeft: spacings.medium }]}>
                    Coming Soon
                  </Text>
                )
              )}
            </View>

          </View>

        </View>
      </View>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    paddingBottom: spacings.large,
    marginRight: 10,
    // borderWidth: .5,
    // borderColor: "#d9d9d9"
  },
  productImage: {
    width: "100%",
    height: hp(13.5),
    borderRadius: 10,
    // alignSelf: "center",
    marginBottom: spacings.large
  },
  productName: {
    fontSize: style.fontSizeExtraExtraSmall.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    fontFamily: 'Montserrat-BoldItalic'
  },
  text: {
    color: "#006400",
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
  },
  productPrice: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    fontFamily: 'arialnarrow'
  },
  contentBox: {
    width: "100%",
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(23),
    // backgroundColor: "red",
    // paddingHorizontal: 9,
    paddingVertical: 2,
    justifyContent: "center",
  },
  quantityButton: {
    paddingHorizontal: 8,
    // paddingTop: 1,
    borderRadius: 5,
    color: whiteColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: blackColor,
    fontFamily: 'Montserrat-BoldItalic'
  },
  addToCartButton: {
    borderRadius: 10,
    fontSize: 8,
    position: "absolute",
    right: -5,
    top: 1,
    zIndex: 1000
  },
  addToCartButtonText: {
    fontSize: 10.5,
    // lineHeight: 18,
    color: redColor,
    fontWeight: '100',
    textAlign: 'center',
    fontFamily: 'Montserrat-BoldItalic'
  },
  favButton: {
    width: wp(10),
    paddingVertical: 4,
    right: 0,
    // bottom: 20,
    zIndex: 10,
  },
  eyeButton: {
    width: wp(8),
    height: wp(8),
    right: 3,
    top: 6,
    zIndex: 10,
    borderRadius: 10,
  },
});

export default ProductVertical;
