import 'react-native-gesture-handler';
import { StyleSheet, View, StatusBar as RNStatusBar, SafeAreaView} from 'react-native';
import React, { useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import AppNavigator from './app/Navigator';
import { AppProvider } from './contexts/appContext';

export default function App() {
    const [userEmail, setUserEmail] = useState(null);
    const [userID, setUserID] = useState(null);
    //console.log(Dimensions.get('window').height);

    return (
        <AppProvider value={{ userEmail, setUserEmail, userID, setUserID }}>
            <NavigationContainer>
                <SafeAreaView style={styles.container}>
                    <RNStatusBar style="auto" />
                    <AppNavigator />
                </SafeAreaView>
            </NavigationContainer>
        </AppProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E4D8EB',
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
});