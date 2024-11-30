import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Phone, Smile, LogOut, Trash2 } from 'lucide-react-native';
import AppContext from '../../contexts/appContext';
import Navbar from '../../components/Navbar';

function Profile({ navigation }) {
    const { theme } = useContext(AppContext);
    const [profileImage, setProfileImage] = useState(null);

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
            <Text style={[styles.headerText, { fontFamily: theme.fonts.bold }]}>Your Profile</Text>
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
                    
                    <Text style={[styles.userName, { fontFamily: theme.fonts.regular }]}>Your Name</Text>
                    <Text style={styles.userEmail}>testAcc@gmail.com</Text>
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
                            <Text style={styles.infoValue}>21</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoContainer}>
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
        padding: 20,
    },
    main: {
        flex: 1,
        backgroundColor: '#E4D8EB',
    },
    headerText: {
        fontSize: 32,
        marginBottom: 20,
        textDecorationLine: 'underline',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageContainer: {
        width: 100,  // Smaller size
        height: 100, // Smaller size
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
        paddingHorizontal: 10,
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