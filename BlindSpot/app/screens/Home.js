import React, { useContext, useEffect, useState, useRef  } from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
    View, 
    Dimensions, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    TextInput, 
    KeyboardAvoidingView, 
    TouchableWithoutFeedback, 
    Keyboard,
    Platform,
    RefreshControl } from 'react-native';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';

import Navbar from '../../components/Navbar';
import CalendarDay from '../../components/CalendarDay';

import { displayEvents, updateDescription } from '../backend/updateEvent';


import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_COLORS = {
    Imports: ['#B39CD0', '#9B7FC1'],    // Purple theme
    Microtask: ['#9DC0D0', '#7FA3C1'],    // Blue-ish
    Leisure: ['#D09CB3', '#C17F96'],    // Pink-ish
    Work: ['#D0C29C', '#C1A67F'],       // Yellow-ish 
    Sleep: ['#D0D0D0', '#A0A0A0'],       // Gray-ish
    Default: ['#D3D3D3', '#A9A9A9'],    // Gray theme for unrecognized categories
};


const PRIORITY_FACTORS = {
    2: 1.2,  // Lighter
    1: 1.0,  // Base color
    0: 0.8,  // Darker
};


function Home() {
    const navigation = useNavigation();
    const { theme, userID } = useContext(AppContext);

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [selectedDay, setSelectedDay] = useState(new Date());

    const scrollViewRef = useRef(null);

    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    const [currentTime, setCurrentTime] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const [events, setEvents] = useState([]);
    const [eventNote, setEventNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

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

    // useEffect to update current time
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
    
        return () => clearInterval(timer);
    }, []);

    // Get events from database
    useEffect(() => {
        const day = selectedDay.getDate();
        const month = selectedDay.getMonth();
        const year = selectedDay.getFullYear();
        
        console.log(`Fetching events for: ${month}/${day}/${year}`);
        
        let isMounted = true;
        setIsLoading(true); // Set loading state when starting to fetch
        
        displayEvents(userID, day, month, year)
            .then((data) => {
                if (!isMounted) return;
                if (Array.isArray(data)) {
                    const formattedEvents = data
                        .filter(event => event && event.start_time && event.end_time)
                        .map(event => ({
                            event_id: event.id,
                            event_category: event.category || 'Uncategorized',
                            event_title: event.title || 'Untitled Event',
                            start_time: new Date(event.start_time),
                            end_time: new Date(event.end_time),
                            priority: event.change || 1,
                            description: event.description || '',
                            location: event.location || ''
                        }))
                        .sort((a, b) => a.start_time - b.start_time);
                    setEvents(formattedEvents);
                } else {
                    setEvents([]);
                }
            })
            .catch((error) => {
                if (!isMounted) return;
                console.error('Error fetching events:', error);
                setEvents([]);
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false); // Clear loading state when done
                }
            });
            
        return () => {
            isMounted = false;
        };
    }, [selectedDay, userID]);

    // Refresh handler
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        setIsLoading(true);
        try {
            const day = selectedDay.getDate();
            const month = selectedDay.getMonth();
            const year = selectedDay.getFullYear();
            
            console.log(`Refreshing events for: ${month}/${day}/${year}`);
            
            const data = await displayEvents(userID, day, month, year);
            if (Array.isArray(data)) {
                const formattedEvents = data
                    .filter(event => event && event.start_time && event.end_time)
                    .map(event => ({
                        event_id: event.id,
                        event_category: event.category || 'Uncategorized',
                        event_title: event.title || 'Untitled Event',
                        start_time: new Date(event.start_time),
                        end_time: new Date(event.end_time),
                        priority: event.change || 1,
                        description: event.description || '',
                        location: event.location || ''
                    }))
                    .sort((a, b) => a.start_time - b.start_time);
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error('Error refreshing events:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [selectedDay, userID]);

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
        if (!date) return '';
        const options = { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles' // This will ensure consistent PST/PDT display
        };
        return date.toLocaleTimeString([], options);
    };

    const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff + (currentWeekOffset * 7));
        return date;
    };

    // Week navigation functions
    const handlePreviousWeek = () => {
        setCurrentWeekOffset(prev => prev - 1);
    };
    
    const handleNextWeek = () => {
        setCurrentWeekOffset(prev => prev + 1);
    };

    const getWeekText = () => {
        if (currentWeekOffset === 0) {
            return "THIS WEEK";
        } else if (currentWeekOffset > 0) {
            return "COMING WEEK";
        } else {
            return "PREVIOUS WEEK";
        }
    };

    const handleResetToCurrentWeek = () => {
        setCurrentWeekOffset(0);
        setSelectedDay(new Date());
        scrollToFirstEvent(new Date());
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
    const scrollToFirstEvent = (date) => {
        if (!events || events.length === 0) {
            console.warn("No events available to scroll. Waiting for events to load.");
            return;
        }
    
        // Check if the selected date is today
        const isToday = isSameDay(date, new Date());
    
        if (isToday) {
            // Scroll to current time
            const now = new Date();
            const scrollPosition = (now.getHours() * 60) + now.getMinutes();
            
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({
                        y: scrollPosition,
                        animated: true
                    });
                }
            }, 100);
        } else {
            // Original logic for scrolling to first event
            const dayEvents = events.filter(event =>
                isSameDay(new Date(event.start_time), new Date(date))
            );
    
            if (dayEvents.length > 0) {
                const firstEvent = dayEvents.reduce((earliest, current) =>
                    current.start_time < earliest.start_time ? current : earliest
                , dayEvents[0]);
    
                const startTime = new Date(firstEvent.start_time);
                const scrollPosition = Math.max(0, (startTime.getHours() * 60 + startTime.getMinutes()) - 30);
    
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollTo({
                            y: scrollPosition,
                            animated: true
                        });
                    }
                }, 100);
            }
        }
    };

    const handleDayPress = (date) => {
        setSelectedDay(new Date(date));
        scrollToFirstEvent(date);
    };

    useFocusEffect(
        React.useCallback(() => {
            handleResetToCurrentWeek(); // Reset to current week
            scrollToFirstEvent(new Date());
        }, [])
    );

    const handleEventPress = (event) => {
        setSelectedEvent(event);
        setEventNote(event.description || '');
        setIsEditing(false); // Start in viewing mode
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!selectedEvent) return;
        
        setIsSaving(true);
        try {
            const success = await updateDescription(userID, selectedEvent.event_id, eventNote);
            if (success) {
                // Update local events array
                const updatedEvents = events.map(event => 
                    event.event_id === selectedEvent.event_id 
                        ? { ...event, description: eventNote }
                        : event
                );
                setEvents(updatedEvents);
                setEventNote
                setIsEditing(false); // Exit edit mode
            }
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEventNote(selectedEvent?.description || '');
        setIsEditing(false);
    };

    // Event styling
    const getEventColors = (category, priority) => {
        const baseColors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
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
        // Calculate start position including minutes
        const startHour = event.start_time.getHours();
        const startMinutes = event.start_time.getMinutes();
        const startPosition = (startHour * 60) + startMinutes;
        
        // Calculate end position including minutes
        const endHour = event.end_time.getHours();
        const endMinutes = event.end_time.getMinutes();
        const endPosition = (endHour * 60) + endMinutes;
        
        // Calculate duration in minutes
        const duration = endPosition - startPosition;
        
        // Enforce minimum height of 30 minutes for better visibility
        const minHeight = 30;
        const displayHeight = Math.max(duration, minHeight);
        
        // For very short events, center them around their actual time
        const topAdjustment = duration < minHeight ? (minHeight - duration) / 2 : 0;
        
        return {
            top: startPosition - topAdjustment,
            height: displayHeight,
            left: '2%',
            right: '2%',
            zIndex: 1,
            // Add a border for very short events to make them more visible
            borderWidth: duration < 45 ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.5)',
        };
    };

    // Filter events for selected day
    const eventsForSelectedDay = React.useMemo(() => {
        if (!Array.isArray(events)) {
            console.warn("events is not an array:", events);
            return [];
        }
        const filteredEvents = events.filter(event => 
            event && event.start_time && isSameDay(new Date(event.start_time), selectedDay)
        );
        console.log("Filtered events for selected day:", filteredEvents);
        return filteredEvents;
    }, [events, selectedDay]);
    
    

    // Effects
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setScreenWidth(Dimensions.get('window').width);
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            console.log("Events loaded, attempting to scroll to first event.");
            scrollToFirstEvent(selectedDay);
        } else {
            console.log("No events to scroll to.");
        }
    }, [events, selectedDay]); // Trigger scroll when events or selectedDay changes
    

    // Render components
    const renderEvent = (event, index) => {
        if (!event) {
            console.warn(`Skipping undefined event at index ${index}`);
            return null;
        }
        return (
            <TouchableOpacity
                key={index}
                onPress={() => handleEventPress(event)}
            >
                <LinearGradient
                    colors={getEventColors(event.event_category, event.priority)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.eventCard, getEventPositionStyle(event)]}
                >
                    <View style={styles.eventContent}>
                        <Text style={styles.eventTitle}>{event.event_title}</Text>
                        <Text style={styles.eventTime}>
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    // red line for current time
    const CurrentTimeLine = () => {
        const isToday = isSameDay(selectedDay, new Date());
        if (!isToday) return null;
    
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
    
        return (
            <View
                style={{
                    position: 'absolute',
                    top: minutes,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: 'red',
                    zIndex: 1000,
                }}
            />
        );
    };
    

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
                    <View style={styles.weekNavigation}>
                        <TouchableOpacity 
                            onPress={handlePreviousWeek}
                            style={styles.navigationButton}
                        >
                            <Text style={styles.navigationArrow}>{'◀'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleResetToCurrentWeek}
                            style={styles.weekTextButton}
                        >
                            <Text style={styles.cardTitle}>{getWeekText()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleNextWeek}
                            style={styles.navigationButton}
                        >
                            <Text style={styles.navigationArrow}>{'▶'}</Text>
                        </TouchableOpacity>
                    </View>
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
                    {isLoading ? (
                        <Text style={styles.noEventsMessage}>Loading events...</Text>
                    ) : eventsForSelectedDay.length === 0 ? (
                        <Text style={styles.noEventsMessage}>No events for this day</Text>
                    ) : null}
                    <Text style={styles.cardTitle}>UPCOMING EVENTS</Text>
                    <ScrollView 
                        ref={scrollViewRef} 
                        style={styles.timelineContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#6A0DAD"
                                colors={["#6A0DAD"]}
                                progressBackgroundColor="#ffffff"
                            />
                        }
                    >
                        <View style={styles.timelineContent}>
                        <View style={styles.timeIndicators}>
                            {timeSlots.map((time, index) => {
                                const date = new Date(time);
                                const hours = date.getHours();
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                const hours12 = hours % 12 || 12; // Convert 24h to 12h format
                                
                                return (
                                    <View key={index} style={styles.timeSlot}>
                                        <Text style={styles.timeText}>
                                            {`${hours12}:00 ${ampm}`}
                                        </Text>
                                        <View style={styles.timeLine} />
                                    </View>
                                );
                            })}
                        </View>
                            <View style={styles.eventsContainer}>
                                <CurrentTimeLine />
                                {eventsForSelectedDay.map(renderEvent)}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
            
            <Navbar navigation={navigation} />
            <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={modalStyle.modalOverlay}
                    >
                        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                            <View style={modalStyle.modalContent}>
                                <TouchableOpacity 
                                    style={modalStyle.closeButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setIsEditing(false);
                                    }}
                                >
                                    <Text style={modalStyle.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                                
                                {selectedEvent && (
                                    <>
                                        <LinearGradient
                                            colors={getEventColors(selectedEvent.event_category, selectedEvent.priority)}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={modalStyle.modalHeader}
                                        >
                                            <Text style={modalStyle.modalTitle}>{selectedEvent.event_title}</Text>
                                            <Text style={modalStyle.modalCategory}>{selectedEvent.event_category}</Text>
                                        </LinearGradient>
                                        
                                        <View style={modalStyle.modalBody}>
                                            <Text style={modalStyle.modalTime}>
                                                {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                                            </Text>

                                            <View style={modalStyle.locationContainer}>
                                                <Text style={modalStyle.locationLabel}>Location:</Text>
                                                <Text style={modalStyle.locationText}>
                                                    {selectedEvent.location && typeof selectedEvent.location === 'object' 
                                                        ? `${selectedEvent.location._lat}° N, ${selectedEvent.location._long}° E`
                                                        : selectedEvent.location || 'No location specified'}
                                                </Text>
                                            </View>
                                            
                                            <View style={modalStyle.notesSection}>
                                                <View style={modalStyle.notesHeader}>
                                                    <Text style={modalStyle.notesLabel}>Notes:</Text>
                                                    {!isEditing ? (
                                                        <TouchableOpacity 
                                                            style={modalStyle.editButton}
                                                            onPress={() => setIsEditing(true)}
                                                        >
                                                            <Text style={modalStyle.editButtonText}>Edit</Text>
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View style={modalStyle.editActions}>
                                                            <TouchableOpacity 
                                                                style={[modalStyle.actionButton, modalStyle.cancelButton]}
                                                                onPress={handleCancel}
                                                            >
                                                                <Text style={modalStyle.cancelButtonText}>Cancel</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity 
                                                                style={[modalStyle.actionButton, modalStyle.saveButton]}
                                                                onPress={handleSave}
                                                                disabled={isSaving}
                                                            >
                                                                <Text style={modalStyle.saveButtonText}>
                                                                    {isSaving ? 'Saving...' : 'Save'}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                                <TextInput
                                                    style={[
                                                        modalStyle.notesInput,
                                                        !isEditing && modalStyle.notesInputDisabled
                                                    ]}
                                                    multiline
                                                    value={eventNote}
                                                    onChangeText={setEventNote}
                                                    placeholder="Add your notes here..."
                                                    placeholderTextColor="#666"
                                                    editable={isEditing}
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </Modal>
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
    weekNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    navigationButton: {
        padding: 0,
    },
    navigationArrow: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
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
    weekTextButton: {
        padding: 0,
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
        width: '20%', // Slightly wider to accommodate AM/PM
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
        fontSize: 11, // Slightly smaller to fit AM/PM
        color: '#6A0DAD',
        paddingLeft: 4, // Reduced padding to fit text
        paddingRight: 2,
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
        padding: 5, // Reduced padding for small events
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minHeight: 30, // Minimum height
    },
    eventContent: {
        flex: 1,
        justifyContent: 'center', // Center content vertically
    },
    eventTitle: {
        fontSize: 12, // Slightly smaller font for better fit
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2, // Reduced margin
    },
    eventTime: {
        fontSize: 10, // Smaller font size for time
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    eventCategory: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
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
    noEventsMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        marginBottom: 10,
        fontWeight: '500',
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

const modalStyle = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    closeButton: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 2,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    modalHeader: {
        padding: 20,
        paddingTop: 25,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
    },
    modalTitle: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    modalCategory: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    modalBody: {
        padding: 20,
        width: '100%',
    },
    modalTime: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    notesSection: {
        width: '100%',
    },
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        paddingRight: 5,
    },
    notesLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: '#6A0DAD',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    editButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    editActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#6A0DAD',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        minHeight: 100,
        maxHeight: 200,
        textAlignVertical: 'top',
        color: '#333',
        backgroundColor: 'white',
        width: '100%',
    },
    notesInputDisabled: {
        backgroundColor: '#f8f8f8',
        color: '#666',
    },
    locationContainer: {
        marginBottom: 20,
    },
    locationLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    locationText: {
        fontSize: 16,
        color: '#666',
    },
});

export default Home;