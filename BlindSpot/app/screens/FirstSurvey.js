import React, { useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Animated, TextInput, ScrollView} from 'react-native';
import Confetti from 'react-native-confetti';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, Briefcase } from 'react-native-feather';

const { height } = Dimensions.get('window');

const days = [     
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const mockQuestions = [
    {
        id: 1,
        question: "Are you a:",
        type: "choice",
        options: ["Student", "Adult"]
    },
    {
        id: 2,
        question: "What is your age?",
        type: "input",
        placeholder: "Enter your age"
    },
    {
        id: 3,
        question: "What days and hours do you work?",
        type: "schedule",
        days: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ]
    }
];

function FirstSurvey() {
    const navigation = useNavigation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const confettiRef = useRef();
    const [showCompletion, setShowCompletion] = useState(false);

    const [schedule, setSchedule] = useState({
        Monday: { works: false, start: '9:00 AM', end: '5:00 PM' },
        Tuesday: { works: false, start: '9:00 AM', end: '5:00 PM' },
        Wednesday: { works: false, start: '9:00 AM', end: '5:00 PM' },
        Thursday: { works: false, start: '9:00 AM', end: '5:00 PM' },
        Friday: { works: false, start: '9:00 AM', end: '5:00 PM' },
        Saturday: { works: false, start: '9:00 AM', end: '5:00 PM' },
        Sunday: { works: false, start: '9:00 AM', end: '5:00 PM' }
    });
    
    const cardPositions = mockQuestions.map((_, index) => 
        React.useRef(new Animated.Value(index === 0 ? 0 : Dimensions.get('window').width)).current
    );

    const handleAnswer = (answer, type, day, field) => {
        if (type === "schedule") {
            setSchedule(prev => ({
                ...prev,
                [day]: {
                    ...prev[day],
                    [field]: field === 'works' ? !prev[day].works : answer
                }
            }));
            setSelectedAnswer(JSON.stringify(schedule));
        } else {
            setSelectedAnswer(answer);
        }
    };

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

    const QuestionCard = ({ question, options, type, placeholder, style, days }) => {
        if (type === "schedule") {
            return (
                <Animated.View style={[styles.questionCard, style]}>
                    <Text style={styles.questionText}>{question}</Text>
                    <ScrollView style={styles.scheduleContainer}>
                        {days.map((day) => (
                            <View key={day} style={styles.dayContainer}>
                                <View style={styles.dayHeader}>
                                    <Text style={styles.dayText}>{day}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.workToggle,
                                            schedule[day].works && styles.workToggleActive
                                        ]}
                                        onPress={() => handleAnswer(null, "schedule", day, "works")}
                                    >
                                        <Text style={[
                                            styles.workToggleText,
                                            schedule[day].works && styles.workToggleTextActive
                                        ]}>
                                            {schedule[day].works ? 'Working' : 'Not Working'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                
                                {schedule[day].works && (
                                    <View style={styles.timeContainer}>
                                        <View style={styles.timePickerContainer}>
                                            <Text style={styles.timeLabel}>Start:</Text>
                                            <TextInput
                                                style={styles.timeInput}
                                                placeholder="00:00"
                                                value={schedule[day].start.split(' ')[0]}
                                                onChangeText={(value) => {
                                                    const period = schedule[day].start.includes('PM') ? 'PM' : 'AM';
                                                    handleAnswer(`${value} ${period}`, "schedule", day, "start");
                                                }}
                                                keyboardType="numeric"
                                                maxLength={5}
                                            />
                                            <TouchableOpacity
                                                style={styles.periodToggle}
                                                onPress={() => {
                                                    const time = schedule[day].start.split(' ')[0];
                                                    const currentPeriod = schedule[day].start.includes('PM') ? 'PM' : 'AM';
                                                    const newPeriod = currentPeriod === 'AM' ? 'PM' : 'AM';
                                                    handleAnswer(`${time} ${newPeriod}`, "schedule", day, "start");
                                                }}
                                            >
                                                <Text style={styles.periodText}>
                                                    {schedule[day].start.includes('PM') ? 'PM' : 'AM'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        
                                        <View style={styles.timePickerContainer}>
                                            <Text style={styles.timeLabel}>End:</Text>
                                            <TextInput
                                                style={styles.timeInput}
                                                placeholder="00:00"
                                                value={schedule[day].end.split(' ')[0]}
                                                onChangeText={(value) => {
                                                    const period = schedule[day].end.includes('PM') ? 'PM' : 'AM';
                                                    handleAnswer(`${value} ${period}`, "schedule", day, "end");
                                                }}
                                                keyboardType="numeric"
                                                maxLength={5}
                                            />
                                            <TouchableOpacity
                                                style={styles.periodToggle}
                                                onPress={() => {
                                                    const time = schedule[day].end.split(' ')[0];
                                                    const currentPeriod = schedule[day].end.includes('PM') ? 'PM' : 'AM';
                                                    const newPeriod = currentPeriod === 'AM' ? 'PM' : 'AM';
                                                    handleAnswer(`${time} ${newPeriod}`, "schedule", day, "end");
                                                }}
                                            >
                                                <Text style={styles.periodText}>
                                                    {schedule[day].end.includes('PM') ? 'PM' : 'AM'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                    <TouchableOpacity 
                        style={[styles.nextButton, !selectedAnswer && styles.nextButtonDisabled]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </Animated.View>
            );
        }
        else if (type === "choice" && currentIndex === 0) {
            return (
                <Animated.View style={[styles.questionCard, style]}>
                    <Text style={styles.titleText}>Are you a:</Text>
                    <View style={styles.choicesContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.choiceBox,
                                selectedAnswer === "Student" && styles.selectedChoice
                            ]}
                            onPress={() => handleAnswer("Student")}
                            activeOpacity={0.8}
                        >
                            <Book 
                                size={32} 
                                color={selectedAnswer === "Student" ? "white" : "#9B7FA7"}
                            />
                            <Text style={[
                                styles.choiceText,
                                selectedAnswer === "Student" && styles.selectedChoiceText
                            ]}>
                                Student
                            </Text>
                        </TouchableOpacity>
    
                        <TouchableOpacity 
                            style={[
                                styles.choiceBox,
                                selectedAnswer === "Adult" && styles.selectedChoice
                            ]}
                            onPress={() => handleAnswer("Adult")}
                            activeOpacity={0.8}
                        >
                            <Briefcase 
                                size={32} 
                                color={selectedAnswer === "Adult" ? "white" : "#9B7FA7"}
                            />
                            <Text style={[
                                styles.choiceText,
                                selectedAnswer === "Adult" && styles.selectedChoiceText
                            ]}>
                                Adult
                            </Text>
                        </TouchableOpacity>
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
                </Animated.View>
            );
        }
        
        return (
        <Animated.View style={[styles.questionCard, style]}>
            <View style={styles.questionContent}>
                <Text style={styles.questionText} numberOfLines={3}>
                    {question}
                </Text>
                
                {type === "choice" ? (
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
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={selectedAnswer}
                        onChangeText={handleAnswer}
                        keyboardType="number-pad"
                        maxLength={3}
                    />
                )}
    
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
    };

    return (
        <View style={styles.container}>
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
                                type={question.type}
                                placeholder={question.placeholder}
                                days={days}
                            />
                        </Animated.View>
                    ))
                ) : (
                    <>
                        <LinearGradient
                            colors={['#67d1f5', '#f74aec']}
                            style={styles.completionCard}
                        >
                            <Text style={styles.completionText}>All Set!</Text>
                            <Text style={styles.completionSubtext}>Your preferences have been saved</Text>
                            <TouchableOpacity 
                                style={styles.doneButton}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.doneButtonText}>Get Started</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                        <Confetti ref={confettiRef} count={50} />
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E4D8EB',
    },
    cardsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    questionCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        height: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        marginTop: height * 0.15,
    },
    questionContent: {
        height: '100%',
        justifyContent: 'space-between',
    },
    questionText: {
        fontSize: 26,
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    optionButton: {
        width: '48%',
        aspectRatio: 2.5,
        backgroundColor: '#F5F0F7',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#B39CD0',
        justifyContent: 'center',
        padding: 5,
    },
    selectedOption: {
        backgroundColor: '#9B7FA7',
        borderColor: '#9B7FA7',
        transform: [{scale: 1.02}],
    },
    optionText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    selectedOptionText: {
        color: 'white',
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#F5F0F7',
        borderWidth: 1,
        borderColor: '#D1C1DB',
        borderRadius: 15,
        padding: 15,
        fontSize: 20,
        marginVertical: 15,
        textAlign: 'center',
        width: '100%',
    },
    nextButton: {
        backgroundColor: '#9B7FA7',
        padding: 16,
        borderRadius: 12,
        marginTop: 'auto',
        marginHorizontal: 20,
    },
    nextButtonDisabled: {
        backgroundColor: '#D1C1DB',
        opacity: 0.5,
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
    completionCard: {
        flex: 1,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: 'hidden',
    },
    doneButton: {
        backgroundColor: 'white',
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
    completionText: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
    },
    completionSubtext: {
        fontSize: 18,
        color: 'white',
        marginTop: 10,
        textAlign: 'center',
    },
    titleText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#333',
        marginBottom: 40,
        textAlign: 'center',
    },
    choicesContainer: {
        flexDirection: 'column',
        gap: 20,
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    choiceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F0F7',
        padding: 20,
        borderRadius: 16,
        gap: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        transform: [{scale: 1}],
        borderWidth: 2,
        borderColor: '#B39CD0',
    },
    selectedChoice: {
        backgroundColor: '#9B7FA7',
        transform: [{scale: 1.02}],
    },
    choiceText: {
        fontSize: 20,
        color: '#9B7FA7',
        fontWeight: '500',
    },
    selectedChoiceText: {
        color: 'white',
    },
    scheduleContainer: {
        flex: 1,
        marginBottom: 20,
    },
    dayContainer: {
        marginBottom: 15,
        backgroundColor: '#F5F0F7',
        borderRadius: 12,
        padding: 15,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    workToggle: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D1C1DB',
    },
    workToggleActive: {
        backgroundColor: '#9B7FA7',
        borderColor: '#9B7FA7',
    },
    workToggleText: {
        color: '#9B7FA7',
        fontSize: 14,
        fontWeight: '500',
    },
    workToggleTextActive: {
        color: 'white',
    },
    timeContainer: {
        marginTop: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
    },
    timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    timeLabel: {
        fontSize: 16,
        color: '#666',
        width: 50,
    },
    timeInput: {
        flex: 1,
        height: 40,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#D1C1DB',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    periodToggle: {
        backgroundColor: '#9B7FA7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    periodText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default FirstSurvey;