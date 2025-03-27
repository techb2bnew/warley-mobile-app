import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator, BackHandler } from 'react-native';
import { blackColor, grayColor, redColor, whiteColor } from '../constants/Color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style, appFonts } from '../constants/Fonts';
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

const Product = ({ product, onAddToCart, loading, inventoryQuantity, onPress, ids }) => {
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
        {imageSource ? <Image
          source={{ uri: imageSource }}
          style={[styles.productImage, resizeModeContain]}
        /> : <Image
          source={COMING_SOON_IMG}
          style={[styles.productImage, resizeModeContain, {
            width: "95%",
            height: hp(9.5)
          }]}
        />}
      </Pressable>
      <View style={{ width: "100%", paddingRight: spacings.large, marginTop: 10 }}>
        <View style={{ width: "100%", height: hp(3.5) }}>
          <Text style={[styles.productName, { color: colors.blackColor }]}>{trimcateText(product?.title)}</Text>
        </View>
        {(priceAmount && userLoggedIn) && (
          priceAmount > 0 ? (
            <Text style={[styles.productPrice, { color: redColor }]}>
              {currencyCode === "GBP" ? "£" : shopCurrency} {priceAmount}
            </Text>
          ) : (
            <Text style={[styles.productPrice, { color: redColor }]}>
              {/* Coming Soon */}
            </Text>
          ))}
      </View>
      {!isAddedToCart && ids?.[0]?.continueSelling === true && priceAmount > 0 ? (
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
      {/* {(ids?.[0]?.continueSelling !== true || priceAmount <= 0) && (
        <View style={[styles.commingSoonAddToCart, { width: wp(8) }]}>
          <Text style={[{ color: whiteColor, textAlign: "center", fontFamily: 'Montserrat-BoldItalic', fontSize: 8 }]}>Sold out</Text>
        </View>
      )} */}
      {priceAmount <= 0 ? (
        <View style={[styles.commingSoonAddToCart, { width: wp(9) }]}>
          <Text style={{ color: whiteColor, textAlign: "center", fontFamily: appFonts.semiBold, fontSize: 8 }}>
            Coming Soon
          </Text>
        </View>
      ) : ids?.[0]?.continueSelling !== true && (
        <View style={[styles.commingSoonAddToCart, { width: wp(8) }]}>
          <Text style={{ color: whiteColor, textAlign: "center", fontFamily: appFonts.semiBold, fontSize: 8 }}>
            Sold Out
          </Text>
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
    fontFamily: appFonts.semiBold
  },
  productPrice: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
    // fontFamily: 'arialnarrow',
    fontFamily: appFonts.semiBold,
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
    fontFamily: appFonts.semiBold
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
    fontFamily: appFonts.semiBold
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
