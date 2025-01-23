import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { blackColor, lightGrayOpacityColor, whiteColor, blackOpacity5, grayColor, redColor } from '../../constants/Color';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import { USER_IMAGE, WHITE_USER_IMAGE } from '../../assests/images'
import Feather from 'react-native-vector-icons/dist/Feather';
import { useSelector } from 'react-redux';
import { LOGIN, SIGNUP, ABOUT_US, CONTACT_US, ORDERS, ADMINAPI_ACCESS_TOKEN, STOREFRONT_DOMAIN } from '../../constants/Constants';
import Header from '../Header';
import { useThemes } from '../../context/ThemeContext';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import { lightColors, darkColors } from '../../constants/Color';
import { logEvent } from '@amplitude/analytics-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const { positionAbsolute, alignItemsCenter, flexDirectionRow, justifyContentSpaceBetween } = BaseStyle;

const MenuModal = ({ modalVisible, setModalVisible, onPressCart, onPressSearch, navigation, onPressShopByCatagory }) => {
  const { isDarkMode, toggleTheme } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const [customerId, setCustomerId] = useState("")
  const [orders, setOrders] = useState([]);
  const [contactUsVisible, setContactUsVisible] = useState(false);

  const onPressShopByCate = () => {
    onPressShopByCatagory()
    logEvent('shop By Catagory button from menu');
    setModalVisible(!modalVisible)
  }
  const onPressSaved = () => {
    navigation.navigate('Saved')
    logEvent('Saved button  from menu');
    setModalVisible(!modalVisible)
  }
  const onPressProfile = () => {
    // navigation.navigate('Profile')
    navigation.navigate('ProfileStack')
    logEvent('Profile button from menu');
    setModalVisible(!modalVisible)
  }
  const onPressLogin = () => {
    navigation.navigate('AuthStack')
    logEvent('Login button from menu');
    setModalVisible(!modalVisible)
  }

  const onPressSignUp = () => {
    navigation.navigate('AuthStack')
    logEvent('Sign in button from menu');
    setModalVisible(!modalVisible)
  }
  const changeTheme = () => {
    toggleTheme()
    logEvent(`Change App theme to ${isDarkMode ? 'Light' : 'Dark'} Mode`)
  }
  const fetchUserDetailsAndOrders = async () => {
    try {
      // Fetch user details from AsyncStorage
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (userDetails) {
        const userDetailsObject = JSON.parse(userDetails);
        const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;

        if (userId) {
          setCustomerId(userId); // Update customer ID state
          // Fetch orders for the customer
          await fetchOrders(userId);
        }
      }
    } catch (error) {
      console.log('Error fetching user details or orders:', error);
    }
  };

  const fetchOrders = async (id) => {
    try {
      const response = await axios.get(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/orders.json?customer_id=${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN
          },
        }
      );
      setOrders(response?.data?.orders);
      console.log('response?.data?.orders', response?.data?.orders);
    } catch (error) {
      console.log('Error fetching orders:', error);
    }
  };


  const onPressContactUs = () => {
    setContactUsVisible(!contactUsVisible);
    logEvent('Contact Us button from menu');
    // setModalVisible(!modalVisible);
  };

  const ContactUsCard = () => {
    return (
      <View style={styles.contactUsCard}>
       <Text style={styles.contactUsTitle}>Contact Us on Email</Text>
       <Text style={styles.contactUsEmail}>info@warleysuperstore.com</Text>
      </View>
    );
  };

  // Use useFocusEffect to trigger the fetch on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserDetailsAndOrders();
    }, [])
  );
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalView, { backgroundColor: colors.whiteColor }]}>
          <Header
            closeIcon={true}
            image={true}
            textinput={true}
            navigation={navigation}
            onClosePress={() => { setModalVisible(!modalVisible), logEvent("close menu modal") }}
          // shoppingCart={true} 
          />
          <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressShopByCate}>
            <Text style={[styles.menuText, { color: colors.blackColor }]}>{"Shop By Categories"}</Text>
            <Feather name={"chevron-right"} size={25} color={colors.blackColor} />
          </Pressable>
          <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressSaved}>
            <Text style={[styles.menuText, { color: colors.blackColor }]}>{"Saved"}</Text>
            <Feather name={"chevron-right"} size={25} color={colors.blackColor} />
          </Pressable>
          {userLoggedIn && <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressProfile}>
            <Text style={[styles.menuText, { color: colors.blackColor }]}>{"Profile"}</Text>
            <Feather name={"chevron-right"} size={25} color={colors.blackColor} />
          </Pressable>}

          {userLoggedIn &&
            <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={() => {
              logEvent(`Orders Clicked userId: ${customerId}`);
              navigation.navigate("UserDashboardScreen", {
                from: ORDERS,
                orderList: orders
              })
              setModalVisible(!modalVisible)
            }}>
              <Text style={[styles.menuText, { color: colors.blackColor }]}>{"My Orders"}</Text>
              <Feather name={"chevron-right"} size={25} color={colors.blackColor} />
            </Pressable>
          }

          <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressContactUs}>
            <Text style={[styles.menuText, { color: colors.blackColor }]}>Contact US</Text>
            <Feather name={contactUsVisible?"chevron-down":"chevron-right"} size={25} color={colors.blackColor} />
          </Pressable>

          {contactUsVisible && <ContactUsCard />}
        </View>
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: wp(100),
    height: hp(100),
    marginTop: Platform.OS === "android" ? 0 : 50,
  },
  modalView: {
    width: wp(100),
    height: hp(100),
    backgroundColor: whiteColor
  },
  menuItem: {
    padding: spacings.xxxLarge,
    borderBottomWidth: 1,
    borderBottomColor: lightGrayOpacityColor,
  },
  menuText: {
    fontSize: style.fontSizeMedium.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
    fontFamily: 'Montserrat-BoldItalic'
  },
  bottomContainer: {
    width: wp(100),
    bottom: 0
  },
  loginItem: {
    padding: spacings.large,
    width: '100%',
  },
  loadingBoxBackground: {
    backgroundColor: blackOpacity5,
  },
  contactUsCard: {
    padding: spacings.xxxLarge,
    backgroundColor: redColor,
    // marginTop: 10,
  },
  contactUsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: whiteColor, 
    fontFamily: 'Montserrat-BoldItalic'
  },
  contactUsEmail: {
    fontSize: 14,
    color: whiteColor, 
    marginTop: 5,
    fontFamily: 'Montserrat-BoldItalic'
  }
});

export default MenuModal;
