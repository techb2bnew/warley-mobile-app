import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors, redColor } from '../constants/Color';

const ChatButton = ({ bottom, phoneNumber = '+447377097972', message = 'Hello!' }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;

  const handlePress = () => {
    const whatsappURL = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappURL).catch((error) => {
      Alert.alert('Error', 'Unable to open WhatsApp. Please ensure it is installed on your device.');
      console.error('Error opening WhatsApp:', error);
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.chatButton,
        { backgroundColor:"#25D366", bottom: bottom || 20 },
      ]}
      onPress={handlePress}
    >
      <Icon name="logo-whatsapp" size={25} color={colors.whiteColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    right: 20,
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    zIndex: 99999,
  },
});

export default ChatButton;
