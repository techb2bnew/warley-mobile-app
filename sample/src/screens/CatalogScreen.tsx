import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, FlatList, Pressable, ActivityIndicator, ImageBackground, Alert, Platform } from 'react-native';
import useShopify from '../hooks/useShopify';
import { Colors, useTheme } from '../context/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { blackColor, redColor, whiteColor, grayColor, lightGrayOpacityColor, mediumGray } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import Header from '../components/Header'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { logEvent } from '@amplitude/analytics-react-native';
import { getAdminAccessToken, getStoreDomain, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, STOREFRONT_ACCESS_TOKEN, LOADER_NAME } from '../constants/Constants'
import { ShopifyProduct } from '../../@types';
import { BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE } from '../assests/images'
import Product from '../components/ProductVertical';
import { useCart } from '../context/Cart';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import LoaderKit from 'react-native-loader-kit';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
import { scheduleNotification } from '../notifications';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
const borderColors = ['#33c1ff', '#ff5733', '#ff33f6', '#0e95e6', '#f0659c', '#ff9933', '#ffcc33', '#3366ff', '#cc33ff'];
const { flex, textAlign, alignItemsCenter, resizeModeContain, borderRadius10, positionRelative, alignJustifyCenter, resizeModeCover } = BaseStyle;
type Props = NativeStackScreenProps<RootStackParamList, 'CatalogScreen'>;

function CatalogScreen({ navigation }: Props) {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [collectionImages, setCollectionImages] = useState({});
  const [shopifycollectionData, setShopifyCollectionData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;
  useEffect(() => {
    logEvent('Catalog Screen Initialized');
  }, [])



  useEffect(() => {
    const fetchCollectionImage = async (handle) => {
      // console.log("handle", handle)
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
          console.log("item.url", item.url)
          const imageUrl = await fetchCollectionImage(item.url);
          console.log("imageUrl", imageUrl)
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

  useFocusEffect(
    useCallback(() => {
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

      fetchCollectionData();
    }, [])
  );


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


  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Catalog Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    <View style={[flex, { backgroundColor: themecolors.whiteColor }]} >
      {/* <ImageBackground style={[flex, { backgroundColor: themecolors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}> */}
      <Header
        navigation={navigation}
        backIcon={true}
        text={"Categories"}
        // text={collectionTitle}
        textinput={true}
      />
      <View style={{ width: "100%", height: 5, backgroundColor: themecolors.whiteColor }}></View>
      <View style={[styles.container]}>
        {shopifycollectionData.length != 0 ? <FlatList
          data={shopifycollectionData}
          renderItem={({ item, index }) => {
            const borderColor = borderColors[index % borderColors.length];
            const imageUrl = collectionImages[item.url];
            return (
              <Pressable style={{ width: wp(24.5), height: Platform.OS === "android" ? hp(16) : hp(14) }} onPress={() => handleCategoryPress(item, index)}>
                <View style={{ height: hp(12), paddingHorizontal: spacings.xLarge, paddingVertical: spacings.small, alignItems: "center", justifyContent: "center", }}>
                  <View style={{
                    backgroundColor: themecolors.whiteColor, borderWidth: 1,
                    borderRadius: 50, height: Platform.OS === "android" ? hp(10) : hp(9.3), overflow: "hidden",
                    // borderColor: borderColor
                    borderColor: blackColor,
                    width: wp(20)
                  }}>
                    <Image source={{ uri: imageUrl }} style={[resizeModeContain, styles.card]} />
                  </View>

                </View>
                <Text style={[styles.categoryName, textAlign, { color: themecolors.blackColor, paddingHorizontal: spacings.normal, fontSize: 10 }]}>{item.name}</Text>
              </Pressable>
            )
          }
          }
          showsVerticalScrollIndicator={false}
          keyExtractor={(index) => index.toString()}
          numColumns={4}
          style={{ width: wp(100), height: Platform.OS === "android" ? "95%" : "83%", paddingBottom: 100 }}
        /> :
          <SkeletonPlaceholder>
            <View style={{ width: wp(100), height: hp(70), padding: spacings.large }}>
              {Array(7).fill().map((_, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {Array(4).fill().map((_, colIndex) => (
                    <View key={colIndex} style={{ width: wp(20), height: Platform.OS === "android" ? hp(10) : hp(9), borderRadius: 50, marginTop: 10 }} />
                  ))}
                </View>
              ))}
            </View>
          </SkeletonPlaceholder>}
      </View>
      <ChatButton onPress={handleChatButtonPress} />

      {/* </ImageBackground> */}
    </View>

  );
}

export default CatalogScreen;

function createStyles() {
  return StyleSheet.create({
    container: {
      width: wp(100),
      height: hp(90),
      flexDirection: "row"
    },
    productCollectionBox: {
      width: "23%",
      height: hp(88),
      paddingVertical: spacings.small,
      backgroundColor: lightGrayOpacityColor
    },
    productDetailsBox: {
      width: wp(78),
      height: hp(88),
      padding: spacings.small,
    },
    card: {
      width: "100%",
      height: "90%",
    },
    categoryName: {
      fontSize: style.fontSizeNormal.fontSize,
      color: blackColor,
      // marginVertical: spacings.small,
      fontWeight: style.fontWeightThin1x.fontWeight,
      fontFamily: 'Montserrat-BoldItalic'
    },
    text: {
      fontSize: style.fontSizeLarge.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
      color: blackColor,
    },
    drinkBannerBox: {
      width: wp(40.5),
      height: hp(20),
      margin: spacings.large,
    },
    skeletonContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    skeletonItem: {
      alignItems: 'center',
      marginVertical: 10,
    },
    skeletonImage: {
      width: wp(15),
      height: hp(10),
      backgroundColor: lightGrayOpacityColor,
      borderRadius: 10,
    },
    skeletonText: {
      width: wp(12),
      height: 10,
      backgroundColor: lightGrayOpacityColor,
      marginTop: 5,
      borderRadius: 5,
    },
  });
}
