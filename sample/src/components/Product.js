// import React, { useEffect, useState } from 'react';
// import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
// import { blackColor, grayColor, redColor, whiteColor } from '../constants/Color'
// import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
// import { spacings, style } from '../constants/Fonts';
// import { BaseStyle } from '../constants/Style';
// import { ADD_TO_CART, OUT_OF_STOCK } from '../constants/Constants';
// import { logEvent } from '@amplitude/analytics-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useThemes } from '../context/ThemeContext';
// import { lightColors, darkColors } from '../constants/Color';
// const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1 } = BaseStyle;

// const Product = ({ product, onAddToCart, loading, inventoryQuantity, onPress }) => {
//   const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
//   const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
//   const priceAmount = price?.price ? price?.price : price?.amount;
//   const currencyCode = price ? price?.currencyCode : null;
//   const [quantity, setQuantity] = useState(1);
//   const [shopCurrency, setShopCurrency] = useState('');
//   const { isDarkMode } = useThemes();
//   const colors = isDarkMode ? darkColors : lightColors;
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
//   }, []);
//   const incrementQuantity = () => {
//     logEvent('Increase Product Quantity');
//     setQuantity(quantity + 1);
//   };

//   const decrementQuantity = () => {
//     logEvent('Decrease Product Quantity');
//     if (quantity > 1) {
//       setQuantity(quantity - 1);
//     }
//   };
//   const outOfStock = inventoryQuantity && inventoryQuantity[0] <= 0;

//   const trimcateText = (text) => {
//     const words = text.split(' ');
//     if (words.length > 5) {
//       return words.slice(0, 4).join(' ') + '...';
//     }
//     return text;
//   };
//   return (
//     <Pressable style={[styles.productContainer, alignItemsCenter, flexDirectionRow, { backgroundColor: isDarkMode ? grayColor : whiteColor }]} onPress={onPress}>
//       <Image
//         source={{ uri: imageSource }}
//         style={[styles.productImage, resizeModeCover]}
//       />
//       <View style={[styles.contentBox, flexDirectionRow]}>
//         <View style={{ width: "45%", paddingRight: spacings.large }}>
//           <Text style={[styles.productName, { color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
//           {priceAmount && (
//             <Text style={[styles.productPrice, { color: colors.blackColor }]}>
//               {currencyCode ? currencyCode === "GBP" && "£" : shopCurrency}{priceAmount}
//             </Text>)}
//         </View>
//         <View style={[{ width: "42%", paddingVertical: spacings.small, alignItems: "center", justifyContent: "space-around", marginLeft: spacings.large }]}>
//           <View style={[styles.quantityContainer, borderWidth1, { marginBottom: spacings.normal, backgroundColor: colors.whiteColor }]}>
//             <TouchableOpacity onPress={decrementQuantity}>
//               <Text style={[styles.quantityButton, { color: colors.blackColor }]}>-</Text>
//             </TouchableOpacity>
//             <Text style={[styles.quantity, { color: colors.blackColor }]}>{quantity}</Text>
//             <TouchableOpacity onPress={incrementQuantity}>
//               <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
//             </TouchableOpacity>
//           </View>
//           {!outOfStock ? (
//             loading ? (
//               <View style={styles.addToCartLoading}>
//                 <ActivityIndicator size="small" />
//               </View>
//             ) : (
//               <Pressable
//                 style={styles.addToCartButton}
//                 onPress={() => onAddToCart((product?.variants?.edges) ? (product?.variants?.edges[0]?.node.id) : product?.variants?.nodes[0].id, quantity)}>
//                 <Text style={styles.addToCartButtonText}>{ADD_TO_CART}</Text>
//               </Pressable>
//             )
//           ) : (
//             <View style={styles.addToCartButton}>
//               <Text style={styles.addToCartButtonText}>{OUT_OF_STOCK}</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   productContainer: {
//     width: "100%",
//     padding: spacings.large,
//     marginVertical: 10,
//     borderColor: 'transparent',
//     borderWidth: .1,
//     borderRadius: 10,

//     shadowColor: grayColor,
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,

//     elevation: 1.5,
//   },
//   productImage: {
//     width: "23%",
//     height: hp(12),
//     borderRadius: 6,
//     alignSelf: "center",
//   },
//   productName: {
//     fontSize: style.fontSizeNormal.fontSize,
//     fontWeight: style.fontWeightThin1x.fontWeight,
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   productPrice: {
//     fontSize: style.fontSizeSmall1x.fontSize,
//     fontWeight: style.fontWeightMedium.fontWeight,
//     color: blackColor,
//     fontFamily: 'arialnarrow'
//   },
//   contentBox: {
//     width: "85%",
//     paddingLeft: spacings.large,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     justifyContent: "center",
//     borderRadius: 10
//   },
//   quantityButton: {
//     paddingHorizontal: 8,
//     borderRadius: 5,
//     color: blackColor,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   quantity: {
//     paddingHorizontal: 12,
//     paddingVertical: 2,
//     fontSize: 16,
//     // fontWeight: 'bold',
//     color: blackColor,
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   addToCartButton: {
//     borderRadius: 10,
//     fontSize: 8,
//     backgroundColor: redColor,
//     paddingHorizontal: 9,
//     paddingVertical: 5,
//   },
//   addToCartButtonText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: whiteColor,
//     // fontWeight: 'bold',
//     textAlign: 'center',
//     fontFamily: 'Montserrat-BoldItalic'
//   },
// });

// export default Product;


// import React, { useEffect, useState } from 'react';
// import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
// import { blackColor, grayColor, redColor, whiteColor } from '../constants/Color'
// import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
// import { spacings, style } from '../constants/Fonts';
// import { BaseStyle } from '../constants/Style';
// import { ADD_TO_CART, OUT_OF_STOCK } from '../constants/Constants';
// import { logEvent } from '@amplitude/analytics-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useThemes } from '../context/ThemeContext';
// import { lightColors, darkColors } from '../constants/Color';
// import { useSelector } from 'react-redux';
// import { COMING_SOON_IMG } from '../assests/images'

// const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1, resizeModeContain } = BaseStyle;

// const Product = ({ product, onAddToCart, loading, inventoryQuantity, onPress }) => {
//   const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
//   const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
//   const priceAmount = price?.price ? price?.price : price?.amount;
//   const currencyCode = price ? price?.currencyCode : null;
//   const [quantity, setQuantity] = useState(1);
//   const [shopCurrency, setShopCurrency] = useState('');
//   const { isDarkMode } = useThemes();
//   const colors = isDarkMode ? darkColors : lightColors;
//   const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
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
//   }, []);
//   const incrementQuantity = () => {
//     logEvent('Increase Product Quantity');
//     setQuantity(quantity + 1);
//     onAddToCart((product?.variants?.edges) ? (product?.variants?.edges[0]?.node.id) : product?.variants?.nodes[0].id, 1)
//   };

//   const decrementQuantity = () => {
//     logEvent('Decrease Product Quantity');
//     if (quantity > 1) {
//       setQuantity(quantity - 1);
//     }
//   };
//   const outOfStock = inventoryQuantity && inventoryQuantity[0] <= 0;

//   const trimcateText = (text) => {
//     const words = text.split(' ');
//     if (words.length > 5) {
//       return words.slice(0, 4).join(' ') + '...';
//     }
//     return text;
//   };
//   return (
//     <Pressable style={[styles.productContainer, alignItemsCenter, flexDirectionRow, { backgroundColor: isDarkMode ? grayColor : whiteColor }]} onPress={onPress}>
//       {imageSource ? <Image
//         source={{ uri: imageSource }}
//         style={[styles.productImage, resizeModeCover]}
//       /> : <Image
//         source={COMING_SOON_IMG}
//         style={[styles.productImage, resizeModeCover, {
//           width: "20%",
//           height: hp(9.5)
//         }]}
//       />}
//       <View style={[styles.contentBox, flexDirectionRow]}>
//         <View style={{ width: "45%", paddingRight: spacings.large }}>
//           <Text style={[styles.productName, { color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
//           {(priceAmount && userLoggedIn) && (
//             priceAmount > 0 ? (
//               <Text style={[styles.productPrice, { color: redColor, marginTop: 10, paddingLeft: spacings.medium }]}>
//                 {currencyCode === "GBP" ? "£" : shopCurrency} {priceAmount}
//               </Text>
//             ) : (
//               <Text style={[styles.productPrice, { color: redColor, marginTop: 10 }]}>
//                 Coming Soon
//               </Text>
//             ))}
//         </View>
//         <View style={[{ width: "42%", paddingVertical: spacings.small, alignItems: "center", justifyContent: "space-around", marginLeft: spacings.large }]}>
//           <View style={[styles.quantityContainer, borderWidth1, { marginBottom: spacings.normal, backgroundColor: colors.whiteColor }]}>
//             <TouchableOpacity onPress={decrementQuantity}>
//               <Text style={[styles.quantityButton, { color: colors.blackColor }]}>-</Text>
//             </TouchableOpacity>
//             <Text style={[styles.quantity, { color: colors.blackColor }]}>{quantity}</Text>
//             <TouchableOpacity onPress={incrementQuantity}>
//               <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
//             </TouchableOpacity>
//           </View>
//           {!outOfStock ? (
//             loading ? (
//               <View style={styles.addToCartLoading}>
//                 <ActivityIndicator size="small" />
//               </View>
//             ) : (
//               <Pressable
//                 style={styles.addToCartButton}
//                 onPress={() => onAddToCart((product?.variants?.edges) ? (product?.variants?.edges[0]?.node.id) : product?.variants?.nodes[0].id, quantity)}>
//                 <Text style={styles.addToCartButtonText}>{ADD_TO_CART}</Text>
//               </Pressable>
//             )
//           ) : (
//             <View style={styles.addToCartButton}>
//               <Text style={styles.addToCartButtonText}>Coming Soon</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   productContainer: {
//     width: "100%",
//     padding: spacings.large,
//     marginVertical: 10,
//     borderColor: 'transparent',
//     borderWidth: .1,
//     borderRadius: 10,

//     shadowColor: grayColor,
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,

//     elevation: 1.5,
//   },
//   productImage: {
//     width: "23%",
//     height: hp(12),
//     borderRadius: 6,
//     alignSelf: "center",
//   },
//   productName: {
//     fontSize: style.fontSizeNormal.fontSize,
//     fontWeight: style.fontWeightThin1x.fontWeight,
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   productPrice: {
//     fontSize: style.fontSizeSmall1x.fontSize,
//     fontWeight: style.fontWeightMedium.fontWeight,
//     color: blackColor,
//     fontFamily: 'arialnarrow',
//     marginTop: 5
//   },
//   contentBox: {
//     width: "85%",
//     paddingLeft: spacings.large,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     justifyContent: "center",
//     borderRadius: 10
//   },
//   quantityButton: {
//     paddingHorizontal: 8,
//     borderRadius: 5,
//     color: blackColor,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   quantity: {
//     paddingHorizontal: 12,
//     paddingVertical: 2,
//     fontSize: 16,
//     color: blackColor,
//     fontFamily: 'Montserrat-BoldItalic'
//   },
//   addToCartButton: {
//     borderRadius: 10,
//     fontSize: 8,
//     backgroundColor: redColor,
//     paddingHorizontal: 9,
//     paddingVertical: 5,
//   },
//   addToCartButtonText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: whiteColor,
//     textAlign: 'center',
//     fontFamily: 'Montserrat-BoldItalic'
//   },
// });

// export default Product;


import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator, BackHandler } from 'react-native';
import { blackColor, grayColor, redColor, whiteColor } from '../constants/Color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { ADD_TO_CART, OUT_OF_STOCK } from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { useSelector } from 'react-redux';
import { COMING_SOON_IMG } from '../assests/images'
import { useCart } from '../context/Cart';
import useShopify from '../hooks/useShopify';
import Toast from 'react-native-simple-toast';
import { useNavigation } from '@react-navigation/native';
const { alignItemsCenter, resizeModeCover, flexDirectionRow, alignJustifyCenter, borderWidth1, resizeModeContain } = BaseStyle;

const Product = ({ product, onAddToCart, loading, inventoryQuantity, onPress }) => {
  const imageSource = product?.images?.edges ? product?.images?.edges[0]?.node?.url : product?.images?.nodes[0]?.url;
  const price = product?.variants?.edges ? product?.variants?.edges[0]?.node?.price : product?.variants?.nodes[0];
  const priceAmount = price?.price ? price?.price : price?.amount;
  const currencyCode = price ? price?.currencyCode : null;
  const [quantity, setQuantity] = useState(1);
  const [shopCurrency, setShopCurrency] = useState('');
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { queries } = useShopify();
  const { cartId, removeFromCart, removeOneFromCart, totalQuantity } = useCart();
  const navigation = useNavigation();
  const [fetchCart, { data, error }] = queries.cart;
  const outOfStock = inventoryQuantity && inventoryQuantity[0] <= 0;


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

  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    onAddToCart((product?.variants?.edges) ? (product?.variants?.edges[0]?.node.id) : product?.variants?.nodes[0].id, 1)
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');
    if (quantity != 1) {
      removeOneFromCart(data?.cart?.lines?.edges[0]?.node?.id, 1);
      Toast.show(`1 remove to cart`);
      setQuantity(quantity - 1);
    }
    else if (quantity === 1) {
      // Handle the case where total quantity is 1
      removeOneFromCart(data?.cart?.lines?.edges[0]?.node?.id, 1);
      setIsAddedToCart(false)
      setQuantity(1); // Reset to 1, so it doesn't go below 1
    } else if (totalQuantity = 1) {
      removeFromCart(data?.cart?.lines?.edges[0]?.node?.id);
      setIsAddedToCart(false)
      setQuantity(1);
    }
  };

  const trimcateText = (text, maxLength = 20) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleAddToCart = () => {
    onAddToCart((product?.variants?.edges) ? (product?.variants?.edges[0]?.node.id) : product?.variants?.nodes[0].id, quantity);
    setIsAddedToCart(true);
  };
  return (
    <View style={{ width: wp(28.5), marginHorizontal: 6, paddingHorizontal: spacings.large, paddingVertical: 6 }}>
      <Pressable style={[styles.productContainer, alignItemsCenter, { backgroundColor: whiteColor, overflow: "hidden" }]} onPress={onPress}>
        <Image
          source={{ uri: imageSource }}
          style={[styles.productImage, resizeModeContain]}
        />
      </Pressable>
      <View style={{ width: "100%", paddingRight: spacings.large, marginTop: 10 }}>
        <View style={{ width: "100%", height: hp(3.5) }}>
          <Text style={[styles.productName, { color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
        </View>
        {(priceAmount) && (
          priceAmount > 0 ? (
            <Text style={[styles.productPrice, { color: redColor }]}>
              {currencyCode === "GBP" ? "£" : shopCurrency} {priceAmount}
            </Text>
          ) : (
            <Text style={[styles.productPrice, { color: redColor }]}>
              Coming Soon
            </Text>
          ))}
      </View>
      {!isAddedToCart && !outOfStock ? (
        <Pressable style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
        </Pressable>
      ) : isAddedToCart ? (
        <View
          style={{
            position: "absolute",
            top: 5,
            right: 1,
            height: hp(10),
            width: wp(8),
            backgroundColor: whiteColor,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "space-evenly",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}
            onPress={incrementQuantity}
          >+</Text>
          <Text
            style={[
              styles.quantityButton,
              { color: colors.blackColor, backgroundColor: redColor, width: wp(8), textAlign: "center", padding: 4 },
            ]}
          >
            {quantity}
          </Text>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}
            onPress={decrementQuantity}
          >-</Text>
        </View>
      ) : null}
      {outOfStock && (
        <View style={[styles.commingSoonAddToCart, { width: wp(8) }]}>
          <Text style={[{ color: whiteColor, textAlign: "center", fontFamily: 'Montserrat-BoldItalic', fontSize: 8 }]}>Sold out</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productContainer: {
    width: "95%",
    height: hp(11),
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,
    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  productImage: {
    width: "100%",
    height: hp(10),
    borderRadius: 6,
    alignSelf: "center",
  },
  productName: {
    fontSize: style.fontSizeExtraExtraSmall.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    fontFamily: 'Montserrat-BoldItalic'
  },
  productPrice: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    fontFamily: 'arialnarrow',
    marginTop: 5
  },
  contentBox: {
    width: "85%",
    paddingLeft: spacings.large,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    justifyContent: "center",
    borderRadius: 10
  },
  quantityButton: {
    paddingHorizontal: 8,
    borderRadius: 5,
    color: blackColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    fontSize: 16,
    color: blackColor,
    fontFamily: 'Montserrat-BoldItalic'
  },
  addToCartButton: {
    position: "absolute",
    top: 5,
    right: 1,
    height: hp(3.5),
    width: wp(8),
    backgroundColor: whiteColor,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  addToCartButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: whiteColor,
    textAlign: 'center',
    fontFamily: 'Montserrat-BoldItalic'
  },
  commingSoonAddToCart: {
    borderRadius: 5,
    fontSize: 8,
    position: "absolute",
    right: 10,
    top: 5,
    zIndex: 999,
    backgroundColor: redColor
  },
});

export default Product;
