import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import PushNotification from 'react-native-push-notification';
import Header from '../components/Header';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import { BACKGROUND_IMAGE, DARK_BACKGROUND_IMAGE, NOTIFICTION_APP_IMG, NO_NOTIFICTION_IMG } from '../assests/images';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../utils';
import { spacings, style,appFonts } from '../constants/Fonts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';  // Import Swipeable and GestureHandlerRootView

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const { isDarkMode } = useThemes();
    const colors = isDarkMode ? darkColors : lightColors;

    const fetchNotifications = () => {
        PushNotification.getDeliveredNotifications((deliveredNotifications) => {
            console.log('Delivered Notifications:', deliveredNotifications);
            setNotifications(deliveredNotifications);
        });
    };
    // useEffect(() => {
    //     PushNotification.setApplicationIconBadgeNumber(0);  // Clear badge count when app is launched
    // }, []);
    useEffect(() => {
        fetchNotifications();
    }, []);

    const removeNotification = (id) => {
        PushNotification.removeDeliveredNotifications([id]);
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.identifier !== id)
        );
    };

    const renderNotification = ({ item }) => (
        <Swipeable
            onSwipeableRightOpen={() => removeNotification(item.identifier)}
            renderRightActions={() => (
                <View style={styles.swipeAction}>
                    <Icon name="close" size={24} color={colors.whiteColor} />
                </View>
            )}
        >
            <View style={[styles.notificationItem, { backgroundColor: isDarkMode ? colors.grayColor : colors.whiteColor, flexDirection: "row" }]}>
                <View style={{ width: wp(16), height: hp(8) }}>
                    <Image source={NOTIFICTION_APP_IMG} style={{ width: "100%", height: "100%", resizeMode: "cover", borderRadius: 10 }} />
                </View>
                <View style={{ width: "90%", paddingLeft: spacings.large, height: "100%" }}>
                    <Text style={[styles.notificationTitle, { color: colors.blackColor }]}>{item.title || 'No Title'}</Text>
                    <Text style={[styles.notificationMessage, { color: colors.blackColor }]}>{item.body || 'No Message'}</Text>
                </View>
            </View>
        </Swipeable>
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* <ImageBackground style={[styles.container, { backgroundColor: colors.whiteColor }]} source={isDarkMode ? DARK_BACKGROUND_IMAGE : BACKGROUND_IMAGE}> */}
            <View style={[styles.container, { backgroundColor: colors.whiteColor }]} >
                <Header backIcon={true} textinput={true} text={"Notifications"} navigation={navigation} />
                <View style={{ width: "100%", height: 5, backgroundColor: colors.whiteColor }}></View>
                <View style={{ padding: spacings.large }}>
                    {notifications?.length > 0 ? (
                        <FlatList
                            data={notifications}
                            renderItem={renderNotification}
                            keyExtractor={(item) => item?.identifier}
                        />
                    ) : (
                        <View style={{ alignItems: "center", justifyContent: "center", height: "90%" }}>
                            <Image source={NO_NOTIFICTION_IMG} style={{ width: wp(20), height: hp(12), resizeMode: "contain" }} />
                            <Text style={[styles.emptyText, { color: colors.blackColor }]}>No notifications available.</Text>
                            <Text style={[styles.subText, { color: colors.blackColor, marginTop: 8 }]}>
                                You will see your notifications here once available.
                            </Text>
                        </View>
                    )}
                </View>
                {/* </ImageBackground> */}
            </View>
        </GestureHandlerRootView>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:"#fff"
    },
    notificationItem: {
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
        borderColor: "#d9d9d9",
        borderWidth: .5,
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
         fontFamily: appFonts.semiBold
    },
    notificationMessage: {
        fontSize: 16,
        color: '#555',
         fontFamily: appFonts.semiBold
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
         fontFamily: appFonts.semiBold
    },
    subText: {
        textAlign: 'center',
        fontSize: 14,
         fontFamily: appFonts.semiBold
    },
    swipeAction: {
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
        width: wp(10),
        height: '100%',
        borderRadius: 8,
    },
});
