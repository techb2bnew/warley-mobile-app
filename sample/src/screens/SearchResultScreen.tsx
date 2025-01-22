import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Pressable, ImageBackground, Platform } from 'react-native';
import { blackColor, grayColor, whiteColor, redColor } from '../constants/Color'
import {
  ADD_TO_CART, OUT_OF_STOCK, BEST_DEALS_OF_THE_WEEK, POPULAR_LIQUOR, 
  STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, 
} from '../constants/Constants'
import { BaseStyle } from '../constants/Style';
import { spacings, style } from '../constants/Fonts';
import Toast from 'react-native-simple-toast';
import { useRoute } from '@react-navigation/native';
import useShopify from '../hooks/useShopify';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import { logEvent } from '@amplitude/analytics-react-native';
import Header from '../components/Header'
import { BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE } from '../assests/images';
import { useSelector } from 'react-redux';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
import { scheduleNotification } from '../notifications';
import Product from '../components/ProductVertical';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
const { alignJustifyCenter, flexDirectionRow, flex, borderRadius10, overflowHidden, textAlign, borderWidth1, resizeModeContain } = BaseStyle;

const SearchResultScreen: React.FC = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const route = useRoute();
  const title = route.params?.title;
  const collectionId = route.params?.id;
  const [bestDealInventoryQuantities, setBestDealInventoryQuantities] = useState('');
  const [bestDealoptions, setBestDealOptions] = useState([]);
  const [bestDealProductVariantsIDS, setBestDealProductVariantsIDS] = useState([]);
  const [bestDealTags, setbestDealTags] = useState<string[][]>([]);
  const [inventoryQuantity, setInventoryQuantity] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { queries } = useShopify();
  const { addToCart, addingToCart } = useCart();
  const [fetchProducts, { data }] = queries.products;

  useEffect(() => {
    fetchProducts({
      variables: {
        first: selectedItem === "Food" ? 10 : 12,
      },
    });
  }, [fetchProducts])

  useEffect(() => {
    logEvent('Search Result Screen Initialized');
  }, [])

  //Popular Liquor
  useEffect(() => {
    const fetchproduct = async () => {
      setLoading(true); // Optional: set loading state to true
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);

      let allProducts = []; // Array to hold all products
      let hasNextPage = true; // Track if there are more products to fetch
      let endCursor = null; // Cursor for pagination

      try {
        while (hasNextPage) {
          const graphql = JSON.stringify({
            query: `
            query getProducts($cursor: String) {
              products(first: 250, after: $cursor) {
                edges {
                  node {
                    id
                    title
                    tags
                    options(first: 250) {
                      id
                      name
                      values
                    }
                    variants(first: 250) {
                      nodes {
                        id
                        title
                        inventoryQuantity
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
            variables: { cursor: endCursor }, // Pass the cursor for pagination
          });

          const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphql,
            redirect: "follow",
          };

          const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
          const result = await response.json();

          const fetchedProducts = result?.data?.products?.edges || [];
          allProducts = [...allProducts, ...fetchedProducts]; // Accumulate fetched products

          const pageInfo = result?.data?.products?.pageInfo || {};
          hasNextPage = pageInfo.hasNextPage; // Update the hasNextPage flag
          endCursor = pageInfo.endCursor; // Update the cursor for the next fetch

          // Process and store the fetched data
          const inventoryQuantities = fetchedProducts.map((productEdge) =>
            productEdge.node.variants.nodes.map((variant) => variant.inventoryQuantity)
          );
          setInventoryQuantity((prev) => [...prev, ...inventoryQuantities]);

          const fetchedTags = fetchedProducts.map((productEdge) => productEdge.node.tags);
          setTags((prev) => [...prev, ...fetchedTags]);

          const fetchedOptions = fetchedProducts.map((product) => product.node.options);
          setOptions((prev) => [...prev, ...fetchedOptions]);

          const productVariantData = fetchedProducts.map((productEdge) =>
            productEdge.node.variants.nodes.map((variant) => ({
              id: variant.id,
              title: variant.title,
              inventoryQty: variant.inventoryQuantity,
              image: variant.image,
            }))
          );
          setProductVariantsIDS((prev) => [...prev, ...productVariantData]);

        }

        console.log("Total Products Fetched:", allProducts.length); // Optional: log total products fetched
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // Optional: set loading state to false
      }
    };

    fetchproduct()
  }, [])

  //with collection id
  useEffect(() => {
    const fetchproduct = async () => {
      setLoading(true);
      let allProducts = [];
      let hasNextPage = true;
      let endCursor = null;

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
                    tags
                    description
                    options(first: 250) {
                      id
                      name
                      values
                    }
                    variants(first: 250) {
                      nodes {
                        price
                        inventoryQuantity
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
            variables: { cursor: endCursor },
          });

          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN,
            },
            body: graphql,
            redirect: "follow",
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

        // Set the accumulated products and other data in state
        setProducts(allProducts);

        const inventoryQuantities = allProducts.map((product) =>
          product.variants.nodes.map((variant) => variant.inventoryQuantity)
        );
        setBestDealInventoryQuantities(inventoryQuantities);

        const fetchedTags = allProducts.map((product) => product.tags);
        setbestDealTags(fetchedTags);

        const fetchedOptions = allProducts.map((product) => product.options);
        setBestDealOptions(fetchedOptions);

        const productVariantData = allProducts.map((product) =>
          product.variants.nodes.map((variant) => ({
            id: variant.id,
            title: variant.title,
            inventoryQty: variant.inventoryQuantity,
            image: variant.image,
          }))
        );
        setBestDealProductVariantsIDS(productVariantData);

        console.log("Total Products Fetched:", allProducts.length);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchproduct();
  }, [])

  //add to cart Product
  const addToCartProduct = async (variantId: any, quantity: any) => {
    logEvent(`Add To Cart Product variantId:${variantId} Qty:${quantity}`);
    await addToCart(variantId, quantity);
    navigation.navigate('Cart')
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    scheduleNotification()
  };

  function getVariant(product: ShopifyProduct) {
    if (product.variants.edges?.length > 0) {
      return product?.variants?.edges[0].node;
    } else if (product?.variants?.nodes?.length > 0) {
      return product?.variants?.nodes[0];
    } else {
      return null;
    }
  }

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Search Result Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    // <ImageBackground style={[flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
    <View style={[flex, { backgroundColor: colors.whiteColor }]} >
      <Header backIcon={true} text={route?.params?.title} navigation={navigation} />
      <View style={[styles.container, flex]}>
        {loading && <SkeletonPlaceholder>
          <View style={{ width: wp(100), height: "auto", flexDirection: 'row', marginVertical: 5 }}>
            {Array(3).fill().map((_, index) => (
              <View key={index} style={{ width: wp(29.5), height: hp(25), marginHorizontal: 5, borderRadius: 10 }} />
            ))}
          </View>
          <View style={{ width: wp(100), height: 'auto', flexDirection: 'row', marginVertical: 5 }}>
            {Array(3).fill().map((_, index) => (
              <View key={index} style={{ width: wp(29.5), height: hp(25), marginHorizontal: 5, borderRadius: 10 }} />
            ))}
          </View>
          <View style={{ width: wp(100), height: 'auto', flexDirection: 'row', marginVertical: 5 }}>
            {Array(3).fill().map((_, index) => (
              <View key={index} style={{ width: wp(29.5), height: hp(25), marginHorizontal: 5, borderRadius: 10 }} />
            ))}
          </View>
        </SkeletonPlaceholder>}
        {(title === BEST_DEALS_OF_THE_WEEK || title === POPULAR_LIQUOR) &&
          <FlatList
            data={products}
            renderItem={({ item, index }) => <Product product={item} onAddToCart={addToCartProduct} inventoryQuantity={bestDealInventoryQuantities[index]} option={bestDealoptions[index]} ids={bestDealProductVariantsIDS[index]}
              spaceTop={spacings.small}
              width={wp(29.5)}
              onPress={() => {
                navigation.navigate('ProductDetails', {
                  product: item,
                  variant: getVariant(item),
                  inventoryQuantity: bestDealInventoryQuantities[index],
                  tags: bestDealTags[index],
                  option: bestDealoptions[index],
                  ids: bestDealProductVariantsIDS[index]
                });
              }} />}
            numColumns={3}
            keyExtractor={(item) => item?.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        }

        {/* {loading && <LoadingModal visible={loading} text={"Please wait while we load the products."} />} */}
        <ChatButton onPress={handleChatButtonPress} bottom={Platform.OS === "android" ? hp(5) : hp(10)} />
      </View>
      {/* </ImageBackground> */}
    </View>
  );
};

const ProductItem = ({ item, addToCartProduct, BestDealInventoryQuantities, BestDealsids, onPress }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const outOfStock = BestDealsids && BestDealsids[0].inventoryQty;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
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
    await addToCartProduct(((item?.node?.variants) ? (item?.node?.variants?.edges[0]?.node.id) : (item?.variants?.nodes[0]?.id)), quantity);
    setLoading(false);
  };
  const productTitle = (item?.node) ? (item?.node?.title) : (item?.title);
  const imageSrc = (item?.node?.images?.edges) ? (item?.node?.images?.edges[0].node.url) : (item?.images?.nodes[0]?.url);

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    return text;
  };

  return (
    <Pressable style={[styles.itemContainer, alignJustifyCenter, borderRadius10, overflowHidden, { backgroundColor: isDarkMode ? colors.grayColor : whiteColor }]} onPress={onPress}>
      <Image source={{ uri: imageSrc }} style={[styles.image, resizeModeContain]} />
      <Text style={[styles.categoryName, textAlign, { fontWeight: style.fontWeightThin1x.fontWeight, color: colors.blackColor }]}>{trimcateText(productTitle)}</Text>
      <View style={[styles.quantityContainer, borderWidth1, flexDirectionRow, alignJustifyCenter, { backgroundColor: colors.whiteColor }]}>
        <TouchableOpacity onPress={decrementQuantity}>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: colors.blackColor }]}>{quantity}</Text>
        <TouchableOpacity onPress={incrementQuantity}>
          <Text style={[styles.quantityButton, { color: colors.blackColor }]}>+</Text>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacings.large
  },
  itemContainer: {
    margin: spacings.small,
    width: "48%",
    padding: spacings.large,
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
    fontWeight: style.fontWeightThin1x.fontWeight,
    fontFamily: 'Montserrat-BoldItalic'
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: blackColor,
    fontFamily: 'Montserrat-BoldItalic'
  },
});

export default SearchResultScreen;
