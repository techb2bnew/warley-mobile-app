import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, FlatList, Keyboard, TouchableOpacity, Image, Pressable, ImageBackground, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from './../utils';
import { blackColor, grayColor, whiteColor, lightGrayOpacityColor, mediumGray } from '../constants/Color'
import {
  POPULAR, BEST_DEALS_OF_THE_WEEK, POPULAR_LIQUOR, SEARCH_FOR_DRINK, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, BEST_DEALS_OF_THE_WEEK_COLLECTION_ID, POPULAR_PRODUCT_COLLECTION_ID
} from '../constants/Constants'
import type { ShopifyProduct } from '../../@types';
import { BaseStyle } from '../constants/Style';
import { spacings, style, appFonts } from '../constants/Fonts';
import { logEvent } from '@amplitude/analytics-react-native';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import Feather from 'react-native-vector-icons/dist/Feather';
import Header from '../components/Header'
import { BACKGROUND_IMAGE, WARLEY_SEARCH, COMING_SOON_IMG } from '../assests/images';
import { useSelector } from 'react-redux';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatButton from '../components/ChatButton';
const { alignItemsCenter, alignJustifyCenter, flexDirectionRow, flex, positionRelative, positionAbsolute, resizeModeContain, borderRadius5, justifyContentSpaceBetween } = BaseStyle;
const SearchScreen = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [inventoryQuantities, setInventoryQuantities] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);
  const [shopCurrency, setShopCurrency] = useState('');

  useEffect(() => {
    logEvent('Search Screen Initialized');
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
  }, [])

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSearch = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
    const graphql = JSON.stringify({
      query: `
        query SearchProducts($query: String!) {
          products(query: $query, first: 20) {
            edges {
              node {
                id
                title
                title
                tags
                status
                description
                options(first:20){
                  id
                  name
                  values
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      price
                      inventoryQuantity
                      title
                      image {
                        originalSrc
                      }
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      id
                      src
                    }
                  }
                }
              }
            }
          }
        }`,
      variables: {
        query: searchQuery
      }
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow"
    };
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
      const result = await response.json();
      const activeProducts = result?.data?.products?.edges?.filter(({ node }) => node.status === 'ACTIVE');
      const suggestions = activeProducts?.map(({ node }) => {
        return {
          title: node?.title,
          imageSrc: node?.images?.edges[0]?.node?.src || null,
          price: node?.variants?.edges[0]?.node?.price
        };
      });
      setSearchSuggestions(suggestions);
      setSearchResults(activeProducts);
      const inventoryQuantities = activeProducts.map((productEdge) => {
        const variantEdges = productEdge?.node?.variants?.edges;
        const inventoryQuantitiesForProduct = variantEdges.map((edge) => edge?.node?.inventoryQuantity);
        return inventoryQuantitiesForProduct;
      });
      setInventoryQuantities(inventoryQuantities);
      const tags = activeProducts.map((productEdge) => productEdge?.node?.tags);
      setTags(tags);

      const options = activeProducts?.map((productEdge) => productEdge?.node?.options);
      setOptions(options);

      const productVariantData = activeProducts?.map((productEdge) =>
        productEdge?.node?.variants?.edges.map((variant) => ({
          id: variant?.node?.id,
          title: variant?.node?.title,
          inventoryQty: variant?.node?.inventoryQuantity,
          image: variant?.node?.image,
          price: variant?.node?.price
        }))
      );

      setProductVariantsIDS(productVariantData)
    } catch (error) {
      console.log(error);
    }
  };

  function getVariant(node: ShopifyProduct) {
    return node?.variants?.edges[0]?.node;
  }

  const fillTextInputWithHint = (hint: string, id?: string) => {
    logEvent(`Selected Popular Hint ${hint}`);
    setSearchQuery(hint);
    setShowSuggestions(false);
    setSuggestionClicked(true);
    navigation.navigate('SearchResultScreen', {
      title: hint,
      id: id
    })
    setSearchQuery('')
  };

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Search Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    <KeyboardAvoidingView
      style={[flex, { height: hp(100) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground style={[styles.Container, flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? '' : BACKGROUND_IMAGE}>
        <Header backIcon={true} text={"Search"} navigation={navigation} />
        <View style={{ width: "100%", height: 5, backgroundColor: colors.whiteColor }}></View>
        <View style={{ paddingHorizontal: spacings.large }}>
          <View style={[positionRelative]}>
            <View style={[styles.input, flexDirectionRow, alignItemsCenter, { backgroundColor: isDarkMode ? colors.grayColor : whiteColor, shadowColor: colors.grayColor }]}>

              <View style={[flex]}>
                <TextInput
                  placeholder={"Search here for anything you want..."}
                  placeholderTextColor={isDarkMode ? whiteColor : grayColor}
                  style={{ color: colors.blackColor, fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize, height: hp(5), }}
                  value={searchQuery}
                  onChangeText={async (text) => {
                    setSearchQuery(text);
                    if (text === '') {
                      setShowSuggestions(false);
                    } else {
                      setShowSuggestions(true);
                      await handleSearch();
                    }
                  }}
                />
              </View>

              <Image
                source={WARLEY_SEARCH}
                style={{ width: wp(4), height: hp(5), resizeMode: 'contain', marginRight: 5 }}
              />
            </View>
            {showSuggestions && (
              <Pressable style={[positionAbsolute, styles.suggestionBox, { backgroundColor: colors.whiteColor }]} onPress={dismissKeyboard}>
                {(searchSuggestions?.length != 0) ? (<FlatList
                  data={searchSuggestions}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        onPress={async () => {

                          setSearchQuery(item?.title);
                          await handleSearch();
                          setShowSuggestions(false);
                          setSuggestionClicked(true);
                          console.log("searchResults", searchResults);

                          const selectedItemFromResults = searchResults.find(items =>
                            items?.node?.title === item?.title ||
                            items?.node?.images?.edges[0]?.node?.src === item?.imageSrc
                          );
                          console.log("selectedItemFromResults", selectedItemFromResults);
                          navigation.navigate('ProductDetails', {
                            product: selectedItemFromResults?.node,
                            variant: getVariant(selectedItemFromResults?.node),
                            inventoryQuantity: inventoryQuantities[index],
                            tags: tags[index],
                            option: options[index],
                            ids: productVariantsIDS[index],
                          });

                          setSearchQuery('');
                          logEvent(`Search Product ${item.title}`);

                        }}
                        style={[styles.suggestionItem, flexDirectionRow, alignItemsCenter]}
                      >
                        {(item?.imageSrc) ?
                          (
                            <Image source={{ uri: item?.imageSrc }} style={[{ width: wp(13), height: hp(10), marginRight: spacings.large }, resizeModeContain]} />
                          ) : (
                            <Image style={[{ width: wp(13), height: hp(10), marginRight: spacings.large }, resizeModeContain]} source={COMING_SOON_IMG} />
                          )}
                        <View style={{ width: wp(55) }}>
                          <Text style={{ color: colors.blackColor, fontFamily: appFonts.semiBold }}>{item?.title}</Text>
                          {userLoggedIn && <Text style={{ color: colors.mediumGray }}>{shopCurrency} {item?.price} </Text>}
                        </View>
                        <View style={[{ width: "25%" }, alignJustifyCenter]}>
                          <Feather name="arrow-up-right" size={25} color={colors.blackColor} />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item, index) => index.toString()}
                />) : (
                  <View style={[alignJustifyCenter, { width: wp(80), height: hp(69), alignSelf: "center" }]}>
                    <View>
                      <Ionicons name="search" size={40} color={colors.grayColor} />
                    </View>
                    <Text style={{ color: colors.blackColor, fontSize: style.fontSizeMedium.fontSize, fontFamily: appFonts.semiBold }}>No Results Found!</Text>
                    <Text style={{ color: colors.mediumGray, textAlign: "center", fontFamily: appFonts.semiBold }}>Try a similar word or something more general.</Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>
          {!showSuggestions && <><Text style={[styles.text, { padding: 10, color: colors.blackColor }]}>{POPULAR}</Text>
            <Pressable style={[borderRadius5, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { backgroundColor: colors.lightGrayOpacityColor, paddingRight: spacings.large, marginTop: spacings.large }]}
              onPress={() => {
                fillTextInputWithHint(POPULAR_LIQUOR, POPULAR_PRODUCT_COLLECTION_ID)
              }}>
              <Text style={[styles.hintText, borderRadius5, { color: isDarkMode ? whiteColor : grayColor }]} >{POPULAR_LIQUOR}</Text>
              <Ionicons name="add" size={25} color={isDarkMode ? whiteColor : grayColor} />
            </Pressable>
            <Pressable style={[borderRadius5, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { backgroundColor: colors.lightGrayOpacityColor, paddingRight: spacings.large, marginTop: 10 }]}
              onPress={() => {
                fillTextInputWithHint(BEST_DEALS_OF_THE_WEEK, BEST_DEALS_OF_THE_WEEK_COLLECTION_ID)
              }}>
              <Text style={[styles.hintText, borderRadius5, { color: isDarkMode ? whiteColor : grayColor }]} >{BEST_DEALS_OF_THE_WEEK}</Text>
              <Ionicons name="add" size={25} color={isDarkMode ? whiteColor : grayColor} />
            </Pressable>
          </>}
        </View>
        <ChatButton onPress={handleChatButtonPress} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  Container: {
    height: hp(100)
  },
  text: {
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
    fontFamily: appFonts.semiBold
  },
  hintText: {
    paddingHorizontal: spacings.large,
    color: grayColor,
    fontSize: style.fontSizeNormal.fontSize,
    fontFamily: appFonts.semiBold
  },
  input: {
    width: "100%",
    height: hp(4),
    borderColor: 'transparent',
    borderWidth: .1,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    marginTop: spacings.large,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 1.5,
  },
  suggestionBox: {
    top: hp(5.5),
    left: 0,
    right: 0,
    zIndex: 1,
    width: wp(95),
    height: hp(83),
    borderRadius: 2
  },

  suggestionItem: {
    padding: spacings.large,
    width: wp(100),
    height: hp(10),
    zIndex: 1,
  },
});

export default SearchScreen;
