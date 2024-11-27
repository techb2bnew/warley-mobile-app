import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator, ImageBackground, Pressable, Alert, Modal } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor, } from '../constants/Color'
import {
  BY_CONTINUING_YOU_AGREE, EMAIL, PASSWORD, CONFIRM_PASSWORD, FIRST_NAME, LAST_NAME, TERM_OF_SERVICES, PRIVACY_POLICY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
  ALREADY_HAVE_AN_ACCOUNT, LOGIN, STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, STOREFRONT_ACCESS_TOKEN,
} from '../constants/Constants'
import { GOOGLE_LOGO_IMAGE, BACKGROUND_IMAGE, OTP_VERIFICATION_IMAGE, APPLE_LOGO_IMAGE } from '../assests/images'
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import LoadingModal from '../components/Modal/LoadingModal';
import SuccessModal from '../components/Modal/SuccessModal';
import { logEvent } from '@amplitude/analytics-react-native';
import PushNotification from 'react-native-push-notification';
import OTPTextInput from 'react-native-otp-textinput';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/actions/authActions';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthProvider';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import axios from 'axios';
const { flex, alignJustifyCenter, alignItemsCenter, borderWidth1, borderRadius5, resizeModeContain, flexDirectionRow, positionAbsolute, textAlign, textDecorationUnderline } = BaseStyle;

const RegisterScreen = ({ onBackToLogin, onCloseModal }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useThemes();
  const { setIsLoggedIn } = useContext(AuthContext)
  const colors = isDarkMode ? darkColors : lightColors;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    logEvent('RegisterScreen Initialized');
  }, [])

  const encodeBase64 = (input) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input;
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
      charCode = str.charCodeAt(i += 3 / 4);
      block = block << 8 | charCode;
    }
    return output;
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation
    // if (!firstName) return Alert.alert("Please Enter Your First Name");
    // if (!lastName) return Alert.alert("Please Enter Your Last Name");
    // if (!phone) return Alert.alert("Please Enter Your Phone Number");
    // if (phone.length < 10) return Alert.alert("Please Enter Your 10 Digit Phone Number");
    // if (!emailPattern.test(email)) return setEmailError("Invalid email format");
    // if (password.length < 8) return setPasswordError("Password must be at least 8 characters");
    // if (password !== confirmPassword) return setConfirmPasswordError("Passwords do not match");

    try {
      // Sign-up request
      // const response = await fetch('https://warley-thv5m.ondigitalocean.app/api/customers', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     // 'X-Shopify-Access-Token': 'YOUR_ACCESS_TOKEN'
      //   },
      //   body: JSON.stringify({
      //     first_name: firstName,
      //     last_name: lastName,
      //     email,
      //     phone: `+44${phone}`,
      //     addresses: [{ address1: null, city: null, province: null, country: null, zip: null, phone: null, default: true }],
      //     password,
      //     password_confirmation: confirmPassword
      //   })
      // });

      // const responseData = await response.json();
      // console.log("responseData:::", responseData);

      // if (responseData.message) {
      //   setError(responseData.message);
      //   setLoading(false);
      //   return;
      // }

      // // Save user details
      // await AsyncStorage.setItem('userDetails', JSON.stringify(responseData));

      // // Login request to get token
      // const loginResponse = await fetch("https://warley-thv5m.ondigitalocean.app/api/customerLogin", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({ email, password }),
      // });

      // const loginData = await loginResponse.json();
      // if (loginResponse.ok && loginData.token) {
      //   // Store the token in AsyncStorage
      //   await AsyncStorage.setItem('authToken', loginData.token);


        const formattedPhoneNumber = `+91${phone}`;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const encodedAuth = encodeBase64(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
        const fromNumber = formattedPhoneNumber.startsWith('+91') ? '+91 78891 01844' : '+44 7807 064256';

        console.log('Phone:', formattedPhoneNumber, 'Auth:', encodedAuth);

        const otpResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${encodedAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: formattedPhoneNumber,
            From: fromNumber,
            Body: `Your OTP for registering on WARLEY is: ${otp}`,
          }).toString(),
        });

        const responseData = await otpResponse.json();
        console.log('Twilio Response:', responseData);

        if (responseData.ok) {
          console.log("OTP sent successfully");
          setSessionId(otpResponse.data.Details);
          // setSessionId(otpResponse.data.data.id); 
          setShowOTP(true); // Show OTP modal
        } else {
          setError('Failed to send OTP');
        }
      // } 
      // else {
      //   setError("Login failed during signup. Please check your credentials.");
      // }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const finalizeSignUp = async () => {
    setOtpError('');

    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      // Verify OTP
      const verifyResponse = await axios.get(`https://2factor.in/API/V1/2e98b3ba-9b7f-11ef-8b17-0200cd936042/SMS/VERIFY/${sessionId}/${otp}`);

      if (verifyResponse.data.Status === 'Success') {
        dispatch(loginSuccess({ email: "user.email", password: '' }));
        Toast.show("User Registered Successfully");
        setShowOTP(false);
        onCloseModal();
        navigation.navigate('Cart');
      } else {
        setOtpError("OTP verification failed. Please try again.");
      }

    } catch (error) {
      console.log('OTP Verification Error:', error);
      setOtpError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //sign in with google
  const googleSignUp = async () => {
    logEvent('GoogleSignUp Button clicked from register screen');
    try {
      setLoading(true)
      await GoogleSignin.hasPlayServices();
      const { idToken, user } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      await AsyncStorage.setItem('userImage', user.photo);
      await AsyncStorage.setItem('authToken', idToken)
      const { email, givenName, familyName } = user;
      console.log("user:::", user)
      const isRegistered = await checkIfUserIsRegistered(user.email)
      console.log("user:::", isRegistered)
      if (isRegistered) {
        Toast.show(`User LoggedIn Succesfully from register screen`);
        navigation.navigate("Home");
        onCloseModal();
        dispatch(loginSuccess({ email: user.email, password: '' }));
        setLoading(false)
        const shopifyToken = await generateCustomerAccessToken(email, "defaultPassword");

        // Store the customer access token for future use
        if (shopifyToken) {
          console.log('customerAccessToken', shopifyToken.accessToken)
          // await AsyncStorage.setItem('customerAccessToken', shopifyToken.accessToken);

        }
      } else {
        const shopifyResponse = await registerUserToShopify({
          email: email,
          password: "defaultPassword",
          password_confirmation: "defaultPassword",
          first_name: givenName,
          last_name: familyName,
        });
        const shopifyToken = await generateCustomerAccessToken(email, "defaultPassword");

        // Store the customer access token for future use
        if (shopifyToken) {
          console.log('customerAccessToken', shopifyToken.accessToken)
          // await AsyncStorage.setItem('customerAccessToken', shopifyToken.accessToken);

        }


        await AsyncStorage.setItem('userDetails', JSON.stringify(shopifyResponse))
        await AsyncStorage.setItem('isSocialAuth', 'true');
        Toast.show(`User Registered Succesfully from register screen`);
        handleNotificationTrigger();
        navigation.navigate("Home");
        dispatch(loginSuccess({ email: user.email, password: '' }));
        onCloseModal();
        setLoading(false)
      }
      logEvent('GoogleSignUp Succesfully from register screen');
    } catch (error) {
      setLoading(false)
      console.error('Google sign up error:', error);

      logEvent(`Google sign up error:${error} from register screen`);
    }
  };

  //registerUserToShopify when user sign with google
  const registerUserToShopify = async (userData) => {
    console.log("userData", userData)
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

  const checkIfUserIsRegistered = async (email) => {
    console.log("email", email)
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

  const toggleShowPassword = () => {
    logEvent('Show Password icon click on Register Screen');
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    logEvent('Show ConfirmPassword icon click on Register Screen');
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNotificationTrigger = () => {
    PushNotification.localNotification({
      channelId: "default-channel-id",
      title: 'Welcome',
      message: 'Thank you for using our app!',
    });
  };

  async function appleSignIn() {
    console.log("working>>",);
    try {
      setLoading(true)
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
        // See: https://github.com/invertase/react-native-apple-authentication#faqs
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const {
        email,
        identityToken
      } = appleAuthRequestResponse;
      const isRegistered = await checkIfUserIsRegistered(email)
      if (isRegistered) {
        Toast.show(`User LoggedIn Succesfully`);
      }
      else {
        // Send user details to Shopify
        const shopifyResponse = await registerUserToShopify({
          email: email,
          password: "defaultPassword",
          password_confirmation: "defaultPassword",
          first_name: appleAuthRequestResponse?.fullName?.givenName,
          last_name: appleAuthRequestResponse?.fullName?.familyName,
        });
        console.log('Shopify response:', shopifyResponse);
        await AsyncStorage.setItem('userDetails', JSON.stringify(shopifyResponse))
        Toast.show(`User Registered Succesfully`);
        handleNotificationTrigger();
      }
      navigation.navigate("Home");
      await AsyncStorage.setItem('isSocialAuth', 'true');
      dispatch(loginSuccess({ email: email, password: '' }));
      setLoading(false)
      onCloseModal();
      await AsyncStorage.setItem('authToken', identityToken)
    } catch (error) {
      setLoading(false)
      console.error('Apple sign In error:', error);
      logEvent(`Apple sign In error:${error}`);
    }
  }

  const generateCustomerAccessToken = async (email, password) => {
    try {
      const response = await axios.post(
        `https://${STOREFRONT_DOMAIN}/api/2023-01/graphql.json`,
        {
          query: `
            mutation {
              customerAccessTokenCreate(input: { email: "${email}", password: "${password}" }) {
                customerAccessToken {
                  accessToken
                  expiresAt
                }
                customerUserErrors {
                  message
                  field
                }
              }
            }
          `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
          },
        }
      );
      return response.data.data.customerAccessTokenCreate.customerAccessToken;
    } catch (error) {
      console.error('Token generation failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <>
        {/* <TouchableOpacity style={[positionAbsolute, styles.backIcon]} onPress={() => { logEvent(`Back Button Pressed from Register`), navigation.goBack() }}>
              <Ionicons name={"arrow-back"} size={33} color={colors.blackColor} />
            </TouchableOpacity> */}
        <View style={[styles.logoBox, alignJustifyCenter]}>
          <Text style={[styles.text, { color: colors.blackColor }]}>Sign Up</Text>
        </View>
        <View style={[styles.textInputBox]}>
          <View style={[flexDirectionRow]}>
            <View style={{ width: "48%", marginRight: spacings.large, }}>
              <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{FIRST_NAME}</Text>
              <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                <View style={{ width: wp(7) }}>
                  <Ionicons name={"person-sharp"} size={20} color={colors.grayColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder={FIRST_NAME}
                    placeholderTextColor={colors.grayColor}
                    onChangeText={setFirstName}
                    value={firstName}
                    style={{ color: colors.blackColor }}
                  />
                </View>
              </View>
            </View>
            <View style={{ width: "48%", marginRight: spacings.large, }}>
              <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{LAST_NAME}</Text>
              <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                <View style={{ width: wp(0) }}>
                  {/* <Ionicons name={"person-sharp"} size={20} color={colors.grayColor} /> */}
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder={LAST_NAME}
                    placeholderTextColor={colors.grayColor}
                    onChangeText={setLastName}
                    value={lastName}
                    style={{ color: colors.blackColor }}
                  />
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{"Phone Number"}</Text>
          <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
            <View style={{ width: wp(7) }}>
              <MaterialCommunityIcons name={"phone"} size={20} color={colors.grayColor} />
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {/* <TextInput
                placeholder="+91"
                placeholderTextColor={colors.grayColor}
                onChangeText={setPhone}
                value={phone}
                keyboardType="phone-pad"
                style={{ color: colors.blackColor,width:"10%" }}
                maxLength={2}
              /> */}
              <TextInput
                placeholder="Enter your Phone Number"
                placeholderTextColor={colors.grayColor}
                onChangeText={setPhone}
                value={phone}
                keyboardType="phone-pad"
                style={{ color: colors.blackColor }}
                maxLength={10}
              />
            </View>
          </View>
          <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{EMAIL}</Text>
          <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
            <View style={{ width: wp(7) }}>
              <MaterialCommunityIcons name={"email-outline"} size={20} color={emailError ? redColor : colors.grayColor} />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder={"Enter your Email"}
                placeholderTextColor={colors.grayColor}
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ color: colors.blackColor }}
              />
            </View>
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <View style={[flexDirectionRow]}>
            <View style={{ width: "48%", marginRight: spacings.large, }}>
              <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{PASSWORD}</Text>
              <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                <View style={{ width: wp(7) }}>
                  <MaterialCommunityIcons name={"lock"} size={20} color={passwordError ? redColor : colors.grayColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder={"Current"}
                    placeholderTextColor={colors.grayColor}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={!showPassword}
                    style={{ color: colors.blackColor }}
                  />
                </View>
                <TouchableOpacity onPress={toggleShowPassword}>
                  <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={20} color={grayColor} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ width: "48%", marginRight: spacings.large, }}>
              <Text style={[styles.textInputHeading, { color: colors.blackColor }]}>{CONFIRM_PASSWORD}</Text>
              <View style={[styles.halfInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, { borderColor: colors.grayColor }]}>
                <View style={{ width: wp(7) }}>
                  <MaterialCommunityIcons name={"lock"} size={20} color={confirmPasswordError ? redColor : colors.grayColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder={"Confirm"}
                    placeholderTextColor={colors.grayColor}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={{ color: colors.blackColor }}
                  />
                </View>
                <TouchableOpacity onPress={toggleShowConfirmPassword}>
                  <MaterialCommunityIcons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={colors.grayColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {confirmPasswordError || passwordError || error ? <Text style={styles.errorText}>{confirmPasswordError || passwordError || error}</Text> : null}
          <Pressable style={[styles.button, alignItemsCenter, borderRadius5]} onPress={handleSignUp}>
            <Text style={styles.buttonText}>{"Register"}</Text>
          </Pressable>

          <View style={[alignJustifyCenter, {}]}>
            <View style={[flexDirectionRow, alignJustifyCenter, { width: "100%", marginVertical: 10 }]}>
              <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
              <Text style={[{ color: colors.blackColor, margin: spacings.small }, textAlign]}>{"Or"}</Text>
              <View style={{ height: 1, backgroundColor: colors.grayColor, width: "46%" }}></View>
            </View>
            <View style={[styles.socialAuthBox, alignJustifyCenter, flexDirectionRow]}>
              <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={googleSignUp}>
                <Image source={GOOGLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
              </TouchableOpacity>
              {Platform.OS === 'ios' && <TouchableOpacity style={[styles.socialButton, alignJustifyCenter]} onPress={appleSignIn}>
                <Image source={APPLE_LOGO_IMAGE} style={[{ width: wp(6), height: hp(4) }, resizeModeContain]} />
              </TouchableOpacity>}
            </View>
          </View>
          <Pressable style={[{ width: "100%" }, alignJustifyCenter]} onPress={onBackToLogin}>
            <Text style={[{ marginTop: hp(3), color: colors.blackColor }]}>{ALREADY_HAVE_AN_ACCOUNT}<Text style={[{ color: colors.redColor }]}> {LOGIN}</Text></Text>
          </Pressable>
          <View style={[positionAbsolute, alignJustifyCenter, { bottom: Platform.OS === "android" ? 0 : hp(10), width: "100%" }]}>
            <Text style={[{ color: colors.blackColor }, textAlign]}>{BY_CONTINUING_YOU_AGREE}</Text>
            <View style={[flexDirectionRow, { marginTop: 5, width: "100%" }, alignJustifyCenter]}>
              <TouchableOpacity onPress={() => {
                navigation.navigate('WebViewScreen', {
                  headerText: TERM_OF_SERVICES
                }),
                  logEvent('Terms Of Services From login');
                onCloseModal()
              }}>
                <Text style={[{ color: colors.redColor, margin: 4 }, textDecorationUnderline]}>{TERM_OF_SERVICES}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                navigation.navigate('WebViewScreen', {
                  headerText: PRIVACY_POLICY
                }),
                  logEvent('Privacy Policy From login');
                onCloseModal()
              }}>
                <Text style={[{ color: colors.redColor, margin: 4 }, textDecorationUnderline]}>{PRIVACY_POLICY}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>

      <Modal visible={showOTP} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setShowOTP(false)}
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.blackColor} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <OTPTextInput
              inputCount={6}
              handleTextChange={setOtp}
              tintColor={colors.blackColor}
              offTintColor={colors.mediumGray}
              containerStyle={styles.otpContainer}
              textInputStyle={[styles.otpInput, { color: colors.blackColor }]} />
            {otpError || error ? <Text style={styles.errorText}>{otpError || error}</Text> : null}
            <TouchableOpacity onPress={finalizeSignUp} style={[styles.button, alignItemsCenter, borderRadius5]}>
              <Text style={styles.buttonText}>Verify and Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {loading &&
        <LoadingModal visible={loading} />
      }
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    width: wp(100),
    height: hp(100)
  },
  logoBox: {
    width: "100%",
    // height: hp(5),
    marginBottom: spacings.xxxLarge
  },
  text: {
    fontSize: style.fontSizeLarge2x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },
  title: {
    fontSize: style.fontSizeLarge1x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    marginBottom: spacings.Large2x,
    color: blackColor
  },
  input: {
    width: '100%',
    height: hp(5.5),
    paddingHorizontal: spacings.xLarge,
    marginVertical: spacings.medium,
  },
  halfInput: {
    width: '100%',
    height: hp(5.5),
    paddingHorizontal: spacings.large,
    marginVertical: spacings.medium,
  },
  button: {
    width: '100%',
    backgroundColor: redColor,
    paddingVertical: spacings.xLarge,
    marginTop: spacings.ExtraLarge
  },
  buttonText: {
    color: whiteColor,
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
  },
  textInputBox: {
    width: "100%",
    height: hp(80)
  },

  errorText: {
    color: redColor
  },
  socialAuthBox: {
    width: '100%',
    // marginTop: spacings.xxLarge
  },
  socialButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: 50,
    borderWidth: .5,
    borderColor: grayColor,
    marginHorizontal: spacings.large
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor
  },
  image: {
    width: wp(70),
    height: hp(25)
  },
  otpContainer: {
    marginVertical: spacings.xLarge,
    width: "100%"
  },
  otpInput: {
    borderWidth: 1,
    fontSize: 20,
    borderRadius: 5,
    width: "14%"
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '98%' },
  modalTitle: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  }
});

export default RegisterScreen;
