import { View, TouchableOpacity, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';

import home from '../assets/navbar/home.png';
import homeCurrent from '../assets/navbar/home_current.png';
import calendar from '../assets/navbar/calendar.png';
import calendarCurrent from '../assets/navbar/calendar_current.png';
import surveys from '../assets/navbar/surveys.png';
import surveysCurrent from '../assets/navbar/surveys_current.png';

/**
 * Navigation bar component with three main tabs: Surveys, Home, and Calendar.
 * Shows active state for current tab and handles navigation between screens.
 * @param {Object} props - Component props
 * @param {Object} props.navigation - React Navigation navigation object
 * @returns {JSX.Element} Bottom navigation bar with icons
*/
const Navbar = ({navigation}) => {
    const route = useRoute();

    return (
        <View style = {styles.navbar}>
            <TouchableOpacity 
                onPress = {() => navigation.navigate('Surveys')}
            >
                <View style = {route.name === 'Surveys' ? styles.buttonActive : styles.button}>
                    <Image source={route.name === 'Surveys' ? surveysCurrent : surveys} style={styles.icon} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
            >
                <View style = {route.name === 'Home' ? styles.buttonActive : styles.button}>
                    <Image source={route.name === 'Home' ? homeCurrent : home} style={[styles.icon, {width: 40, height: 40}]} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Calendar')}
            >
                <View style = {route.name === 'Calendar' ? styles.buttonActive : styles.button}>
                    <Image source={route.name === 'Calendar' ? calendarCurrent : calendar} style={styles.icon} />
                </View>
            </TouchableOpacity>

        </View>
    )
}



const styles = StyleSheet.create({
    navbar: {
        height: Math.min(50, Dimensions.get('window').height * 0.05),
        width: '100%',
        backgroundColor: '#E4D8EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        paddingBottom: 20,
    },
    button: {
        alignItems: 'center',
        marginHorizontal: 25,
    },
    buttonActive: {
        alignItems: 'center',
        marginHorizontal: 25,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        width: 30,
        height: 30,
        marginBottom: 5,
    },

});

export default Navbar;