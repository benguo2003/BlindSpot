import React, { useState } from 'react';
import { View, Image, Dimensions, TextInput, Button, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../backend/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import logo from '../../assets/images/blindSpotTextLogoTransparent.png';
import Icon from 'react-native-vector-icons/Feather';
import theme from '../style/themes.js';
import {addUserToUsersCollection} from '../backend/backendSignUp';
import {addEvent} from '../backend/addEvent'
import {removeEvent} from '../backend/removeEvent'
import {updateTitle, updateRecurrence, updateTime, updateDescription, findEvent, displayEvents} from '../backend/updateEvent'

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const validateEmail = (email) => {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,20})+$/;
    return regex.test(email);
};

export default function SignUp({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        if (password.length < 7) {
            Alert.alert('Invalid Password', 'Password must be at least 7 characters long.');
            return;
        }
        if (confirmPassword !== password) {
            Alert.alert('Passwords Do Not Match', 'Please make sure the passwords match.');
            return;
        }

        try {
            await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            await addUserToUsersCollection('testuser123', email, 'testUser', 30); //hard coded userID and name for testing purposes...can change this later
            const now = new Date(); // Current time
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
            await addEvent('testuser123', 'testuser123_event1', 'breakfast', 'eating first meal', true, 'daily', 1, now, oneHourLater);
            await addEvent('testuser123', 'testuser123_delete', 'del_event', 'to be deleted', true, 'weekly', 2, now, oneHourLater);
            await removeEvent('testuser123', 'del_event');
            await updateTitle('testuser123', 'breakfast', 'Breakfast_New');
            await updateRecurrence('testuser123', 'Breakfast_New', true, 'daily', 2);
            await updateTime('testuser123', 'Breakfast_New', new Date(now.getTime() + 3600000), new Date(now.getTime() + 7200000));
            await updateDescription('testuser123', 'Breakfast_New', 'new breakfast description');
            const x = await displayEvents('testuser123');
            console.log(x);
            Alert.alert('Success', 'Account created successfully!');
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert('Error', `An error occurred while processing your request: ${error.message}`);
        }

        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logo} />
            </View>

            <Text style={styles.title}>Sign Up</Text>
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
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? "eye-off" : "eye"} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
                <Text style={{ color: theme.colors.buttonText, textAlign: 'center' }}>SIGN UP</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <View style={{ flex: 1, borderBottomColor: theme.colors.textSecondary, borderBottomWidth: 1 }} />
                <Text style={{ textAlign: 'center', marginHorizontal: 10, color: theme.colors.textSecondary }}>Or</Text>
                <View style={{ flex: 1, borderBottomColor: theme.colors.textSecondary, borderBottomWidth: 1 }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.linkButton}>
                    <Text style={{ color: theme.colors.linkText, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                        Already a BlindSpot User? <Text style={{ textDecorationLine: 'underline' }}>Sign in here</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
        marginTop: -screenHeight * 0.05,
    },
    logoContainer: {
        marginBottom: 50,
    },
    logo: {
        width: 300, 
        height: 70, 
        alignSelf: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
    signUnText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
        color: theme.colors.linkText,
    },
    signUpButton: {
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 10,
    },    
});