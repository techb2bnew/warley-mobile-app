import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Text, Image, ActivityIndicator, Pressable, RefreshControl, TouchableOpacity, ImageBackground, FlatList, Alert, Animated, Modal, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import useShopify from '../hooks/useShopify';
import type { CartItem, CartLineItem } from '../../@types';
import { Colors, useTheme } from '../context/Theme';
import { useCart } from '../context/Cart';
import Toast from 'react-native-simple-toast';
import { blackColor, redColor, whiteColor, lightShadeBlue, mediumGray, grayColor } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import {
  SUBTOTAL, YOUR_CART_IS_EMPTY, AN_ERROR_OCCURED, LOADING_CART, TOTAL, TAXES, QUNATITY, CHECKOUT, STOREFRONT_DOMAIN, STOREFRONT_ACCESS_TOKEN,
  ADMINAPI_ACCESS_TOKEN, YOU_MIGHT_LIKE, LOADER_NAME
} from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeProductFromCart, removeProductInCart } from '../redux/actions/cartActions';
import { BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE } from '../assests/images'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Header from '../components/Header';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import axios from 'axios';
import { addToWishlist, removeFromWishlist } from '../redux/actions/wishListActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatButton from '../components/ChatButton';
import PushNotification from 'react-native-push-notification';
import LoginModal from '../components/Modal/LoginModal'
import { useFocusEffect } from '@react-navigation/native';

const { flex, alignJustifyCenter, flexDirectionRow, resizeModeCover, positionAbsolute, justifyContentSpaceBetween, borderRadius10, alignItemsCenter, borderRadius5, textAlign, alignItemsFlexEnd, resizeModeContain } = BaseStyle;

function CartScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;
  const ShopifyCheckout = useShopifyCheckoutSheet();
  const [refreshing, setRefreshing] = React.useState(false);
  const { cartId, checkoutURL, totalQuantity, removeFromCart, addingToCart, addToCart, removeOneFromCart } = useCart();
  const { queries } = useShopify();
  const [fetchCart, { data, loading, error }] = queries.cart;
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dispatch = useDispatch();
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const [upSellingproducts, setUpSellingProducts] = useState([]);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const wishList = useSelector(state => state.wishlist.wishlist);
  const [shopCurrency, setShopCurrency] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const slideAnim = useRef(new Animated.Value(500)).current;  // Initial position off-screen
  const lastAction = useSelector(state => state.wishlist.lastAction);

  const openModal = () => {
    setModalVisible(true);
    // Animate from bottom to top
    Animated.timing(slideAnim, {
      toValue: 0, // Slide to the top
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 720, // Slide back to bottom
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    if (cartId) {
      fetchCart({
        variables: {
          cartId,
        },
      });
    }
  }, [fetchCart, cartId]);

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
    logEvent('CartScreen');
    // fetchCartDetail();
  }, [])

  // const handleWishlistSubmission = async (customerId, wishList) => {
  //   try {
  //     const token = await AsyncStorage.getItem('authToken');
  //     if (!token) {
  //       console.error('Token not found');
  //       return;
  //     }
  //     const formattedWishlist = wishList.map(item => {
  //       console.log("item", item);

  //       const variants = Array.isArray(item.variants?.nodes) ? item.variants.nodes : [];
  //       const options = Array.isArray(item.options) ? item.options.map(option => ({
  //         name: option.name,
  //         value: option.values ? option.values[0] : "",  
  //       })) : [];
  //       const productId = item.id;  
  //       return {
  //         productId: productId,  
  //         title: item.title,
  //         images: item.images?.nodes?.length > 0 ? item.images.nodes : [],
  //         variants: variants.map(variant => ({
  //           id: item.id,  
  //           price: variant.price,
  //           inventoryQuantity: variant.inventoryQuantity,
  //           title: variant.title,
  //           image: variant.image ? variant.image.url : null,
  //         })),
  //         tags: item.tags,
  //         options: options,
  //       };
  //     });

  //     // Log the formattedWishlist to check the structure before sending the request
  //     console.log("Formatted Wishlist:", JSON.stringify(formattedWishlist, null, 2));
  //     console.log("Request Payload:", {
  //       customerId,
  //       productData: formattedWishlist
  //     });

  //     // Send the request to the API
  //     const response = await fetch('https://warley-thv5m.ondigitalocean.app/api/addToWishlist', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         customerId,
  //         productData: formattedWishlist,  
  //       }),
  //     });
  //     const result = await response.json();
  //     // Alert.alert(result.message);  // Assuming the result contains a 'message' field
  //     console.log('Wishlist synced with API:', result);
  //     return result;
  //   } catch (error) {
  //     console.error('Error syncing wishlist:', error);
  //     throw error;
  //   }
  // };

  const handleWishlistSubmission = async (customerId, wishList) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      for (const item of wishList) {
        const productId = item.id || item.productId;  // Ensure the ID is correctly assigned
        if (!productId) {
          console.error("Product ID missing in wishlist item:", item);
          continue;
        }

        const variants = Array.isArray(item.variants?.nodes) ? item.variants.nodes : [];
        const options = Array.isArray(item.options) ? item.options.map(option => ({
          id: option?.id,
          name: option?.name,
          value: option?.values
        })) : [];

        const formattedWishlistItem = {
          productId: productId,
          title: item.title,
          images: item.images?.nodes?.length > 0 ? item.images.nodes : [],
          variants: variants.map(variant => ({
            id: variant.id,
            price: variant.price,
            inventoryQuantity: variant.inventoryQuantity,
            title: variant.title,
            image: variant.image ? variant.image.url : null,
          })),
          tags: item.tags,
          options: options,
        };

        const requestBody = JSON.stringify({
          customerId,
          productData: formattedWishlistItem,
        }, null, 2);
        console.log("Request Payload:", requestBody);

        // Send the request to the API
        // const response = await fetch('https://warley-thv5m.ondigitalocean.app/api/addToWishlist', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`,
        //   },
        //   body: JSON.stringify({
        //     customerId,
        //     productData: formattedWishlistItem,
        //   }),
        // });
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({
          "customerId": customerId,
          "productData": formattedWishlistItem
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        };

        fetch("https://warley-thv5m.ondigitalocean.app/api/addToWishlist", requestOptions)
          .then((response) => response.text())
          .then((result) => (

            console.log('Wishlist item synced with API:', result)
          )
          )
      }

      console.log("All wishlist items attempted for sync");
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      throw error;
    }
  };
  useEffect(() => {
    if (userLoggedIn && lastAction === "ADD_TO_WISHLIST") {
      if (wishList.length > 0) {
        // console.log('Wishlist synced with API::::::::', wishList);
        handleWishlistSubmission(customerId, wishList);
      } else {
        console.log("No items in wishlist.");
      }
    }
  }, [userLoggedIn, wishList, customerId, lastAction]);

  const fetchCartDetail = async () => {
    try {
      const response = await axios.post(`https://${STOREFRONT_DOMAIN}/api/2024-01/graphql.json`, {
        query: `
          {
            cart(id: "${cartId}") {
              id
              lines(first: 10) {
                edges {
                  node {
                    id
                    merchandise {
                      ... on ProductVariant {
                        product {
                          id
                        }
                      }
                    }
                    quantity
                  }
                }
              }
            }
          }
        `
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        }
      });

      const productIds = response.data?.data?.cart?.lines?.edges.map(edge => {
        const fullId = edge.node.merchandise?.product?.id || '';
        return fullId.split('/').pop();
      }) || [];
      if (productIds) {
        fetchProductMetafields(productIds)
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  const extractProductFields = (product) => {
    return {
      id: product.id,
      title: product.title,
      inventoryQuantities: product.variants.map(variant => variant.inventory_quantity),
      imageUrls: product.images.map(image => image.src),
      price: product.variants.map(variant => variant.price),
      variantId: product.variants.map(variant => variant.admin_graphql_api_id),
    };
  };

  const fetchProductMetafields = async (productID) => {
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-07/products/${productID}/metafields.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      });

      const metafields = response.data.metafields;

      const allMetafieldValues = [];

      metafields.forEach(metafield => {
        if (metafield.value) {
          try {
            const values = JSON.parse(metafield.value);
            allMetafieldValues.push(...values);
          } catch (error) {
            console.error('Error parsing metafield value:', error);
          }
        }
      });

      const productIds = allMetafieldValues?.map(id => id.replace('gid://shopify/Product/', ''))
        .join(','); // Join IDs with commas

      if (productIds.length > 0) {
        const productsResponse = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-07/products.json?ids=${productIds}`, {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
            'Content-Type': 'application/json'
          }
        });

        const products = productsResponse.data.products;

        const productDetails = products.map(product => extractProductFields(product));
        setUpSellingProducts(productDetails);

      } else {
        console.log('No metafield values found to fetch products.');
        setUpSellingProducts([]);
      }

    } catch (error) {
      console.error('Error fetching metafields:', error);
    }
  };

  const onRefresh = useCallback(() => {
    logEvent('onRefresh cart ');
    setRefreshing(true);
    fetchCart({
      variables: {
        cartId,
      },
    }).then(() => setRefreshing(false));
  }, [cartId, fetchCart]);

  useFocusEffect(
    useCallback(() => {
      const fetchUserDetails = async () => {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          const userDetailsObject = JSON.parse(userDetails);
          // console.log("cart", userDetailsObject);
          const userId = userDetailsObject.customer ? userDetailsObject.customer.id : userDetailsObject.id;
          setCustomerId(userId);
        }
      };

      fetchUserDetails();
    }, [userLoggedIn])
  );

  const fetchUserProfile = async (id) => {
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${id}.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      const customer = response.data.customer;
      // console.log("Customer profile fetched:", customer);
      return customer;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  };

  const presentCheckout = async () => {
    logEvent('Click CheckOut');
    if (!userLoggedIn) {
      logEvent('User not logged in, redirecting to Auth');
      navigation.navigate("AuthStack");
      Toast.show("Please complete the registration process first");
      return;
    }

    if (!checkoutURL) {
      console.log('Checkout URL is not available');
      return;
    }

    // Fetch the customer profile
    const customer = await fetchUserProfile(customerId);
    if (customer) {
      const customerEmail = customer.email;
      const firstName = customer.first_name;
      const lastName = customer.last_name;
      const defaultAddress = customer.default_address || {};
      const address1 = defaultAddress.address1;
      const address2 = defaultAddress.address2 || '';
      const city = defaultAddress.city;
      const province = defaultAddress.province || '';
      const country = defaultAddress.country;
      const zip = defaultAddress.zip;

      // Construct the full checkout URL with the customer's data using Shopify's expected parameter names
      // const fullCheckoutURL = `${checkoutURL}&checkout[email]=${encodeURIComponent(customerEmail)}&checkout[shipping_address][first_name]=${encodeURIComponent(firstName)}&checkout[shipping_address][last_name]=${encodeURIComponent(lastName)}&checkout[shipping_address][address1]=${encodeURIComponent(address1)}&checkout[shipping_address][address2]=${encodeURIComponent(address2)}&checkout[shipping_address][city]=${encodeURIComponent(city)}&checkout[shipping_address][province]=${encodeURIComponent(province)}&checkout[shipping_address][country]=${encodeURIComponent(country)}&checkout[shipping_address][zip]=${encodeURIComponent(zip)}`;
      const fullCheckoutURL = `${checkoutURL}&checkout[email]=${encodeURIComponent(customerEmail)}&checkout[shipping_address][first_name]=${encodeURIComponent(firstName)}&checkout[shipping_address][last_name]=${encodeURIComponent(lastName)}&checkout[shipping_address][address1]=${encodeURIComponent(address1)}&checkout[shipping_address][address2]=${encodeURIComponent(address2)}&checkout[shipping_address][city]=${encodeURIComponent(city)}&checkout[shipping_address][province]=${encodeURIComponent(province)}&checkout[shipping_address][zip]=${encodeURIComponent(zip)}`;

      // Navigate to checkout with the constructed URL
      // navigation.navigate('ShopifyCheckOut', {
      //   url: fullCheckoutURL,
      // });
      // console.log(fullCheckoutURL)
      ShopifyCheckout.present(fullCheckoutURL);

      cancelScheduledNotification();
      logEvent('Opened Checkout');
    }
    // if (customer) {
    //   const customerEmail = customer.email;
    //   const firstName = customer.first_name;
    //   const lastName = customer.last_name;
    //   const defaultAddress = customer.default_address || {};
    //   const address1 = defaultAddress.address1;
    //   const city = defaultAddress.city;
    //   const code = defaultAddress.zip;
    //   const country = defaultAddress.country;

    //   // Construct the full checkout URL with the customer's data
    //   const fullCheckoutURL = `${checkoutURL}&email=${encodeURIComponent(customerEmail)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&address1=${encodeURIComponent(address1)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&code=${encodeURIComponent(code)}`;

    //   // Navigate to checkout with the constructed URL
    //   navigation.navigate('ShopifyCheckOut', {
    //     url: fullCheckoutURL,
    //   });
    //   cancelScheduledNotification();
    //   logEvent('Opened Checkout');
    // } 
    else {
      console.error("Failed to fetch customer profile.");
    }
  };


  // const presentCheckout = async () => {
  //   logEvent('Click CheckOut ');
  //   if (!userLoggedIn) {
  //     logEvent('user not login Go to Auth');
  //     navigation.navigate("AuthStack");
  //     Toast.show("Please First complete the registration process")
  //   } else {
  //     if (checkoutURL) {
  //       // console.log(checkoutURL)
  //       // ShopifyCheckout.present(checkoutURL);
  //       navigation.navigate('ShopifyCheckOut', {
  //         url: checkoutURL,
  //       });
  //       cancelScheduledNotification()
  //       logEvent('Open CheckOut ');
  //     } else {
  //       console.log('Checkout URL is not available');
  //     }
  //   }
  // };

  const cancelScheduledNotification = () => {
    PushNotification.cancelLocalNotification({ id: "1" });
  };

  const onPressContinueShopping = () => {
    logEvent(`Press Continue Shopping Button in Cart Screen`);
    navigation.navigate('HomeScreen')
  }

  if (error) {
    return (
      // <ImageBackground source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
      <View style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
        <Text style={[styles.loadingText, { color: themecolors.blackColor }]}>
          {AN_ERROR_OCCURED}
        </Text>
        <Text style={[styles.loadingText, { color: themecolors.blackColor }]}>
          {error?.name} {error?.message}
        </Text>
        {/* </ImageBackground> */}
      </View>
    );
  }

  if (loading) {
    return (
      // <ImageBackground source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
      <View style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart"} />
        <View style={[flex, alignJustifyCenter]}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>{LOADING_CART}</Text>
        </View>
        {/* </ImageBackground> */}
      </View>
    );
  }

  if (!data || !data.cart || data?.cart?.lines?.edges?.length === 0 || !cartId) {
    return (
      // <ImageBackground source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
      <View style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart"} />
        <View style={{ width: "100%", height: 5, backgroundColor: themecolors.whiteColor }}></View>
        <View style={[flex, alignJustifyCenter]}>
          <Icon name="shopping-bag" size={60} color={themecolors.lightShadeBlue} />
          <Text style={[styles.loadingText, { color: themecolors.blackColor }]}>{YOUR_CART_IS_EMPTY}</Text>
          <TouchableOpacity style={[styles.addToCartButton, borderRadius10]} onPress={onPressContinueShopping}>
            <Text style={[styles.costBlockTextStrong, textAlign, { color: whiteColor }]}>
              Go to Shopping
            </Text>
          </TouchableOpacity>
        </View>
        {/* </ImageBackground> */}
      </View>
    );
  }

  const handleRemoveToCart = (variantId: string,) => {
    removeFromCart(variantId);
    dispatch(removeProductFromCart(variantId));
    Toast.show('Item removed from cart')
    logEvent(`Item removed from cart variantId:${variantId} `);
    cancelScheduledNotification()
  };

  const getTotalAmount = () => {
    let totalAmount = 0;
    let currencyCode = '';
    if (data?.cart?.lines?.edges && data?.cart?.lines?.edges?.length > 0) {
      currencyCode = data?.cart?.lines?.edges[0]?.node?.merchandise?.price?.currencyCode;
      data?.cart?.lines?.edges.forEach(({ node }) => {
        const itemPrice = parseFloat(node?.merchandise?.price?.amount);
        const itemQuantity = node?.quantity;
        const itemTotal = itemPrice * itemQuantity;
        totalAmount += itemTotal;
      });
    }
    return { totalAmount: totalAmount?.toFixed(2), currencyCode };
  };

  const addValues = (value1: any, value2: any) => {
    if (isNaN(value1) || isNaN(value2)) {
      return '--';
    }
    return value1 + value2;
  }

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return text;
  };

  const totalAmount = parseFloat(getTotalAmount()?.totalAmount);
  const taxAmount = data?.cart?.cost?.totalTaxAmount ? parseFloat(price(data?.cart?.cost?.totalTaxAmount)) : 0;
  const sum = addValues(totalAmount, taxAmount);

  const onAddToCartRelatedProduct = async (variantId, quantity) => {
    setLoadingProductId(variantId);
    await addToCart(variantId, quantity)
    setLoadingProductId(null);
    logEvent(`upselling Item add in cart variantId:${variantId} `);
  };

  const getIsFavSelected = (productId) => {
    const isFav = wishList.some(item => item?.id === productId);
    return isFav;
  }

  const handlePress = (item) => {
    if (!getIsFavSelected(item?.id)) {
      dispatch(addToWishlist(item));
      logEvent(`upselling Item add in fav`);
    } else {
      dispatch(removeFromWishlist(item?.id));
      logEvent(`upselling Item remove in fav`);
    }
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Cart Screen');
    navigation.navigate("ShopifyInboxScreen")
  };



  return (
    // <ImageBackground source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE} style={[styles.loading, flex, { backgroundColor: themecolors.whiteColor }]}>
    <View style={[styles.loading, flex, { backgroundColor: themecolors.whiteColor }]}>
      <SafeAreaView >
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart List"}
          textinput={true} />
        <View style={{ width: "100%", height: 5, backgroundColor: themecolors.whiteColor }}></View>
        <View style={{ height: Platform.OS === "android" ? hp(90) : hp(80) }}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.productList}>
              {data?.cart?.lines?.edges.map(({ node }) => (
                <CartItem
                  key={node?.merchandise?.id}
                  item={node}
                  addToCartitem={addToCart}
                  removeOneFromCart={removeOneFromCart}
                  quantity={node?.quantity}
                  loading={addingToCart?.has(node?.id)}
                  onRemove={(variantId) => handleRemoveToCart(variantId)}
                />
              ))}
            </View>
            {/* {upSellingproducts?.length != 0 ? <View style={styles.relatedProductsContainer}>
              <Text style={[styles.relatedProductsTitle, { color: themecolors.blackColor }]}>{YOU_MIGHT_LIKE}</Text>
              <FlatList
                data={upSellingproducts}
                renderItem={({ item }) => {
                  const inventoryQuantity = item?.inventoryQuantities[0] || 0;
                  const isFavSelected = getIsFavSelected(item?.id);
                  return (
                    <View
                      style={[styles.relatedProductItem, alignJustifyCenter, { backgroundColor: isDarkMode ? grayColor : "transparnet" }]}
                    >
                      <View style={{ width: "100%", borderWidth: .5, borderColor: themecolors.lightGrayOpacityColor, marginBottom: spacings.small, borderRadius: 10, alignItems: "center" }}>
                        <Image
                          source={{ uri: item?.imageUrls[0] }}
                          style={[styles.relatedProductImage, borderRadius10, resizeModeContain]}
                        />
                      </View>
                      <View style={[{ width: "100%", height: hp(9) }]}>
                        <Text style={[styles.relatedproductName, { color: themecolors.blackColor }]}>{trimcateText(item?.title)}</Text>
                        <Text
                          style={[
                            styles.relatedproductPrice,
                            { paddingHorizontal: spacings.small, color: themecolors.blackColor },
                          ]}
                        >
                          {item?.price[0]} {shopCurrency}
                        </Text>
                      </View>
                      <View style={[{ width: "100%", flexDirection: "row" }, justifyContentSpaceBetween, alignItemsCenter]}>
                        {inventoryQuantity === 0 ? (
                          <Pressable
                            style={[styles.relatedAddtocartButton, borderRadius10, alignJustifyCenter]}
                          >
                            <Text style={styles.addToCartButtonText}>Out of stock</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            style={[styles.relatedAddtocartButton, borderRadius10, alignJustifyCenter]}
                            onPress={() => onAddToCartRelatedProduct(item?.variantId[0], 1)}
                            disabled={loadingProductId === item?.variantId[0]}
                          >
                            {loadingProductId === item?.variantId[0] ? (
                              <ActivityIndicator color={whiteColor} />
                            ) : (
                              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                            )}
                          </Pressable>
                        )}
                        <TouchableOpacity style={[alignJustifyCenter, styles.relatedProductfavButton, { backgroundColor: whiteColor, borderColor: themecolors.redColor }]} onPress={() => handlePress(item)}>
                          <AntDesign
                            name={isFavSelected ? "heart" : "hearto"}
                            size={18}
                            color={redColor}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }}
                horizontal
                keyExtractor={(index) => index?.toString()}
                showsHorizontalScrollIndicator={false}
              />
            </View>
              :
              <View style={{ width: wp(100), alignItems: "center", justifyContent: "center", height: hp(15) }}>
                <LoaderKit
                  style={{ width: 50, height: 50 }}
                  name={LOADER_NAME}
                  color={themecolors.blackColor}
                />
                <Text>Loading Products...</Text>
              </View>} */}
          </ScrollView>
          <ChatButton onPress={handleChatButtonPress} bottom={userLoggedIn ? Platform.OS == "android" ? hp(35) : hp(33) : hp(10)} />
        </View>
        {userLoggedIn ?
          totalQuantity > 0 && (
            <View style={{ position: "absolute", bottom: 0, borderWidth: 1, borderBottomWidth: 0, borderColor: "#797979", borderRadius: 8, width: "100%", backgroundColor: themecolors.whiteColor }}>
              <View style={styles.costContainer}>
                <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow]}>
                  <Text style={styles.costBlockText}>{SUBTOTAL}</Text>
                  <Text style={[styles.costBlockText, { color: themecolors.blackColor }]}>
                    {getTotalAmount().currencyCode === "GBP" && "£"}  {getTotalAmount().totalAmount}
                  </Text>
                </View>

                <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow]}>
                  <Text style={styles.costBlockText}>{TAXES}</Text>
                  <Text style={[styles.costBlockText, { color: themecolors.blackColor }]}>
                    {price(data?.cart?.cost?.totalTaxAmount)}
                  </Text>
                </View>

                <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacings.large }]}>
                  <Text style={[styles.costBlockTextStrong, { color: themecolors.blackColor }]}>{TOTAL}</Text>
                  <Text style={[styles.costBlockTextStrong, { color: themecolors.blackColor }]}>
                    {getTotalAmount().currencyCode === "GBP" && "£"} {sum.toFixed(2)}
                  </Text>
                </View>
                <Text style={{
                  fontSize: style.fontSizeNormal1x.fontSize,
                  marginVertical: spacings.Large2x,
                  fontWeight: style.fontWeightThin1x.fontWeight,
                  lineHeight: 20,
                  color: themecolors.blackColor,
                  fontFamily: 'Montserrat-BoldItalic'
                }}>Note : Shipping will be calculated at checkout.</Text>

              </View>
              <Pressable
                style={[styles.cartButton, borderRadius10, alignJustifyCenter]}
                disabled={totalQuantity === 0}
                onPress={presentCheckout}>
                <Text style={[styles.cartButtonText, textAlign]}>{CHECKOUT}</Text>
              </Pressable>
            </View>
          )
          :
          <View style={[flexDirectionRow, positionAbsolute, justifyContentSpaceBetween, { alignItems: "baseline", bottom: 0, width: wp(100), zIndex: 1, backgroundColor: themecolors.whiteColor, height: hp(8) }]}>
            <View style={{ width: wp(50), justifyContent: "center", alignItems: "center", height: hp(10) }}>
              <View style={[styles.quantityContainer, alignJustifyCenter, { flexDirection: "column", width: wp(50) }]}>
                <Text style={{ paddingHorizontal: spacings.large, color: themecolors.blackColor, fontSize: style.fontSizeMedium.fontSize, fontWeight: "700", fontFamily: 'Montserrat-BoldItalic' }}>Total: {getTotalAmount().currencyCode === "GBP" && "£"} {getTotalAmount().totalAmount} </Text>
                {/* <Text style={{ backgroundColor: "#dafbd5", paddingHorizontal: 4, marginTop: 8, borderRadius: 5, color: "#018726" }}><AntDesign
                  name={"tag"}
                  size={15}
                  color={"#018726"}
                />Saved £21.99 </Text> */}
              </View>
            </View>
            <View style={[{ position: "absolute", bottom: 10, right: 10, }]}>
              <Pressable
                style={[styles.addToCartButton, borderRadius10, { backgroundColor: "#018726" }]}
                onPress={openModal}
              >
                <Text style={[textAlign, { color: whiteColor, width: wp(12), fontFamily: 'Montserrat-BoldItalic' }]}>
                  Login
                </Text>
              </Pressable>

            </View>
          </View>
        }
        {modalVisible && (
          <LoginModal modalVisible={modalVisible} closeModal={closeModal} slideAnim={slideAnim} />
        )}
      </SafeAreaView>
      {/* </ImageBackground> */}
    </View>
  );
}

function price(value: { amount: string; currencyCode: string }) {
  if (!value) {
    return '-';
  }
  const { amount, currencyCode } = value;

  // Return formatted price with GBP symbol if currencyCode is GBP
  return currencyCode === "GBP" ? `£ ${amount}` : `${amount} ${currencyCode}`;
}
;


function CartItem({
  item,
  quantity,
  onRemove,
  loading,
  addToCartitem,
  removeOneFromCart

}: {
  item: CartLineItem;
  quantity: number;
  loading?: boolean;
  onRemove: (variantId: string, quantityToRemove: number) => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;
  const [productquantity, setProductQuantity] = useState(quantity);

  const handleRemoveItem = () => {
    onRemove(item.id);
  };

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return text;
  };

  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    const newQuantity = productquantity + 1;
    setProductQuantity(newQuantity);

    // Call addToCart with the variant ID and the new quantity to add
    addToCartitem(item.merchandise.id, 1); // Adds one more of the same item
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);

  };

  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');
    if (item.quantity > 1) {
      const newQuantity = productquantity - 1;
      setProductQuantity(newQuantity);
      removeOneFromCart(item.id, 1); // Removes one quantity of the item
      Toast.show(`1 remove to cart`);
    } else {
      onRemove(item.id);
    }
  };


  return (
    <View
      key={item?.id}
      style={{
        ...styles.productItem,
        ...(loading ? styles.productItemLoading : {}),
        borderWidth: 1, borderColor: "#797979", backgroundColor: isDarkMode ? grayColor : whiteColor
      }}>
      <View style={{ borderWidth: 1, borderRadius: 10, overflow: "hidden", borderColor: grayColor }}>
        <Image
          resizeMethod="resize"
          style={[styles.productImage, resizeModeCover, borderRadius5]}
          alt={item?.merchandise?.image?.altText}
          source={{ uri: item?.merchandise?.image?.url }}
        />
      </View>
      <View style={[styles.productText, flex, alignJustifyCenter, flexDirectionRow]}>
        <View style={[flex]}>
          <Text style={[styles.productTitle, { color: themecolors.blackColor }]}>
            {trimcateText(item?.merchandise?.product?.title)}
          </Text>
          <Text style={[{ color: themecolors.grayColor }]}>
            {/* 2 x 16g */}
          </Text>
          <Text style={[styles.productPrice, { color: themecolors.blackColor }]}>
            {price(item?.merchandise?.price)}
          </Text>
        </View>
        <View>
          <View style={[styles.quantityContainer, flexDirectionRow, { marginTop: 30 }]}>
            <TouchableOpacity onPress={decrementQuantity} >
              <AntDesign
                name={"minuscircle"}
                size={25}
                color={"#eb4335"}
              />
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: themecolors.blackColor }]}>{quantity}</Text>
            <TouchableOpacity onPress={incrementQuantity} >
              <AntDesign
                name={"pluscircle"}
                size={25}
                color={"#eb4335"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View >
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    loading: {
    },
    loadingText: {
      marginVertical: spacings.Large2x,
      color: colors.text,
      fontFamily: 'Montserrat-BoldItalic'
    },
    scrollView: {
      paddingBottom: spacings.xLarge,
    },
    cartButton: {
      width: 'auto',
      height: hp(6),
      left: 0,
      right: 0,
      marginHorizontal: spacings.large,
      padding: spacings.large,
      backgroundColor: redColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    cartButtonText: {
      fontSize: style.fontSizeMedium.fontSize,
      lineHeight: 20,
      color: colors.secondaryText,
      fontWeight: style.fontWeightThin1x.fontWeight,
      fontFamily: 'Montserrat-BoldItalic'
    },
    cartButtonTextSubtitle: {
      fontSize: style.fontSizeSmall2x.fontSize,
      color: colors.textSubdued,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    productList: {
      marginVertical: spacings.xLarge,
      paddingHorizontal: spacings.xLarge,
    },
    productItem: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: spacings.large,
      padding: spacings.large,
      backgroundColor: whiteColor,
      borderRadius: 5,
    },
    productItemLoading: {
      opacity: 0.6,
    },
    productText: {
      paddingLeft: 10,
      display: 'flex',
      color: colors.textSubdued
    },
    productTitle: {
      fontSize: style.fontSizeNormal1x.fontSize,
      // marginBottom: spacings.small2x,
      fontWeight: style.fontWeightThin1x.fontWeight,
      // lineHeight: 20,
      color: blackColor,
      fontFamily: 'Montserrat-BoldItalic'
    },
    productDescription: {
      fontSize: style.fontSizeNormal.fontSize,
      color: colors.textSubdued,
      padding: spacings.xLarge,
      fontFamily: 'Montserrat-BoldItalic'
    },
    productPrice: {
      fontSize: style.fontSizeNormal.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
      color: blackColor,
      fontFamily: 'arialnarrow'
    },
    removeButton: {
      marginRight: spacings.xLarge,
      marginTop: spacings.xSmall,
      padding: spacings.large,
    },
    removeButtonText: {
      color: colors.textSubdued,
      fontFamily: 'Montserrat-BoldItalic'
    },
    productImage: {
      width: wp(20),
      height: hp(10),
      // borderWidth: 1
    },
    costContainer: {
      // marginBottom: spacings.xLarge,
      marginHorizontal: spacings.Large1x,
      paddingTop: spacings.xLarge,
      // paddingBottom: hp(10),
      paddingHorizontal: spacings.xsmall,
      borderTopColor: colors.border,
    },
    costBlock: {
      display: 'flex',
      padding: spacings.small2x,
    },
    costBlockText: {
      fontSize: style.fontSizeNormal.fontSize,
      color: colors.textSubdued,
      fontFamily: 'Montserrat-BoldItalic'
    },
    costBlockTextStrong: {
      fontSize: style.fontSizeNormal2x.fontSize,
      color: colors.text,
      fontWeight: style.fontWeightThin1x.fontWeight,
      fontFamily: 'Montserrat-BoldItalic'
    },
    addToCartButton: {
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      backgroundColor: redColor,
      paddingVertical: spacings.large,
      paddingHorizontal: spacings.xxxxLarge
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: wp(22),
      // backgroundColor: whiteColor,
      paddingHorizontal: 9,
      paddingVertical: 2,
      justifyContent: "center",
      borderRadius: 5,
      borderColor: redColor,
    },
    quantityButton: {
      paddingHorizontal: 8,
      borderRadius: 5,
      color: redColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    quantity: {
      paddingHorizontal: 12,
      paddingVertical: 2,
      fontSize: 16,
      fontWeight: 'bold',
      color: redColor,
      fontFamily: 'Montserrat-BoldItalic'
    },
    relatedProductsContainer: {
      width: "100%",
      marginTop: spacings.xLarge,
    },
    relatedProductsTitle: {
      fontSize: style.fontSizeLarge.fontSize,
      fontWeight: style.fontWeightMedium.fontWeight,
      color: blackColor,
      paddingHorizontal: spacings.large
    },
    relatedProductItem: {
      width: wp(40),
      margin: spacings.small,
      padding: spacings.large,
      borderRadius: 5
    },
    relatedProductImage: {
      width: wp(30),
      height: wp(30),
      marginVertical: spacings.large,
    },
    relatedproductName: {
      fontSize: style.fontSizeSmall2x.fontSize, fontWeight: style.fontWeightThin1x.fontWeight, fontFamily: 'Montserrat-BoldItalic'
    },
    relatedproductPrice: {
      fontSize: style.fontSizeSmall1x.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,

    },
    relatedAddtocartButton: {
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      width: "68%",
      backgroundColor: redColor,
      padding: spacings.normal,
    },
    addToCartButtonText: {
      fontSize: style.fontSizeNormal.fontSize,
      lineHeight: 20,
      color: whiteColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    relatedProductfavButton: {
      width: wp(10),
      height: hp(3.8),
      right: 0,
      zIndex: 10,
      borderWidth: 1,
      borderRadius: 10,
    },
    addToCartButtonLoading: {
      width: wp(44)
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'white',
      height: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    closeButton: {
      backgroundColor: '#018726',
      padding: 10,
      borderRadius: 10,
      alignSelf: 'flex-end',
    },
  });
}

export default CartScreen;


