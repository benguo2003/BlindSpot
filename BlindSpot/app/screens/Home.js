import React, { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation } from '@react-navigation/native';
import { View, Dimensions, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';
import CalendarDay from '../../components/CalendarDay';


import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_COLORS = {
    Meeting: ['#B39CD0', '#9B7FC1'],    // Purple theme
    Routine: ['#9DC0D0', '#7FA3C1'],    // Blue-ish
    Leisure: ['#D09CB3', '#C17F96'],    // Pink-ish
};

const PRIORITY_FACTORS = {
    1: 1.2,  // Lighter
    2: 1.0,  // Base color
    3: 0.8,  // Darker
};


function Home() {
    const navigation = useNavigation();
    const { theme } = useContext(AppContext);

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [selectedDay, setSelectedDay] = useState(new Date());

    const scrollViewRef = useRef(null);

    const mockEvents = [
        // Monday Nov 20
        {
            event_id: 1,
            event_category: 'Meeting',
            event_title: 'Coffee with Ana',
            start_time: new Date(2024, 10, 30, 10, 0, 0),
            end_time: new Date(2024, 10, 30, 11, 0, 0),
            priority: 2,
            recurring: false,
        },
        {
            event_id: 2,
            event_category: 'Meeting',
            event_title: 'Team Meeting',
            start_time: new Date(2024, 10, 30, 14, 0, 0),
            end_time: new Date(2024, 10, 30, 15, 0, 0),
            priority: 3,
            recurring: false,
        },
        // Thursday Nov 23
        {
            event_id: 3,
            event_category: 'Routine',
            event_title: 'Gym',
            start_time: new Date(2024, 11, 1, 8, 0, 0),
            end_time: new Date(2024, 11, 1, 9, 0, 0),
            priority: 2,
            recurring: false,
        },
        {
            event_id: 4,
            event_category: 'Routine',
            event_title: 'Grocery Shopping',
            start_time: new Date(2024, 10, 29, 14, 0, 0),
            end_time: new Date(2024, 10, 29, 15, 0, 0),
            priority: 1,
            recurring: false,
        },
        // Friday Nov 24
        {
            event_id: 5,
            event_category: 'Leisure',
            event_title: 'Movie Night',
            start_time: new Date(2024, 10, 29, 18, 0, 0),
            end_time: new Date(2024, 10, 29, 21, 0, 0),
            priority: 3,
            recurring: false,
        },
        // Saturday Nov 25
        {
            event_id: 6,
            event_category: 'Leisure',
            event_title: 'Date Night with John',
            start_time: new Date(2024, 10, 23, 19, 0, 0),
            end_time: new Date(2024, 10, 23, 21, 0, 0),
            priority: 3,
            recurring: false,
        },
    ];

    // Utility functions
    const calculateDayWidth = () => {
        const containerPadding = 10 * 2;
        const outerMargins = 5 * 2;
        const innerMargins = 2 * 6;
        const availableWidth = screenWidth - 40 - containerPadding - outerMargins - innerMargins;
        return Math.floor(availableWidth / 7);
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const getMonday = (d) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    // Calendar setup
    const monday = getMonday(new Date());
    const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return date;
    });

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        return new Date(selectedDay).setHours(i, 0, 0, 0);
    });

    // Event handlers
    const handleDayPress = (date) => {
        setSelectedDay(new Date(date));
        const dayEvents = mockEvents.filter(event => 
            isSameDay(new Date(event.start_time), new Date(date))
        );

        if (dayEvents.length > 0) {
            const firstEvent = dayEvents.reduce((earliest, current) => 
                current.start_time < earliest.start_time ? current : earliest
            , dayEvents[0]);

            const scrollPosition = Math.max(0, (firstEvent.start_time.getHours() - 0.5) * 60);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: scrollPosition,
                    animated: true
                });
            }, 100);
        }
    };

    // Event styling
    const getEventColors = (category, priority) => {
        const baseColors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Meeting;
        const factor = PRIORITY_FACTORS[priority] || 1.0;

        const adjustColor = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            return '#' + [r, g, b].map(c => 
                Math.max(0, Math.min(255, Math.round(c * factor)))
                .toString(16)
                .padStart(2, '0')
            ).join('');
        };

        return baseColors.map(adjustColor);
    };

    const getEventPositionStyle = (event) => {
        const startHour = event.start_time.getHours() + (event.start_time.getMinutes() / 60);
        const duration = event.end_time.getHours() - startHour + 
                        (event.end_time.getMinutes() - event.start_time.getMinutes()) / 60;
        
        return {
            top: startHour * 60,
            height: duration * 60,
            left: '2%',
            right: '2%',
            zIndex: 1,
        };
    };

    // Filter events for selected day
    const eventsForSelectedDay = mockEvents.filter(event => 
        isSameDay(new Date(event.start_time), selectedDay)
    );

    // Effects
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setScreenWidth(Dimensions.get('window').width);
        });
        return () => subscription.remove();
    }, []);

    // Render components
    const renderEvent = (event, index) => (
        <LinearGradient
            key={index}
            colors={getEventColors(event.event_category, event.priority)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.eventCard, getEventPositionStyle(event)]}
        >
            <View style={styles.eventContent}>
                {/* <Text style={styles.eventCategory}>{event.event_category}</Text> */}
                <Text style={styles.eventTitle}>{event.event_title}</Text>
                <Text style={styles.eventTime}>
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </Text>
            </View>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerBox}>
                    <Text style={[styles.headerText, { fontFamily: theme.fonts.regular }]}>
                        Welcome Back, Liz
                    </Text>
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Image 
                            source={require('../../assets/images/profile.png')}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                <Text style={[styles.mainText, { fontFamily: theme.fonts.bold}]}>Schedule</Text>
                
                {/* Calendar */}
                <View style={styles.thisWeekCalendar}>
                    <Text style={styles.cardTitle}>THIS WEEK</Text>
                    <View style={styles.calendarRow}>
                    {weekDates.map((date, index) => (
                        <CalendarDay
                            key={index}
                            dayIndex={index}
                            dayNum={date.getDate()}
                            date={date}
                            colorDefault='white'
                            colorSelect='#6A0DAD'
                            widthSize={calculateDayWidth()}
                            fontSizeDayName={12}
                            fontSizeDayNum={20}
                            isSelected={isSameDay(date, selectedDay)}
                            onPress={handleDayPress}
                        />
                    ))}
                    </View>
                </View>

                {/* Events Timeline */}
                <View style={styles.upcomingEvents}>
                    <Text style={styles.cardTitle}>UPCOMING EVENTS</Text>
                    <ScrollView ref={scrollViewRef} style={styles.timelineContainer}>
                        <View style={styles.timelineContent}>
                            <View style={styles.timeIndicators}>
                                {timeSlots.map((time, index) => (
                                    <View key={index} style={styles.timeSlot}>
                                        <Text style={styles.timeText}>
                                            {new Date(time).getHours().toString().padStart(2, '0')}:00
                                        </Text>
                                        <View style={styles.timeLine} />
                                    </View>
                                ))}
                            </View>
                            <View style={styles.eventsContainer}>
                                {eventsForSelectedDay.map(renderEvent)}
                            </View>
                        </View>
                    </ScrollView>
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
        height: Math.min(42, Dimensions.get('window').height * 0.05),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 5,
        marginTop: 10,
    },
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerText: {
        fontSize: 15,
        color: 'black',
    },
    profileButton: {
        height: 42,
        width: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    profileImage: {
        height: '100%',
        width: '100%',
        borderRadius: 21,
        borderWidth: 1,
    },
    main: {
        flex: 1,
        backgroundColor: '#E4D8EB',
        marginHorizontal: 20,
    },
    mainText: {
        fontSize: 40,
        color: 'black',
        textAlign: 'left',
        textDecorationLine: 'underline',
    },
    thisWeekCalendar: {
        height: 150,
        width: '100%',
        backgroundColor: '#B39CD0',
        borderRadius: 15,
        marginVertical: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 5,
    },
    cardTitle: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    upcomingEvents: {
        height: 350,
        width: '100%',
        backgroundColor: '#C3A6D8',
        borderRadius: 15,
        marginVertical: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    timelineContainer: {
        flex: 1,
        marginTop: 10,
        borderRadius: 12,
    },
    timelineContent: {
        flexDirection: 'row',
        height: 24 * 60,
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        overflow: 'hidden',
    },
    timeIndicators: {
        width: '20%',
        borderRightWidth: 1,
        borderRightColor: 'rgba(106, 13, 173, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    timeSlot: {
        height: 60,
        justifyContent: 'flex-start',
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(106, 13, 173, 0.05)',
    },
    timeText: {
        fontSize: 12,
        color: '#6A0DAD',
        paddingLeft: 8,
        fontWeight: '500',
    },
    timeLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(106, 13, 173, 0.05)',
    },
    eventsContainer: {
        flex: 1,
        position: 'relative',
        paddingLeft: 2,
    },
    eventCard: {
        position: 'absolute',
        left: '2%',
        right: '2%',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    eventContent: {
        flex: 1,
    },
    eventCategory: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    eventTime: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    upcomingEvents: {
        flex: 1,
        minHeight: 350,
        width: '100%',
        backgroundColor: '#C3A6D8',
        borderRadius: 15,
        marginVertical: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    thisWeekCalendar: {
        height: 150,
        width: '100%',
        backgroundColor: '#B39CD0',
        borderRadius: 15,
        marginVertical: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    getEventPositionStyle: (event) => {
        const startHour = event.start_time.getHours() + (event.start_time.getMinutes() / 60);
        const endHour = event.end_time.getHours() + (event.end_time.getMinutes() / 60);
        const duration = endHour - startHour;
        
        return {
            top: startHour * 60,
            height: duration * 60,
            left: '2%',
            right: '2%',
            zIndex: 1,
        };
    },
});

export default Home;