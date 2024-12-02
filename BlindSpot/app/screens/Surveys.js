import React, { useContext, useState } from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, Image, TouchableOpacity, Animated, TextInput } from 'react-native';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';
import Confetti from 'react-native-confetti';

const mockQuestions = [
    {
        id: "Laundry",
        question: "When did you do your laundry?",
        type: "choice",
        options: ["On time!", "A different time", "I didn't do it"]
    },
    {
        id: "Laundry1",
        question: "How long does it take you to do your laundry?",
        type: "time"
    },
    {
        id: "Trash",
        question: "When did you take out the trash?",
        type: "choice",
        options: ["On time!", "A different time", "I didn't do it"]
    },
    {
        id: "Trash2",
        question: "How long does it take you to take out the trash?",
        type: "time"
    },
    {
        id: "Dishes",
        question: "When did you do the dishes?",
        type: "choice",
        options: ["On time!", "A different time", "I didn't do it"]
    },
    {
        id: "Dishes2",
        question: "How long does it take you to do the dishes?",
        type: "time"
    },
    {
        id: "Meditation",
        question: "When did you meditate?",
        type: "choice",
        options: ["On time!", "A different time", "I didn't do it"]
    },
    {
        id: "Meditation2",
        question: "How long did you meditate?",
        type: "time"
    },
    {
        id: "Groceries",
        question: "When did you go grocery shopping?",
        type: "choice",
        options: ["On time!", "A different time", "I didn't do it"]
    },
    {
        id: "Groceries2",
        question: "How long did you spend grocery shopping?",
        type: "time"
    },
    {
        id: "Exercise",
        question: "When did you exercise?",
        type: "choice",
        options: ["On time!", "A different time", "I didn't do it"]
    },
    {
        id: "Exercise2",
        question: "How long did you exercise?",
        type: "time"
    },

];

function Surveys() {
    const navigation = useNavigation();
    const { theme } = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeInput, setTimeInput] = useState('');
    const confettiRef = React.useRef();
    const [showCompletion, setShowCompletion] = useState(false);
    
    const cardPositions = mockQuestions.map((_, index) => 
        React.useRef(new Animated.Value(index === 0 ? 0 : Dimensions.get('window').width)).current
    );

    const handleAnswer = (answer) => {
        if (mockQuestions[currentIndex].type === 'time') {
            setTimeInput(answer);
        } else {
            setSelectedAnswer(answer);
        }
    };

    const isValidAnswer = () => {
        if (mockQuestions[currentIndex].type === 'time') {
            return timeInput !== '' && !isNaN(timeInput) && parseInt(timeInput) > 0;
        }
        return selectedAnswer !== null;
    };

    const handleNext = () => {
        const currentAnswer = mockQuestions[currentIndex].type === 'time' ? timeInput : selectedAnswer;
    
        if (currentAnswer === "I didn't do it") {
            // If the user selected "I didn't do it", skip the next question
            if (currentIndex === mockQuestions.length - 2) {
                // If this was the last question, complete the survey
                setAnswers(prev => ({...prev, [currentIndex]: currentAnswer}));
                setAnswers(prev => ({...prev, [currentIndex + 1]: null}));

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
            } else {
                // Otherwise, move to the question after the next one
                setAnswers(prev => ({...prev, [currentIndex]: currentAnswer}));
                setAnswers(prev => ({...prev, [currentIndex + 1]: null}));
                
                Animated.parallel([
                    Animated.timing(cardPositions[currentIndex], {
                        toValue: -Dimensions.get('window').width * 1.5,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(cardPositions[currentIndex + 2], {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start(() => {
                    setCurrentIndex(prev => prev + 2);
                    setSelectedAnswer(null);
                    setTimeInput('');
                });
            }
        } else {
            // If the current answer is not "I didn't do it", save the answer and move to the next question
            setAnswers(prev => ({...prev, [currentIndex]: currentAnswer}));
    
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
                setTimeInput('');
            });
        }
    };

    const TimeInputCard = ({ question, style }) => {
        const [localInput, setLocalInput] = useState(timeInput);
        
        return (
            <Animated.View style={[styles.questionCard, style]}>
                <View style={styles.questionContent}>
                    <Text style={[styles.questionNumber, { fontFamily: theme.fonts.bold }]} numberOfLines={1}>
                        Question {currentIndex + 1}/{mockQuestions.length}
                    </Text>
                    <Text style={[styles.questionText, { fontFamily: theme.fonts.bold }]} numberOfLines={3}>
                        {question}
                    </Text>
                    <View style={styles.timeInputContainer}>
                        <TextInput
                            style={styles.timeInput}
                            keyboardType="numeric"
                            placeholder="Enter time in minutes"
                            value={localInput}
                            onChangeText={setLocalInput}
                            onSubmitEditing={() => setTimeInput(localInput)}
                            maxLength={3}
                        />
                        <Text style={styles.minutesLabel}>minutes</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={() => {
                            setTimeInput(localInput);
                            handleNext();
                        }}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const ChoiceCard = ({ question, options, style }) => (
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
                            {question.type === 'time' ? (
                                <TimeInputCard question={question.question} />
                            ) : (
                                <ChoiceCard
                                    question={question.question}
                                    options={question.options}
                                />
                            )}
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
        fontSize: 20,
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
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    timeInput: {
        backgroundColor: '#F5F0F7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1C1DB',
        padding: 16,
        fontSize: 16,
        width: 120,
        textAlign: 'center',
        marginRight: 10,
    },
    minutesLabel: {
        fontSize: 16,
        color: '#333',
    },
});

export default Surveys;