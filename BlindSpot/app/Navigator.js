import 'react-native-gesture-handler';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import Calendar from './screens/Calendar';
import Surveys from './screens/Surveys';
import Profile from './screens/Profile';
import ForgotPassword from './screens/ForgotPassword';

const Stack = createNativeStackNavigator();

function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName='SignIn'>
            <Stack.Screen
                name = "SignIn"
                component = {SignIn}
                options = {{
                    animation: 'slide_from_left',
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name = "SignUp"
                component = {SignUp}
                options = {{
                    animation: 'slide_from_right',
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name = "ForgotPassword"
                component = {ForgotPassword}
                options = {{
                    animation: 'slide_from_right',
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name = "Home"
                component = {Home}
                options = {{
                    animation: 'fade',
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name = "Calendar"
                component = {Calendar}
                options = {{
                    animation: 'fade',
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name = "Surveys"
                component = {Surveys}
                options = {{
                    animation: 'fade',
                    headerShown: false,
                }}
            />

            <Stack.Screen 
                name="Profile" 
                component={Profile} 
                options = {{
                    animation: 'fade',
                    headerShown: false,
                }}
            />
            
        </Stack.Navigator>
    )
}

export default AppNavigator;