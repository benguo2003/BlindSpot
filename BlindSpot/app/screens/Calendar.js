import React, {useContext, useEffect, useState} from 'react';
import AppContext from '../../contexts/appContext';

import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {Calendar as RNCalendar, CalendarList, Agenda} from 'react-native-calendars';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';


function Calendar() {
    const navigation = useNavigation();
    const { userType, theme } = useContext(AppContext);

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    const [selected, setSelected] = useState('');


    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(Dimensions.get('window').width);
            setScreenHeight(Dimensions.get('window').height);
        };
    
        // Dimensions.addEventListener now returns a subscription object
        const subscription = Dimensions.addEventListener('change', handleResize);
    
        return () => {
            // Call the remove method on the subscription object to remove the event listener
            subscription.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerBox}>
                    <Text style = {[styles.headerText, {fontFamily: theme.fonts.regular}]}>Calendar</Text>
                    <TouchableOpacity 
                        style = {styles.LogoContainer}
                        onPress = {() => navigation.navigate('SignIn')}
                        >
                            <Image source = {Logo} style = {styles.LogoImage} />
                    </TouchableOpacity>
                    
                </View>
            </View>
            <View style = {styles.main}>
            <RNCalendar
                style={{
                    borderWidth: 1,
                    borderColor: 'black',
                    height: 350,
                    backgroundColor: 'pink',  // This sets the overall background color
                }}
                theme={{
                    backgroundColor: 'pink',
                    calendarBackground: 'pink',
                    selectedDayBackgroundColor: 'purple',  // This is the deeper purple for selection
                    selectedDayTextColor: 'white',
                    dayTextColor: 'black',
                    textDisabledColor: '#d9e1e8',
                    dotColor: 'purple',
                    selectedDotColor: '#ffffff',
                    arrowColor: 'black',
                    todayTextColor: '#fc03ba',  
                    monthTextColor: 'black',
                    textSectionTitleColor: 'black', 
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16,
                }}
                onDayPress={day => {
                    setSelected(day.dateString);
                    console.log('selected day', day);
                }}
                markedDates={{
                    [selected]: {
                        selected: true,
                        disableTouchEvent: true,
                        selectedDotColor: 'white'
                    }
                }}
            />
            <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>Upcoming Events</Text>
                {/* Future events will go here */}
            </View>
            </View>            
            <Navbar navigation={navigation} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E4D8EB',
    },
    header: {
        height: Math.min(80, Dimensions.get('window').height * 0.1),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 15,
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    headerText: {
        fontSize: 40,
        color: 'black',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    LogoContainer: {
        height: 42,
        width: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    LogoImage: {
        height: 40,
        width: 40,
    },
    main: {
        flex: 1,
        backgroundColor: '#E4D8EB',
        marginHorizontal: 20,
    },
    eventsContainer: {
        marginTop: 20,
        backgroundColor: 'pink',
        borderRadius: 15,
        padding: 15,
        minHeight: 200,  // Adjust this value to make the container bigger or smaller
        borderWidth: 1,
        borderColor: 'black',
    },
    eventsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
})

export default Calendar;