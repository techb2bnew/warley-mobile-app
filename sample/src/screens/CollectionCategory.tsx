import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, TextInput, ScrollView, ActivityIndicator, Pressable, ImageBackground } from 'react-native'
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { blackColor, lightGrayOpacityColor, whiteColor, grayColor, redColor } from '../constants/Color'
import { BaseStyle } from '../constants/Style';
import { spacings, style } from '../constants/Fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { ADD_TO_CART, OUT_OF_STOCK, getAdminAccessToken, getStoreDomain, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, LOADER_NAME } from '../constants/Constants'
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import Product from '../components/Product';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import Toast from 'react-native-simple-toast';
import Header from '../components/Header'
import FilterModal from '../components/Modal/FilterModal'
import { FILTER_ICON, WHITE_FILTER_ICON } from '../assests/images';
import { logEvent } from '@amplitude/analytics-react-native';
import { BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE } from '../assests/images';
import { useSelector } from 'react-redux';
import LoaderKit from 'react-native-loader-kit'
import LoadingModal from '../components/Modal/LoadingModal';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
import { scheduleNotification } from '../notifications';
const { alignItemsCenter, resizeModeContain, textAlign, alignJustifyCenter, flex, borderRadius10, overflowHidden, borderWidth1, flexDirectionRow, justifyContentSpaceBetween } = BaseStyle;

const CollectionCategory = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const { addToCart, addingToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [inventoryQuantities, setInventoryQuantities] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const route = useRoute();
  const collectionId = route.params?.id;
  const productType = route.params?.productType;
  const headingText = route.params?.headingText
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchproduct = async () => {
      setLoading(true);
      let allProducts = []; // Store all fetched products
      let hasNextPage = true; // Track if more pages are available
      let endCursor = null; // Cursor for pagination

      try {
        while (hasNextPage) {
          const graphql = JSON.stringify({
            query: `
            query($cursor: String) {
              collection(id: "${collectionId}") {
                products(first: 250, after: $cursor) {
                  nodes {
                    id
                    images(first: 250) {
                      nodes {
                        src
                        url
                      }
                    }
                    title
                    description
                    vendor
                    tags
                    options(first: 250) {
                      id
                      name
                      values
                    }
                    variants(first: 250) {
                      nodes {
                        price
                        inventoryQuantity
                        inventoryPolicy
                        id
                        title
                        image {
                          originalSrc
                        }
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }`,
            variables: { cursor: endCursor }
          });

          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN
            },
            body: graphql,
            redirect: "follow"
          };

          const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
          const result = await response.json();

          const fetchedProducts = result?.data?.collection?.products?.nodes || [];
          const pageInfo = result?.data?.collection?.products?.pageInfo || {};

          // Accumulate fetched products
          allProducts = [...allProducts, ...fetchedProducts];

          // Update pagination information
          hasNextPage = pageInfo.hasNextPage;
          endCursor = pageInfo.endCursor;
        }
        const sortedProducts = allProducts.sort((a, b) => a.title.localeCompare(b.title));

        // Set the accumulated products and other data in state
        setProducts(sortedProducts);

        const inventoryQuantities = sortedProducts.map((product) =>
          product.variants.nodes.map((variant) => variant.inventoryQuantity)
        );
        setInventoryQuantities(inventoryQuantities);

        const fetchedTags = sortedProducts.map((product) => product.tags);
        setTags(fetchedTags);

        const fetchedOptions = sortedProducts.map((product) => product.options);
        setOptions(fetchedOptions);

        const productVariantData = sortedProducts.map((product) =>
          product.variants.nodes.map((variant) => ({
            id: variant.id,
            title: variant.title,
            inventoryQty: variant.inventoryQuantity,
            continueSelling: variant?.inventoryPolicy === "CONTINUE",
            image: variant.image
          }))
        );
        setProductVariantsIDS(productVariantData);

        console.log("Total Products Fetched:", sortedProducts.length);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchproduct();
  }, [collectionId])

  useEffect(() => {
    const fetchProductsByType = async () => {
      setLoading(true);
      let allProducts = []; // Store all fetched products
      let hasNextPage = true; // Track if more pages are available
      let endCursor = null; // Cursor for pagination

      try {
        while (hasNextPage) {
          const graphql = JSON.stringify({
            query: `
            query($cursor: String) {
              products(first: 250, after: $cursor, query: "product_type:${productType}") {
                edges {
                  node {
                    id
                    images(first: 250) {
                      nodes {
                        src
                        url
                      }
                    }
                    title
                    description
                    vendor
                    tags
                    options(first: 250) {
                      id
                      name
                      values
                    }
                    variants(first: 250) {
                      nodes {
                        price
                        inventoryQuantity
                        inventoryPolicy
                        id
                        title
                        image {
                          originalSrc
                        }
                      }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }`,
            variables: { cursor: endCursor }
          });

          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN
            },
            body: graphql,
            redirect: "follow"
          };

          const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
          const result = await response.json();

          const fetchedProducts = result?.data?.products?.edges.map(edge => edge.node) || [];
          const pageInfo = result?.data?.products?.pageInfo || {};

          // Accumulate fetched products
          allProducts = [...allProducts, ...fetchedProducts];

          // Update pagination information
          hasNextPage = pageInfo.hasNextPage;
          endCursor = pageInfo.endCursor;
        }
        const sortedProducts = allProducts.sort((a, b) => a.title.localeCompare(b.title));

        // Set the accumulated products and other data in state
        setProducts(sortedProducts);

        const inventoryQuantities = sortedProducts.map((product) =>
          product.variants.nodes.map((variant) => variant.inventoryQuantity)
        );
        setInventoryQuantities(inventoryQuantities);

        const fetchedTags = sortedProducts.map((product) => product.tags);
        setTags(fetchedTags);

        const fetchedOptions = sortedProducts.map((product) => product.options);
        setOptions(fetchedOptions);

        const productVariantData = sortedProducts.map((product) =>
          product.variants.nodes.map((variant) => ({
            id: variant.id,
            title: variant.title,
            inventoryQty: variant.inventoryQuantity,
            continueSelling: variant?.inventoryPolicy === "CONTINUE",
            image: variant.image
          }))
        );
        setProductVariantsIDS(productVariantData);

        console.log("Total Products Fetched:", sortedProducts.length);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByType();
  }, [productType]);

  useEffect(() => {
    logEvent('Collections Category Screen Initialized');
  }, [])

  const vendors = Array.from(new Set(products?.map(product => product?.vendor)));

  const addToCartProduct = async (variantId: any, quantity: any) => {
    logEvent(`Add To Cart Pressed variantId:${variantId} Qty:${quantity}`);
    setLoadingProductId(variantId);
    await addToCart(variantId, quantity);
    // navigation.navigate('Cart')
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    setLoadingProductId(null);
    scheduleNotification();
  };

  function getVariant(node: ShopifyProduct) {
    return node?.variants?.nodes;
  }

  const applyFilters = (filteredData) => {
    setFilteredProducts(filteredData);
  };

  //on ApplyFilter By Vendor
  const applyFilterByVendor = (vendor) => {
    logEvent("Apply Filter By Vendor Name from Filter Modal");
    if (vendor === selectedVendor) {
      setFilteredProducts(products);
      setSelectedVendor('');
    } else {
      const filtered = products?.filter(product => product?.vendor === vendor);
      setFilteredProducts(filtered);
      setSelectedVendor(vendor);
    }
  };

  //show Filter Modal
  const showFilterModal = () => {
    logEvent("Open Filter Modal");
    setIsFilterModalVisible(true)
  }

  //On Click Search
  const onPressSeacrchBar = () => {
    logEvent("Click on Search Bar");
    navigation.navigate('Search',
      { navigation: navigation })
  }

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in collection Category Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    // <ImageBackground style={[styles.container, flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
    <View style={[styles.container, flex, { backgroundColor: colors.whiteColor }]} >
      <Header backIcon={true} text={headingText} navigation={navigation} onPress={() => { logEvent('Back Button Clicked'), navigation.goBack() }} />
      <View style={{ paddingHorizontal: spacings.large }}>
        {/* <View style={[flexDirectionRow]}>
          <TouchableOpacity style={[styles.textinputBox, flexDirectionRow, alignItemsCenter, { backgroundColor: isDarkMode ? grayColor : whiteColor }]}
            onPress={onPressSeacrchBar}
          >
            <Ionicons name="search" size={25} color={isDarkMode ? whiteColor : grayColor} />
            <View style={[flex]}>
              <Text style={{ color: isDarkMode ? whiteColor : blackColor, fontFamily: 'Montserrat-BoldItalic' }}> Search</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={showFilterModal} style={[alignJustifyCenter, { width: "15%", height: hp(6), marginTop: spacings.large }]}>
            <Image source={isDarkMode ? WHITE_FILTER_ICON : FILTER_ICON} style={[{ width: 25, height: 25 }, resizeModeContain]} />
          </TouchableOpacity>
        </View> */}
        {route?.params?.from ?
          <View style={[styles.productDetailBox]}>
            {products?.length > 0 ?
              <FlatList
                data={filteredProducts.length > 0 ? filteredProducts : products}
                renderItem={({ item, index }) => <ProductItem item={item} addToCartProduct={addToCartProduct} InventoryQuantities={inventoryQuantities[index]} ids={productVariantsIDS[index]}
                  onPress={() => {
                    navigation.navigate('ProductDetails', {
                      product: item,
                      variant: getVariant(item),
                      inventoryQuantity: inventoryQuantities[index],
                      tags: tags[index],
                      option: options[index],
                      ids: productVariantsIDS[index]
                    });
                  }} />}
                numColumns={2}
                keyExtractor={(item) => item?.id.toString()}
              />
              :
              <View style={[{ height: hp(70) }, alignJustifyCenter]}>
                <LoaderKit
                  style={{ width: 50, height: 50 }}
                  name={LOADER_NAME}
                  color={colors.blackColor}
                />
              </View>
            }
          </View>
          : <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 110 }}>
            <FlatList
              data={filteredProducts.length > 0 ? filteredProducts : products} // Use the data source
              keyExtractor={(item) => item?.id.toString()} // Key for each item
              renderItem={({ item, index }) => (
                <Product
                  key={item?.id}
                  product={item}
                  onAddToCart={addToCartProduct}
                  inventoryQuantity={inventoryQuantities[index]}
                  ids={productVariantsIDS[index]}
                  loading={loadingProductId === item?.variants?.nodes[0]?.id}
                  onPress={() => {
                    navigation.navigate('ProductDetails', {
                      product: item,
                      variant: getVariant(item),
                      inventoryQuantity: inventoryQuantities[index],
                      tags: tags[index],
                      option: options[index],
                      ids: productVariantsIDS[index]
                    });
                  }}
                />
              )}
              numColumns={3}
              extraData={{ inventoryQuantities, productVariantsIDS, tags, options }}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                !loading ? (
                  <View style={{ alignItems: "center", justifyContent: "center", height: hp(80), width: wp(95) }}>
                    <Text style={[styles.emptyText, { color: colors.blackColor }]}>No Product available.</Text>
                    <Text style={[styles.subText, { color: colors.blackColor, marginTop: 8 }]}>
                      Check back soon for updates.
                    </Text>
                  </View>
                ) : null
              }
            />
          </ScrollView>}
      </View>
      <ChatButton onPress={handleChatButtonPress} />
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        applyFilters={applyFilters}
        allProducts={products}
        vendor={vendors}
        onSelectVendor={applyFilterByVendor}
        product={products}
      />

      {loading && <LoadingModal visible={loading} text={"Please wait while we load the products."} />}

      {/* </ImageBackground> */}
    </View>
  );
}
const ProductItem = ({ item, addToCartProduct, InventoryQuantities, ids, onPress }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const outOfStock = ids && ids[0].inventoryQty;

  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    setLoading(true);
    await addToCartProduct(item?.variants?.nodes[0]?.id, quantity);
    setLoading(false);
  };

  return (
    <Pressable style={[styles.itemContainer, alignJustifyCenter, borderRadius10, overflowHidden]} onPress={onPress}>
      <Image source={{ uri: item?.images?.nodes[0]?.url }} style={[styles.categoryImage, resizeModeContain]} />
      <Text style={[styles.categoryName, textAlign, { fontWeight: style.fontWeightThin1x.fontWeight }]}>{item?.title}</Text>
      <View style={[styles.quantityContainer, borderWidth1, flexDirectionRow, alignJustifyCenter]}>
        <TouchableOpacity onPress={decrementQuantity}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity onPress={incrementQuantity}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
      {outOfStock ? (
        loading ? (
          <View style={{ marginTop: 5 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <Pressable
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={[styles.addToCartButtonText, textAlign]}>{ADD_TO_CART}</Text>
          </Pressable>
        )
      ) : (
        <View style={styles.addToCartButton}>
          <Text style={styles.addToCartButtonText}>{OUT_OF_STOCK}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default CollectionCategory;

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(95),
    backgroundColor: whiteColor
  },

  button: {
    paddingVertical: 5,
    borderRadius: 50,
  },
  selectedButton: {
    backgroundColor: redColor,
    paddingVertical: spacings.small,
    paddingHorizontal: spacings.large
  },
  buttonText: {
    fontSize: style.fontSizeNormal.fontSize,
    color: blackColor
  },
  productDetailBox: {
    width: wp(100),
    height: hp(82),
    paddingTop: spacings.large,
    paddingBottom: spacings.xxxxLarge
  },
  categoryImage: {
    width: wp(30),
    height: hp(20.5),
  },
  categoryName: {
    fontSize: 14,
    color: blackColor
  },
  itemContainer: {
    width: wp(46),
    margin: spacings.small,
    paddingVertical: spacings.large,
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,
    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1.7,
  },
  quantityContainer: {
    marginTop: spacings.large,
    backgroundColor: whiteColor,
    paddingHorizontal: 5,
    borderRadius: 10
  },
  quantityButton: {
    paddingHorizontal: spacings.large,
    borderRadius: 5,
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
  },
  quantity: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
    fontFamily: 'Montserrat-BoldItalic'
  },
  addToCartButton: {
    borderRadius: 10,
    fontSize: 8,
    marginTop: 15,
    backgroundColor: redColor,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addToCartButtonText: {
    fontSize: style.fontSizeNormal.fontSize,
    lineHeight: 20,
    color: whiteColor,
    // fontWeight: style.fontWeightThin1x.fontWeight,
    fontFamily: 'Montserrat-BoldItalic'
  },
  textinputBox: {
    width: "85%",
    height: hp(6),
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,
    backgroundColor: whiteColor,
    paddingHorizontal: spacings.large,
    marginTop: spacings.large,
    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 1.5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  subText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

