import React, { useEffect, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View, Pressable, FlatList } from 'react-native'
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { spacings, style } from '../constants/Fonts';
import { whiteColor, blackColor, grayColor, redColor } from '../constants/Color';
import Header from '../components/Header';
import { BaseStyle } from '../constants/Style'; 
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, BrandsCollections, STOREFRONT_ACCESS_TOKEN,productType } from '../constants/Constants'
import { DARK_BACKGROUND_IMAGE, BACKGROUND_IMAGE } from '../assests/images';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import axios from 'axios';
const borderColors = ['#33c1ff', '#ff5733', '#ff33f6', '#75ff33', '#f3ff33', '#ff9933', '#ffcc33', '#3366ff', '#cc33ff'];
const { flex, alignJustifyCenter, flexDirectionRow, resizeModeCover, justifyContentSpaceBetween, borderRadius10, alignItemsCenter,
    textAlign, overflowHidden } = BaseStyle;

export default function BrandCollection({ navigation }) {
    const [productTypecollectionData, setProductTypeCollection] = useState(productType);
    const { isDarkMode } = useThemes();
    const colors = isDarkMode ? darkColors : lightColors;

    // useEffect(() => {
    //     fetchAllCollectionsWithProductTypes();
    // }, []);

    // const fetchAllCollectionsWithProductTypes = async () => {
    //     // console.log("Fetching all collections...");
    //     let allCollections = [];
    //     let productTypes = new Set();
    //     let matchingCollections = [];
    //     let hasNextPage = true;
    //     let endCursor = null;

    //     try {
    //         while (hasNextPage) {
    //             const graphql = JSON.stringify({
    //                 query: `
    //                 query($cursor: String) {
    //                     collections(first: 250, after: $cursor) {
    //                         edges {
    //                             node {
    //                                 id
    //                                 title
    //                                 handle
    //                                 image {
    //                                     id
    //                                     src
    //                                     url
    //                                 }
    //                                 products(first: 250) {
    //                                     nodes {
    //                                         id
    //                                         title
    //                                         productType
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                         pageInfo {
    //                             hasNextPage
    //                             endCursor
    //                         }
    //                     }
    //                 }`,
    //                 variables: { cursor: endCursor },
    //             });

    //             const requestOptions = {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
    //                 },
    //                 body: graphql,
    //             };

    //             const response = await fetch(
    //                 `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`,
    //                 requestOptions
    //             );

    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }

    //             const result = await response.json();
    //             const fetchedCollections = result?.data?.collections?.edges.map(edge => edge.node) || [];

    //             // Collect all product types from fetched products
    //             fetchedCollections.forEach(collection => {
    //                 collection.products.nodes.forEach(product => {
    //                     if (product.productType) {
    //                         productTypes.add(product.productType); // Store unique product types
    //                     }
    //                 });
    //             });

    //             allCollections = [...allCollections, ...fetchedCollections];

    //             const pageInfo = result?.data?.collections?.pageInfo || {};
    //             hasNextPage = pageInfo.hasNextPage;
    //             endCursor = pageInfo.endCursor;
    //         }

    //         // console.log("All Product Types:", Array.from(productTypes));

    //         // Filter collections that match product types
    //         allCollections.forEach(collection => {
    //             const collectionName = collection.title;
    //             if (productTypes.has(collectionName)) {
    //                 matchingCollections.push({
    //                     id: collection.id,
    //                     name: collectionName,
    //                     imageUrl: collection.image?.url || null,
    //                 });
    //             }
    //         });

    //         // console.log("Matching Collections:", matchingCollections);
    //         setProductTypeCollection(Array.from(productTypes))
    //         // console.log("Total Collections Fetched:", allCollections.length);
    //     } catch (error) {
    //         console.error('Error fetching collections:', error);
    //     }
    // };

    const onPressCollection = (id: any, heading: any) => {
        // logEvent(`See All our product Collection Button Pressed from HomeScreenElectronics CollectionID: ${id} CollectionName: ${heading}`);
        navigation.navigate('Collections', {
            productType: id, headingText: heading
        })
    }

    return (
        // <ImageBackground style={[{ flex: 1 }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
        <View style={[{ flex: 1, backgroundColor: whiteColor }]} >
            <Header backIcon={true} text={"All Brands"} navigation={navigation} />

            <View style={[{ width: "100%", height: "auto", padding: spacings.large }, flexDirectionRow]}>
                {productTypecollectionData.length === 0 ? (
                    <SkeletonPlaceholder>
                        <View style={{ width: wp(95) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {[...Array(2)].map((_, index) => (
                                    <View key={index} style={{ width: wp(45), height: hp(5), backgroundColor: '#e0e0e0', borderRadius: 5, margin: 5 }} />
                                ))}
                            </View>

                        </View>
                    </SkeletonPlaceholder>
                ) : (
                    <View style={{ width: "100%", alignItems: "center", justifyContent: "center",marginBottom:8 }}>
                        {/* <FlatList
                            data={productTypecollectionData.filter(item => item?.name !== "NULL")}
                            renderItem={({ item, index }) => {
                                console.log(item)
                                const borderColor = borderColors[index % borderColors.length];
                                return (
                                    <View style={[{ width: wp(21), height: hp(10), margin: 5 },]}>
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
                            showsVerticalScrollIndicator={false}
                            numColumns={4}
                            keyExtractor={(item) => item?.id}
                            style={{ width: wp(95), marginBottom: 40 }}
                        /> */}
                        <FlatList
                            data={productTypecollectionData.filter(item => item?.name !== "NULL")}
                            renderItem={({ item, index }) => {
                                const borderColor = borderColors[index % borderColors.length];
                                return (
                                    <View style={[{ width: wp(45), height: hp(5), margin: 5 },alignJustifyCenter]}>
                                        <Pressable
                                            style={[styles.categoryCard, overflowHidden, alignJustifyCenter, {
                                                backgroundColor: colors.whiteColor,
                                                // borderColor: isDarkMode ? borderColor : borderColor,
                                                borderColor: blackColor,
                                                borderWidth: isDarkMode ? 1 : 1
                                            }]}
                                            onPress={() => onPressCollection(item, item)}
                                        >
                                            {/* Displaying the product type name as text */}
                                            <Text style={styles.categoryText}>
                                                {item}
                                            </Text>
                                        </Pressable>
                                    </View>
                                );
                            }}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            keyExtractor={(item) => item?.id}
                            style={{ width: wp(95), marginBottom: 40 }}
                        />
                    </View>)}
            </View>
            {/* </ImageBackground> */}
        </View>
    )
}

const styles = StyleSheet.create({
    categoryCard: {
        // width: wp(20.8),
        // height: hp(10),
        width: wp(45),
        height: hp(5),
        borderRadius: 5,
        borderWidth: 0.5,
        paddingVertical: spacings.small,
    },
    categoryImage: {
        width: "100%",
        height: "110%",
        borderRadius: 10,
    },
    categoryText:{
        textAlign: 'center',
        fontSize: 11,
        fontFamily: 'Montserrat-BoldItalic',
        color:blackColor
    }
})