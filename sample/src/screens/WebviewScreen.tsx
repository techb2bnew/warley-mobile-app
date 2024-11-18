import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';
import { whiteColor, blackColor } from '../constants/Color';
import Header from '../components/Header';
import { useRoute } from '@react-navigation/native';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
const { textAlign } = BaseStyle;
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { logEvent } from '@amplitude/analytics-react-native';

const WebviewScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute();
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  useEffect(() => {
    logEvent('WebView Screen Initialized');
  }, [])
  return (
    <View style={[styles.container, { backgroundColor: colors.whiteColor }]}>
      <Header
        backIcon={true}
        text={route?.params?.headerText}
        navigation={navigation}
      />
      {/* {route?.params?.headerText === "Terms of Services" && <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>Terms of Service for Warley Superstore App</Text>
        <Text style={[styles.subtitle, textAlign, { color: colors.blackColor }]}>Effective Date: 09-07-2024</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          By using AppCartify, you agree to these Terms of Service. If you do not agree, do not use our app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2. User Responsibilities</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Provide accurate information during registration.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Keep your account credentials secure.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Comply with all applicable laws.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3. Prohibited Activities</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● No fraudulent activities.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● No distribution of harmful software.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● No violation of intellectual property rights.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4. Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          All content on AppCartify, including text, graphics, logos, and software, is the property of AppCartify or its content suppliers and protected by intellectual property laws.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          AppCartify is not liable for any indirect, incidental, or consequential damages arising from your use of the app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          We may modify these terms at any time. Continued use of the app constitutes acceptance of the new terms.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7. Governing Law</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          These terms are governed by the laws of India.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          For any questions or concerns, please contact us at tech@base2brand.com.
        </Text>
      </ScrollView>} */}
      {/* {route?.params?.headerText === "Privacy Policy" && <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>Privacy Policy for Warley Superstore App</Text>
        <Text style={[styles.subtitle, textAlign, { color: colors.blackColor }]}>Effective Date: 09-07-2024</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1. Introduction</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          Welcome to AppCartify. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Personal Information: Name, email address, shipping address, phone number.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Payment Information: Credit card details, billing information.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Usage Data: Device information, IP address, browsing history, app usage statistics.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To process and fulfill your orders.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To provide customer support.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To improve our app and services.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● To send you promotional materials (with your consent).</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4. Data Sharing</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>We do not sell or rent your personal information to third parties. We may share data with:</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Service providers who help us operate our business.</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Legal authorities if required by law.</Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5. Data Security</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          We implement robust security measures to protect your data from unauthorized access.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6. Your Rights</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          You have the right to access, update, or delete your personal information. Contact us at [email] to exercise these rights.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7. Changes to This Policy</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          We may update this policy from time to time. We will notify you of any changes by posting the new policy on our app.
        </Text>
        <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.blackColor }]}>
          For any questions or concerns, please contact us at tech@base2brand.com.
        </Text> 
      </ScrollView>} */}
      {route?.params?.headerText === "Terms of Services" && (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>Terms of Service for Warley Superstore App</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Welcome to the Warley Superstore app. These Terms of Service govern your use of the Warley Superstore mobile application and the services provided by Warley Superstore ("we," "us," or "our"). By downloading, accessing, or using the App, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, please do not use the App.
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            By using the Warley Superstore app, you agree to these Terms of Service and our Privacy Policy. If you do not agree to these terms, you are not authorized to use the app or its services. These Terms may be updated from time to time, and your continued use of the app after any changes will constitute your acceptance of those changes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2. Use of the App</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            You agree to use the Warley Superstore app in compliance with all applicable laws and regulations. You may not use the App for any illegal or unauthorized purpose, including, but not limited to, violating intellectual property rights, distributing harmful software, or engaging in fraudulent activity.
            You agree not to interfere with or disrupt the functionality of the app or its servers, and not to engage in any activity that could harm, disable, overburden, or impair the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3. Account Registration</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            To use certain features of the app, you may be required to create an account. When you register, you agree to provide accurate, current, and complete information and to update this information as necessary. You are responsible for maintaining the confidentiality of your account and for all activities under your account.
            If you suspect any unauthorized use of your account, you must notify us immediately. Warley Superstore is not liable for any loss or damage arising from unauthorized access to your account.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4. Products and Services</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore offers a wide range of products and services through the app, including grocery items, discounts, and promotions. We strive to ensure that product details, prices, and availability are accurate, but we do not guarantee the accuracy or completeness of this information.
            All product descriptions, pricing, and promotions are subject to change without notice. Warley Superstore reserves the right to limit the quantity of items or refuse any orders at our discretion, including orders that appear to be placed by resellers or distributors.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5. Payment and Billing</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            By purchasing products or services through the Warley Superstore app, you agree to pay all applicable charges, taxes, and fees for the items or services ordered. Payments are processed through our third-party payment processor, and we do not store payment details.
            You agree to provide accurate billing information and authorize Warley Superstore to charge your account for all amounts owed. If we are unable to process your payment, we may cancel or delay your order.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6. Delivery and Shipping</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore offers delivery services for items purchased through the app. Delivery times and fees vary depending on the location and service selected. We aim to fulfill all orders as quickly as possible, but we do not guarantee specific delivery dates.
            You are responsible for ensuring that the delivery address provided is accurate and up-to-date. If a delivery cannot be completed due to an incorrect address, you may be subject to additional fees.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7. Returns and Refunds</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore offers a return and refund policy for products purchased through the app. To be eligible for a return or refund, products must be in their original condition and returned within the timeframe specified in our return policy.
            If you are not satisfied with a product or service, please contact our customer service team for assistance. Refunds are issued according to our refund policy, and may take several business days to process.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8. Intellectual Property</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            All content available through the Warley Superstore app, including text, images, logos, and trademarks, is owned by Warley Superstore or its licensors and is protected by copyright and intellectual property laws. You may not copy, reproduce, or distribute any content without express written permission from Warley Superstore.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>9. Privacy and Data Collection</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We are committed to protecting your privacy. By using the app, you consent to our collection, use, and storage of your personal information as outlined in our Privacy Policy. This includes information you provide when registering, making a purchase, or using the app.
            We may collect and process personal information, including but not limited to, contact information, transaction details, and location data, for the purpose of providing services, processing orders, and improving your app experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>10. Disclaimers and Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            The Warley Superstore app and its services are provided on an "as-is" and "as-available" basis. We make no warranties or representations regarding the availability, functionality, or reliability of the app. We do not guarantee that the app will meet your expectations or operate without interruptions or errors.
            To the fullest extent permitted by law, Warley Superstore disclaims any liability for damages arising from the use or inability to use the app, including indirect, incidental, or consequential damages.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>11. Indemnification</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            You agree to indemnify and hold harmless Warley Superstore, its affiliates, and its employees from any claims, losses, liabilities, and expenses, including legal fees, arising from your use of the app or any violation of these Terms of Service.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>12. Termination of Access</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore reserves the right to suspend or terminate your access to the app at any time, without notice, for violations of these Terms of Service or for any other reason deemed appropriate by us. Upon termination, you must immediately cease using the app and delete any copies of the app from your devices.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>13. Governing Law</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            These Terms of Service are governed by the laws of the United Kingdom. Any disputes arising from these terms will be resolved in the courts of the United Kingdom.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>14. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore reserves the right to modify or update these Terms of Service at any time. Any changes will be effective when posted in the app or on our website. You are encouraged to review these terms periodically for updates.
          </Text>
        </ScrollView>
      )}
      {route?.params?.headerText === "Privacy Policy" && (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>At Warley Superstore Privacy Policy</Text>
          {/* <Text style={[styles.subtitle, textAlign, { color: colors.blackColor }]}>Effective Date: 09-07-2024</Text> */}

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1. Introduction</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            At Warley Superstore, we take your privacy seriously and are committed to safeguarding the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our mobile application. By using the Warley Superstore app, you agree to the collection and use of your personal data in accordance with this policy.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2. Information We Collect</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Personal Information: This includes information that can be used to identify you, such as your name, email address, phone number, and billing address. You provide this information when you create an account, place an order, or contact customer support.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Transactional Information: We collect data about your purchases, including the items you buy, payment details, and transaction history. This allows us to process your orders and manage your shopping experience.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Usage Information: We collect information on how you use our app, such as device information (including device type, operating system, IP address), app usage patterns, and browsing activity within the app. This helps us enhance the app's performance and user experience.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Location Information: With your consent, we may collect location data to provide location-based services, such as showing nearby store locations or delivery options.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>We use the information we collect to provide you with an enhanced and personalized shopping experience, including:</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Account Management: To create and manage your account, process orders, and communicate with you regarding your purchases.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Order Fulfillment: To process payments, ship products, and handle returns or exchanges.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Personalized Experience: To recommend products, provide tailored promotions, and offer discounts based on your preferences and purchase history.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Customer Support: To assist with customer service inquiries, resolve issues, and respond to your feedback or requests.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● App Improvements: To improve the functionality, features, and usability of the app, making it more efficient and user-friendly.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Marketing: To send promotional materials, updates, and special offers that we think may interest you, based on your consent.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4. How We Share Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We do not sell or rent your personal information to third parties. However, we may share your information in the following situations:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Service Providers: We may share your information with third-party companies that help us operate our business, such as payment processors, delivery services, and cloud hosting providers. These partners are obligated to protect your data and only use it for the services they provide to us.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Legal Compliance: We may disclose your information if required by law or if we believe such action is necessary to comply with legal obligations, protect the rights of Warley Superstore, or ensure the safety of our users or the public.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Business Transfers: In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of the transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5. Data Security</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encrypting sensitive data and using secure servers. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6. Your Rights and Choices</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            As a user, you have certain rights regarding your personal information, including:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Access: You can request access to the personal data we hold about you.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Correction: You may request that we correct any inaccuracies in your information.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Deletion: You have the right to request the deletion of your personal data, subject to legal requirements.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>● Opt-Out: You can opt-out of receiving marketing communications by following the unsubscribe instructions in the email or by contacting us directly.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7. Cookies and Tracking Technologies</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            The Warley Superstore app uses cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device that help us remember your preferences, track your activity, and analyze how the app is used. You can manage cookie settings in your device’s settings or browser preferences. However, disabling cookies may impact certain features of the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8. Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            The Warley Superstore app is not intended for use by children under the age of 16. We do not knowingly collect or solicit personal information from children under 16. If we learn that we have inadvertently collected information from a child, we will take steps to delete that information immediately. If you believe we may have collected information from a child, please contact us.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>9. Changes to This Privacy Policy</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make updates, we will notify you by updating the "Last Updated" date at the bottom of this page. We encourage you to review this policy periodically for any changes.
          </Text>
        </ScrollView>
      )}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(100),
    // backgroundColor: whiteColor,
  },
  contentContainer: {
    padding: spacings.Large2x,
  },
  title: {
    fontSize: style.fontSizeLargeXX.fontSize,
    fontWeight: 'bold',
    // color: blackColor,
    marginBottom: spacings.Large2x,
  },
  subtitle: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.Large2x,
  },
  sectionTitle: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: 'bold',
    color: blackColor,
    marginBottom: spacings.xLarge,
  },
  paragraph: {
    fontSize: style.fontSizeNormal2x.fontSize,
    color: blackColor,
    marginBottom: spacings.xLarge,
    lineHeight: 24,
  },
});

export default WebviewScreen;
