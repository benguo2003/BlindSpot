import React, { useState } from 'react';
import { 
    View, 
    TextInput, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    Dimensions, 
    KeyboardAvoidingView, 
    Platform, 
    Image, 
    ActivityIndicator 
} from 'react-native';
import { FIREBASE_AUTH } from '../backend/FirebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../style/themes';
import logo from '../../assets/images/blindSpotTextLogoTransparent.png';

export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();

    const handleResetPassword = async () => {
        if (!email) {
            alert('Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(FIREBASE_AUTH, email);
            alert('Password reset email sent. Please check your email.');
            navigation.navigate('SignIn');
        } catch (error) {
            console.log('Error sending password reset email:', error);
            alert('Error sending password reset email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={{ marginBottom: 50 }}>
                <Image source={logo} style={{ width: 300, height: 70, alignSelf: 'center' }} />
            </View>

            <Text style={styles.title}>Forgot Password</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
            ) : (
                <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.instruction}>
                        Enter your email address below to reset your password.
                    </Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                    />
                    
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleResetPassword}
                    >
                        <Text style={styles.buttonText}>Reset Password</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.backToLogin}>Back to Login</Text>
                    </TouchableOpacity>
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
    instruction: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    input: {
        height: 40,
        borderColor: theme.colors.inputBorder,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingVertical: 10,
        marginBottom: 20,
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
    },
    buttonText: {
        color: theme.colors.buttonText,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backToLogin: {
        fontSize: 14,
        textAlign: 'center',
        color: theme.colors.primary,
    },
});