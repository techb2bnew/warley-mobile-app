import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Switch } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style,appFonts } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor, mediumGray } from '../constants/Color';
import ConfirmationModal from '../components/Modal/ConfirmationModal'
import { DELETE, SHIPPING_ADDRESS, ORDERS, ARE_YOU_SURE_DELETE_ACCOUNT, ARE_YOU_SURE_SIGNOUT, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN } from '../constants/Constants';
import { BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE } from '../assests/images';
import Feather from 'react-native-vector-icons/dist/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import { logEvent } from '@amplitude/analytics-react-native';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import LoadingModal from '../components/Modal/LoadingModal';
import { MYADDRESS_IMAGE, MYORDER_IMAGE, MYACCOUNT_IMAGE, LOGOUT_IMAGE, DELETE_IMAGE, WHITE_MYACCOUNT_IMAGE, WHITE_MYORDER_IMAGE, WHITE_MYADDRESS_IMAGE, } from '../assests/images'
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import ChatButton from '../components/ChatButton';
const { flex, alignItemsCenter, resizeModeContain, flexDirectionRow, justifyContentSpaceBetween, resizeModeCover } = BaseStyle;

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const { setIsLoggedIn } = useContext(AuthContext)
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
  const [customerId, setCustomerId] = useState("")
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [userName, setUserName] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false)
  const { isDarkMode, toggleTheme } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;

  useEffect(() => {
    logEvent('ProfileScreen Initialized');
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchUserDetails()
      fetchImage();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      getCustomerAddress(customerId);
      fetchUserProfile(customerId);
      fetchOrders(customerId);
    }, [customerId])
  );

  //for get customer ID
  const fetchUserDetails = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails')
    if (userDetails) {
      const userDetailsObject = JSON.parse(userDetails);
      const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
      setCustomerId(userId)
    }
  };

  useEffect(() => {
    getCustomerAddress(customerId);
    fetchUserProfile(customerId);
    fetchOrders(customerId);
  }, [customerId])

  //for get customer Profile
  const fetchUserProfile = async (id) => {
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${id}.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      const customer = response?.data?.customer;
      setUserName(`${customer.first_name} ${customer.last_name}`);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  //for get customer profile Image
  const fetchImage = async () => {
    const profileImage = await AsyncStorage.getItem('userImage')
    setImage(profileImage)
  };

  //for get customer orders
  const fetchOrders = async (id) => {
    try {
      // console.log
      const response = await axios.get(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/orders.json?customer_id=${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN
          },
        }
      );
      // console.log("response.data.orders", response?.data?.orders);
      setOrders(response?.data?.orders)
    } catch (error) {
      console.log('Error fetching orders:', error);
    }
  };

  //for get customer Address
  const getCustomerAddress = async (id) => {
    try {
      const response = await axios.get(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers/${id}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          },
        }
      );
      const customer = response?.data?.customer;
      const addresses = customer?.addresses;
      setCustomerAddresses(addresses)
      return addresses;
    } catch (error) {
      console.log('Error fetching customer address:', error);
    }
  };

  //for toggle Modal
  const toggleModal = (message: string, action: () => void) => {
    setModalMessage(message);
    setConfirmAction(() => action);
    setShowModal(true);
  };

  //for SignOutAccount
  const handleSignOut = async () => {
    console.log("handleSignOut");
    setLoading(true)
    logEvent('SignOut Button Clicked');
    dispatch(logout());
    // await AsyncStorage.removeItem('userImage')
    setShowModal(false);
    setIsLoggedIn(false)
    navigation.goBack()
    // navigation.navigate('Home');
    logEvent('SignOut Success');
    setLoading(false)
  };

  //for deleteAccount
  // const handleDelete = async () => {
  //   logEvent('Delete Button Clicked');
  //   // try {
  //   //  
  //   //     `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers/${customerId}.json`,
  //   //     {
  //   //       headers: {
  //   //         'Content-Type': 'application/json',
  //   //         "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN,
  //   //       },
  //   //     }
  //   //   );
  //   //   setLoading(true)
  //   //   await AsyncStorage.removeItem('isUserLoggedIn');
  //   //   await AsyncStorage.removeItem('userImage')
  //   //   await AsyncStorage.removeItem('userDetails')
  //   //   setShowModal(false);
  //   //   setIsLoggedIn(false)
  //   //   dispatch(logout());
  //   //   navigation.navigate('HomeScreen');
  //   //   logEvent('Delete Seccess');
  //   //   setLoading(false)
  //   // } catch (error) {
  //   //   setLoading(false)
  //   //   console.log(`Error deleting customer :`, error);
  //   //   logEvent(`Error deleting customer :${error}`);
  //   // }
  // };


  // const handleDelete = async () => {
  //   logEvent('Delete Button Clicked');
  //   setLoading(true);

  //   try {
  //     // Retrieve the token from AsyncStorage
  //     const token = await AsyncStorage.getItem('authToken');
  //     if (!token) {
  //       console.error("No token found");
  //       setLoading(false);
  //       return;
  //     }

  //     // Construct the DELETE request URL with the customer ID
  //     const requestUrl = `https://warley-thv5m.ondigitalocean.app/api/deleteCustomer/${customerId}`;

  //     // Make the DELETE request using axios with Authorization header
  //     await axios.delete(requestUrl, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`, // Use token from AsyncStorage
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     // Clear user-related data from AsyncStorage
  //     await AsyncStorage.multiRemove(['isUserLoggedIn', 'userImage', 'userDetails']);

  //     // Update UI states and navigate
  //     setShowModal(false);
  //     setIsLoggedIn(false);
  //     dispatch(logout());
  //     navigation.navigate('HomeScreen');

  //     logEvent('Delete Success');
  //   } catch (error) {
  //     console.error(`Error deleting customer:`, error);
  //     logEvent(`Error deleting customer: ${error}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDelete = async () => {
    logEvent('Delete Button Clicked');
    setLoading(true);

    try {
      // Check if the user logged in via social authentication
      const isSocialAuth = await AsyncStorage.getItem('isSocialAuth'); // Assuming you store this flag during social auth

      let requestUrl = '';
      let headers = {
        'Content-Type': 'application/json',
      };

      // Handle the deletion based on the login type (social auth or normal login)
      if (isSocialAuth === 'true') {
        // If the user logged in via social auth
        requestUrl = `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers/${customerId}.json`;
        headers["X-Shopify-Access-Token"] = ADMINAPI_ACCESS_TOKEN;  // Add Shopify Access Token for social auth
      } else {
        // If the user logged in via normal API
        // Retrieve the token from AsyncStorage (only if not social auth)
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        requestUrl = `https://warley-thv5m.ondigitalocean.app/api/deleteCustomer/${customerId}`;
        headers['Authorization'] = `Bearer ${token}`; 
      }

      // Make the DELETE request using axios with appropriate headers
      await axios.delete(requestUrl, { headers });

      // Clear user-related data from AsyncStorage
      await AsyncStorage.multiRemove(['isUserLoggedIn', 'userImage', 'userDetails', 'isSocialAuth']);

      // Update UI states and navigate
      setShowModal(false);
      setIsLoggedIn(false);
      dispatch(logout());
      navigation.navigate('HomeScreen');

      logEvent('Delete Success');
    } catch (error) {
      console.error(`Error deleting customer:`, error);
      logEvent(`Error deleting customer: ${error}`);
    } finally {
      setLoading(false);
    }
  };


  const capitalizeFirstLetter = (str) => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const FallbackAvatar = ({ name }) => (
    <View style={[styles.fallbackAvatar, { borderColor: colors.grayColor }]}>
      <Text style={styles.fallbackAvatarText}>{getInitials(name)}</Text>
    </View>
  );

  const handleChatButtonPress = () => {
    logEvent('Chat button clicked in Profile Screen');
    navigation.navigate("ShopifyInboxScreen")
  };

  return (
    // <ImageBackground style={[styles.container, flex, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}>
    <View style={[styles.container, flex, { backgroundColor: colors.whiteColor }]}>
      <View style={[{ width: "100%", height: hp(7) }, flexDirectionRow, alignItemsCenter]}>
        <TouchableOpacity style={[styles.backIcon, alignItemsCenter]} onPress={() => { logEvent(`Back Button Pressed from Profile`), navigation.goBack() }}>
          <Ionicons name={"arrow-back"} size={33} color={colors.blackColor} />
        </TouchableOpacity>
        <Text style={[styles.text, { color: colors.blackColor,fontFamily: appFonts.semiBold }]}>{"Account"}</Text>
      </View>
      <View style={[styles.header, alignItemsCenter]}>
        <FallbackAvatar name={userName} />
        <Text style={[styles.username, { color: colors.blackColor }]}>{capitalizeFirstLetter(userName)}</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            logEvent(`AccountDetails Clicked userId: ${customerId}`);
            navigation.navigate("AccountDetails")
          }}>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={isDarkMode ? WHITE_MYACCOUNT_IMAGE : MYACCOUNT_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: colors.blackColor }]}>{"My Details"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={colors.blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: colors.mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            logEvent(`Orders Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: ORDERS,
              orderList: orders
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={isDarkMode ? WHITE_MYORDER_IMAGE : MYORDER_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: colors.blackColor }]}>{"My Orders"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={colors.blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: colors.mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            logEvent(`Shipping Address Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: SHIPPING_ADDRESS,
              address: customerAddresses
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={isDarkMode ? WHITE_MYADDRESS_IMAGE : MYADDRESS_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: colors.blackColor }]}>{"Address Book"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={colors.blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: colors.mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => toggleModal(ARE_YOU_SURE_DELETE_ACCOUNT, handleDelete)}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={DELETE_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: colors.blackColor }]}>{DELETE}</Text>
          </View>

        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: colors.mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => toggleModal(ARE_YOU_SURE_SIGNOUT, handleSignOut)}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={LOGOUT_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: redColor }]}>{"Logout"}</Text>
          </View>

        </TouchableOpacity>
        {showModal && <ConfirmationModal
          visible={showModal}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          message={modalMessage}
        />}
        {loading &&
          <LoadingModal visible={loading} />
        }
      </View>
      <ChatButton onPress={handleChatButtonPress} />
      {/* </ImageBackground > */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
  },
  header: {
    paddingVertical: spacings.large,
  },
  text: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    marginLeft: spacings.normalx
  },
  profileImage: {
    width: wp(30),
    height: wp(30),
    borderRadius: 100,
    borderWidth: 4,
  },
  username: {
    marginTop: spacings.large,
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    fontFamily: appFonts.semiBold
  },
  section: {
    marginTop: spacings.Large2x,
  },
  option: {
    paddingVertical: spacings.xxLarge,
    paddingRight: spacings.small,
    paddingHorizontal: spacings.xxxLarge,
    height: hp(7.5)

  },
  optionText: {
    fontSize: style.fontSizeMedium.fontSize,
    paddingLeft: spacings.xLarge,
    color: grayColor,
    fontFamily: appFonts.semiBold
  },
  backIcon: {
    width: wp(10),
    height: hp(5)
  },
  toggleButton: {
    marginRight: 10,
  },
  fallbackAvatar: {
    width: wp(30),
    height: wp(30),
    borderRadius: 100,
    alignSelf: 'center',
    backgroundColor: '#a8326b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  fallbackAvatarText: {
    fontSize: 40,
    color: '#fff',
  },
});

export default ProfileScreen;
