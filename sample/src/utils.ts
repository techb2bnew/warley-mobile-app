import env from 'react-native-config';
import { NativeModules, Platform, Dimensions, PixelRatio } from 'react-native';
import { AppConfig } from './context/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {
  EMAIL,
  ADDRESS_1,
  ADDRESS_2,
  CITY,
  COMPANY,
  COUNTRY,
  FIRST_NAME,
  LAST_NAME,
  PROVINCE,
  ZIP,
  PHONE,
} = env;

export function createBuyerIdentityCartInput(appConfig: AppConfig) {
  if (!appConfig.prefillBuyerInformation) {
    return {};
  }

  return {
    buyerIdentity: {
      email: EMAIL,
      deliveryAddressPreferences: {
        deliveryAddress: {
          address1: ADDRESS_1,
          address2: ADDRESS_2,
          city: CITY,
          company: COMPANY,
          country: COUNTRY,
          firstName: FIRST_NAME,
          lastName: LAST_NAME,
          phone: PHONE,
          province: PROVINCE,
          zip: ZIP,
        },
      },
    },
  };
}

export function getLocale(): string {
  const fallbackLocale = 'en_CA';

  return (
    (Platform.OS === 'ios'
      ? NativeModules.SettingsManager?.settings.AppleLocale ||
      NativeModules.SettingsManager?.settings.AppleLanguages[0]
      : NativeModules.I18nManager?.localeIdentifier) ?? fallbackLocale
  );
}

export function currency(amount?: string, currency?: string): string {
  if (typeof amount === 'undefined' && typeof currency === 'undefined') {
    return '';
  }

  const currencyCode = currency ? ` ${currency}` : '';

  try {
    const locale = getLocale();
    return (
      new Intl.NumberFormat(locale.replace(/_/, '-'), {
        style: 'currency',
        currency: currency,
      }).format(Number(amount ?? 0)) + currencyCode
    );
  } catch (error) {
    return `${Number(amount ?? 0).toFixed(2)}` + currencyCode;
  }
}


export const widthPercentageToDP = widthPercent => {
  const screenWidth = Dimensions.get('window').width;
  const elemWidth = parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

export const heightPercentageToDP = heightPercent => {
  const screenHeight = Dimensions.get('window').height;
  const elemHeight = parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};


