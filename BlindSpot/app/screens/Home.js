import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';
import CalendarDay from '../../components/CalendarDay';

function Home() {
    const navigation = useNavigation();
    const { userType, theme } = useContext(AppContext);

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    const calculateDayWidth = () => {
        const containerPadding = 10 * 2;
        const outerMargins = 5 * 2;
        const innerMargins = 2 * 6;
        const availableWidth = screenWidth - 40 - containerPadding - outerMargins - innerMargins;
        return Math.floor(availableWidth / 7);
    };

    const currentDate = new Date();
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));

    const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return date;
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(Dimensions.get('window').width);
            setScreenHeight(Dimensions.get('window').height);
        };

        const subscription = Dimensions.addEventListener('change', handleResize);

        return () => {
            subscription.remove();
        };
    }, []);

    // Check if two dates are the same day
    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerBox}>
                    <Text style={[styles.headerText, { fontFamily: theme.fonts.regular }]}>Welcome Back, Liz</Text>
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Image 
                            source={require('../../assets/images/profile.png')}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.main}>
                <Text style={[styles.mainText, { fontFamily: theme.fonts.bold}]}>Schedule</Text>
                <View style={styles.thisWeekCalendar}>
                    <Text style={styles.cardTitle}>THIS WEEK</Text>
                    <View style={styles.calendarRow}>
                        {weekDates.map((date, index) => (
                            <CalendarDay
                                key={index}
                                dayIndex={index}
                                dayNum={date.getDate()}
                                colorDefault='white'
                                colorSelect='#6A0DAD'
                                widthSize={calculateDayWidth()}
                                fontSizeDayName={12}
                                fontSizeDayNum={20}
                                isSelected={isSameDay(date, currentDate)}
                            />
                        ))}
                    </View>
                </View>
                <View style={styles.upcomingEvents}>
                    <Text style={styles.cardTitle}>UPCOMING EVENTS</Text>
                </View>
            </View>
            <Navbar navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E4D8EB',
    },
    header: {
        height: Math.min(42, Dimensions.get('window').height * 0.05),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 5,
        marginTop: 10,
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerText: {
        fontSize: 15,
        color: 'black',
    },
    profileButton: {
        height: 42,
        width: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    profileImage: {
        height: '100%',
        width: '100%',
        borderRadius: 21,
        borderWidth: 1,
    },
    main: {
        flex: 1,
        backgroundColor: '#E4D8EB',
        marginHorizontal: 20,
    },
    mainText: {
        fontSize: 40,
        color: 'black',
        textAlign: 'left',
        textDecorationLine: 'underline',
    },
    thisWeekCalendar: {
        height: 150,
        width: '100%',
        backgroundColor: '#B39CD0',
        borderRadius: 15,
        marginVertical: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 5,
    },
    cardTitle: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    upcomingEvents: {
        height: 350,
        width: '100%',
        backgroundColor: '#C3A6D8',
        borderRadius: 15,
        marginVertical: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
export default Home;