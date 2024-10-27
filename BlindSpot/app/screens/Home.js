import React, {useContext, useEffect, useState} from 'react';
import AppContext from '../../contexts/appContext';

import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';


function Home() {
    const navigation = useNavigation();
    const { userType } = useContext(AppContext);

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

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
                    <Text style = {styles.headerText}>Welcome Back, Liz</Text>
                    <TouchableOpacity 
                        style = {styles.profileButton}
                        onPress = {() => navigation.navigate('SignIn')}
                        >
                            <Image source = {Logo} style = {styles.profileImage} />
                    </TouchableOpacity>

                </View>
            </View>
            <View style = {styles.main}>
                <Text style={styles.mainText}>Schedule</Text>
                <View style = {styles.thisWeekCalendar}>
                    <Text style = {styles.cardTitle}>THIS WEEK</Text>
                </View>
                <View style = {styles.upcomingEvents}>
                    <Text style = {styles.cardTitle}>UPCOMING EVENTS</Text>
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
        height: Math.min(42, Dimensions.get('window').height * 0.05),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 5,
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
    },
    profileImage: {
        height: 40,
        width: 40,
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
        fontWeight: 'bold',
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
})

export default Home;