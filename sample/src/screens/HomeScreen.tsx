import React, { useCallback, useEffect, useRef, useState } from 'react';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Pressable, KeyboardAvoidingView, ActivityIndicator, TextInput, ImageBackground, Modal, Button, Dimensions, Alert, Platform, Animated } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor, redColor, lightGrayOpacityColor } from '../constants/Color'
import { spacings, style, appFonts } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import Carousal from '../components/Carousal'
import Header from '../components/Header'
import Product from '../components/ProductVertical';
import ChatButton from '../components/ChatButton';
import { WARLEY_SEARCH, BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE } from '../assests/images';
import {
  BEST_SELLING, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, OUR_PRODUCT_COLLECTION_ID,
  STOREFRONT_ACCESS_TOKEN, LOADER_NAME, BrandsCollections
} from '../constants/Constants'
import useShopify from '../hooks/useShopify';
import { useCart } from '../context/Cart';
import type { ShopifyProduct } from '../../@types';
import Toast from 'react-native-simple-toast';
import { logEvent } from '@amplitude/analytics-react-native';
import axios from 'axios';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { scheduleNotification } from '../notifications';
import AgeVerificationModal from '../components/Modal/AgeVerificationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginModal from '../components/Modal/LoginModal'
const { flex, alignJustifyCenter, flexDirectionRow, resizeModeCover, justifyContentSpaceBetween, borderRadius10, alignItemsCenter,
  textAlign, overflowHidden } = BaseStyle;
const { height: screenHeight } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { isDarkMode, toggleTheme } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const { addToCart, addingToCart, clearCart } = useCart();
  const [inventoryQuantities, setInventoryQuantities] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const [bestDealInventoryQuantities, setBestDealInventoryQuantities] = useState('');
  const [bestDealoptions, setBestDealOptions] = useState([]);
  const [bestDealProductVariantsIDS, setBestDealProductVariantsIDS] = useState([]);
  const [bestDealTags, setbestDealTags] = useState<string[][]>([]);
  const [products, setProducts] = useState([]);
  const [bestDealProducts, setBestDealProducts] = useState([]);
  const { queries } = useShopify();
  const [fetchCollections, { data: collectionData }] = queries.collections;
  const [fetchProducts, { data }] = queries.products;
  const [fetchCart, { data: cartdata }] = queries.cart;
  const [shopifyCollection, setShopifyCollection] = useState([])
  const [collectionsFetched, setCollectionsFetched] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [shopifycollectionData, setShopifyCollectionData] = useState([]);
  const [productTypecollectionData, setProductTypeCollection] = useState([]);
  const [showAgePopup, setShowAgePopup] = useState(false);
  const dispatch = useDispatch();
  const borderColors = ['#33c1ff', '#ff5733', '#ff33f6', '#75ff33', '#0e95e6', '#ff9933', '#ffcc33', '#3366ff', '#cc33ff'];
  const shopifycollectionborderColors = ['#e67e22', '#1abc9c', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#2ecc71', '#34495e', '#95a5a6'];
  const collections = shopifyCollection || [];
  const [collectionImages, setCollectionImages] = useState({});
  const catagory = [...collections.slice(0, 5)];
  const recentlyViewedProduct = useSelector((state) => state.recentlyViewed);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const productsBest = [
    {
      id: 'gid://shopify/Product/9888472629594',
      image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/best%20deal%2F1.png?alt=media&token=114dac4f-8cfd-40f0-a77f-764a14d367cd",

    },
    {
      id: 'gid://shopify/Product/9889518387546',
      image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/best%20deal%2F2.png?alt=media&token=1b95ae67-a19d-4666-bf90-92f1589bf0ac",

    },
    {
      id: 'gid://shopify/Product/9888057033050',
      image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/best%20deal%2F3.png?alt=media&token=5051ccaf-a7a7-4c1f-8934-223c9a209dec",

    },
    {
      id: 'gid://shopify/Product/9888317079898',
      image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/best%20deal%2F4.png?alt=media&token=209ed163-a796-4ded-b38c-564e8d6aa578",

    },
    {
      id: 'gid://shopify/Product/9888054247770',
      image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/best%20deal%2F5.png?alt=media&token=3cbdd36f-b127-4270-9ba6-3add98d983ec",

    }
  ];


  const carouselData = [
    { id: 1, image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/carousal%2F1.png?alt=media&token=7ab1a97e-0f28-45f4-b7be-51777071c5f6", action: () => onPressCollection("gid://shopify/Collection/635461140826", "Plum Tomatoes") },
    { id: 2, image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/carousal%2F2.png?alt=media&token=b6ff8e15-3f21-4fc4-96ae-8f7e6853e5f7", action: () => onPressCollection("gid://shopify/Collection/635468284250", "Lemon Juices") },
    { id: 3, image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/carousal%2F5.png?alt=media&token=b8b7760e-4bf3-4b38-977e-7581816f21f9", action: () => onPressCollection("gid://shopify/Collection/635468611930", "Tea") },
    { id: 4, image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/carousal%2F3.png?alt=media&token=19e6600c-2701-4098-8ad9-7895829f15f8", action: () => onPressCollection("gid://shopify/Collection/635465990490", "Mango Pulp") },
    { id: 5, image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/carousal%2F4.png?alt=media&token=8f0269a7-cf1e-4002-b572-45b0c2c88f09", action: () => onPressCollection("gid://shopify/Collection/637613703514", "Lentils") },
    { id: 6, image: "https://firebasestorage.googleapis.com/v0/b/warleystore-5a182.appspot.com/o/carousal%2F6.png?alt=media&token=248a9317-5fe7-4605-b414-bcdbb2f00475", action: () => onPressCollection("gid://shopify/Collection/635468611930", "Tea") },
  ];

  useEffect(() => {
    logEvent('Home Screen Electronic Initialized');
  }, [])

  //best selling
  // collection(id: "gid://shopify/Collection/634626834778") {
  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
         collection(id: "gid://shopify/Collection/637661774170") {
        products(first: 250) {
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
            tags
            options(first:250){
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
      }
    }`,
        variables: {}
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow"
      };
      fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const fetchedProducts = JSON.parse(result);
          const sortedProducts = fetchedProducts?.data?.collection?.products?.nodes.sort((a, b) =>
            a.title.localeCompare(b.title)
          );

          setBestDealProducts(sortedProducts);
          const inventoryQuantities = sortedProducts?.map((productEdge) => {
            return productEdge?.variants?.nodes?.map((variants) => variants?.inventoryQuantity);
          });
          setBestDealInventoryQuantities(inventoryQuantities)
          const fetchedOptions = sortedProducts.map((product) => product.options);
          setBestDealOptions(fetchedOptions);

          const productVariantData = sortedProducts.map((product) =>
            product.variants.nodes.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              continueSelling: variant?.inventoryPolicy === "CONTINUE",
              image: variant?.image
            }))
          );
          setBestDealProductVariantsIDS(productVariantData);

          const fetchedTags = sortedProducts.map(productEdge => productEdge?.tags);
          setbestDealTags(fetchedTags)
        })
        .catch((error) => console.log(error));
    }
    fetchproduct();
  }, [])

  //our product
  useEffect(() => {
    const fetchproduct = () => {
      setSkeletonLoading(true)
      setSkeletonLoading(false)
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
        collection(id: "gid://shopify/Collection/637662101850") {
          products(first: 6) {
            nodes {
              id
              images(first: 6) {
                nodes {
                  src
                  url
                }
              }
              title
              tags
              description
              options(first:6){
                id
                name
                values
              }
              variants(first: 6) {
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
        }
      }`,
        variables: {}
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow"
      };
      fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const fetchedProducts = JSON.parse(result);
          const sortedProducts = fetchedProducts?.data?.collection?.products?.nodes.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
          setProducts(sortedProducts);
          setSkeletonLoading(false)
          const inventoryQuantities = sortedProducts?.map((productEdge) => {
            return productEdge?.variants?.nodes?.map((variants) => variants?.inventoryQuantity);
          });
          setInventoryQuantities(inventoryQuantities)
          const fetchedOptions = sortedProducts?.map((product) => product?.options);
          setOptions(fetchedOptions);

          const productVariantData = sortedProducts.map((product) =>
            product.variants.nodes.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              continueSelling: variant?.inventoryPolicy === "CONTINUE",
              image: variant?.image
            }))
          );
          setProductVariantsIDS(productVariantData);

          const fetchedTags = sortedProducts.map(productEdge => productEdge?.tags);
          setTags(fetchedTags)
        })
        .catch((error) => { console.log(error), setSkeletonLoading(false) });
    }
    fetchproduct();
  }, [])

  //handel deep Links
  useEffect(() => {
    const handleInitialLink = async () => {
      const initialLink = await dynamicLinks().getInitialLink();
      if (initialLink) {
        handleDynamicLinks(initialLink);
      }
    };
    handleInitialLink();
    const unsubscribe = dynamicLinks().onLink(handleDynamicLinks);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchCollections({
        variables: {
          first: 250,
        },
      });
      await fetchProducts({
        variables: {
          first: 10,
        },
      });
      setCollectionsFetched(true);
    };
    fetchInitialData();
  }, [fetchCollections, fetchProducts]);

  //handel handleDynamicDeepLinks
  const handleDynamicLinks = async (link) => {
    try {
      if (link && link.url) {
        let productId = link?.url?.split('=').pop();
        const productData = await fetchProductDetails(productId);
        navigation.navigate('ProductDetails', {
          product: productData?.product,
          variant: productData?.variants,
          inventoryQuantity: productData?.inventoryQuantities,
          tags: productData?.tags,
          option: productData?.options,
          ids: productData?.ids
        });
      } else {
      }
    } catch (error) {
      console.error('Error handling dynamic link:', error);
    }
  }

  //fatch product exit in deeplink
  const fetchProductDetails = async (productId) => {
    const parts = productId.split('/');
    const lastValue = parts[parts.length - 1];
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/products/${lastValue}.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      const product = response.data.product;
      const ids = product?.variants?.map((variant) => ({
        id: variant?.admin_graphql_api_id,
        title: variant?.title,
        inventoryQty: variant?.inventory_quantity,
        image: variant?.image
      }));
      return {
        product: product,
        variants: product?.variants.map((variant) => ({
          id: variant?.id,
          title: variant?.title,
          inventoryQuantity: variant?.inventory_quantity,
          options: variant?.option_values,
        })),
        inventoryQuantities: product?.variants.map((variant) => variant?.inventory_quantity),
        tags: product?.tags.split(','),
        options: product?.options.map((option) => ({
          name: option?.name,
          values: option?.values,
        })),
        ids: ids,
      };

    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  //move to catalog page
  const onPressShopAll = () => {
    logEvent('SeeAll Button Pressed from HomeScreenElectroncs');
    navigation.navigate('CatalogStack')
  }

  //move to collection page
  const onPressCollection = (id: any, heading: any) => {
    console.log("iddd::::::;", id, heading)
    logEvent(`See All our product Collection Button Pressed from HomeScreenElectronics CollectionID: ${id} CollectionName: ${heading}`);
    navigation.navigate('Collections', {
      id: id, headingText: heading
    })
  }

  //get product variant
  const getVariant = (product: ShopifyProduct) => {
    if (product?.variants?.edges?.length > 0) {
      return product?.variants?.edges[0]?.node;
    } else if (product?.variants?.nodes?.length > 0) {
      return product?.variants?.nodes[0];
    } else {
      return null;
    }
  };

  //Add to Cart Product
  const addToCartProduct = async (variantId: any, quantity: any) => {
    // console.log("iddd::::::;", variantId)
    logEvent(`Add To Cart Pressed variantId:${variantId} Qty:${quantity}`);
    await addToCart(variantId, quantity);
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    scheduleNotification();
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Electronics Home Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  const onPressSeacrchBar = () => {
    logEvent("Click on Search Bar");
    navigation.navigate('Search',
      { navigation: navigation })
  }

  const onPressBrandSeeALL = () => {
    logEvent('SeeAll Brand Button Pressed from HomeScreenElectroncs');
    navigation.navigate('BrandCollectionScreen')
  }

  const fetchAllCollectionsWithProductTypes = async () => {
    console.log("Fetching all collections...");
    let allCollections = [];
    let productTypes = new Set();
    let matchingCollections = [];
    let hasNextPage = true;
    let endCursor = null;

    try {
      while (hasNextPage) {
        const graphql = JSON.stringify({
          query: `
                query($cursor: String) {
                    collections(first: 250, after: $cursor) {
                        edges {
                            node {
                                id
                                title
                                handle
                                image {
                                        id
                                        src
                                        url
                                    }
                                products(first: 250) {
                                    nodes {
                                        id
                                        title
                                        productType
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
          variables: { cursor: endCursor },
        });

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          },
          body: graphql,
        };

        const response = await fetch(
          `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`,
          requestOptions
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const fetchedCollections = result?.data?.collections?.edges.map(edge => edge.node) || [];
        // Collect all product types from fetched products
        fetchedCollections.forEach(collection => {
          collection.products.nodes.forEach(product => {
            if (product.productType) {
              productTypes.add(product.productType); // Store unique product types
            }
          });
        });

        allCollections = [...allCollections, ...fetchedCollections];

        const pageInfo = result?.data?.collections?.pageInfo || {};
        hasNextPage = pageInfo.hasNextPage;
        endCursor = pageInfo.endCursor;
      }

      console.log("All Product Types:", Array.from(productTypes));

      // Filter collections that match product types
      allCollections.forEach(collection => {
        const collectionName = collection.title;
        if (productTypes.has(collectionName)) {
          matchingCollections.push({
            id: collection.id,
            name: collectionName,
            imageUrl: collection.image?.url || null,
          });
        }
      });

      console.log("Matching Collections:", matchingCollections);
      setProductTypeCollection(matchingCollections)
      // console.log("Total Collections Fetched:", allCollections.length);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const response = await axios.get(`https://warleycollection-xr8ec.ondigitalocean.app/api/collectionData?shop=${STOREFRONT_DOMAIN}`);
        // console.log("shopifycollectionData", response.data.fetchCollectionsData)
        const mainCategoryDetails = response.data.fetchCollectionsData
          .map((collection) => {
            const getMainCategoryDetails = (nestedCollection) => {
              return {
                name: nestedCollection["MainCategoryName1"] || nestedCollection["MainCategoryName 1"] || null,
                url: nestedCollection.url || null,
                items: nestedCollection.items || [],
              };
            };

            if (
              Array.isArray(collection.collectionsData) &&
              collection.collectionsData.length > 0 &&
              Array.isArray(collection.collectionsData[0].collectionsData) &&
              collection.collectionsData[0].collectionsData.length > 0
            ) {
              return getMainCategoryDetails(collection.collectionsData[0].collectionsData[0]);
            } else if (
              typeof collection.collectionsData === "object" &&
              Array.isArray(collection.collectionsData.collectionsData) &&
              collection.collectionsData.collectionsData.length > 0
            ) {
              return getMainCategoryDetails(collection.collectionsData.collectionsData[0]);
            } else if (
              Array.isArray(collection.collectionsData) &&
              collection.collectionsData.length > 0
            ) {
              return getMainCategoryDetails(collection.collectionsData[0]);
            } else if (
              Array.isArray(collection.collectionsData) &&
              collection.collectionsData.length > 0 &&
              typeof collection.collectionsData[0] === "object" &&
              Array.isArray(collection.collectionsData[0].collectionsData)
            ) {
              const nestedCollection = collection.collectionsData[0].collectionsData[0];
              return nestedCollection ? getMainCategoryDetails(nestedCollection) : null;
            }
            return null;
          })
          .filter((details) => details !== null);

        setShopifyCollectionData(mainCategoryDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllCollectionsWithProductTypes();
    fetchCollectionData();
  }, []);

  const handleCategoryPress = (item, index) => {
    setSelectedCategory(item);
    const categoryNameKey = `CategoryName ${index + 1}`;
    // console.log("cattt", item)
    navigation.navigate('CategoriesDetailsScreen', {
      category: item.items,
      url: item.url,
      selectedCategory: selectedCategory,
      titles: item.items[0],
      tabss: item.items[0].subcategories,
    });
  };

  useEffect(() => {
    const fetchCollectionImage = async (handle) => {
      // console.log("handle",handle)
      const query = `
        query($handle: String!) {
          collectionByHandle(handle: $handle) {
            image {
              url
            }
          }
        }
      `;
      const variables = { handle };

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        data: JSON.stringify({ query, variables }),
        url: `https://${STOREFRONT_DOMAIN}/api/2024-04/graphql.json`,
      };

      try {
        const response = await axios(requestOptions);
        const collection = response.data.data.collectionByHandle;

        // console.log(`Fetched image for handle "${handle}":`, collection?.image?.url);
        return collection?.image?.url;
      } catch (error) {
        console.error('Error fetching collection image:', error);
        return null;
      }
    };

    const fetchAllCollectionImages = async () => {
      const imagePromises = shopifycollectionData.map(async (item) => {
        if (item.url && !collectionImages[item.url]) {
          // console.log("item.url",item.url)
          const imageUrl = await fetchCollectionImage(item.url);
          // console.log("imageUrl",imageUrl)
          return { [item.url]: imageUrl };
        }
        return null;
      });

      const results = await Promise.all(imagePromises);
      const newImages = results.reduce((acc, img) => (img ? { ...acc, ...img } : acc), {});

      setCollectionImages((prev) => {
        const updatedImages = { ...prev, ...newImages };
        // console.log('Updated collection images:', updatedImages); 
        return updatedImages;
      });
    };

    if (shopifycollectionData.length > 0) {
      fetchAllCollectionImages();
    }
  }, [shopifycollectionData]);

  useEffect(() => {
    const checkAgeVerification = async () => {
      try {
        const hasVerifiedAge = await AsyncStorage.getItem('hasVerifiedAge');
        if (!hasVerifiedAge) {
          // toggleTheme()
          setShowAgePopup(true);// Show popup if age verification hasn't been done
        }
      } catch (error) {
        console.error('Failed to check age verification:', error);
      }
    };
    checkAgeVerification();
  }, []);

  const handleAgeVerified = async () => {
    try {
      await AsyncStorage.setItem('hasVerifiedAge', 'true');
      setShowAgePopup(false);
    } catch (error) {
      console.error('Failed to save age verification status:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    const imageUrl = collectionImages[item.url];
    // const imageUrl = null;
    const borderColor = shopifycollectionborderColors[index % shopifycollectionborderColors.length];
    // console.log("Rendering item:", item.name, "Image URL:", imageUrl);
    return (
      <View style={[{ width: wp(24), height: Platform.OS === "android" ? hp(15) : hp(13) }, alignItemsCenter]}>

        <Pressable
          style={[
            styles.categoryCard,
            overflowHidden,
            alignJustifyCenter,
            { borderWidth: 0 },
          ]}
          onPress={() => handleCategoryPress(item, index)}
        >
          {/* <Image
            source={{ uri: imageUrl }}
            style={[styles.categoryImage, { resizeMode: "contain", borderWidth: isDarkMode ? 1 : 1, 
              // borderColor: isDarkMode ? borderColor : borderColor, 
              borderColor:redColor,
              borderRadius: 50, width: "100%", height: "100%", backgroundColor: colors.whiteColor }]}
          /> */}
          <View style={[styles.categoryImage, {
            borderWidth: isDarkMode ? 1 : 1,
            // borderColor: isDarkMode ? borderColor : borderColor, 
            borderColor: blackColor,
            borderRadius: 50,
            width: "100%",
            height: "100%",
            backgroundColor: colors.whiteColor
          }, alignJustifyCenter]}>
            <Image source={{ uri: imageUrl }} style={[{ resizeMode: "contain", width: "95%", height: "95%", alignItems: "center", justifyContent: "center", borderRadius: 50 }]} />
          </View>
        </Pressable>
        <Text style={[styles.collectionText, textAlign, { color: colors.blackColor }]}>
          {item.name}
        </Text>
      </View>
    );
  };

  const handleBannerPress = (index, item) => {
    // console.log(`Banner ${index + 1} clicked:`);
    if (item.action) item.action();
  };

  const fetchBestProductDetails = async (productId) => {
    const query = `
        query getProductDetails($id: ID!) {
            product(id: $id) {
                id
                title
                description
                vendor
                tags
                variants(first: 5) {
                    edges {
                        node {
                            id
                            title
                            price {
                                amount
                                currencyCode
                            }
                            quantityAvailable 
                            selectedOptions {
                             name
                             value
                             }
                        }
                    }
                }
                images(first: 5) {
                  nodes {
                      src
                  }
              }
            }
        }
    `;

    const variables = { id: productId };

    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/api/2023-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        console.error(`HTTP error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return null;
      }
      // console.log("productdata",data.data.product)
      return data.data.product;
    } catch (error) {
      console.error('Network error:', error);
      return null;
    }
  };

  const handlePressBestDeal = async (item, index) => {
    console.log("Handling press for item:", item);
    try {
      const productDetails = await fetchBestProductDetails(item.id);

      // if (!productDetails) {
      //     console.log('Error fetching product details or product not found.');
      //     return;
      // }
      console.log("productDetails", productDetails)
      const variant = getVariant(productDetails);
      const tags = productDetails.tags;
      const inventoryQuantities = productDetails?.variants?.edges?.map(
        (variant) => variant.node.quantityAvailable
      );

      const options = productDetails?.variants?.edges?.map(
        (variant) => variant.node.selectedOptions[0]
      );
      const ids = productDetails?.variants?.edges?.map(variant => variant.node.id);


      // console.log("productDetailstags",options)
      navigation.navigate('ProductDetails', {
        product: productDetails,
        variant: variant,
        inventoryQuantity: inventoryQuantities,
        tags: tags,
        // option: options,
        ids: ids,
      });
    } catch (error) {
      console.error('Error handling product press:', error);
    }
  };


  const openModal = () => {
    setLoginModalVisible(true);
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
      setLoginModalVisible(false);
    });
  };

  return (
    // <ImageBackground style={[flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
    <View style={[flex, { backgroundColor: colors.whiteColor }]} >
      <View>
        <Header
          navigation={navigation}
          image={true}
          menuImage={true}
          notification={true}
          onPressShopByCatagory={onPressShopAll}
          onPressProfile={openModal}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginTop: 0 }}
      // stickyHeaderIndices={[1]}
      >
        {/* {/ Header /} */}


        {/* {/ Search Bar (Sticky) /} */}
        <View>
          <TouchableOpacity
            style={[
              styles.input,
              flexDirectionRow,
              alignItemsCenter,
              {
                backgroundColor: isDarkMode ? colors.grayColor : whiteColor,
                shadowColor: colors.grayColor,
              },
            ]}
            onPress={onPressSeacrchBar}
          >

            <View style={[flex]}>
              <Text style={{ color: isDarkMode ? whiteColor : "#808080", fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize, }}> Search here for anything you want...</Text>
            </View>
            <Image
              source={WARLEY_SEARCH}
              style={{ width: wp(4), height: hp(5), resizeMode: 'contain', marginRight: 5 }}
            />
          </TouchableOpacity>
        </View>

        {skeletonLoading ? (
          <SkeletonPlaceholder>
            {/* Skeleton for Brand Section */}
            <View style={{ width: "100%", marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: 100, height: 20 }} />
              <View style={{ width: 50, height: 20 }} />
            </View>

            {/* Skeleton for Category Cards */}
            <View style={{ width: wp(100), height: 150, flexDirection: 'row', marginTop: 5 }}>
              {Array(4).fill().map((_, index) => (
                <View key={index} style={{ width: wp(24), height: hp(14), margin: 10 }} />
              ))}
            </View>

            {/* Skeleton for Carousel */}
            <View style={{ width: wp(91.8), height: hp(20), borderRadius: 10, marginVertical: 10 }} />

            {/* Skeleton for Best Deal */}
            <View style={{ height: hp(30), flexDirection: 'row', justifyContent: 'space-between' }}>
              {Array(4).fill().map((_, index) => (
                <View key={index} style={{ width: 100, height: 100, margin: 10 }} />
              ))}
            </View>

            {/* Skeleton for Products */}
            <View style={{ height: hp(30), flexDirection: 'row', justifyContent: 'space-between' }}>
              {Array(4).fill().map((_, index) => (
                <View key={index} style={{ width: 100, height: 100, margin: 10 }} />
              ))}
            </View>
          </SkeletonPlaceholder>
        ) : (
          <View style={[styles.container, flex]}>
            {/* carousal */}
            <Carousal
              data={carouselData.slice(0, 3)}
              dostsShow={true}
              renderItem={item => (
                <Image source={{ uri: item?.image }} style={[{ width: wp(90), height: hp(20), resizeMode: "contain" }, borderRadius10]} />
              )}
              onBannerPress={handleBannerPress}
            />

            {/* catagories */}
            <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
              <Text style={[styles.text, { color: colors.blackColor }]}>{"Categories"}</Text>
              <Pressable onPress={onPressShopAll}>
                <Text style={{ color: redColor, fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight, fontFamily: appFonts.semiBold }} >See All <AntDesign name={"arrowright"} size={16} color={redColor} /></Text>
              </Pressable>
            </View>
            <View style={[{ width: wp(100), height: "auto", marginTop: 10 }, flexDirectionRow]}>
              {shopifycollectionData.length != 0 ?
                <FlatList
                  data={shopifycollectionData.slice(0, 12)}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderItem}
                  // horizontal
                  numColumns={4}
                  showsHorizontalScrollIndicator={false}
                />

                : <SkeletonPlaceholder>
                  <View style={{ width: wp(95), height: hp(33), padding: spacings.large }}>
                    {Array(3).fill().map((_, rowIndex) => (
                      <View key={rowIndex} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        {Array(4).fill().map((_, colIndex) => (
                          <View key={colIndex} style={{ width: wp(18), height: hp(8.5), borderRadius: 50, marginTop: 10 }} />
                        ))}
                      </View>
                    ))}
                  </View>
                </SkeletonPlaceholder>}
            </View>

            {/* PopularBrandsCollection */}
            <View style={[{ width: "100%", marginTop: 20, marginBottom: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
              <Text style={[styles.text, { color: colors.blackColor }]}>Popular <Text style={{ color: "#ff1111" }}>Brands</Text></Text>
              <Pressable onPress={onPressBrandSeeALL}>
                <Text style={{ color: redColor, fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight, fontFamily: appFonts.semiBold }} >See All <AntDesign name={"arrowright"} size={16} color={redColor} /></Text>
              </Pressable>
            </View>
            <View style={[{ width: "100%", height: "auto", marginTop: 5 }, flexDirectionRow]}>
              {BrandsCollections.length === 0 ? (
                <SkeletonPlaceholder>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {[...Array(4)].map((_, index) => (
                      <View key={index} style={{ width: wp(20.8), height: hp(10), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {[...Array(4)].map((_, index) => (
                      <View key={index} style={{ width: wp(20.8), height: hp(10), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                    ))}
                  </View>
                </SkeletonPlaceholder>
              ) : (
                <FlatList
                  data={BrandsCollections.filter(item => item?.name !== "NULL").slice(0, 12)}
                  renderItem={({ item, index }) => {
                    // console.log("item:::",item)
                    const borderColor = borderColors[index % borderColors.length];
                    return (
                      <View style={[{ width: wp(22), height: hp(10), margin: 5 },]}>
                        <Pressable
                          style={[styles.categoryCard, overflowHidden, alignJustifyCenter, {
                            backgroundColor: colors.whiteColor,
                            // borderColor: isDarkMode ? borderColor : borderColor, 
                            borderColor: blackColor,
                            borderWidth: isDarkMode ? 1 : 1
                          }]}
                          onPress={() => onPressCollection(item?.id, item?.name)
                          }
                        >
                          <Image
                            source={
                              { uri: item?.imageUrl }
                            }
                            style={
                              [styles.categoryImage, { resizeMode: "contain" }]
                            }
                          />
                        </Pressable>
                      </View>
                    );
                  }}
                  showsHorizontalScrollIndicator={false}
                  // horizontal
                  numColumns={4}
                  keyExtractor={(item) => item?.id}
                />)}
            </View>

            {/* best deal */}
            <Text style={[styles.text, { color: colors.blackColor, marginVertical: 10 }]}>{"Best Deal"}</Text>
            <View style={[{ height: hp(26) }, alignJustifyCenter]}>
              {bestDealProducts?.length > 0 ? <FlatList
                data={bestDealProducts}
                renderItem={({ item, index }) => {
                  return (
                    <Product
                      product={item}
                      onAddToCart={addToCartProduct}
                      loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                      inventoryQuantity={bestDealInventoryQuantities[index]}
                      option={bestDealoptions[index]}
                      ids={bestDealProductVariantsIDS[index]}
                      width={wp(28)}
                      onPress={() => {
                        navigation.navigate('ProductDetails', {
                          product: item,
                          variant: getVariant(item),
                          inventoryQuantity: bestDealInventoryQuantities[index],
                          tags: bestDealTags[index],
                          option: bestDealoptions[index],
                          ids: bestDealProductVariantsIDS[index]
                        });
                      }}
                    />
                  );
                }}
                showsHorizontalScrollIndicator={false}
                horizontal
              /> :
                // <LoaderKit
                //   style={{ width: 50, height: 50 }}
                //   name={LOADER_NAME}
                //   color={colors.blackColor}
                // />
                <SkeletonPlaceholder>
                  <View style={{ flexDirection: 'row', }}>
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                  </View>
                </SkeletonPlaceholder>
              }
            </View>


            {/* BEST_SELLING */}
            <View style={[{ width: "100%", marginBottom: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
              <Text style={[styles.text, { color: colors.blackColor }]}>{BEST_SELLING}</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
              showsHorizontalScrollIndicator={false}>
              {productsBest?.map((item, index) => (
                <View key={item}>
                  <Pressable style={{ marginRight: 10, overflow: "hidden", borderRadius: 10 }}
                    onPress={() => handlePressBestDeal(item, index)}
                  >
                    <Image source={{ uri: item.image }} style={{ width: 200, height: 200 }} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            {/* our product */}
            <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
              <Text style={[styles.text, { color: colors.blackColor }]}>{"Top Sellers"}</Text>
              <Text style={{ color: redColor, fontSize: style.fontSizeNormal.fontSize, fontWeight: style.fontWeightThin1x.fontWeight,fontFamily: appFonts.semiBold }} onPress={() => onPressCollection(OUR_PRODUCT_COLLECTION_ID, "Top Sellers")}>See All <AntDesign name={"arrowright"} size={16} color={redColor} /></Text>
            </View>
            <View style={[{ height: "auto", width: "100%", paddingHorizontal: spacings.large }, alignJustifyCenter]}>
              {products?.length > 0 ? <FlatList
                data={products}
                renderItem={({ item, index }) => {
                  return (
                    <Product
                      product={item}
                      onAddToCart={addToCartProduct}
                      loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                      inventoryQuantity={inventoryQuantities[index]}
                      option={options[index]}
                      ids={productVariantsIDS[index]}
                      spaceTop={spacings.small}
                      width={wp(27.5)}
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
                  );
                }}
                showsHorizontalScrollIndicator={false}
                // horizontal
                numColumns={3}
                style={{ width: "100%" }}
              /> :
                <SkeletonPlaceholder>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                    <View style={{ width: wp(30), height: hp(24), borderRadius: 10, marginRight: 5 }} />
                  </View>
                </SkeletonPlaceholder>
              }
            </View>

            {/* carousal */}
            <Carousal
              data={carouselData.slice(3, 6)}
              dostsShow={true}
              renderItem={item => (
                <Image source={{ uri: item?.image }} style={[{ width: wp(90), height: hp(20) }, borderRadius10, resizeModeCover]} />
              )}
              onBannerPress={handleBannerPress}
            />


            {recentlyViewedProduct?.length > 0 && (
              <>
                <View style={[{ width: "100%", marginVertical: 10 }, alignItemsCenter, justifyContentSpaceBetween, flexDirectionRow]}>
                  <Text style={[styles.text, { color: colors.blackColor }]}>{"Recently Viewed"}</Text>
                </View>
                <View style={[{ height: "auto", width: "100%", paddingHorizontal: spacings.large }]}>
                  <FlatList
                    data={recentlyViewedProduct}
                    renderItem={({ item, index }) => {
                      // Log the item for debugging
                      const variantData = (item?.variants?.edges || item?.variants?.nodes || []).map(variant => {
                        const node = variant?.node || variant; // Handle both edges and nodes
                        return {
                          id: node?.id,                         // Extract the variant ID
                          title: node?.title,                   // Extract the variant title
                          inventoryQuantity: node?.inventoryQuantity,
                          continueSelling: node?.inventoryPolicy === "CONTINUE",
                          image: node?.image?.src
                        };
                      });
                      return (
                        <Product
                          product={item}
                          onAddToCart={addToCartProduct}
                          loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                          inventoryQuantity={item.inventoryQuantity}
                          option={item.option}
                          ids={variantData}
                          spaceTop={spacings.small}
                          width={wp(28)}
                          onPress={() => {
                            console.log('Product item pressed:', item);
                            navigation.navigate('ProductDetails', {
                              product: item,
                              variant: getVariant(item),
                              inventoryQuantity: item.inventoryQuantity,
                              tags: item.tags,
                              option: item.options,
                              ids: variantData,
                            });
                          }}
                        />
                      );
                    }}
                    showsHorizontalScrollIndicator={false}
                    numColumns={3}
                    keyExtractor={(item, index) => `${item?.id}-${index}`}
                    style={{ width: '100%' }}
                  />

                </View>
              </>
            )}

          </View>

        )}

        {/* </View> */}
      </ScrollView>
      {loginModalVisible && (
        <LoginModal modalVisible={loginModalVisible} closeModal={closeModal} slideAnim={slideAnim} />
      )}
      {showAgePopup && <AgeVerificationModal onVerify={handleAgeVerified} />}
      <ChatButton onPress={handleChatButtonPress} />
      {/* </ImageBackground> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  collectionText: { fontSize: 9, paddingVertical: 5, fontFamily: appFonts.semiBold },
  modalContainer: {
    height: screenHeight * 0.4,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  flatListContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  subCategoryButton: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  subCategoryText: {
    textAlign: 'center',
    fontSize: 16,
  },
  text: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    fontFamily: appFonts.black
  },
  input: {
    width: "95%",
    height: hp(4),
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    margin: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    width: wp(20),
    height: wp(20),
    borderRadius: 100,
    borderWidth: 0.5,
    paddingVertical: spacings.small,
  },
  categoryCard: {
    width: wp(18),
    height: wp(20),
    borderRadius: 10,
    borderWidth: 0.5,
    paddingVertical: spacings.small,
  },
  categoryImage: {
    width: "100%",
    height: "110%",
    borderRadius: 10,
  },
  categoryName: {
    fontSize: style.fontSizeNormal.fontSize,
    color: whiteColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },

  image: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  menuItem: {
    paddingHorizontal: spacings.normal,
    paddingVertical: spacings.xxsmall,
    marginRight: spacings.large,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  selectedMenuItem: {
    borderBottomColor: redColor,
    borderBottomWidth: 2,
    paddingVertical: spacings.xxsmall,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: blackColor,
  },
});

export default HomeScreen;

