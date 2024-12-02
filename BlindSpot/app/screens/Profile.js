import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Phone, Smile, LogOut, Trash2 } from 'lucide-react-native';
import AppContext from '../../contexts/appContext';
import Navbar from '../../components/Navbar';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import { retrieveInfo } from '../backend/updateProfile';


import { FIREBASE_AUTH } from '../backend/FirebaseConfig';

function Profile({ navigation }) {
    const { theme, userID } = useContext(AppContext);
    const [profileImage, setProfileImage] = useState(null);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        age: '',
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const info = await retrieveInfo(userID);
                if (info) {
                    setUserInfo({
                        name: info.name || '',
                        email: info.email || '',
                        age: info.age || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };
    
        fetchUserInfo();
    }, [userID]);

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

    const handleSignOut = async () => {
        try {
            await FIREBASE_AUTH.signOut();
            navigation.navigate('SignIn');
            console.log("You have signed out.");
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
            console.error('Sign out error:', error);
        }
    };

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to upload photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const handleImageSelection = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        };

        try {
            const result = await ImagePicker.launchImageLibraryAsync(options);
            
            if (!result.canceled && result.assets && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
                // Here you would typically upload the image to your backend
                // uploadImageToServer(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select image');
            console.error('Image selection error:', error);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
                // Here you would typically upload the image to your backend
                // uploadImageToServer(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
            console.error('Camera error:', error);
        }
    };

    const handleChangePhoto = () => {
        Alert.alert(
            'Change Profile Photo',
            'Choose an option',
            [
                {
                    text: 'Take Photo',
                    onPress: handleTakePhoto,
                },
                {
                    text: 'Choose from Library',
                    onPress: handleImageSelection,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerBox}>
                    <Text style={[styles.headerText, { fontFamily: theme.fonts.bold }]}>Your Profile</Text>
                    <View 
                        style={styles.LogoContainer}
                    >
                        <Image source={Logo} style={styles.LogoImage} />
                    </View>
                </View>
            </View>
            <View style={styles.main}>
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <Image 
                            source={
                                profileImage 
                                    ? { uri: profileImage }
                                    : require('../../assets/images/profile.png')
                            }
                            style={styles.profileImage}
                        />
                    </View>
                    <TouchableOpacity 
                        style={styles.changePhotoButton}
                        onPress={handleChangePhoto}
                    >
                        <Text style={styles.changePhotoText}>Change Profile Picture</Text>
                    </TouchableOpacity>
                    
                    <Text style={[styles.userName, { fontFamily: theme.fonts.regular }]}>{userInfo.name}</Text>
                    <Text style={styles.userEmail}>{userInfo.email}</Text>

                </View>

                <View style={styles.infoSection}>
                    <TouchableOpacity style={styles.infoContainer}>
                        <View style={styles.iconContainer}>
                            <Phone stroke="white" size={24} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>(949)-678-8921</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer}>
                        <View style={styles.iconContainer}>
                            <Smile stroke="white" size={24} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>Age</Text>
                            <Text style={styles.infoValue}>{userInfo.age}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer} onPress={() => handleSignOut()}>
                        <View style={styles.iconContainer}>
                            <LogOut stroke="white" size={24} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>Sign Out</Text>
                            <Text style={styles.infoValue}>Click here to sign out</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer}>
                        <View style={styles.iconContainer}>
                            <Trash2 stroke="white" size={24} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>Delete Account</Text>
                            <Text style={styles.infoValue}>Click here to delete account</Text>
                        </View>
                    </TouchableOpacity>
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
        height: Math.min(80, Dimensions.get('window').height * 0.1),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 20,
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerText: {
        fontSize: 40,  // Updated to match Calendar.js
        color: 'black',
        textDecorationLine: 'underline',
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
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#B39CD0',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    changePhotoButton: {
        backgroundColor: '#B39CD0',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    changePhotoText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    infoSection: {
        marginTop: 5,
        marginBottom: 20,
    },
    infoContainer: {
        backgroundColor: '#DE3A9B',
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    infoLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    infoValue: {
        color: 'white',
        fontSize: 14,
        opacity: 0.9,
    },
});

export default Profile;