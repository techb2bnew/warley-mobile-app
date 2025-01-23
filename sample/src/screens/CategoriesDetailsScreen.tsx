import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, Dimensions, Pressable, Image, ImageBackground, ActivityIndicator, ScrollView, Platform } from 'react-native';
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import { useThemes } from '../context/ThemeContext';
import { spacings, style } from '../constants/Fonts';
import { whiteColor, blackColor, grayColor, redColor } from '../constants/Color';
import Header from '../components/Header';
import { BaseStyle } from '../constants/Style';
import Toast from 'react-native-simple-toast';
import { FILTER_ICON, WHITE_FILTER_ICON, DARK_BACKGROUND_IMAGE, BACKGROUND_IMAGE, NO_PRODUCT_IMG, COMING_SOON_IMG } from '../assests/images';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, ADD_TO_CART, OUT_OF_STOCK } from '../constants/Constants'
import { ShopifyProduct } from '../../@types';
import { lightColors, darkColors, lightGrayColor, verylightGrayColor } from '../constants/Color';
import { logEvent } from '@amplitude/analytics-react-native';
import { useCart } from '../context/Cart';
import { scheduleNotification } from '../notifications';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import ChatButton from '../components/ChatButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Product from '../components/Product'
const { height: screenHeight } = Dimensions.get('window');
const { resizeModeContain, textAlign, alignJustifyCenter, borderRadius10, overflowHidden, borderWidth1, flexDirectionRow } = BaseStyle;

const CategoriesDetailsScreen = ({ route, navigation }) => {
    const { isDarkMode } = useThemes();
    const colors = isDarkMode ? darkColors : lightColors;
    const [modalView, setModalView] = useState('subcategory');
    const [modalVisible, setModalVisible] = useState(false);
    const { tabss, category } = route.params;
    const [activeTab, setActiveTab] = useState(tabss[0]);
    const [nestedTabs, setNestedTabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [tab, setTab] = useState([]);
    const [routeName, setRouteName] = useState();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [productVariantsIDS, setProductVariantsIDS] = useState([]);
    const [tags, setTags] = useState<string[][]>([]);
    const [options, setOptions] = useState([]);
    const [inventoryQuantities, setInventoryQuantities] = useState('');
    const { addToCart, addingToCart } = useCart();
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedHandle, setSelectedHandle] = useState("");
    const [hasNextPage, setHasNextPage] = useState(true);
    const [endCursor, setEndCursor] = useState(null);
    const [activityloading, setActivityLoading] = useState(false);

    useEffect(() => {
        // console.log(category.items)
        // fetchProductsByHandle(route.params.url);
        fetchInitialProducts(route.params.url)
        // console.log("route.params.url",route.params.url)
    }, [route.params.url]);

    function getVariant(node: ShopifyProduct) {
        return node?.variants?.nodes;
    }

    // const fetchProductsByHandle = async (handle) => {
    //     capitalizeFirstLetter(handle)
    //     setLoading(true);
    //     let allProducts = [];
    //     let hasNextPage = true;
    //     let endCursor = null;
    //     try {
    //         while (hasNextPage) {
    //             const graphql = JSON.stringify({
    //                 query: `
    //                 query($handle: String!, $cursor: String) {
    //                     collectionByHandle(handle: $handle) {
    //                         id
    //                         title
    //                         products(first: 250, after: $cursor) {
    //                             nodes {
    //                                 id
    //                                 tags
    //                                 title
    //                                 description
    //                                 options(first: 250) {
    //                                     id
    //                                     name
    //                                     values
    //                                 }
    //                                 images(first: 250) {
    //                                     nodes {
    //                                         url
    //                                     }
    //                                 }
    //                                 variants(first: 250) {
    //                                     nodes {
    //                                         id
    //                                         title
    //                                         price
    //                                         inventoryQuantity
    //                                         image {
    //                                             originalSrc
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                             pageInfo {
    //                                 hasNextPage
    //                                 endCursor
    //                             }
    //                         }
    //                     }
    //                 }`,
    //                 variables: { handle, cursor: endCursor },
    //             });

    //             const requestOptions = {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
    //                 },
    //                 body: graphql,
    //             };

    //             const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
    //             const result = await response.json();

    //             const fetchedProducts = result?.data?.collectionByHandle?.products?.nodes || [];
    //             // console.log(fetchedProducts)
    //             const pageInfo = result?.data?.collectionByHandle?.products?.pageInfo || {};

    //             // Accumulate fetched products
    //             allProducts = [...allProducts, ...fetchedProducts];

    //             // Check if there are more products to fetch
    //             hasNextPage = pageInfo.hasNextPage;
    //             endCursor = pageInfo.endCursor;
    //         }

    //         // Set final products and other data
    //         setProducts(allProducts);

    //         const inventoryQuantities = allProducts.map((product) =>
    //             product.variants.nodes.map((variant) => variant.inventoryQuantity)
    //         );
    //         setInventoryQuantities(inventoryQuantities);

    //         const fetchedTags = allProducts.map((product) => product.tags);
    //         setTags(fetchedTags);

    //         const fetchedOptions = allProducts.map((product) => product.options);
    //         setOptions(fetchedOptions);

    //         const productVariantData = allProducts.map((product) =>
    //             product.variants.nodes.map((variant) => ({
    //                 id: variant.id,
    //                 title: variant.title,
    //                 inventoryQty: variant.inventoryQuantity,
    //                 image: variant.image,
    //             }))
    //         );
    //         setProductVariantsIDS(productVariantData);

    //         // console.log("Total Products Fetched:", allProducts.length);
    //     } catch (error) {
    //         console.error('Error fetching products:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchProductsByHandle = async (handle, cursor = null) => {

        capitalizeFirstLetter(handle); // Capitalize the handle (optional)
        setActivityLoading(true); // Start loading indicator

        try {
            const graphql = JSON.stringify({
                query: `
                    query($handle: String!, $cursor: String) {
                        collectionByHandle(handle: $handle) {
                            products(first: 250, after: $cursor) {
                                nodes {
                                    id
                                    title
                                    description
                                    tags
                                    options(first: 250) {
                                        id
                                        name
                                        values
                                    }
                                         images(first: 250) {
                                        nodes {
                                            url
                                        }
                                     }
                                    variants(first: 250) {
                                        nodes {
                                            id
                                            title
                                            price
                                            inventoryQuantity
                                            inventoryPolicy
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
                variables: { handle, cursor },
            });

            const response = await fetch(
                `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
                    },
                    body: graphql,
                }
            );

            const result = await response.json();
            const fetchedProducts = result?.data?.collectionByHandle?.products?.nodes || [];
            const pageInfo = result?.data?.collectionByHandle?.products?.pageInfo || {};

            // Process only the newly fetched products
            processFetchedData(fetchedProducts);

            // Return pagination info
            return { hasNextPage: pageInfo.hasNextPage, endCursor: pageInfo.endCursor };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { hasNextPage: false, endCursor: null };
        } finally {
            setActivityLoading(false); // Stop loading indicator
        }
    };

    // const processFetchedData = (newProducts) => {
    //     // Append new products to the existing list
    //     setProducts((prev) => [...prev, ...newProducts]);

    //     // Append inventory quantities incrementally
    //     setInventoryQuantities((prev) => [
    //         ...prev,
    //         ...newProducts.map((product) =>
    //             product.variants.nodes.map((variant) => variant.inventoryQuantity)
    //         ),
    //     ]);

    //     // Append tags incrementally
    //     setTags((prev) => [...prev, ...newProducts.map((product) => product.tags)]);

    //     // Append options incrementally
    //     setOptions((prev) => [...prev, ...newProducts.map((product) => product.options)]);

    //     // Append product variants incrementally
    //     setProductVariantsIDS((prev) => [
    //         ...prev,
    //         ...newProducts.map((product) =>
    //             product.variants.nodes.map((variant) => ({
    //                 id: variant.id,
    //                 title: variant.title,
    //                 inventoryQty: variant.inventoryQuantity,
    //                 image: variant.image?.originalSrc,
    //             }))
    //         ),
    //     ]);
    // };

    const processFetchedData = (newProducts) => {
        // Sort new products alphabetically by title
        const sortedNewProducts = [...newProducts].sort((a, b) =>
            a.title.localeCompare(b.title)
        );

        // Update the products state with sorted products
        setProducts((prev) =>
            [...prev, ...sortedNewProducts].sort((a, b) =>
                a.title.localeCompare(b.title)
            )
        );

        // Append inventory quantities incrementally
        setInventoryQuantities((prev) => [
            ...prev,
            ...sortedNewProducts.map((product) =>
                product.variants.nodes.map((variant) => variant.inventoryQuantity)
            ),
        ]);

        // Append tags incrementally
        setTags((prev) => [...prev, ...sortedNewProducts.map((product) => product.tags)]);

        // Append options incrementally
        setOptions((prev) => [...prev, ...sortedNewProducts.map((product) => product.options)]);

        // Append product variants incrementally
        setProductVariantsIDS((prev) => [
            ...prev,
            ...sortedNewProducts.map((product) =>
                product.variants.nodes.map((variant) => ({
                    id: variant.id,
                    title: variant.title,
                    inventoryQty: variant.inventoryQuantity,
                    continueSelling: variant?.inventoryPolicy === "CONTINUE",
                    image: variant.image?.originalSrc,
                }))
            ),
        ]);
    };

    const handleSubcategorySelect = (item) => {
        setSelectedItem(item.url)
        // console.log("itemm:::::", item.url)
        setProducts([])
        if (item.subcategories && item.subcategories.length > 0) {
            setSelectedCategories((prev) => [...prev, item.title]);
            setTab(item.subcategories)
            setActiveTab(item);
            setNestedTabs([]);
            fetchInitialProducts(item.url);
            setModalView('tab');
        } else {
            setModalVisible(false);
            fetchInitialProducts(item.url);
        }
    };

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
        setSelectedItem(tab.url)
        setProducts([])
        if (tab.subcategories && tab.subcategories.length > 0) {
            setNestedTabs(tab.subcategories);
            fetchInitialProducts(tab.url);
            setModalView('nestedTab');
        } else {
            setModalVisible(false);
            fetchInitialProducts(tab.url);
        }
    };

    const handleNestedTabSelect = (nestedTab) => {
        setProducts([])
        setSelectedItem(nestedTab.url)
        fetchInitialProducts(nestedTab.url);
        setModalVisible(false);
    };

    const addToCartProduct = async (variantId: any, quantity: any) => {
        logEvent(`Add To Cart Product variantId:${variantId} Qty:${quantity}`);
        await addToCart(variantId, quantity);
        navigation.navigate('Cart')
        Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
        scheduleNotification()
    };

    const handleChatButtonPress = () => {
        logEvent('Chat button clicked in Electronics Home Screen');
        navigation.navigate("ShopifyInboxScreen")
    };
    const capitalizeFirstLetter = (routeName) => {
        const result = routeName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        setRouteName(result); // Set the result in state
    };

    const fetchInitialProducts = async (handle) => {
        setLoading(true)
        const result = await fetchProductsByHandle(handle);
        setSelectedHandle(handle)
        setLoading(false)
        setHasNextPage(result.hasNextPage);
        setEndCursor(result.endCursor);
    };

    const fetchMoreProducts = async () => {
        if (loading || !hasNextPage) return; // Prevent multiple fetches
        const result = await fetchProductsByHandle(selectedHandle, endCursor);
        setSelectedHandle('')
        setHasNextPage(result.hasNextPage);
        setEndCursor(result.endCursor);
    };
    return (
        <ImageBackground style={[{ flex: 1 }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
            {/* // <View style={[{ flex: 1, backgroundColor: whiteColor }]} > */}
            <>
                <Header backIcon={true} text={routeName} navigation={navigation} />
                <View style={{ width: "100%", height: 5, backgroundColor: colors.whiteColor }}></View>
                <View style={{ padding: 10 }}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                        {modalView === 'subcategory' && (
                            <FlatList
                                data={category}
                                renderItem={({ item, index }) => {
                                    const dynamicCategoryName = `CategoryName ${index + 1}`;
                                    const mainCategoryName = item[dynamicCategoryName];
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleSubcategorySelect(item)}
                                            style={[styles.subCategoryButton, { backgroundColor: selectedItem === item.url ? redColor : whiteColor }]}
                                        >
                                            <Text style={[styles.subCategoryText, { color: selectedItem === item.url ? whiteColor : blackColor }]}>
                                                {(item.CategoryName) || (mainCategoryName)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                                keyExtractor={(item) => item?.id?.toString()}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            />
                        )}

                        {modalView === 'tab' && (
                            <FlatList
                                data={tab}
                                renderItem={({ item, index }) => {
                                    const dynamicSubcategoryName = item[`SubcategoryName ${index + 1}`] || item[`SubcategoryChildName ${index + 1}`];
                                    const subcategoryName = dynamicSubcategoryName;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleTabSelect(item)}
                                            style={[styles.tabButton, { backgroundColor: selectedItem === item.url ? redColor : whiteColor }]}
                                        >
                                            <Text style={[styles.tabText, { color: selectedItem === item.url ? whiteColor : blackColor }]}>
                                                {(item.SubcategoryName1) || (subcategoryName)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                                keyExtractor={(item) => item?.id?.toString()}
                                horizontal={true}  // Horizontal layout for tab
                                showsHorizontalScrollIndicator={false}
                            />
                        )}

                        {modalView === 'nestedTab' && (
                            <FlatList
                                data={nestedTabs}
                                renderItem={({ item, index }) => {
                                    const dynamicSubcategoryChildName = `SubcategoryChildName ${index + 1}`;
                                    const subcategoryChildName = item[dynamicSubcategoryChildName];
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleNestedTabSelect(item)}
                                            style={[styles.tabButton, { backgroundColor: selectedItem === item.url ? redColor : whiteColor }]}
                                        >
                                            <Text style={[styles.tabText, { color: selectedItem === item.url ? whiteColor : blackColor }]}>
                                                {item.SubcategoryName2 || subcategoryChildName || 'No Subcategory Child Name'}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                                keyExtractor={(item) => item?.url}
                                horizontal={true}  // Horizontal layout for nested tabs
                                showsHorizontalScrollIndicator={false}
                            />
                        )}
                    </ScrollView>

                    {loading && (
                        <SkeletonPlaceholder>
                            <View style={{ width: wp(100), height: 'auto', flexDirection: 'row', marginVertical: 5 }}>
                                {Array(3).fill().map((_, index) => (
                                    <View key={index} style={{ width: wp(29), height: hp(20), marginHorizontal: 5, borderRadius: 10, backgroundColor: colors.grayColor }} />
                                ))}
                            </View>
                            <View style={{ width: wp(100), height: 'auto', flexDirection: 'row', marginVertical: 5 }}>
                                {Array(3).fill().map((_, index) => (
                                    <View key={index} style={{ width: wp(29), height: hp(20), marginHorizontal: 5, borderRadius: 10, backgroundColor: colors.grayColor }} />
                                ))}
                            </View>
                            <View style={{ width: wp(100), height: 'auto', flexDirection: 'row', marginVertical: 5 }}>
                                {Array(3).fill().map((_, index) => (
                                    <View key={index} style={{ width: wp(29), height: hp(20), marginHorizontal: 5, borderRadius: 10, backgroundColor: colors.grayColor }} />
                                ))}
                            </View>
                            <View style={{ width: wp(100), height: 'auto', flexDirection: 'row', marginVertical: 5 }}>
                                {Array(3).fill().map((_, index) => (
                                    <View key={index} style={{ width: wp(29), height: hp(20), marginHorizontal: 5, borderRadius: 10, backgroundColor: colors.grayColor }} />
                                ))}
                            </View>
                        </SkeletonPlaceholder>
                    )}

                    <View style={[styles.productDetailBox]}>
                        {!loading && (
                            products.length !== 0 ?
                                < FlatList
                                    data={products}
                                    renderItem={({ item, index }) => (
                                        // <ProductItem
                                        //     item={item}
                                        //     addToCartProduct={addToCartProduct}
                                        //     InventoryQuantities={inventoryQuantities[index]}
                                        //     ids={productVariantsIDS[index]}
                                        //     onPress={() => {
                                        //         navigation.navigate('ProductDetails', {
                                        //             product: item,
                                        //             variant: getVariant(item),
                                        //             inventoryQuantity: inventoryQuantities[index],
                                        //             tags: tags[index],
                                        //             option: options[index],
                                        //             ids: productVariantsIDS[index],
                                        //         });
                                        //     }}
                                        // />
                                        <Product
                                            product={item}
                                            onAddToCart={addToCartProduct}
                                            loading={addingToCart?.has(getVariant(item)?.id ?? '')}
                                            inventoryQuantity={inventoryQuantities[index]}
                                            option={options[index]}
                                            ids={productVariantsIDS[index]}
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
                                    keyExtractor={(item) => item?.id?.toString()}
                                    onEndReached={fetchMoreProducts} // Trigger fetch on end
                                    onEndReachedThreshold={0.5} // Fetch when the user scrolls 50% from the bottom
                                    ListFooterComponent={
                                        activityloading ? <ActivityIndicator size="large" color="#0000ff" /> : null
                                    }
                                />
                                :
                                <View style={{ alignItems: "center", justifyContent: "center", height: "60%", width: wp(95) }}>
                                    <Image source={NO_PRODUCT_IMG} style={{ width: wp(20), height: hp(12), resizeMode: "contain" }} />
                                    <Text style={[styles.emptyText, { color: colors.blackColor }]}>No Product available.</Text>
                                    <Text style={[styles.subText, { color: colors.blackColor, marginTop: 8 }]}>
                                        Check back soon for updates.
                                    </Text>
                                </View>

                        )}
                    </View>
                </View>

            </>
            <ChatButton onPress={handleChatButtonPress} />
        </ImageBackground>

    );
};


const ProductItem = ({ item, InventoryQuantities, ids, onPress, addToCartProduct }) => {
    const { isDarkMode } = useThemes();
    const colors = isDarkMode ? darkColors : lightColors;
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [shopCurrency, setShopCurrency] = useState('');
    const outOfStock = ids && ids[0]?.inventoryQty;
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
    const price = item?.variants?.edges ? item?.variants?.edges[0]?.node?.price : item?.variants?.nodes[0];
    const priceAmount = price?.price ? price?.price : price?.amount;

    const incrementQuantity = () => {
        setQuantity(quantity + 1);
    };

    const decrementQuantity = () => {
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
        <Pressable style={[styles.itemContainer, alignJustifyCenter, borderRadius10, overflowHidden, { backgroundColor: isDarkMode ? colors.grayColor : whiteColor }]} onPress={onPress}>
            {(item?.images?.nodes[0]?.url) ? <Image source={{ uri: item?.images?.nodes[0]?.url }} style={[styles.categoryImage, resizeModeContain]} /> :
                <Image source={COMING_SOON_IMG} style={[styles.categoryImage, resizeModeContain, { width: wp(40), height: hp(20.5) }]} />}            <Text style={[styles.categoryName, textAlign, { fontWeight: style.fontWeightThin1x.fontWeight, color: colors.blackColor, paddingHorizontal: 8 }]}>{item?.title}</Text>
            <Text style={[styles.categoryName, textAlign, { fontWeight: style.fontWeightThin1x.fontWeight, color: colors.redColor, paddingHorizontal: 8, fontFamily: 'arrialnarrow' }]}>{shopCurrency} {priceAmount}</Text>
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

export default CategoriesDetailsScreen;

const styles = StyleSheet.create({
    productDetailBox: {
        width: wp(100),
        height: Platform.OS === "android" ? hp(78) : hp(72),
        paddingTop: spacings.large,
        paddingBottom: spacings.xxxxLarge,
    },
    filterButton: {
        position: "absolute",
        top: -40,
        right: 0,
        width: "15%",
        height: hp(6),
    },
    filterIcon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        height: screenHeight * 0.4,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    subCategoryButton: {
        flex: 1,
        margin: 5,
        padding: 10,
        backgroundColor: whiteColor,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 1,
        borderColor: blackColor
    },
    subCategoryText: {
        textAlign: 'center',
        fontSize: style.fontSizeSmall.fontSize,
        fontFamily: 'Montserrat-BoldItalic'
    },
    tabButton: {
        flex: 1,
        margin: 5,
        padding: 10,
        backgroundColor: whiteColor,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 1,
        borderColor: blackColor
    },
    tabText: {
        textAlign: 'center',
        fontSize: style.fontSizeSmall.fontSize,
        fontFamily: 'Montserrat-BoldItalic'
    },
    closeModalButton: {
        position: 'absolute',
        bottom: hp(42),
        left: '47%',
    },
    productItem: {
        margin: spacings.small,
        padding: spacings.large,
        width: wp(45),
        backgroundColor: whiteColor,
        borderRadius: 10,
        shadowColor: grayColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1.7,
    },
    productImage: {
        width: wp(30),
        height: hp(20.5),
        resizeMode: 'contain',
    },
    productTitle: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
        color: blackColor,
    },
    categoryImage: {
        width: wp(30),
        height: hp(20.5),
    },
    categoryName: {
        fontSize: 14,
        color: blackColor,
        fontFamily: 'Montserrat-BoldItalic'
    },
    itemContainer: {
        width: wp(45.5),
        // marginVertical: spacings.small,
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
        fontWeight: style.fontWeightThin1x.fontWeight,
        fontFamily: 'Montserrat-BoldItalic'
    },
    emptyText: {
        textAlign: 'center',
        // marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
    subText: {
        textAlign: 'center',
        fontSize: 14,
    },
    imageBackground: {
        // flex: 1,
        width: '100%',
        // height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
});
