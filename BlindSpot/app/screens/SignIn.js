import React, { useState, useEffect, useContext } from 'react';
import { View, Image, Dimensions, TextInput, Button, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_DB, FIREBASE_AUTH } from '../backend/FirebaseConfig';
import logo from '../../assets/images/blindSpotTextLogoTransparent.png';
import AppContext from '../../contexts/appContext';
import Icon from 'react-native-vector-icons/Feather';
import theme from '../style/themes.js';
import {calendar2firebase} from '../backend/calendar2firebase.js'

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function SignIn({ navigation }) {
    const { userEmail, setUserEmail } = useContext(AppContext);
    const { userID, setUserID } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [savePassword, setSavePassword] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // New state for password visibility
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            // Save credentials if savePassword is true
            if (savePassword) {
                try {
                    await AsyncStorage.setItem('email', email.toLowerCase());
                    await AsyncStorage.setItem('password', password);
                } catch (error) {
                    console.warn('Failed to save password due to low storage space due to: ', error);
                }
            } else {
                try {
                    await AsyncStorage.removeItem('email');
                    await AsyncStorage.removeItem('password');
                } catch (error) {
                    console.warn('Failed to remove saved password due to: ', error);
                }
            }

            // Set user context
            setUserEmail(user.email);
            setUserID(user.email);

            // Navigate to home screen
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Login Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadCredentials = async () => {
            const savedEmail = await AsyncStorage.getItem('email');
            const savedPassword = await AsyncStorage.getItem('password');
            if (savedEmail && savedPassword) {
                setEmail(savedEmail);
                setPassword(savedPassword);
                setSavePassword(true);
            }
        };
        loadCredentials();
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={{ marginBottom: 50 }}>
                <Image source={logo} style={{ width: 300, height: 70, alignSelf: 'center' }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
            ) : (
                <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.title}>Sign In</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="oneTimeCode"
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}  // Updated style to prevent layout issues
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            textContentType="oneTimeCode"
                            secureTextEntry={!isPasswordVisible} // Toggle visibility based on isPasswordVisible state
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Icon name={isPasswordVisible ? "eye-off" : "eye"} size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            value={savePassword}
                            onValueChange={setSavePassword}
                        />
                        <Text style={styles.checkboxText}>Save Password</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
                        <Text style={{ color: theme.colors.buttonText, textAlign: 'center' }}>SIGN IN</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                        <View style={{ flex: 1, borderBottomColor: theme.colors.textSecondary, borderBottomWidth: 1 }} />
                        <Text style={{ textAlign: 'center', marginHorizontal: 10, color: theme.colors.textSecondary }}>Or</Text>
                        <View style={{ flex: 1, borderBottomColor: theme.colors.textSecondary, borderBottomWidth: 1 }} />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.linkButton}>
                            <Text style={{ color: theme.colors.linkText, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                                New to BlindSpot? <Text style={{ textDecorationLine: 'underline' }}>Sign up here</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkButton}>
                            <Text style={{ color: theme.colors.linkText, fontSize: 12, textAlign: 'center', marginTop: 4 }}>Forgot Password</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: theme.colors.textPrimary,
    },
    input: {
        height: 40,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        padding: 10,
        borderRadius: 10,
    },
    passwordContainer: { 
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 10,
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    passwordInput: {
        flex: 1,
        height: 40,
    },
    linkButton: {
        marginHorizontal: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
        marginLeft: 10,
    },
    checkbox: {
        backgroundColor: theme.colors.lightGray,
        borderWidth: 0,
        padding: 0,
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 14,
    },
    signInButton: {
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 10,
    }
});