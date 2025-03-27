import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
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
      {route?.params?.headerText === "Terms of Services" && (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>Terms of Service</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1) Introduction</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Welcome to the Warley Superstore. These Terms of Service govern your use of the Warley Superstore website and application and the services provided by Warley Superstore ("we," "us," or "our"). By downloading, accessing, or using the website and app, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, please do not use the website and app.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2) Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            By using the Warley Superstore Website & App, you acknowledge and accept these Terms of Service and our Privacy Policy. If you do not agree, you are not authorized to use the website, app or its services. These Terms may be updated periodically, and your continued use of the website and app after any changes will constitute your acceptance of the revised Terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3) Use of Website and App</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            You agree to use the Warley Superstore Website and App in compliance with all applicable laws and regulations. You may not use the website or app for any illegal or unauthorized purpose, including but not limited to:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Violating intellectual property rights.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Distributing harmful software (malware, viruses, etc.).</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Engaging in fraudulent activity.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Interfering with or disrupting the functionality of the website and app or its servers.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Engaging in any activity that could harm, disable, overburden, or impair the website and app.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4) Account Registration</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            To use certain features of the website or app, you may need to create an account. By registering, you agree to:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Provide accurate, current, and complete information.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Update your information as necessary.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Maintain the confidentiality of your account credentials.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Be responsible for all activities conducted under your account.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            If you suspect any unauthorized use of your account, you must notify us immediately. Warley Superstore is not liable for any loss or damage arising from unauthorized access to your account.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5) Products and Services</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore offers a wide range of products and services through the website and app, including:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Groceries</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Discounts and Promotions</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Special Offers</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We strive to ensure that product details, prices, and availability are accurate, but we do not guarantee the accuracy or completeness of this information.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            All product descriptions, pricing, and promotions are subject to change without notice. We reserve the right to limit quantities or refuse orders at our discretion, including those that appear to be placed by resellers or distributors.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6) Payment and Billing</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            By purchasing products or services through the Warley Superstore Website or App, you agree to:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Pay all applicable charges, taxes, and fees for your purchases.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Provide accurate billing information.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Authorize Warley Superstore to charge your account for all amounts owed.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Payments are processed through our third-party payment processor, and we do not store payment details. If we are unable to process your payment, we may cancel or delay your order.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7) Delivery and Shipping</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore offers delivery services for items purchased through the website or app.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Delivery times and fees vary depending on location and service selected.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• We aim to fulfill all orders as quickly as possible but do not guarantee specific delivery dates.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• You are responsible for providing an accurate delivery address.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• If a delivery cannot be completed due to an incorrect address, you may be subject to additional fees.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8) Returns and Refunds</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore offers a return and refund policy for eligible products.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>To qualify for a return or refund, items must be:</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• In their original condition.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Returned within the specified timeframe outlined in our Return Policy.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            If you are dissatisfied with a product or service, please contact our customer service team for assistance. Refunds are processed based on our Refund Policy and may take several business days.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>9) Intellectual Property</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            All content available through the Warley Superstore Website and App, including:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Text</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Images</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Logos</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Trademarks</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            is owned by Warley Superstore or its licensors and is protected by copyright and intellectual property laws. You may not copy, reproduce, or distribute any content without express written permission.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>10) Privacy and Data Collection</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We are committed to protecting your privacy. By using the website or app, you consent to our collection, use, and storage of your personal information as outlined in our Privacy Policy.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>This includes information you provide when:</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Registering an account.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Making a purchase.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Using the website or app.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>We may collect and process personal information, including:</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Contact details.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Transaction details.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Location data.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            This information helps us provide services, process orders, and improve your app experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>11) Disclaimers and Limitations of Liability</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            The Warley Superstore Website or App and its services are provided on an "as-is" and "as-available" basis.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>We do not guarantee:</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• The availability, functionality, or reliability of the app.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• That the app will meet your expectations without interruptions or errors.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            To the fullest extent permitted by law, Warley Superstore disclaims any liability for damages arising from the use or inability to use the app, including indirect, incidental, or consequential damages.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>12) Indemnification</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            You agree to indemnify and hold harmless Warley Superstore, its affiliates, and employees from any claims, losses, liabilities, and expenses, including legal fees, arising from:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Your use of the website or app.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Any violation of these Terms of Service.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>13) Termination of Access</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore reserves the right to suspend or terminate your access to the app at any time, without notice, for violations of these Terms of Service or for any other reason deemed appropriate.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Upon termination, you must immediately cease using the app and delete any copies of the app from your devices.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>14) Governing Law</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            These Terms of Service are governed by the laws of the United Kingdom. Any disputes arising from these terms will be resolved in the courts of the United Kingdom.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>15) Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Warley Superstore reserves the right to modify or update these Terms of Service at any time. Any changes will be effective immediately when posted in the app or on our website.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We encourage users to review these terms periodically for updates.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>16) Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            If you have any questions about these Terms of Service, please contact us:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>📧 Email: info@warleysuperstore.com</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>🌐 Website: www.warleysuperstore.com</Text>
        </ScrollView>
      )}
      {route?.params?.headerText === "Privacy Policy" && (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, textAlign, { color: colors.blackColor }]}>Warley Superstore Privacy Policy</Text>

          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            At Warley Superstore, we take your privacy seriously and are committed to safeguarding the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our mobile application.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            By using the Warley Superstore App, you agree to the collection and use of your personal data in accordance with this policy.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1) Information We Collect</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            When you use the Warley Superstore App, we may collect the following types of information:
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1.1 Personal Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            This includes information that can be used to identify you, such as:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Name</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Email Address</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Phone Number</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Billing Address</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            You provide this information when you create an account, place an order, or contact customer support.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1.2 Transactional Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We collect data about your purchases, including:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Items bought</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Payment details</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Transaction history</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            This allows us to process your orders and manage your shopping experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1.3 Usage Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We collect information on how you use our app, such as:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Device information (device type, operating system, IP address)</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• App usage patterns</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Browsing activity within the app</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            This helps us enhance the app's performance and user experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>1.4 Location Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            With your consent, we may collect location data to provide location-based services, such as:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Showing nearby store locations</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Delivery options</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>2) How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We use the information we collect to enhance and personalize your shopping experience, including:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Account Management: Creating and managing your account, processing orders, and communicating with you.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Order Fulfillment: Processing payments, shipping products, and handling returns or exchanges.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Personalized Experience: Recommending products, offering tailored promotions, and providing discounts based on your preferences.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Customer Support: Assisting with service inquiries, resolving issues, and responding to feedback.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• App Improvements: Enhancing functionality, features, and usability.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Marketing: Sending promotional materials, updates, and special offers (with your consent).</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3) How We Share Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We do not sell or rent your personal information to third parties. However, we may share your information in the following situations:
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3.1 Service Providers</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We may share your information with third-party companies that help us operate our business, such as:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Payment processors</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Delivery services</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Cloud hosting providers</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            These partners are obligated to protect your data and only use it for the services they provide to us.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3.2 Legal Compliance</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We may disclose your information if required by law or if we believe such action is necessary to:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Comply with legal obligations.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Protect the rights of Warley Superstore.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Ensure the safety of our users or the public.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>3.3 Business Transfer</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>4) Data Security</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We implement robust security measures to protect your personal information from:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Unauthorized access</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Alteration</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Disclosure</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Destruction</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            This includes encryption of sensitive data and secure servers. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>5) Your Rights and Choices</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            As a user, you have certain rights regarding your personal information, including:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Access: Request access to the personal data we hold about you.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Correction: Request corrections to any inaccurate information.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Deletion: Request the deletion of your personal data (subject to legal requirements).</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Opt-Out: Unsubscribe from marketing communications by following the instructions in the email or contacting us directly.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            To exercise any of these rights, please contact us either by filling out the CONTACT FORM or via email (info@warleysuperstore.com)
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6) Cookies and Tracking Technologies</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            The Warley Superstore App uses cookies and similar tracking technologies to enhance your experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6.1 What Are Cookies?</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            Cookies are small data files stored on your device that help us:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Remember your preferences.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Track your activity.</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Analyze app usage.</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>6.2 Managing Cookies?</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            You can manage cookie settings in your device's settings or browser preferences. However, disabling cookies may impact certain features of the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>7) Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            The Warley Superstore App is not intended for children under the age of 16. We do not knowingly collect or solicit information from children under 16.
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            If we learn that we have inadvertently collected information from a child, we will take steps to delete it immediately. If you believe we may have collected information from a child, please contact us.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8) Changes to This Privacy Policy</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            We may update this Privacy Policy from time to time to reflect changes in:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Our practices</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Legal requirements</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>• Operational needs</Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>8.1 Notification of Changes</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            When updates occur, we will notify you by updating the "Last Updated" date at the bottom of this page. We encourage you to review this policy periodically for any changes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.blackColor }]}>9) Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          </Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>📧 Email: info@warleysuperstore.com</Text>
          <Text style={[styles.paragraph, { color: colors.blackColor }]}>🌐 Website: www.warleysuperstore.com</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: Platform.OS === "android" ? hp(94) : hp(86),
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
