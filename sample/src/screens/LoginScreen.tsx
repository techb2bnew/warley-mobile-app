import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ImageBackground, Pressable } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';
import { spacings, style, appFonts } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, lightBlueColor, redColor } from '../constants/Color'
import {
  LOGIN, REGISTER, DONT_HAVE_AN_ACCOUNT, PASSWORD_MUST_BE_AT, INVALID_EMAIL_FORMAT, PLEASE_FILL_ALL_FIELD, EMAIL, PASSWORD, BY_CONTINUING_YOU_AGREE, getAdminAccessToken,
  getStoreDomain, WEBCLIENT_ID_FOR_GOOGLE_LOGIN, FORGET_PASSWORD, REMEMBER_ME, TERM_OF_SERVICES, PRIVACY_POLICY, CONTENT_POLICY, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN,
  PRIVACY_POLICY_URL, TERM_OF_SERVICES_URL, CONTENT_POLICY_URL
} from '../constants/Constants'
import { GOOGLE_LOGO_IMAGE, FACEBOOK_LOGO_IMAGE, BACKGROUND_IMAGE, MORE_DOTS_IMAGE, APPLE_LOGO_IMAGE } from '../assests/images'
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/dist/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthProvider';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, loginSuccess, loginFailure } from '../redux/actions/authActions';
import LoadingModal from '../components/Modal/LoadingModal';
import { logEvent } from '@amplitude/analytics-react-native';
import PushNotification from 'react-native-push-notification';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { useNavigation } from '@react-navigation/native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { STOREFRONT_ACCESS_TOKEN } from '@env';
import axios from 'axios';
const { flex, alignJustifyCenter, alignItemsCenter, borderWidth1, borderRadius5, textDecorationUnderline, resizeModeContain, flexDirectionRow,
  positionAbsolute, textAlign, justifyContentSpaceBetween } = BaseStyle;

const LoginScreen = ({ handleSignUpClick, onCloseModal }) => {
  const navigation = useNavigation();
  const { setIsLoggedIn } = useContext(AuthContext)
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const webClientId = WEBCLIENT_ID_FOR_GOOGLE_LOGIN;
  // Retrieve wishlist from Redux
  const wishlistObject = useSelector(state => state.wishlist); // Use useSelector to get wishlist
  const wishList = wishlistObject?.wishlist  // Default to an empty array if wishlist is undefined

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: webClientId,
    })
    logEvent('Login Screen Initialized');
  }, [])

  const toggleShowPassword = () => {
    logEvent('Show Password icon click on Login Screen');
    setShowPassword(!showPassword);
  };

  //triggred notification
  const handleNotificationTrigger = () => {
    PushNotification.localNotification({
      channelId: "default-channel-id",
      title: 'Welcome',
      message: 'Thank you for using our app!',
    });
  };

  //Log in with user Details
  // const handleLogin = async () => {
  //   logEvent('Login Button clicked');
  //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   // if (!email || !password) {
  //   //   setEmailError(PLEASE_FILL_ALL_FIELD);
  //   //   logEvent(PLEASE_FILL_ALL_FIELD);
  //   //   setPasswordError('');
  //   //   return;
  //   // }

  //   if (!emailPattern.test(email)) {
  //     setEmailError(INVALID_EMAIL_FORMAT);
  //     logEvent(INVALID_EMAIL_FORMAT);
  //     setPasswordError('');
  //     return;
  //   }
  //   if (password.length < 8) {
  //     setEmailError('');
  //     logEvent(PASSWORD_MUST_BE_AT);
  //     setPasswordError(PASSWORD_MUST_BE_AT)
  //     return;
  //   }
  //   if (!rememberMe) {
  //     Toast.show('Please select the "Remember Me" checkbox');
  //     return;
  //   }
  //   try {
  //     const response = await fetch(`https://warley-thv5m.ondigitalocean.app/api/customerLogin`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     setLoading(true)
  //     dispatch(loginRequest({ email, password }));
  //     if (response.ok) {
  //       await checkIfUserIsRegistered(email)
  //       await AsyncStorage.setItem('isUserLoggedIn', response.url)
  //       setIsLoggedIn(true)
  //       navigation.navigate("Cart");
  //       onCloseModal()
  //       // handleSignUpClick()
  //       dispatch(loginSuccess({ email, password }));
  //       setLoading(false)
  //       logEvent('LoginSuccess');
  //       handleNotificationTrigger();
  //     } else {
  //       const responseData = await response.json();
  //       setPasswordError(responseData.message)
  //       setLoading(false)
  //       dispatch(loginFailure(responseData.message));
  //       logEvent(`LoginFailure ${responseData.message}`);
  //     }
  //   } catch (error) {
  //     setPasswordError(error.message || 'An unexpected error occurred')
  //     console.log('Error activating account:', error);
  //     dispatch(loginFailure(error));
  //     logEvent(`LoginFailure: ${error}`);
  //   }
  // };

  const handleLogin = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email && !password) {
      setEmailError('Email is required.');
      setPasswordError('Password is required.');
      logEvent('BothFieldsEmpty');
      return;
    }
    if (!emailPattern.test(email)) {
      setEmailError('Invalid email format. Please enter a valid email address.');
      logEvent(INVALID_EMAIL_FORMAT);
      setPasswordError('');
      return;
    }
    if (!password) {
      setEmailError('');
      setPasswordError('Password is required.');
      logEvent('BothFieldsEmpty');
      return;
    }
    if (password.length < 8) {
      setEmailError('');
      logEvent(PASSWORD_MUST_BE_AT);
      setPasswordError(PASSWORD_MUST_BE_AT)
      return;
    }
    if (!rememberMe) {
      Toast.show('Please select the "Remember Me" checkbox to proceed.');
      return;
    }
    const raw = JSON.stringify({
      email: email,
      password: password
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    setLoading(true);
    dispatch(loginRequest({ email, password }));
    logEvent('Login Button clicked');

    fetch("https://warley-thv5m.ondigitalocean.app/api/customerLogin", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json().then((data) => {
            const token = data.token;
            console.log("token", token)
            // Store token in AsyncStorage
            return AsyncStorage.setItem('authToken', token)
              .then(() => {
                return checkIfUserIsRegistered(email)
                  .then(() => {
                    AsyncStorage.setItem('isUserLoggedIn', response.url)
                      .then(() => {
                        setIsLoggedIn(true);
                        navigation.navigate("Cart");
                        onCloseModal();
                        dispatch(loginSuccess({ email, password }));
                        logEvent('LoginSuccess');
                        handleNotificationTrigger();
                        setLoading(false);
                      })
                      .catch((error) => {
                        console.error('AsyncStorage error:', error);
                        setLoading(false);
                      });
                  })
                  .catch((error) => {
                    console.error('User registration check error:', error);
                    setLoading(false);
                  });
              })
              .catch((error) => {
                console.error('Error storing token:', error);
                setLoading(false);
              });
          });
        } else {
          return response.json().then((responseData) => {
            setPasswordError(responseData.message);
            dispatch(loginFailure(responseData.message));
            logEvent(`LoginFailure ${responseData.message}`);
            setLoading(false);
          });
        }
      })
      .catch((error) => {
        setPasswordError(error.message || 'An unexpected error occurred');
        console.error('Fetch error:', error);
        dispatch(loginFailure(error));
        logEvent(`LoginFailure: ${error}`);
        setLoading(false);
      });
  };

  const checkIfUserIsRegistered = async (email) => {
    // console.log("checkIfUserIsRegistered", email)
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const customers = responseData.customers;
        // console.log("customer", customers)
        // Check if any customer matches the provided email
        const customer = customers.find(customer => customer.email === email);

        if (customer) {
          await AsyncStorage.setItem('userDetails', JSON.stringify(customer));
          return true;
        } else {
          return false;
        }
      } else {
        throw new Error('Failed to fetch customers from Shopify');
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  };


  // const func = () => {

  //   const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");

  //   const raw = JSON.stringify({
  //     "email": "lalib2b@gmail.com",
  //     "password": "12345678"
  //   });

  //   const requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //     redirect: "follow"
  //   };

  //   fetch("https://warley-thv5m.ondigitalocean.app/api/customerLogin", requestOptions)
  //     .then((response) => response.text())
  //     .then((result) => console.log("ffffffff",result))
  //     .catch((error) => console.error(error));
  // }


  // useEffect(() => {
  //   func()
  // }, [])

  //register user on shopify
  const registerUserToShopify = async (userData) => {
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2023-10/customers.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        },
        body: JSON.stringify({ customer: userData }),
      });
      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json(); // Capture error details from Shopify
        console.error('Error data:', errorData);
        throw new Error('Failed to register user on Shopify');
      }
    } catch (error) {
      console.error('Error registering user on Shopify:', error);
      throw error;
    }
  };

  //login with google
  const googleSignIn = async () => {
    logEvent('GoogleSignUp Button clicked');
    try {
      setLoading(true)
      await GoogleSignin.hasPlayServices();
      const { idToken, user } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      await AsyncStorage.setItem('userImage', user.photo)
      await AsyncStorage.setItem('authToken', idToken)
      const { email, givenName, familyName } = user;

      const isRegistered = await checkIfUserIsRegistered(user.email);
      // console.log("isRegistered", isRegistered);

      if (isRegistered) {
        Toast.show(`User LoggedIn Succesfully`);
      }
      else {
        // Send user details to Shopify
        const shopifyResponse = await registerUserToShopify({
          email: email,
          password: "defaultPassword",
          password_confirmation: "defaultPassword",
          first_name: givenName,
          last_name: familyName,
        });
        await AsyncStorage.setItem('userDetails', JSON.stringify(shopifyResponse))
        Toast.show(`User Registered Succesfully`);
        handleNotificationTrigger();
      }
      navigation.navigate("Home");
      await AsyncStorage.setItem('isSocialAuth', 'true');
      dispatch(loginSuccess({ email: user.email, password: '' }));
      onCloseModal();
      setLoading(false)
      logEvent('GoogleSignIn Succesfully');
    } catch (error) {
      setLoading(false)
      console.error('Google sign In error:', error);
      logEvent(`Google sign In error:${error}`);
    }
  };

  async function appleSignIn() {
    // console.log("working>>");
    try {
      setLoading(true);
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const { email, identityToken } = appleAuthRequestResponse;
      // console.log(
      //   "appleAuthRequestResponse>>::",
      //   appleAuthRequestResponse,
      //   appleAuthRequestResponse.email,
      //   appleAuthRequestResponse.fullName
      // );

      const isRegistered = await checkIfUserIsRegistered(email);
      if (isRegistered) {
        Toast.show(`User Logged In Successfully`);
      } else {
        const shopifyResponse = await registerUserToShopify({
          email: email,
          password: "defaultPassword",
          password_confirmation: "defaultPassword",
          first_name: appleAuthRequestResponse?.fullName?.givenName,
          last_name: appleAuthRequestResponse?.fullName?.familyName,
        });
        // console.log("Shopify response:", shopifyResponse);
        await AsyncStorage.setItem("userDetails", JSON.stringify(shopifyResponse));
        Toast.show(`User Registered Successfully`);
        handleNotificationTrigger();
      }
      navigation.navigate("Home");
      await AsyncStorage.setItem('isSocialAuth', 'true');
      dispatch(loginSuccess({ email: email, password: "" }));
      setLoading(false);
      onCloseModal();
      await AsyncStorage.setItem('authToken', identityToken);
    } catch (error) {
      setLoading(false);
      console.error("Apple Sign In error:", error);
      Toast.show("Apple Sign In failed. Please try again.");
      logEvent(`Apple sign In error:${error}`);
    }
  }


  return (
    <KeyboardAvoidingView
      style={[styles.container, flex]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.logoBox, alignJustifyCenter]}>
        <Text style={[styles.text, { color: colors.blackColor }]}>Log In</Text>
      </View>
      <View style={[styles.textInputBox]}>
        <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{EMAIL}</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: emailError ? redColor : grayColor }]}>
          <View style={{ width: wp(9) }}>
            <Fontisto name={"email"} size={20} color={emailError ? redColor : colors.grayColor} />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder={"Enter your Email"}
              placeholderTextColor={colors.grayColor}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) {
                  setEmailError('');
                }
              }}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ color: colors.blackColor, fontFamily: appFonts.semiBold, fontSize: 12 }}
            />
          </View>
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{PASSWORD}</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: passwordError ? redColor : grayColor }]}>
          <View style={{ width: wp(7) }}>
            <MaterialCommunityIcons name={"lock"} size={20} color={passwordError ? redColor : colors.grayColor} />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder={"Enter your Password"}
              placeholderTextColor={colors.grayColor}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) {
                  setPasswordError('');
                }
              }}
              value={password}
              secureTextEntry={!showPassword}
              style={{ color: colors.blackColor, fontFamily: appFonts.semiBold, fontSize: 12 }}
            />
          </View>
          <TouchableOpacity onPress={toggleShowPassword}>
            <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={20} color={colors.grayColor} />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        <View style={[{ width: "100%", height: hp(5) }, flexDirectionRow, justifyContentSpaceBetween]}>
          <View style={[flexDirectionRow, alignItemsCenter, { height: hp(3.3) }]}>
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
              {rememberMe ? <Fontisto name="toggle-on" size={25} color={colors.redColor} />
                : <Fontisto name="toggle-off" size={25} color={colors.grayColor} />}
            </TouchableOpacity>
            <Text style={[{ color: colors.blackColor, paddingHorizontal: 4, fontFamily: appFonts.semiBold, fontSize: 12 }]}>{REMEMBER_ME}</Text>
          </View >
          <TouchableOpacity
            onPress={() => { navigation.navigate("ForgetPasswordScreen"), onCloseModal() }}
            style={{ marginTop: 5 }}
          >
            <Text style={[{ color: redColor, fontFamily: appFonts.semiBold, fontSize: 12 }]}>{FORGET_PASSWORD}</Text>
          </TouchableOpacity>
        </View>
        <Pressable style={[styles.button, alignItemsCenter, borderRadius5]} onPress={handleLogin}>
          <Text style={styles.buttonText}>{LOGIN}</Text>
        </Pressable>

        <View style={[flexDirectionRow, alignJustifyCenter, { width: "100%", marginTop: spacings.large }]}>
          <Text style={[{ color: redColor, marginVertical: spacings.xxxxLarge, marginHorizontal: spacings.small, fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize }, textAlign]}>
            Login required to access products information and complete your purchase.
          </Text>
        </View>
        {/* <View style={[flexDirectionRow, alignJustifyCenter, { width: "100%", marginTop: spacings.large }]}>
          <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
          <Text style={[{ color: colors.blackColor, marginVertical: spacings.xxxxLarge, marginHorizontal: spacings.small ,fontFamily: 'Montserrat-BoldItalic',fontSize: style.fontSizeSmall1x.fontSize}, textAlign]}>or</Text>
          <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
        </View>
        <View style={[styles.socialAuthBox, alignJustifyCenter, flexDirectionRow]}>
          <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={googleSignIn}>
            <Image source={GOOGLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
          </TouchableOpacity>
          {Platform.OS === 'ios' && <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={appleSignIn}>
            <Image source={APPLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
          </TouchableOpacity>}
        </View> */}
        <Pressable style={[{ width: "100%" }, alignJustifyCenter]} onPress={() => handleSignUpClick()}>
          <Text style={[{ marginTop: hp(7), color: colors.blackColor, fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize }]}>{DONT_HAVE_AN_ACCOUNT}<Text style={[{ color: colors.redColor }]}> {REGISTER}</Text></Text>
        </Pressable>
        <View style={[positionAbsolute, alignJustifyCenter, { bottom: Platform.OS === "android" ? 0 : hp(10), width: "100%" }]}>
          <Text style={[{ color: colors.blackColor, fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize }, textAlign]}>{BY_CONTINUING_YOU_AGREE}</Text>
          <View style={[flexDirectionRow, { marginTop: spacings.large, width: "100%" }, alignJustifyCenter]}>
            <TouchableOpacity onPress={() => {
              navigation.navigate('WebViewScreen', {
                headerText: TERM_OF_SERVICES
              }),
                logEvent('Terms Of Services From login');
              onCloseModal()
            }}>
              <Text style={[{ color: colors.redColor, margin: 4, fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize }, textDecorationUnderline]}>{TERM_OF_SERVICES}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              navigation.navigate('WebViewScreen', {
                headerText: PRIVACY_POLICY
              }),
                logEvent('Privacy Policy From login');
              onCloseModal()
            }}>
              <Text style={[{ color: colors.redColor, margin: 4, fontFamily: appFonts.semiBold, fontSize: style.fontSizeSmall1x.fontSize }, textDecorationUnderline]}>{PRIVACY_POLICY}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
      {loading &&
        <LoadingModal visible={loading} />
      }
    </KeyboardAvoidingView >
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: whiteColor
  },
  text: {
    fontSize: style.fontSizeLarge3x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    fontFamily: appFonts.semiBold
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
    fontFamily: appFonts.semiBold
  },
  input: {
    width: '100%',
    height: hp(5),
    borderColor: grayColor,
    paddingHorizontal: spacings.xLarge,
    marginVertical: spacings.large,
  },
  button: {
    width: '100%',
    backgroundColor: redColor,
    paddingVertical: spacings.xLarge,
    marginTop: spacings.Large1x
  },
  buttonText: {
    color: whiteColor,
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    fontFamily: appFonts.semiBold
  },
  textInputBox: {
    width: "100%",
    height: hp(75)
  },
  logoBox: {
    width: "100%",
    height: hp(12),
    // marginTop: spacings.Large1x
  },
  errorText: {
    color: redColor,
    fontFamily: appFonts.semiBold,
    fontSize: 9
  },
  backIcon: {
    top: 15,
    left: 10,
    width: wp(10),
    height: hp(5)
  },
  socialAuthBox: {
    width: '100%',
  },
  socialButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: 50,
    borderWidth: .5,
    borderColor: grayColor,
    marginHorizontal: spacings.large
  }
});

export default LoginScreen;
