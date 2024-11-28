import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';

const AgeVerificationModal = ({ onVerify }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;

  const handleYes = () => {
    onVerify();
  };

  const handleNo = () => {
    BackHandler.exitApp();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={true}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.whiteColor }]}>
          <Text style={[styles.title, { color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }]}>Are you 18 or older?</Text>
          <Text style={[styles.message, { color: colors.blackColor, fontFamily: 'Montserrat-BoldItalic' }]}>You must be 18+ to use this app.</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonYes} onPress={handleYes}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonNo} onPress={handleNo}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonYes: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonNo: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-BoldItalic'
  },
});

export default AgeVerificationModal;
