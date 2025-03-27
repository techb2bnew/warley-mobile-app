import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style,appFonts } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { ADMINAPI_ACCESS_TOKEN, STOREFRONT_DOMAIN } from '../constants/Constants';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors, lightGrayColor } from '../constants/Color';
import { BACKGROUND_IMAGE, ADD_TO_CART_IMG, DARK_BACKGROUND_IMAGE } from '../assests/images';
import ChatButton from '../components/ChatButton';
import { logEvent } from '@amplitude/analytics-react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-simple-toast';
import LoadingModal from '../components/Modal/LoadingModal';
import { scheduleNotification } from '../notifications';
import { useCart } from '../context/Cart';
const { flex, flexDirectionRow, } = BaseStyle;
const OrderDetailsScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const { isDarkMode } = useThemes();
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(false);
  const colors = isDarkMode ? darkColors : lightColors;
  const { addToCart, addingToCart, clearCart } = useCart();

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

  const fetchProductImage = async (productId) => {
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/products/${productId}.json`, {
        headers: {
          "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN,
        },
      });
      const productData = await response.json();
      const imageUrl = productData.product?.images[0]?.src;
      setProductImages((prevImages) => ({
        ...prevImages,
        [productId]: imageUrl,
      }));
    } catch (error) {
      console.error("Failed to fetch product image:", error);
    }
  };

  useEffect(() => {
    order.line_items.forEach(item => {
      if (!productImages[item.product_id]) {
        fetchProductImage(item.product_id);
      }
    });
  }, [order.line_items]);


  const addToCartProduct = async (variantId: any, quantity: any) => {
    setLoading(true);
    const id = `gid://shopify/ProductVariant/${variantId}`
    logEvent(`Add To Cart Pressed variantId:${variantId} Qty:${quantity}`);
    await addToCart(id, quantity);
    navigation.navigate('Cart')
    setLoading(false)
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    scheduleNotification();
   
  };
  
  const renderItem = ({ item }) => {
    const totalPrice = item.price * item.quantity;
    const productImage = productImages[item.product_id];
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.detailsContainer, { backgroundColor: colors.lightGrayOpacityColor }]}>
          <View style={[flexDirectionRow, flex]}>
            <View style={{ width: "25%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              {productImage ? (
                <Image
                  source={{ uri: productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImage, { backgroundColor: '#D1D4D6' }]}>
                  <Text>No Image</Text>
                </View>
              )}
            </View>
            <View style={{ width: "75%" }}>
              <Text style={[styles.productTitle, { color: colors.blackColor }]}>{trimcateText(item.title)}</Text>
              {item.variant_title && (
                <Text style={[styles.variantText, { color: colors.blackColor }]}>Variant: {item.variant_title}</Text>
              )}
              <Text style={[styles.quantityText, { color: colors.blackColor }]}>Quantity: {item.quantity}</Text>
              <Text style={[styles.priceText, { color: colors.blackColor, fontFamily: appFonts.semiBold }]}>Price: {order.currency === "GBP" && "£"} {item.price} </Text>
              <Text style={[styles.priceText, { color: colors.blackColor, fontFamily: appFonts.semiBold }]}>Total Price: {order.currency === "GBP" && "£"}{totalPrice} </Text>

            </View>
          </View>
          <TouchableOpacity onPress={() => addToCartProduct(item.variant_id, 1)} style={[styles.buyAgainButton, { backgroundColor: colors.redColor }]}>
            <Text style={{ color: colors.whiteColor, fontFamily: appFonts.semiBold }}>Buy Again</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  return (
    <ImageBackground style={[flex]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
      <Header backIcon={true} text={"OrderDetails"} navigation={navigation} />
      <View style={{ width: "100%", height: 5, backgroundColor: colors.whiteColor }}></View>
      <View style={[styles.container, flex]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.sectionContainer, { backgroundColor: colors.whiteColor }]}>
            <Text style={[styles.label, { color: colors.blackColor }]}>Order ID</Text>
            <Text style={[styles.value, { color: colors.blackColor }]}>#{order.id}</Text>
          </View>
          <View style={[styles.sectionContainer, { backgroundColor: colors.whiteColor }]}>
            <Text style={[styles.label, { color: colors.blackColor }]}>Order Created</Text>
            <Text style={[styles.value, { color: colors.blackColor }]}>{new Date(order.created_at).toLocaleDateString()}</Text>
          </View>
          {order.shipping_address && <View style={[styles.sectionContainer, { backgroundColor: colors.whiteColor }]}>
            <Text style={[styles.label, { color: colors.blackColor }]}>Delivery Address</Text>
            <Text style={[styles.value, { color: colors.blackColor }]}>
              {order.shipping_address.name}, {order.shipping_address.address1},
              {order.shipping_address.address2 && ` ${order.shipping_address.address2},`}
              {order.shipping_address.city}, {order.shipping_address.province} -
              {order.shipping_address.zip}, {order.shipping_address.country}
            </Text>
          </View>}
          <FlatList
            data={order.line_items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
           {loading && <LoadingModal visible={loading} />}
        </ScrollView>
        <ChatButton onPress={handleChatButtonPress} />
      </View>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacings.large,
  },
  sectionContainer: {
    padding: spacings.medium,
    borderRadius: 10,
    marginVertical: spacings.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: style.fontSizeExtraSmall.fontSize,
    fontWeight: 'bold',
    fontFamily: appFonts.semiBold
  },
  value: {
    fontSize: style.fontSizeSmall.fontSize,
    marginTop: 5,
    fontFamily: appFonts.semiBold
  },
  itemContainer: {
    marginVertical: 5,
    borderRadius: 8,
  },
  productImage: {
    width: wp(20),
    height: hp(10),
    borderRadius: 8,
    marginRight: spacings.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: wp(90),
    height: hp(50),
    borderRadius: 8,
    marginVertical: spacings.Large1x,
  },
  detailsContainer: {
    flex: 1,
    padding: spacings.large,
    borderRadius: 10
  },
  productTitle: {
    fontSize: style.fontSizeSmall.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    fontFamily:appFonts.semiBold
  },
  variantText: {
    fontSize: style.fontSizeSmall.fontSize,
    marginTop: 2,
    fontFamily: appFonts.semiBold
  },
  quantityText: {
    fontSize: style.fontSizeSmall.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    marginTop: 5,
    fontFamily: appFonts.semiBold
  },
  priceText: {
    fontSize: style.fontSizeSmall.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    marginTop: 5,
  },
  statusContainer: {
    marginTop: spacings.Large2x,
    padding: spacings.xxxxLarge,
    borderRadius: 8,
  },
  statusText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    fontFamily: appFonts.semiBold
  },
  addressTitle: {
    fontWeight: 'bold',
    fontFamily: appFonts.semiBold
  },
  buyAgainButton: {
    marginTop: spacings.large,
    paddingVertical: spacings.large,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default OrderDetailsScreen;
