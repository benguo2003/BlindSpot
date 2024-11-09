import React, { createContext, useContext, useState } from 'react';
import { useFonts } from 'expo-font';
import { RobotoSerif_400Regular } from '@expo-google-fonts/roboto-serif';
import { ActivityIndicator, View } from 'react-native';
import theme from '../app/style/themes';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [fontsLoaded] = useFonts({
        RobotoSerif_400Regular,
    });

    const [userEmail, setUserEmail] = useState(null);
    const [userID, setUserID] = useState(null);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
            </View>
        );
    }

    return (
        <AppContext.Provider value={{ theme, userEmail, setUserEmail, userID, setUserID }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;