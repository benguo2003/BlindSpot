import React, { useState, useContext } from 'react';
import { View, Image, Dimensions, TextInput, Button, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../backend/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import logo from '../../assets/images/blindSpotTextLogoTransparent.png';
import Icon from 'react-native-vector-icons/Feather';
import theme from '../style/themes.js';
import {addUserToUsersCollection} from '../backend/backendSignUp';
import {addEvent} from '../backend/addEvent'
import {removeEvent} from '../backend/removeEvent'
import {updateTitle, updateRecurrence, updateTime, updateDescription, updateLocation, findEvent, displayEvents} from '../backend/updateEvent'
import {updateProfile, retrieveInfo} from '../backend/updateProfile'

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
    const [userID, setUserID] = useContext(AppContext);

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
            let user_id = email + new Date().getTime().toString();
            await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            await addUserToUsersCollection(user_id, email, 'testUser', 30); //hard coded userID and name for testing purposes...can change this later
            
            const start_time = new Date(2025, 2, 31, 7,0,0); // Current time
            const oneHourLater = new Date(start_time.getTime() + 60 * 60 * 1000); // Add 1 hour
            await addEvent(user_id, 'testuser123_breakfast', 'breakfast', 'eating first meal', 'Home', true, 'daily', 1, start_time, oneHourLater);
            const start_time2 = new Date(2025, 2, 31, 15, 0, 0);
            const end_time2 = new Date(start_time2.getTime() + 60 * 60 * 1000); //add 1 hour
            await addEvent(user_id, 'testuser123_delete', 'del_event', 'to be deleted', 'delete_location', true, 'weekly', 2, start_time, oneHourLater);
            await removeEvent(user_id, 'del_event');
            await updateTitle(user_id, 'breakfast', 'Breakfast_New');
            await updateRecurrence(user_id, 'Breakfast_New', true, 'daily', 2);
            await updateTime(user_id, 'Breakfast_New', new Date(2025, 2, 31, 6, 0,0), new Date(2025,2,31,6,30,0));
            await updateDescription(user_id, 'Breakfast_New', 'new breakfast description');
            await addEvent(user_id, 'testuser123_workout', 'Workout', 'exercise for the day', 'Gym', false, '',-1, start_time2, end_time2);
            await addEvent(user_id, 'testuser123_class', 'Class', 'class for the day', 'College Building 1', false, '',-1, new Date(2025, 3, 3, 10,30,0), new Date(2025,3,3,11,30,0));
            await updateLocation(user_id, 'Workout', 'Club Gym');
            const x = await displayEvents(user_id, 31, 3, 2025);
            console.log(x);
            await updateProfile(user_id, 22, 'testuser1111111');
            const y = await retrieveInfo(user_id);
            console.log(y);
            const z = await findEvent(user_id, 'Workout');
            console.log(z);
            Alert.alert('Success', 'Account created successfully!');
            navigation.navigate('SignIn');
            setUserID(user_id);
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