import React, { useContext, useState } from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';
import Confetti from 'react-native-confetti';

const mockQuestions = [
    {
        id: 1,
        question: "How often do you engage in collaborative projects?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
        id: 2,
        question: "What's your preferred method of receiving feedback?",
        options: ["Written", "Verbal", "Mixed", "Depends on context"]
    },
    {
        id: 3,
        question: "How do you typically handle workplace conflicts?",
        options: ["Direct discussion", "Seek mediation", "Written communication", "Escalate to management"]
    }
];

function Surveys() {
    const navigation = useNavigation();
    const { theme } = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const confettiRef = React.useRef();
    const [showCompletion, setShowCompletion] = useState(false);
    
    const cardPositions = mockQuestions.map((_, index) => 
        React.useRef(new Animated.Value(index === 0 ? 0 : Dimensions.get('window').width)).current
    );

    const handleAnswer = (answer) => setSelectedAnswer(answer);

    const handleNext = () => {
        if (!selectedAnswer) return;
        setAnswers(prev => ({...prev, [currentIndex]: selectedAnswer}));
    
        if (currentIndex === mockQuestions.length - 1) {
            Animated.timing(cardPositions[currentIndex], {
                toValue: -Dimensions.get('window').width * 1.5,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setShowCompletion(true);
                setTimeout(() => {
                    confettiRef.current?.startConfetti();
                }, 100);
            });
            return;
        }
    
        Animated.parallel([
            Animated.timing(cardPositions[currentIndex], {
                toValue: -Dimensions.get('window').width * 1.5,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(cardPositions[currentIndex + 1], {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
        });
    };

    const QuestionCard = ({ question, options, style }) => (
        <Animated.View style={[styles.questionCard, style]}>
            <View style={styles.questionContent}>
                <Text style={[styles.questionNumber, { fontFamily: theme.fonts.bold }]} numberOfLines={1}>
                    Question {currentIndex + 1}/{mockQuestions.length}
                </Text>
                <Text style={[styles.questionText, { fontFamily: theme.fonts.bold }]} numberOfLines={3}>
                    {question}
                </Text>
                <View style={styles.optionsContainer}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionButton,
                                selectedAnswer === option && styles.selectedOption
                            ]}
                            onPress={() => handleAnswer(option)}
                        >
                            <Text style={[
                                styles.optionText,
                                selectedAnswer === option && styles.selectedOptionText
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity 
                    style={[
                        styles.nextButton,
                        !selectedAnswer && styles.nextButtonDisabled
                    ]}
                    onPress={handleNext}
                    disabled={!selectedAnswer}
                >
                    <Text style={[
                        styles.nextButtonText,
                        !selectedAnswer && styles.nextButtonTextDisabled
                    ]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const progress = (Object.keys(answers).length / mockQuestions.length) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerBox}>
                    <Text style={[styles.headerText, { fontFamily: theme.fonts.bold }]}>Surveys</Text>
                    <TouchableOpacity style={styles.LogoContainer}>
                        <Image source={Logo} style={styles.LogoImage} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
                <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>

            <View style={styles.cardsContainer}>
                {!showCompletion ? (
                    mockQuestions.map((question, index) => (
                        <Animated.View 
                            key={index}
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    transform: [
                                        { translateX: cardPositions[index] },
                                        { rotate: cardPositions[index].interpolate({
                                            inputRange: [-Dimensions.get('window').width * 1.5, 0, Dimensions.get('window').width],
                                            outputRange: ['-15deg', '0deg', '15deg']
                                        })}
                                    ],
                                    zIndex: mockQuestions.length - index
                                }
                            ]}
                        >
                            <QuestionCard
                                question={question.question}
                                options={question.options}
                            />
                        </Animated.View>
                    ))
                ) : (
                    <>
                        <View style={styles.completionCard}>
                            <Text style={styles.completionText}>Survey Complete!</Text>
                            <Text style={styles.completionSubtext}>Thank you for your responses</Text>
                            <TouchableOpacity 
                                style={styles.doneButton}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <Confetti ref={confettiRef} count={50} />
                    </>
                )}
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
        marginTop: 20,
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerText: {
        fontSize: 40,
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
    progressContainer: {
        height: 30,
        backgroundColor: '#D1C1DB',
        marginHorizontal: 20,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#9B7FA7',
        borderRadius: 15,
    },
    progressText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        lineHeight: 30,
        color: 'black',
        fontWeight: '600',
    },
    cardsContainer: {
        flex: 1,
        marginHorizontal: 20,
    },
    questionCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    questionContent: {
        flex: 1,
        gap: 15,
    },
    questionNumber: {
        fontSize: 16,
        color: '#9B7FA7',
        marginBottom: 5,
    },
    questionText: {
        fontSize: 24,
        color: '#333',
        marginBottom: 20,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        padding: 16,
        backgroundColor: '#F5F0F7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1C1DB',
    },
    selectedOption: {
        backgroundColor: '#9B7FA7',
        borderColor: '#9B7FA7',
    },
    optionText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    selectedOptionText: {
        color: 'white',
    },
    completionCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    completionText: {
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#9B7FA7',
        padding: 16,
        borderRadius: 12,
        marginTop: 'auto',
    },
    nextButtonDisabled: {
        backgroundColor: '#D1C1DB',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
    },
    nextButtonTextDisabled: {
        color: '#fff8',
    },
    completionOverlay: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    completionSubtext: {
        fontSize: 18,
        color: 'black',
        marginTop: 10,
    },
    doneButton: {
        backgroundColor: 'pink',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 30,
    },
    doneButtonText: {
        color: '#9B7FA7',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Surveys;