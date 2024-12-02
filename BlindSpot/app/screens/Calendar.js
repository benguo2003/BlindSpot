import React, {useContext, useEffect, useState, useRef} from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation } from '@react-navigation/native';
import { 
    View, 
    Dimensions, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView,
    Animated,
    TextInput
} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';

// Mock events data
const mockEvents = {
    '2024-12-05': [
        {
            id: 1,
            title: 'Team Meeting',
            time: '10:00 AM',
            duration: '1 hour',
            location: 'Conference Room A',
            description: 'Weekly sync with the development team'
        },
        {
            id: 2,
            title: 'Lunch with Client',
            time: '12:30 PM',
            duration: '1.5 hours',
            location: 'Downtown Cafe',
            description: 'Project discussion over lunch'
        }
    ],
    '2024-12-10': [
        {
            id: 3,
            title: 'Product Launch',
            time: '2:00 PM',
            duration: '2 hours',
            location: 'Main Auditorium',
            description: 'New feature release presentation'
        }
    ],
    '2024-12-15': [
        {
            id: 4,
            title: 'Training Session',
            time: '9:00 AM',
            duration: '3 hours',
            location: 'Training Room B',
            description: 'New employee onboarding'
        },
        {
            id: 5,
            title: 'Project Deadline',
            time: '5:00 PM',
            duration: 'N/A',
            location: 'Online',
            description: 'Submit final project deliverables'
        }
    ]
};

function Calendar() {
    const navigation = useNavigation();
    const { userType, theme } = useContext(AppContext);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [selected, setSelected] = useState('');
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(Dimensions.get('window').width);
            setScreenHeight(Dimensions.get('window').height);
        };
        const subscription = Dimensions.addEventListener('change', handleResize);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (selected) {
            setSelectedDateEvents(mockEvents[selected] || []);
        }
    }, [selected]);

    const handleDeleteEvent = (eventId) => {
        const updatedEvents = selectedDateEvents.filter(event => event.id !== eventId);
        setSelectedDateEvents(updatedEvents);
        setSelectedEvent(null);
    };

    const handleSaveChanges = (eventId) => {
        // Create the updated event
        const updatedEvent = {
            ...selectedEvent,
            description: editedDescription
        };
        
        // Update the event in selectedDateEvents
        const updatedEvents = selectedDateEvents.map(event => {
            if (event.id === eventId) {
                return updatedEvent;
            }
            return event;
        });
        
        // Update the mock events data
        mockEvents[selected] = updatedEvents;
        
        // Update all the state
        setSelectedDateEvents(updatedEvents);
        setSelectedEvent(updatedEvent); // Add this line to update the expanded view
        setIsEditing(false);
    };

    const EventCard = ({ event, isCollapsed }) => {
        if (!isCollapsed) {
            return (
                <View style={styles.expandedEventCard}>
                    <View style={styles.expandedHeader}>
                        <Text style={styles.expandedTitle}>{event.title}</Text>
                        <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.expandedContent}>
                        <View style={styles.eventDetails}>
                            <Text style={styles.eventTime}>🕒 {event.time} ({event.duration})</Text>
                            <Text style={styles.eventLocation}>📍 {event.location}</Text>
                            <Text style={styles.eventDescription}>{event.description}</Text>
                        </View>

                    {isEditing ? (
                        <View style={styles.editContainer}>
                            <Text style={styles.editTitle}>Edit Event</Text>
                            {/* Add TextInput for description */}
                            <TextInput
                                style={styles.editInput}
                                multiline
                                value={editedDescription}
                                onChangeText={setEditedDescription}
                                placeholder="Event description"
                            />
                            <View style={styles.editButtonsContainer}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.saveButton]}
                                    onPress={() => handleSaveChanges(event.id)}
                                >
                                    <Text style={styles.buttonText}>Save Changes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={() => {
                                        setIsEditing(false);
                                        setEditedDescription(event.description); // Reset to original
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.editButton]}
                                onPress={() => {
                                    setEditedDescription(event.description); // Set initial value
                                    setIsEditing(true);
                                }}
                            >
                                <Text style={styles.buttonText}>Edit Event</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => handleDeleteEvent(event.id)}
                            >
                                <Text style={styles.buttonText}>Delete Event</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    </ScrollView>
                </View>
            );
        }

        return (
            <TouchableOpacity 
                style={styles.eventCard}
                onPress={() => {
                    setSelectedEvent(event);
                }}
            >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                    <Text style={styles.eventTime}>🕒 {event.time} ({event.duration})</Text>
                    <Text style={styles.eventLocation}>📍 {event.location}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={[styles.headerText, {fontFamily: theme.fonts.bold}]}>Calendar</Text>
                <TouchableOpacity 
                    style={styles.LogoContainer}
                    onPress={() => navigation.navigate('SignIn')}
                >
                    <Image source={Logo} style={styles.LogoImage} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.main}>
                {/* Normal view with calendar and events list */}
                <View 
                    style={[
                        styles.normalContent, 
                        { display: selectedEvent ? 'none' : 'flex' }
                    ]}
                >
                    <RNCalendar
                        style={{
                            borderWidth: 1,
                            borderColor: 'black',
                            height: 350,
                            backgroundColor: 'pink',
                            borderRadius: 15,
                            overflow: 'hidden',
                        }}
                        theme={{
                            backgroundColor: 'pink',
                            calendarBackground: 'pink',
                            selectedDayBackgroundColor: 'purple',
                            selectedDayTextColor: 'white',
                            dayTextColor: 'black',
                            textDisabledColor: '#d9e1e8',
                            dotColor: 'purple',
                            selectedDotColor: '#ffffff',
                            arrowColor: 'black',
                            todayTextColor: '#fc03ba',
                            monthTextColor: 'black',
                            textSectionTitleColor: 'black',
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 16,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 16,
                        }}
                        onDayPress={day => {
                            setSelected(day.dateString);
                            setSelectedEvent(null);
                        }}
                        markedDates={{
                            ...Object.keys(mockEvents).reduce((acc, date) => ({
                                ...acc,
                                [date]: {
                                    marked: true,
                                    dotColor: 'purple'
                                }
                            }), {}),
                            [selected]: {
                                selected: true,
                                disableTouchEvent: true,
                                selectedDotColor: 'white',
                                marked: mockEvents[selected] ? true : false
                            }
                        }}
                    />
                    
                    <View style={styles.eventsContainer}>
                        <Text style={styles.eventsTitle}>
                            {selected ? `Events for ${new Date(selected).toLocaleDateString()}` : 'Select a date to view events'}
                        </Text>
                        <ScrollView style={styles.eventsList}>
                            {selectedDateEvents.length > 0 ? (
                                selectedDateEvents.map(event => (
                                    <EventCard 
                                        key={event.id} 
                                        event={event}
                                        isCollapsed={true}
                                    />
                                ))
                            ) : (
                                <Text style={styles.noEventsText}>
                                    {selected ? 'No events scheduled for this date' : 'Please select a date to view events'}
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </View>

                {/* Expanded event view */}
                {selectedEvent && (
                    <View style={styles.expandedEventContainer}>
                        <EventCard 
                            event={selectedEvent}
                            isCollapsed={false}
                        />
                    </View>
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
    headerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 20,
        height: Math.min(80, Dimensions.get('window').height * 0.1),
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
    main: {
        flex: 1,
        backgroundColor: '#E4D8EB',
        marginHorizontal: 20,
        position: 'relative',
    },
    normalContent: {
        flex: 1,
    },
    eventsContainer: {
        marginTop: 20,
        backgroundColor: 'pink',
        borderRadius: 15,
        padding: 15,
        flex: 1,
        borderWidth: 1,
        borderColor: 'black',
    },
    eventsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    eventsList: {
        flex: 1,
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'purple',
    },
    expandedEventContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#E4D8EB',
        padding: 15,
    },
    expandedEventCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: 'purple',
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'purple',
        marginBottom: 5,
    },
    eventDetails: {
        gap: 5,
    },
    eventTime: {
        fontSize: 14,
        color: '#666',
    },
    eventLocation: {
        fontSize: 14,
        color: '#666',
    },
    eventDescription: {
        fontSize: 14,
        color: '#444',
        marginTop: 5,
    },
    noEventsText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 20,
    },
    expandedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    expandedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'purple',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
    },
    expandedContent: {
        flex: 1,
        paddingTop: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#6B4EE6',
    },
    deleteButton: {
        backgroundColor: '#FF4444',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    editContainer: {
        padding: 20,
    },
    editTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'purple',
        marginBottom: 20,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Changed from space-around to center
        alignItems: 'center',
        marginTop: 30,
        gap: 20, // Add gap between buttons
    },
    editInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
});

export default Calendar;