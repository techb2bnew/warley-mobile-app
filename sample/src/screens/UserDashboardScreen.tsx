import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ImageBackground, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor, mediumGray } from '../constants/Color';
import { SHIPPING_ADDRESS, MY_WISHLIST, ORDERS } from '../constants/Constants';
import Header from '../components/Header'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Fontisto from 'react-native-vector-icons/dist/Fontisto';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import AddAddressModal from '../components/Modal/AddAddressModal';
import { removeFromWishlist } from '../redux/actions/wishListActions';
import { useDispatch, useSelector } from 'react-redux';
import { logEvent } from '@amplitude/analytics-react-native';
import { BACKGROUND_IMAGE, ADD_TO_CART_IMG, DARK_BACKGROUND_IMAGE, COMING_SOON_IMG } from '../assests/images';
import { STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, OUT_OF_STOCK, STOREFRONT_ACCESS_TOKEN } from '../constants/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/Cart';
import Toast from 'react-native-simple-toast';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import AddReviewModal from '../components/Modal/AddReviewModal';
import ChatButton from '../components/ChatButton';
import { scheduleNotification } from '../notifications';
import useShopify from '../hooks/useShopify';
import axios from 'axios';
import { validate } from 'graphql';
const { alignJustifyCenter, textAlign, positionAbsolute, resizeModeContain, flexDirectionRow, flex } = BaseStyle;

const UserDashboardScreen = () => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { addToCart, addingToCart, cartId, removeFromCart, removeOneFromCart } = useCart();
  const { queries } = useShopify();
  const [fetchCart, { data }] = queries.cart;
  const navigation = useNavigation()
  const route = useRoute();
  const ordersList = route.params?.orderList;
  const customerAddresses = route.params?.address;
  const wishlistObject = useSelector(state => state.wishlist);
  const wishList = wishlistObject?.wishlist;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null)
  const dispatch = useDispatch();
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const [shopCurrency, setShopCurrency] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState('');
  const [productquantity, setProductQuantity] = useState(1);
  const [productImages, setProductImages] = useState({});
  const [customerWishList, setCustomerWishList] = useState([]);
  useEffect(() => {
    logEvent('UserDashboardScreen Initialized');
  }, [])

  useEffect(() => {
    if (customerAddresses?.length === 1) {
      setDefaultAddressId(customerAddresses[0].id);
      setSelectedAddressId(customerAddresses[0].id);
    }
  }, [customerAddresses]);

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
    const fetchUserDetails = async () => {
      const userDetails = await AsyncStorage.getItem('userDetails')
      const userAddress = await AsyncStorage.getItem('isDefaultAddress')
      if (userAddress) {
        setDefaultAddressId(JSON.parse(userAddress));
      }
      if (userDetails) {
        const userDetailsObject = JSON.parse(userDetails);
        const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
        setCustomerId(userId)
      }
    };
    fetchUserDetails();
  }, [customerId, defaultAddressId]);

  useEffect(() => {
    if (cartId) {
      fetchCart({
        variables: {
          cartId,
        },
      });
    }
  }, [fetchCart, cartId]);


  const removeFromWishlistAPI = async (customerId, productId) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('Token not found');
        return;
      }
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

  const handlePress = (item) => {
    console.log("item::", item)
    logEvent(`removed from WishList ${item}`);
    dispatch(removeFromWishlist(item));
    if (customerWishList.length > 0) {
      console.log("customerWishList", customerWishList)
      const idToUse = item?.productId || item._id;
      const number = idToUse?.match(/\d+$/)?.[0];
      console.log(number)
      removeFromWishlistAPI(customerId, number);
      fetchCustomerWishlist(customerId);
    }
  };

  const onPressContinueShopping = (title: string) => {
    logEvent(`Press Continue Shopping Button in ${title} Screen`);
    navigation.navigate('HomeScreen')
  }

  const onPressAddAddress = () => {
    logEvent(`Press Add Address Modal`);
    setModalVisible(true)
  }

  const setDefaultAddress = async (addressId) => {
    logEvent(`Press Set Default Address Button`);
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2023-01/customers/${customerId}/addresses/${addressId}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          address: {
            id: addressId,
            default: true,
          }
        }),
      });
      await AsyncStorage.removeItem('isDefaultAddress');
      const data = await response.json();
      await AsyncStorage.setItem('isDefaultAddress', JSON.stringify(addressId));
      setDefaultAddressId(addressId);
      logEvent(`Seccess setting default address`);
      // console.log('Set default address response:', data);
    } catch (error) {
      console.error('Error setting default address:', error);
      logEvent(`Error setting default address`);
    }
  }

  const addToCartProduct = async (item: any, quantity: any) => {
    const variantId = item?.variants?.edges ? item?.variants?.edges[0]?.node?.id : item?.variants?.nodes ? item?.variants?.nodes[0].id : item?.variants?.[0]?.admin_graphql_api_id ? item?.variants[0]?.admin_graphql_api_id : item.variantId[0];
    // console.log(variantId)
    setLoadingProductId(variantId);
    await addToCart(variantId, quantity);
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    setLoadingProductId(null);
    logEvent(`Add To Cart  Product variantId:${variantId} Qty:${quantity}`);
    scheduleNotification();
  };

  const openReviewModal = (item) => {
    const productIds = item.line_items.map(lineItem => lineItem.product_id);
    console.log("Product IDs:", productIds);
    const fullName = `${item?.customer?.first_name || ''} ${item?.customer?.last_name || ''}`;
    console.log("full name:", fullName);
    setProductId(productIds)
    setCustomerName(fullName)
    setIsModalVisible(true)
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in userDashboard Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  const trimcateText = (text, limit = 20) => {
    if (text.length > limit) {
      return text.slice(0, limit);
    }
    return text;
  };

  const getVariant = (product: ShopifyProduct) => {
    if (product?.variants?.edges?.length > 0) {
      return product?.variants?.edges[0]?.node;
    } else if (product?.variants?.nodes?.length > 0) {
      return product?.variants?.nodes[0];
    } else {
      return null;
    }
  };

  useEffect(() => {
    // Fetch images for each product in the order list
    ordersList?.forEach(order => {
      order.line_items.forEach(async (lineItem) => {
        const { product_id } = lineItem;
        if (!productImages[product_id]) {
          try {
            const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2023-04/products/${product_id}.json`, {
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
              },
            });
            const imageUrl = response.data.product.image?.src || null;
            setProductImages(prevImages => ({
              ...prevImages,
              [product_id]: imageUrl,
            }));
          } catch (error) {
            console.error('Error fetching product image:', error);
          }
        }
      });
    });
  }, [ordersList]);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          const userDetailsObject = JSON.parse(userDetails);
          const userId = userDetailsObject?.customer ? userDetailsObject.customer.id : userDetailsObject.id;
          setCustomerId(userId);
        }
      } catch (error) {
        console.error("Error retrieving user details:", error);
      }
    };

    getUserDetails();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchCustomerWishlist(customerId);
    }
  }, [customerId, wishList]);


  const fetchCustomerWishlist = async (customerId) => {
    console.log(customerId)
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error("Token not found");
      // console.log(token)
      // API request to fetch wishlist
      const response = await fetch(`https://warley-thv5m.ondigitalocean.app/api/wishlist/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Check for a successful response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch wishlist: ${errorText}`);
      }

      // Parse and return the wishlist data
      const wishlistData = await response.json();
      console.log("Customer Wishlist:", wishlistData);
      setCustomerWishList(wishlistData.wishlist)
      // return wishlistData;

    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return null;
    }
  };

  const renderProductItem = ({ item }) => {
    const imageUrl = item?.images?.edges ? item?.images?.edges?.[0]?.node?.url : item?.images?.nodes ? item?.images?.nodes?.[0]?.url : item?.images?.[0]?.src ? item?.images?.[0]?.src : item?.imageUrls ? item?.imageUrls[0] : null
    const itemPrice = item?.variants?.edges?.[0]?.node?.price?.amount ?? item?.variants?.nodes?.[0]?.price ?? item?.variants?.[0]?.price;
    const itemCurrencyCode = item?.variants?.edges?.[0]?.node?.price?.currencyCode ?? null;
    const inventoryQuantity = item?.variants?.nodes ? item?.variants?.nodes[0]?.inventoryQuantity : (item?.variants?.[0]?.inventory_quantity ? item?.variants?.[0]?.inventory_quantity : (Array.isArray(item?.inventoryQuantity) ? item?.inventoryQuantity[0] : item?.inventoryQuantity));
    const variantId = item?.variants?.edges ? item?.variants.edges[0]?.node.id : item?.variants?.nodes ? item?.variants?.nodes[0]?.id : item?.variants?.[0]?.admin_graphql_api_id ? item?.variants[0]?.admin_graphql_api_id : item.variantId?.[0];
    const tags = item?.tags;
    const option = item?.options?.map((opt) => ({
      id: opt.id,
      name: opt.name,
      values: opt.values
    }));

    const ids = item?.variants?.nodes?.map(variant => ({
      id: variant.id,
      title: variant.title
    }));

    const getCartItem = (variantId) =>
      data?.cart?.lines?.edges?.find((item) => item.node.merchandise.id === variantId);
    const cartItem = getCartItem(variantId);
    const productQuantity = cartItem ? cartItem.node.quantity : 0;

    const incrementQuantity = () => {
      logEvent('Increase Product Quantity');
      const newQuantity = productquantity + 1;
      setProductQuantity(newQuantity);
      addToCart(item?.variants?.nodes[0]?.id, 1); 
    };

    const decrementQuantity = () => {
      logEvent('Decrease Product Quantity');
      if (productQuantity > 1) {
        const newQuantity = productquantity - 1;
        setProductQuantity(newQuantity);

        removeOneFromCart(cartItem?.node.id, 1);
        Toast.show(`1 remove to cart`);
      } else {
        removeFromCart(cartItem?.node.id);
      }
    };

    return (
      <Pressable style={[styles.itemContainer, { backgroundColor: isDarkMode ? grayColor : whiteColor }]}
        onPress={() => {
          navigation.navigate('ProductDetails', {
            product: item,
            variant: getVariant(item),
            inventoryQuantity: inventoryQuantity,
            tags: tags,
            option: option,
            ids: ids
          })
        }}
      >
        <Pressable style={[positionAbsolute, styles.favButton]}
          onPress={() => handlePress(item)}
        >
          <AntDesign
            name={"heart"}
            size={20}
            color={"#eb4345"}
          />
        </Pressable>
        <>
          {inventoryQuantity > 0 && item.price?.[0] != 0 && itemPrice != 0 ? (
            productQuantity > 0 ? (
              // If product is in the cart with quantity > 0, show increment/decrement buttons
              <View key={cartItem.node.id} style={[styles.quantityContainer]}>
                <TouchableOpacity onPress={() => incrementQuantity(variantId)}>
                  <AntDesign name={"pluscircle"} size={25} color={"#399918"} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{productQuantity}</Text>
                <TouchableOpacity onPress={() => decrementQuantity(variantId)}>
                  <AntDesign name={"minuscircle"} size={25} color={"#399918"} />
                </TouchableOpacity>
              </View>
            ) : (
              // If product is not in the cart (quantity 0), show Add to Cart button
              <Pressable
                style={styles.addToCartButton}
                onPress={() => addToCartProduct(item, 1)}
              >
                {/* <Image
                      source={ADD_TO_CART_IMG}
                      style={{ height: 35, width: 35, resizeMode: "contain" }}
                    /> */}
                <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
              </Pressable>
            )
          ) : (
            // If inventory quantity is 0 or less, show Out of Stock message
            <View style={[{
              borderRadius: 10,
              position: "absolute",
              right: -5,
              top: 1,
              zIndex: 1000,
              width: wp(9),
              backgroundColor: redColor,
              alignItems: "center",
              justifyContent: 'center',
              padding: 3
            }]}>
              <Text style={[{
                fontSize: 9,
                color: whiteColor,
                fontFamily: 'Montserrat-BoldItalic'
              }]}>Sold Out</Text>
            </View>
          )}
        </>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.productImage, resizeModeContain]}
          />
        ) : (
          <Image
            source={COMING_SOON_IMG}
            style={[styles.productImage, resizeModeContain]}
          />)}
        <View style={{ width: "100%", height: hp(7), justifyContent: "center", marginTop: spacings.large }}>
          <View style={{ width: "100%" }}>
            <Text style={[styles.wishListItemName, { color: colors.blackColor }]}>{trimcateText(item?.title)}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>

            <View>
              {item.price?.[0] > 0 || itemPrice > 0 ? (
                <Text style={[styles.wishListItemPrice, { color: redColor }]}>
                  {itemCurrencyCode ? (itemCurrencyCode === "GBP" && "£") : shopCurrency}
                  <Text style={[styles.wishListItemPrice]}> {item.price?.[0] || itemPrice}</Text>
                </Text>
              ) : (
                <Text style={[styles.wishListItemPrice]}>Coming Soon</Text>
              )}
            </View>

          </View>
        </View>
      </Pressable>
    );
  }


  //   console.log("Customer Wishlist:", customerWishList);
  // console.log("Wishlist:", wishList);
  const combinedWishList = [
    ...customerWishList,
    ...wishList.filter(
      item => !customerWishList.some(existingItem => existingItem?.title?.trim() === item?.title?.trim())
    ),
  ];
  return (
    <KeyboardAvoidingView
      style={[flex]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* <ImageBackground style={[styles.container, flex]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}> */}
      <View style={[styles.container, flex]} >
        <Header backIcon={true} textinput={true} text={route.params?.from} navigation={navigation} />
        <View style={{ width: "100%", height: 5, backgroundColor: colors.whiteColor }}></View>
        {
          route.params?.from === ORDERS &&
          (ordersList && ordersList.length > 0 ?
            <View style={[styles.detailsBox]}>
              <FlatList
                data={ordersList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable style={{ margin: 5, backgroundColor: colors.lightGrayOpacityColor, borderRadius: 12, padding: spacings.large, borderWidth: 1, borderColor: colors.lightShadeBlue }}
                    onPress={() => {
                      // Pass order details along with the pressed line item image to the OrderDetails screen
                      const lineItemImage = item?.line_items?.[0]?.product_id
                        ? productImages[item.line_items[0].product_id]
                        : null;

                      navigation.navigate('OrderDetails', { order: item, image: lineItemImage });
                    }}
                  >
                    <Text style={[styles.orderTitle, { color: colors.blackColor, marginBottom: spacings.medium, fontFamily: 'Montserrat-BoldItalic' }]}>
                      Order Id : #{item.id}
                    </Text>
                    {item?.line_items && item.line_items.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacings.medium, backgroundColor: colors.whiteColor, borderRadius: 8, shadowColor: colors.blackOpacity5, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>

                        {(() => {
                          const lineItem = item.line_items[0];
                          const imageUrl = productImages[lineItem.product_id];
                          return (
                            <>
                              {imageUrl ? (
                                <Image
                                  source={{ uri: imageUrl }}
                                  style={{ width: wp(18), height: hp(12), borderRadius: 8, marginRight: 16 }}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={{ width: 60, height: 60, backgroundColor: '#D1D4D6', borderRadius: 8, marginRight: 16, justifyContent: 'center', alignItems: 'center' }}>
                                  <Text style={{ color: '#808080' }}>No Image</Text>
                                </View>
                              )}

                              {/* Product Details */}
                              <View style={{ flex: 1 }}>
                                <View style={[flexDirectionRow, { marginBottom: spacings.small, width: "80%" }]}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>Date:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                                </View>
                                <View style={[flexDirectionRow, { marginBottom: spacings.small, width: "80%" }]}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>Total Price:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>{item.total_price}</Text>
                                </View>
                                <View style={[flexDirectionRow, { marginBottom: spacings.small, width: "80%" }]}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>Total Number of  items:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>{item.line_items.length}</Text>
                                </View>
                                <View style={[flexDirectionRow, { marginBottom: spacings.small, width: "80%" }]}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>Currency:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>{item.currency}</Text>
                                </View>

                                {/* <View style={[flexDirectionRow, { marginBottom: spacings.small, width: "80%" }]}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor }}>Product:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor }}>{trimcateText(lineItem.title)}</Text>
                                </View>

                                {lineItem?.variant_title && (
                                  <View style={[flexDirectionRow, { marginBottom: spacings.small }]}>
                                    <Text style={{ fontWeight: "bold", color: colors.blackColor }}>Variant:</Text>
                                    <Text style={{ marginLeft: spacings.medium, color: colors.blackColor }}>{lineItem.variant_title}</Text>
                                  </View>
                                )}

                                <View style={[flexDirectionRow, { marginBottom: spacings.small }]}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor }}>Quantity:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor }}>{lineItem.quantity}</Text>
                                </View>

                                <View style={flexDirectionRow}>
                                  <Text style={{ fontWeight: "bold", color: colors.blackColor }}>Price:</Text>
                                  <Text style={{ marginLeft: spacings.medium, color: colors.blackColor }}>
                                    {lineItem.price} {shopCurrency}
                                  </Text>
                                </View> */}
                              </View>
                            </>
                          );
                        })()}
                      </View>
                    )}
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />

            </View> :
            <View style={[styles.centeredContainer, alignJustifyCenter]}>
              <Text style={{ color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>No orders placed.</Text>
              <Text style={[textAlign, { color: colors.blackColor, margin: spacings.large, fontFamily: 'Montserrat-BoldItalic' }]}>Your all ordered will appear here. Currently its Empty</Text>
              <Pressable style={styles.button} onPress={() => onPressContinueShopping(ORDERS)}>
                <Text style={[styles.buttonText, textAlign]}>Continue Shopping</Text>
              </Pressable>
            </View>)
        }
        {
          route.params?.from === "Saved" &&
          (wishList && wishList.length > 0 || customerWishList && customerWishList.length > 0 ?
            <View style={[styles.detailsBox]}>
              <FlatList
                data={combinedWishList}
                // data={customerWishList ? customerWishList : wishList}
                keyExtractor={(item) => item?.id?.toString()}
                numColumns={3}
                renderItem={renderProductItem}
              />
            </View> :
            <View style={[styles.centeredContainer, alignJustifyCenter, { width: wp(80),height:hp(80), alignSelf: "center" }]}>
              <View>
                <AntDesign
                  name={"hearto"}
                  size={50}
                  color={colors.mediumGray}
                />
              </View>
              <Text style={{ color: colors.blackColor, fontSize: style.fontSizeMedium.fontSize, fontFamily: 'Montserrat-BoldItalic' }}>No Saved found.</Text>
              <Text style={{ color: colors.mediumGray, textAlign: "center", fontFamily: 'Montserrat-BoldItalic' }}>You don’t have any saved items. Go to home and add some.</Text>
            </View>)
        }
        {
          route.params?.from === SHIPPING_ADDRESS &&
          (customerAddresses && customerAddresses.length > 0 ? <View style={[styles.centeredContainer]}>
            <Text style={[styles.itemText, { marginVertical: spacings.normal, color: colors.blackColor }]}>Saved Address</Text>
            <FlatList
              data={customerAddresses}
              keyExtractor={(item) => item?.id.toString()}
              renderItem={({ item }) => {
                const isSelected = defaultAddressId === item?.id;
                return (
                  <Pressable style={[{ padding: spacings.large, borderWidth: 1, width: "100%", borderRadius: 10, marginVertical: 5, borderColor: colors.blackColor, backgroundColor: isDarkMode ? grayColor : "tranparent" }, flexDirectionRow]}
                    onPress={() => [setSelectedAddressId(item.id), setDefaultAddress(item?.id)]}>
                    <View style={[{ width: "15%" }, alignJustifyCenter]}>
                      <Ionicons
                        name={"location"}
                        size={30}
                        color={redColor}
                      />
                    </View>
                    <View style={{ width: "75%" }}>
                      {item.name && <View style={[flexDirectionRow]}>
                        <View style={{ width: "25%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>Name</Text>
                        </View>
                        <View style={{ width: "5%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>:</Text>
                        </View>
                        <View style={{ width: "50%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>{item.name}</Text>
                        </View>
                      </View>}
                      {item.phone && <View style={[flexDirectionRow]}>
                        <View style={{ width: "25%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>Phone</Text>
                        </View>
                        <View style={{ width: "5%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>:</Text>
                        </View>
                        <View style={{ width: "50%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>{item.phone}</Text>
                        </View>
                      </View>}
                      <View style={[flexDirectionRow]}>
                        <View style={{ width: "25%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>Address</Text>
                        </View>
                        <View style={{ width: "5%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>:</Text>
                        </View>
                        <View style={{ width: "70%" }}>
                          <Text style={[styles.additemText, { color: colors.blackColor }]}>{`${item.address1}, ${item.city}, ${item.province}, ${item.country}-${item.zip}`}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[{ width: "10%" }, alignJustifyCenter]}>
                      <Fontisto
                        name={isSelected ? "radio-btn-active" : "radio-btn-passive"}
                        size={20}
                        color={redColor}
                      />
                    </View>
                  </Pressable>
                );
              }}
            />
            <Pressable style={[styles.addAddressButtonRounded, positionAbsolute, alignJustifyCenter]} onPress={onPressAddAddress}>
              <AntDesign name={"plus"} size={28} color={whiteColor} />
            </Pressable>
          </View> :
            <View style={[styles.centeredContainer, alignJustifyCenter]}>
              <Text style={{ color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }}>No address found.</Text>
              <Pressable style={styles.button} onPress={() => onPressContinueShopping(SHIPPING_ADDRESS)}>
                <Text style={[styles.buttonText, textAlign]}>Continue Shopping</Text>
              </Pressable>
              <Pressable style={[styles.addAddressButtonRounded, positionAbsolute, alignJustifyCenter]} onPress={onPressAddAddress}>
                <AntDesign name={"plus"} size={28} color={whiteColor} />
              </Pressable>
            </View>)
        }
        {modalVisible && <AddAddressModal visible={modalVisible} onClose={() => setModalVisible(false)} />}
        {isModalVisible && <AddReviewModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} productId={productId} customerName={customerName} />}
        <ChatButton onPress={handleChatButtonPress} bottom={route.params?.from === SHIPPING_ADDRESS ? Platform.OS === "android" ? 2 : hp(10) : 0} />
        {/* </ImageBackground> */}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    width: wp(100),
    height: hp(100)
  },
  centeredContainer: {
    width: wp(100),
    height: hp(90),
    padding: spacings.large,
  },
  itemContainer: {
    paddingHorizontal: spacings.large,
    paddingBottom: 15,
    margin: 5,
    width: wp(28.5),
    height: hp(23),
    borderColor: 'transparent',
    backgroundColor: whiteColor,
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
  },
  itemText: {
    fontSize: style.fontSizeMedium.fontSize,
    color: blackColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  wishListItemName: {
    color: blackColor,
    fontSize: style.fontSizeExtraExtraSmall.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,

  },
  wishListItemPrice: {
    fontSize: style.fontSizeSmall.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: redColor,

  },
  button: {
    marginTop: spacings.medium,
    padding: spacings.medium,
    backgroundColor: redColor,
    borderRadius: 5,
  },
  buttonText: {
    color: whiteColor,
    fontFamily: 'Montserrat-BoldItalic'
  },
  addAddressButtonRounded: {
    bottom: hp(15),
    right: 20,
    width: wp(15),
    height: Platform.OS === "android" ? hp(7.5) : hp(7),
    backgroundColor: redColor,
    borderRadius: 50
  },
  addAddressButton: {
    bottom: 50,
    // right: 20,
    width: "100%",
    height: hp(6),
    // backgroundColor: redColor,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "center"
  },
  detailsBox: {
    width: wp(100),
    height: Platform.OS == "android" ? hp(87) : hp(76),
    padding: spacings.large
  },
  productImage: {
    width: "70%",
    height: hp(12),
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: spacings.large
  },
  favButton: {
    width: wp(8),
    height: wp(8),
    right: 2,
    top: hp(13),
    zIndex: 10,
    // backgroundColor:whiteColor,
    borderRadius: 5
  },
  additemText: {
    fontSize: style.fontSizeNormal.fontSize,
    color: blackColor,
    fontFamily: 'Montserrat-BoldItalic'
    // fontWeight: style.fontWeightThin1x.fontWeight,
  },
  // addToCartButtonText: {
  //   fontSize: style.fontSizeNormal.fontSize,
  //   lineHeight: 20,
  //   color: whiteColor,
  //   fontWeight: style.fontWeightThin1x.fontWeight,
  // },
  quantityContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // width: wp(20),
    // paddingVertical: 4,
    // marginBottom: 10,
    // justifyContent: "center",
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
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingTop: 1,
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
    // borderRadius: 10,
    // fontSize: 8,
    // position: "absolute",
    // right: -9,
    // bottom: Platform.OS === "android" ? -27 : -32,
    // paddingVertical: 5,
    position: "absolute",
    top: .5,
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
  },
  addToCartButtonText: {
    fontSize: 11,
    lineHeight: 18,
    color: redColor,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Montserrat-BoldItalic'
  },
});

export default UserDashboardScreen;
