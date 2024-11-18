import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, Text, Image, Pressable, ActivityIndicator, TouchableOpacity, FlatList, Alert, ImageBackground, Linking, Animated, Platform } from 'react-native';
import { Colors, useTheme } from '../context/Theme';
import { useCart } from '../context/Cart';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Toast from 'react-native-simple-toast';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import Share from 'react-native-share';
import axios from 'axios';
import LoaderKit from 'react-native-loader-kit';
import { blackColor, redColor, whiteColor, lightGrayOpacityColor, goldColor, lightPink, grayColor } from '../constants/Color';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';
import { YOU_MIGHT_LIKE, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, STOREFRONT_ACCESS_TOKEN, GOOGLE_APIKEY, STORE_LOCATION_ID, WRITE_REVIEW_URL, RATING_REVIEWS, reviews } from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import { ShopifyProduct } from '../../@types';
import { BACKGROUND_IMAGE, LADY_DONALD_RICE, DARK_BACKGROUND_IMAGE } from '../assests/images';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/actions/wishListActions';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Header from '../components/Header';
import Product from '../components/ProductVertical';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import LoadingModal from '../components/Modal/LoadingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
import { useNavigation } from '@react-navigation/native';
import { scheduleNotification } from '../notifications';
const { alignJustifyCenter, flexDirectionRow, resizeModeCover, justifyContentSpaceBetween, borderRadius10, borderRadius5, textAlign, positionAbsolute,
  alignItemsCenter, resizeModeContain, textDecorationUnderline } = BaseStyle;

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

function ProductDetailsScreen({ navigation, route }: Props) {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { colors } = useTheme();
  const { addToCart, addingToCart } = useCart();
  const styles = createStyles(colors);
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  const { tags, option, ids } = route?.params;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [shareProductloading, setShareProductLoading] = useState(false);
  const dispatch = useDispatch();
  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;

  if (!route?.params) {
    return null;
  }

  useEffect(() => {
    logEvent('Product Details Screen Initialized');
  }, [])

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Constructing the tags string from the array
        console.log(route?.params?.product?.title)
        const tagsString = tags.join(',');
        const excludedProductTitle = route?.params?.product?.title;
        const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/products.json?tags=${tagsString}`, {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.products) {
          // console.log(response.data.products)
          // Filtering products based on tags and ensuring they are active
          const filteredProducts = response.data.products.filter(product => {
            const isActive = product.status === 'active';
            const isExcluded = product.admin_graphql_api_id === excludedProductTitle || tags.includes(product.title);
            const isExcludedTitle = product.title === excludedProductTitle;
            const hasMatchingTag = tags.some(tag => product.tags.includes(tag));
            // console.log(isActive,isExcluded,hasMatchingTag)
            return isActive && !isExcluded && hasMatchingTag && !isExcludedTitle;
          });

          // Update state with filtered products
          // console.log("filterwed", filteredProducts)
          setRelatedProducts(filteredProducts);
        }
      } catch (error) {
        console.log('Error fetching related products:', error);
      }
    };

    // if (tags?.length > 0) {
    fetchRelatedProducts();
    // } else {
    // Clear related products when tags are empty
    // setRelatedProducts([]);
    // }
  }, [tags, route?.params?.product?.title]);

  const handleSelectOption = (optionName, value) => {
    logEvent(`Selected Product  variant Name:${optionName} Value:${value}`);
    setSelectedOptions(prevOptions => ({
      ...prevOptions,
      [optionName]: value,
    }));
  };

  const onAddtoCartProduct = async (id: any, quantity: number) => {
    logEvent(`Add To Cart  Product variantId:${id} Qty:${quantity}`);
    await addToCart(id, quantity);
    // navigation.navigate('CartModal');
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    scheduleNotification();
  };

  const getProductHandleById = async (id: string) => {
    const query = `
      query($id: ID!) {
        product(id: $id) {
          handle
        }
      }
    `;
    const variables = {
      id: id
    };
    const response = await fetch(`https://${STOREFRONT_DOMAIN}/api/2023-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables })
    });
    const responseData = await response.json();
    if (responseData.errors) {
      setShareProductLoading(false)
      console.error('Error fetching product handle:', responseData.errors);
      return null;
    }
    return responseData.data.product.handle;
  };

  const generateLink = async(pid: string) => {
    try {
      const link = await dynamicLinks().buildShortLink({
        link: `https://warley.page.link/XktS?productId=${pid}`,
        domainUriPrefix: 'https://warley.page.link',
        android: {
          packageName: 'com.Warley',
        },

      }, dynamicLinks.ShortLinkType.DEFAULT)
      return link
    } catch (error) {
      setShareProductLoading(false)
      console.log('Generating Link Error:', error)
    }
  }

  const shareProduct = async (id: string) => {
    console.log("id",id)
    setShareProductLoading(true)
    logEvent('Share Product Button Clicked');
    const getLink = await generateLink(id)
    try {
      // const handle = await getProductHandleById(id);

      // if (!handle) {
      //   throw new Error('Product handle not found');
      // }

      const shareUrl = getLink;
      const shareOptions = {
        title: 'Share Product',
        message: `Check out this product: ${shareUrl}`,
      };
      setShareProductLoading(false)
      await Share.open(shareOptions);

      logEvent(`Share Product Name: ${product.title}`);

    } catch (error) {
      setShareProductLoading(false)
      console.log('Error => ', error);
    }
  };

  return (
    <ImageBackground style={[styles.container, { backgroundColor: themecolors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
      <Header
        backIcon={true} textinput={true} text={route?.params?.product?.title}
        shoppingCart={true} share={true} navigation={navigation} productId={route?.params?.product.id} shareProduct={shareProduct} />
      <View style={{ width: "100%", height: 5, backgroundColor: themecolors.whiteColor }}></View>

      <ProductDetails
        product={route?.params?.product}
        onAddToCart={(variantId: string, quantity: number) => onAddtoCartProduct(variantId, quantity)}
        loading={
          route?.params.variant
            ? addingToCart.has(route?.params?.variant?.id)
            : false
        }
        inventoryQuantity={route?.params?.inventoryQuantity}
        relatedProducts={relatedProducts}
        options={option}
        selectedOptions={selectedOptions}
        handleSelectOption={handleSelectOption}
        ids={route?.params?.ids}
        shareProductloading={shareProductloading}
        shareProduct={shareProduct}
      />

    </ImageBackground>
  );
}

const getVariant = (product: ShopifyProduct) => {
  if (product.variants?.edges?.length > 0) {
    return product?.variants?.edges[0]?.node;
  } else if (product?.variants?.nodes?.length > 0) {
    return product?.variants?.nodes[0];
  } else {
    return null;
  }
};

function ProductDetails({
  product,
  onAddToCart,
  loading = false,
  inventoryQuantity,
  relatedProducts,
  options,
  selectedOptions,
  handleSelectOption,
  ids,
  shareProductloading,
  shareProduct,

}: {
  product: ShopifyProduct;
  loading?: boolean;
  onAddToCart: (variantId: string, quantity: number) => void;
  inventoryQuantity?: number,
  relatedProducts?: ShopifyProduct[],
  options?: any[];
  selectedOptions: any;
  handleSelectOption: (optionName: string, value: string) => void;
  ids?: string,
  shareProductloading,
  shareProduct: (id: string) => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const image = (product?.images?.nodes) ? (product?.images?.nodes[0]?.src) : (product?.images?.edges) ? (product?.images?.edges[0]?.node) : (product?.image?.src);
  const variant = getVariant(product);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = inventoryQuantity && inventoryQuantity[0] <= 0;
  const variantSelected = Object.keys(selectedOptions).length > 0;
  const dispatch = useDispatch();
  const wishList = useSelector(state => state.wishlist.wishlist);
  const isSelected = wishList.some(item => item.id === product.id);
  const [expanded, setExpanded] = useState(false);
  const { checkoutURL } = useCart();
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const [loadingProductId, setLoadingProductId] = useState(null);
  // const [shareProductloading, setShareProductLoading] = useState(false);
  const [shopCurrency, setShopCurrency] = useState('');
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;
  const navigation = useNavigation();
  const [rating, setRating] = useState(null);
  const [reviewDescription, setReviewDescription] = useState('');
  const [customerName, setCustomerName] = useState("");
  const [inventoryQuantities, setInventoryQuantities] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [option, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const [products, setProducts] = useState([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [customerId, setCustomerId] = useState("")
  // const [allReviews, setAllReviews] = useState([]); // To store reviews
  // const [page, setPage] = useState(1); // To store the page number
  // const [reviewloading, setReviewLoading] = useState(false); // To handle loading state

  const [shuffledReviews, setShuffledReviews] = useState([]);

  useEffect(() => {
    // Shuffle reviews when the screen is loaded
    setShuffledReviews(shuffleReviews(reviews));
  }, []);

  const shuffleReviews = (reviewsArray) => {
    // Shuffle the reviews array to randomize the order
    return [...reviewsArray].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    // Check if no option is selected
    if (!variantSelected && options?.length > 0) {
      // Loop through each option and select the first value
      options?.forEach(option => {
        handleSelectOption(option.name, option.values[0]);
      });
    }
  }, [variantSelected, options]);

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
    fetchProductMetafields(product.id)
    fetchUserDetails()
  }, []);

  const fetchUserDetails = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails')
    if (userDetails) {
      const userDetailsObject = JSON.parse(userDetails);
      const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
      setCustomerId(userId)
    }
  };

  const getIsFavSelected = (productId) => {
    const isFav = wishList.some(item => item.admin_graphql_api_id === productId);
    return isFav;
  }

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

  const getSelectedVariantId = () => {
    const selectedOptionString = Object.values(selectedOptions).join(' / ');
    const selectedVariant = ids?.find(variant => variant.title === selectedOptionString);
    return selectedVariant ? selectedVariant.id : null;
  }

  const getInventoryQuantity = () => {
    const selectedVariantId = getSelectedVariantId();
    if (selectedVariantId) {
      const selectedVariant = ids?.find(variant => variant.id === selectedVariantId);
      return selectedVariant ? selectedVariant.inventoryQty : 0;
    }
    return 0;
  }

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const onPressFavButton = () => {
    if (!isSelected) {
      logEvent(`Product Add to wishlish ProductId: ${product.id}`);
      console.log("wishlist:::", product)
      dispatch(addToWishlist(product));
    } else {
      logEvent(`Product remove from wishlist ProductId: ${product.id}`);
      dispatch(removeFromWishlist(product));
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
  const handlePress = (item) => {
    if (!getIsFavSelected(item.admin_graphql_api_id)) {
      logEvent(`Product Add to wishlish ProductId: ${item.admin_graphql_api_id}`);
      dispatch(addToWishlist(item));
      addToWishlistApi(customerId, item)
    } else {
      logEvent(`Product remove from wishlist ProductId: ${item.admin_graphql_api_id}`);
      dispatch(removeFromWishlist(item.admin_graphql_api_id));
    }
  };

  //Add to Cart Product
  const onAddToCartRelatedProduct = (variantId, qty) => {
    setLoadingProductId(variantId);
    onAddToCart(variantId, qty).then(() => {
      setLoadingProductId(null);
    });
  };

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 3) {
      return words.slice(0, 3).join(' ') + '...';
    }
    return text;
  };

  useEffect(() => {
    const fetchproduct = () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
      const graphql = JSON.stringify({
        query: `query MyQuery {
        collection(id: "gid://shopify/Collection/331437375641") {
          products(first: 4) {
            nodes {
              id
              images(first: 4) {
                nodes {
                  src
                  url
                }
              }
              title
              tags
              options(first:4){
                id
                name
                values
              }
              variants(first: 4) {
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
          setProducts(fetchedProducts?.data?.collection?.products?.nodes);
          const inventoryQuantities = fetchedProducts?.data?.collection?.products?.nodes?.map((productEdge) => {
            return productEdge?.variants?.nodes?.map((variants) => variants?.inventoryQuantity);
          });
          setInventoryQuantities(inventoryQuantities)
          const fetchedOptions = fetchedProducts?.data?.collection?.products?.nodes?.map((product) => product?.options);
          setOptions(fetchedOptions);

          const productVariantData = fetchedProducts?.data?.collection?.products?.nodes.map((product) =>
            product.variants.nodes.map((variant) => ({
              id: variant?.id,
              title: variant?.title,
              inventoryQty: variant?.inventoryQuantity,
              image: variant?.image
            }))
          );
          setProductVariantsIDS(productVariantData);

          const fetchedTags = fetchedProducts?.data?.collection?.products?.nodes.map(productEdge => productEdge?.tags);
          setTags(fetchedTags)
        })
        .catch((error) => console.log(error));
    }
    fetchproduct();
  }, [])

  const fetchProductMetafields = async (productID: any) => {
    const numericProductID = productID.split('/').pop();
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-07/products/${numericProductID}/metafields.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      });

      // Extract metafields from the response
      const metafields = response.data.metafields;

      // Function to extract review description and rating
      const extractReviewAndRating = (metafields) => {
        let reviewDescription = null;
        let rating = null;
        let customerName = "";
        metafields.forEach(metafield => {
          if (metafield.key === "reviewdes" && metafield.namespace === "custom") {
            reviewDescription = JSON.parse(metafield.value);
            setReviewDescription(reviewDescription);
          } else if (metafield.key === "rating" && metafield.namespace === "custom") {
            const ratingValue = JSON.parse(metafield.value);  // Parsing the value as it's stored as a JSON string
            if (ratingValue.length > 0) {
              rating = ratingValue[0].value;
              setRating(rating);
            }
          } else if (metafield.key === "customername" && metafield.namespace === "custom") {
            const customerNameValue = JSON.parse(metafield.value);
            if (customerNameValue.length > 0) {
              customerName = customerNameValue[0];
              setCustomerName(customerName)
            }
          }
        });

        return {
          reviewDescription,
          rating,
          customerName
        };
      };

      const { reviewDescription, rating, customerName } = extractReviewAndRating(metafields);
      ;
    } catch (error) {
      console.error('Error fetching metafields:', error);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word.charAt(0).toUpperCase()).join('') : '';
  };

  const FallbackAvatar = ({ name }) => (
    <View style={styles.fallbackAvatar}>
      <Text style={styles.fallbackAvatarText}>{getInitials(name)}</Text>
    </View>
  );

  const capitalizeFirstLetter = (str) => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in ProdcutDetails Screen');
    navigation.navigate("ShopifyInboxScreen");
  };

  const presentCheckout = async () => {
    logEvent('Click CheckOut ');
    if (!userLoggedIn) {
      logEvent('user not login Go to Auth');
      openModal()
      // navigation.navigate("AuthStack");
      Toast.show("Please First complete the registration process")
    } else {
      if (checkoutURL) {
        // console.log(checkoutURL)
        // ShopifyCheckout.present(checkoutURL);
        navigation.navigate('ShopifyCheckOut', {
          url: checkoutURL,
        });
        cancelScheduledNotification()
        logEvent('Open CheckOut ');
      } else {
        console.log('Checkout URL is not available');
      }
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


  const fetchReviews = async () => {
    if (reviewloading) return;
    setReviewLoading(true);

    try {
      // Construct the API URL
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${STORE_LOCATION_ID}&fields=reviews&key=${GOOGLE_APIKEY}`;

      // Fetch data from the Google Places API
      const response = await fetch(url);
      const data = await response.json();

      console.log('API response:', data.result.reviews);

      // Check if reviews are available
      if (data.result && data.result.reviews) {
        // Filter reviews to get only 5-star ratings
        const fiveStarReviews = data.result.reviews.filter(review => review.rating === 5);
        console.log('Filtered 5-star reviews:', fiveStarReviews);

        // Limit to the first 10 5-star reviews
        const first10Reviews = fiveStarReviews;
        console.log('First 10 5-star reviews:', first10Reviews);

        // Update the state with the new 5-star reviews
        setAllReviews(first10Reviews);

        // If there are more pages, increment the page number
        if (data.next_page_token) {
          setPage(prevPage => prevPage + 1); // Increment the page number for the next fetch
        }
      } else {
        console.log('No reviews found');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewLoading(false); // Set loading to false once the fetch is done
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleWriteReview = () => {
    const url = WRITE_REVIEW_URL;
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  
  const renderItem = ({ item }) => {
    const { author_name, profile_photo_url, rating, relative_time_description, text } = item;
    const maxLength = 120;
    const truncatedText = text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    return (
      <View style={styles.reviewContainer}>
        <View style={styles.profileContainer}>
        <FallbackAvatar name={author_name} />
          {/* {profile_photo_url ? (
            <Image source={{ uri: profile_photo_url }} style={styles.profileImage} />
          ) : (
            <Image source={LADY_DONALD_RICE} style={styles.profileImage} />
          )} */}
        </View>

        <View style={styles.reviewContent}>
          <Text style={[styles.authorName, { color: themecolors.blackColor }]}>{author_name}</Text>
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, index) => {
              const currentRating = rating !== null && rating !== undefined ? Math.round(rating) : 4;
              return (
                <FontAwesome
                  key={index}
                  name={index < currentRating ? "star" : "star-o"}
                  size={17}
                  color={themecolors.goldColor}
                />
              );
            })}
          </View>

          {relative_time_description && (
            <Text style={[styles.timeDescription, { color: themecolors.blackColor}]}>{relative_time_description}</Text>
          )}
          {text && <Text style={[styles.reviewText, { color: themecolors.blackColor }]}>{truncatedText}</Text>}

        </View>
      </View>
    );
  };


  return (
    <View>
      <ScrollView
        style={{ width: "100%", height: "93.8%", paddingBottom: spacings.large }}
        showsVerticalScrollIndicator={false}
      >
        <View key={product?.id} style={[styles.productItem, borderRadius10, { width: "100%", paddingBottom: hp(15) }]}>
          <Image
            resizeMethod="resize"
            style={[styles.productImage, resizeModeCover, borderRadius10]}
            alt={image?.altText}
            source={{ uri: (image?.src) ? (image?.src) : (image?.url) ? (image?.url) : image }}
          />
          <TouchableOpacity style={[positionAbsolute, alignJustifyCenter, styles.favButton]} onPress={onPressFavButton}>
            <AntDesign
              name={isSelected ? "heart" : "hearto"}
              size={18}
              color={redColor}
            />
          </TouchableOpacity>
          <View style={[styles.productText, justifyContentSpaceBetween]}>
            <View>
              <View style={[flexDirectionRow, { width: "100%", justifyContent: "space-between", alignItems: "center" }]}>
                <View>
                  <Text style={[styles.productTitle, { color: themecolors.blackColor, fontSize: 24 }]}>{product.title}</Text>
                </View>
              </View>
              <View style={[flexDirectionRow, { width: "100%" }]}>
                {(variant?.price?.amount || variant?.price) && (
                  <Text style={[styles.productPrice, { color: "#eb4335", fontSize: 20 }]}>
                   {(variant?.price?.currencyCode) ? variant.price.currencyCode : shopCurrency} {(variant?.price?.amount) ? variant.price.amount : variant.price} 
                  </Text>
                )}
                <Pressable style={[flexDirectionRow, alignItemsCenter, { marginLeft: spacings.large }]}>

                </Pressable>
              </View>
              {product.description && <Text style={[styles.productPrice, { color: themecolors.blackColor, marginVertical: spacings.large }]}>About this product</Text>}
              {product.description && <Pressable onPress={toggleExpanded} style={{ marginBottom: spacings.large }}>
                <Text style={[styles.productDescription, { color: "#808080" }]} numberOfLines={expanded ? null : 2}
                  ellipsizeMode="tail">{product.description}</Text>
              </Pressable>}
            </View>
            <View style={{ marginBottom: spacings.large }}>
              <View>
                {options?.map((option, index) => {
                  if ((option.name === "Title" && option.values.includes("Default Title")) ||
                    (option.name === "default" && option.values.includes("default"))) {
                    return null;
                  }
                  return (
                    <View key={index} style={styles.optionContainer}>
                      <Text style={[styles.relatedProductsTitle, { color: themecolors.blackColor }]}>Choose {option?.name}</Text>
                      <View style={[flexDirectionRow, { marginTop: spacings.large }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {option?.values.map((value, idx) => (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => handleSelectOption(option?.name, value)}
                              style={[
                                styles.optionValueContainer,
                                flexDirectionRow,
                                borderRadius5,
                                alignJustifyCenter,
                                selectedOptions[option.name] === value
                                  ? { backgroundColor: themecolors.redColor, borderWidth: 0 }
                                  : { backgroundColor: themecolors.whiteColor }
                              ]}
                            >
                              <Text style={[styles.optionValue, selectedOptions[option?.name] === value && { color: themecolors.whiteColor }]}>
                                {value}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  );
                })}
              </View>

            </View>
            {/* <View style={{ marginBottom: spacings.large }}>
              <Text style={[styles.relatedProductsTitle, { color: themecolors.blackColor, fontSize: 20 }]}>{RATING_REVIEWS}</Text>
              <View style={[styles.reviewSection, flexDirectionRow, alignItemsCenter]}>
                <View style={[{ width: wp(30) }, justifyContentSpaceBetween, flexDirectionRow]}>
                  {Array.from({ length: 5 }).map((_, index) => {
                    const currentRating = rating !== null && rating !== undefined ? Math.round(rating) : 4; // Default to 4 stars if no rating is provided
                    return (
                      <FontAwesome
                        key={index}
                        name={index < currentRating ? "star" : "star-o"}
                        size={17}
                        color={themecolors.goldColor}
                      />
                    );
                  })}
                </View>
                <Text style={[styles.optionValue, { marginLeft: spacings.large, backgroundColor: lightGrayOpacityColor, paddingHorizontal: spacings.large, borderRadius: 5 }]}>
                  {rating ? `${rating}/5` : '4/5'}
                </Text>
              </View>
              <View style={[flexDirectionRow, alignItemsCenter]}>
                <View style={[{ width: wp(20), height: hp(10) }, alignItemsCenter]}>
                  {customerName != "" ? <FallbackAvatar name={customerName} /> : <Image source={LADY_DONALD_RICE} style={[resizeModeContain, { width: wp(13), height: wp(13) }]} />}
                </View>
                <View style={{ width: "75%" }}>
                  <Text style={[styles.productPrice, { padding: spacings.small, color: themecolors.blackColor }]}>{customerName ? capitalizeFirstLetter(customerName) : "Donald Rice"}</Text>
                  <View style={[{ width: wp(30), height: hp(3), paddingLeft: spacings.normal }, justifyContentSpaceBetween, flexDirectionRow]}>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const currentRating = rating !== null && rating !== undefined ? Math.round(rating) : 4; // Default to 4 stars if no rating is provided
                      return (
                        <FontAwesome
                          key={index}
                          name={index < currentRating ? "star" : "star-o"}
                          size={17}
                          color={themecolors.goldColor}
                        />
                      );
                    })}
                  </View>
                  <Text style={[styles.productDescription, { fontSize: style.fontSizeSmall1x.fontSize, color: themecolors.blackColor }]}>
                    {reviewDescription || 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed ...'}
                  </Text>
                </View>
              </View>
            </View> */}
            {shuffledReviews.length > 0 && <Text style={[styles.relatedProductsTitle, { color: themecolors.blackColor, fontSize: 20 }]}>{RATING_REVIEWS}</Text>}
            <FlatList
              // data={allReviews}
              data={shuffledReviews}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.flatList}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
            {shuffledReviews.length > 0 && <Pressable
              onPress={handleWriteReview}
              style={[styles.outOfStockButton, borderRadius10,alignJustifyCenter, { height: hp(5), padding: spacings.large }]}
            >
              <Text style={[{ color: whiteColor, fontWeight: style.fontWeightThin1x.fontWeight, fontSize: style.fontSizeNormal2x.fontSize, }, textAlign]}>
                Write a Review
              </Text>
            </Pressable>}
          </View>
          {relatedProducts?.length != 0 && <View style={styles.relatedProductsContainer}>
            <Text style={[styles.relatedProductsTitle, { color: themecolors.blackColor }]}>{YOU_MIGHT_LIKE}</Text>
            <FlatList
              data={relatedProducts}
              renderItem={({ item }) => {
                const inventoryQuantity = item?.variants[0]?.inventory_quantity ?? 0;
                const isFavSelected = getIsFavSelected(item.admin_graphql_api_id);
                return (
                  <View
                    style={[styles.relatedProductItem, alignJustifyCenter, { backgroundColor: isDarkMode ? grayColor : "transparnet" }]}
                  >
                    <View style={{ width: "100%", borderWidth: .5, borderColor: themecolors.lightGrayOpacityColor, marginBottom: spacings.small, borderRadius: 10, alignItems: "center" }}>
                      <Image
                        source={{ uri: item?.image?.src }}
                        style={[styles.relatedProductImage, borderRadius10, resizeModeContain]}
                      />
                    </View>
                    <View style={[{ width: "100%", height: hp(9) }]}>
                      <Text style={[styles.relatedproductName, { color: themecolors.blackColor }]}>{trimcateText(item.title)}</Text>
                      <Text style={[styles.relatedproductPrice, { paddingHorizontal: spacings.small, color: themecolors.blackColor }]}>{item?.variants[0]?.price} {shopCurrency}
                      </Text>
                    </View>
                    <View style={[{ width: "100%", flexDirection: "row" }, justifyContentSpaceBetween, alignItemsCenter]}>
                      {inventoryQuantity === 0 ? <Pressable
                        style={[styles.relatedAddtocartButton, borderRadius10, alignJustifyCenter]}
                      >
                        <Text style={styles.addToCartButtonText}>Out of stock</Text>
                      </Pressable>
                        : <Pressable
                          style={[styles.relatedAddtocartButton, borderRadius10, alignJustifyCenter]}
                          onPress={() => onAddToCartRelatedProduct(item.variants[0].admin_graphql_api_id, 1)}
                          disabled={loadingProductId === item.variants[0].admin_graphql_api_id}
                        >
                          {loadingProductId === item.variants[0].admin_graphql_api_id ? (
                            <ActivityIndicator color={whiteColor} />
                          ) : (
                            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                          )}

                        </Pressable>}
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
              // numColumns={2}
              keyExtractor={(index) => index?.toString()}
              showsHorizontalScrollIndicator={false}
            />
          </View>}
          {shareProductloading && <LoadingModal visible={shareProductloading} />}
        </View>
      </ScrollView>
      <ChatButton onPress={handleChatButtonPress} bottom={Platform.OS === "android" ? hp(15) : hp(20)} />
      <View style={[flexDirectionRow, positionAbsolute, justifyContentSpaceBetween, alignJustifyCenter, {
        alignItems: "baseline",
        bottom: Platform.OS === "android" ? hp(2) : !(getInventoryQuantity() <= 0 || inventoryQuantity === 0) ? hp(4) : hp(4), width: wp(100), zIndex: 1, backgroundColor: themecolors.whiteColor, height: hp(10)
      }]}>
        <View style={[styles.addToCartButtonContainer, { paddingTop: 5 }]}>
          {(getInventoryQuantity() <= 0 || inventoryQuantity === 0) ? (
            <Pressable style={[styles.outOfStockButton, borderRadius10]}>
              <Text style={[styles.addToCartButtonText, textAlign]}>
                Out of stock
              </Text>
            </Pressable>
          ) : (
            <Pressable
              disabled={loading || !variantSelected}
              style={[styles.outOfStockButton, borderRadius10]}
              onPress={() => {
                const selectedVariantId = getSelectedVariantId();
                if (selectedVariantId) {
                  onAddToCart(selectedVariantId, quantity);
                } else {
                  Alert.alert('Please select a variant before adding to cart');
                }
              }}
            >
              {loading ? (
                <View style={[styles.addToCartButtonText, textAlign]}>
                  <ActivityIndicator size="small" color={whiteColor} />
                </View>
              ) : (
                <Text style={[styles.addToCartButtonText, textAlign, { color: whiteColor }]}>
                  Add to Cart
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export default ProductDetailsScreen;

function createStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      maxHeight: hp(100),
    },
    productItem: {
      padding: spacings.large,
    },
    productText: {
      paddingTop: spacings.large,
      flexShrink: 1,
      flexGrow: 1,
      color: colors.textSubdued,
    },
    productTitle: {
      fontSize: style.fontSizeLarge.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
      marginTop: spacings.large,
      marginBottom: spacings.normal,
      lineHeight: 28,
      textAlign: 'left',
      color: blackColor,
    },
    productDescription: {
      fontSize: style.fontSizeNormal.fontSize,
      fontWeight: "400",
      // marginHorizontal: spacings.normal,
      lineHeight: 15,
      textAlign: 'left',
      color: colors.text,
    },
    productPrice: {
      fontSize: style.fontSizeLarge.fontSize,
      color: blackColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    productImage: {
      width: '100%',
      height: hp(50),
      marginTop: spacings.normal,
    },
    addToCartButtonContainer: {

    },
    addToCartButton: {
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      backgroundColor: redColor,
      padding: spacings.xxLarge,
    },
    outOfStockButton: {
      width: wp(95),
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      backgroundColor: redColor,
      padding: spacings.xxLarge,
    },
    addToCartButtonText: {
      fontSize: style.fontSizeNormal.fontSize,
      lineHeight: 20,
      color: whiteColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    quantityContainer: {
      marginBottom: spacings.large,
      paddingHorizontal: spacings.normal,
      width: wp(28)
    },
    quantityButton: {
      width: wp(7),
      color: whiteColor,
      fontSize: style.fontSizeNormal2x.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    quantity: {
      paddingHorizontal: spacings.xxLarge,
      paddingVertical: spacings.xSmall,
      fontSize: style.fontSizeNormal2x.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
      color: blackColor,
    },
    addToCartButtonLoading: {
      width: wp(44)
    },
    shareButton: {
      width: wp(10),
      height: wp(10),
      zIndex: 10,
      backgroundColor: lightPink,
      borderRadius: 100
    },
    relatedProductsContainer: {
      width: "100%",
      marginTop: spacings.xLarge,
    },
    relatedProductsTitle: {
      fontSize: style.fontSizeLarge.fontSize,
      fontWeight: style.fontWeightMedium.fontWeight,
      color: blackColor,
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
    relatedProductTitle: {
      fontSize: style.fontSizeNormal.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    relatedAddtocartButton: {
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      width: "68%",
      backgroundColor: redColor,
      padding: spacings.normal,

    },
    optionContainer: {
      marginVertical: spacings.small,
    },
    optionName: {
      fontSize: style.fontSizeNormal.fontSize,
      color: blackColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
      marginBottom: spacings.xsmall,
    },
    optionValueContainer: {
      marginHorizontal: spacings.large,
      padding: spacings.small,
      borderWidth: 1,
      borderColor: blackColor,
      width: wp(23)
    },
    optionValue: {
      fontSize: style.fontSizeNormal.fontSize,
      color: blackColor,
    },
    favButton: {
      width: wp(8),
      height: wp(8),
      right: 20,
      top: 20,
      zIndex: 10,
    },
    reviewSection: {
      width: "100%",
      height: hp(6),
    },
    button: {
      width: '100%',
      backgroundColor: redColor,
      paddingVertical: spacings.large,
      marginTop: spacings.large
    },
    buttonText: {
      color: whiteColor,
      fontSize: style.fontSizeMedium.fontSize,
      fontWeight: style.fontWeightThin.fontWeight,
    },
    relatedProductfavButton: {
      width: wp(10),
      height: hp(3.8),
      right: 0,
      zIndex: 10,
      borderWidth: 1,

      borderRadius: 10,
    },
    relatedproductName: {

      fontSize: style.fontSizeSmall2x.fontSize, fontWeight: style.fontWeightThin1x.fontWeight,
    },
    relatedproductPrice: {
      fontSize: style.fontSizeSmall1x.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,

      fontFamily: 'GeneralSans-Variable'

    },
    fallbackAvatar: {
      width: 60,
      height: 60,
      borderRadius: 65,
      backgroundColor: '#a8326b',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 2,
      borderColor: '#fff',
    },
    fallbackAvatarText: {
      fontSize: 30,
      color: '#fff',
      fontWeight: 'bold',
    },
    text: {
      fontSize: style.fontSizeMedium1x.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
      color: blackColor,
      fontFamily: 'GeneralSans-Variable'
    },
    flatList: {
      width: "100%",
      paddingVertical: hp(1),
    },
    reviewContainer: {
      flexDirection: 'row',
      // alignItems: 'center',
      // backgroundColor:"red",
      width: wp(80),
      height: hp(15),
      // paddingVertical: hp(1.5),
      marginRight: 5,
      marginBottom: 5
    },
    profileContainer: {
      width: wp(20),
      height: hp(10),
      paddingTop:spacings.large
      // alignItems: 'center',
      // justifyContent: 'center',
      // backgroundColor:'red'
    },
    profileImage: {
      width: wp(18),
      height: wp(18),
      borderRadius: 50,
    },
    reviewContent: {
      width: '75%',
      paddingLeft: spacings.normal,
    },
    authorName: {
      fontWeight: 'bold',
      fontSize: style.fontSizeMedium.fontSize,
      marginBottom: spacings.small,
    },
    ratingContainer: {
      flexDirection: 'row',
      marginBottom: spacings.small,
    },
    timeDescription: {
      fontSize: style.fontSizeSmall.fontSize,
      marginBottom: spacings.small,
    },
    reviewText: {
      fontSize: style.fontSizeSmall1x.fontSize,
    },
  });
}
