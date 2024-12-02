import React, { useContext, useEffect, useState, useRef } from 'react';
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
    TextInput
} from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';
import { displayEvents2, updateEvent } from '../backend/updateEvent';
import { removeEvent } from '../backend/removeEvent';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper function
const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function Calendar() {
    const navigation = useNavigation();
    const { userType, theme, userID } = useContext(AppContext);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const [selected, setSelected] = useState('');
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEvent, setEditedEvent] = useState({
        title: '',
        category: '',
        startTime: new Date(),
        endTime: new Date(),
        description: '',
    });
    const [monthlyEvents, setMonthlyEvents] = useState({});
    const [currentMonthEvents, setCurrentMonthEvents] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const scrollViewRef = useRef(null);

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
            const selectedDateEvents = monthlyEvents[selected] || [];
            setSelectedDateEvents(selectedDateEvents);
        }
    }, [selected, monthlyEvents]);

    useEffect(() => {
        const fetchMonthlyEvents = async () => {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            try {
                const events = await displayEvents2(userID, 1, month, year);
                
                // Organize events by date
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);  // Use our new helper function
                    if (!eventsByDate[date]) {
                        eventsByDate[date] = [];
                    }
                    eventsByDate[date].push(event);
                });
                
                console.log('Events by date:', eventsByDate); // Add this to debug
                setMonthlyEvents(eventsByDate);
                setCurrentMonthEvents(events);
            } catch (error) {
                console.error('Error fetching monthly events:', error);
            }
        };
    
        fetchMonthlyEvents();
    }, [userID]);

    const handleDeleteEvent = async (eventId, eventTitle) => {
        try {
            const result = await removeEvent(userID, eventTitle);
            
            if (result.success) {
                // Update local state only if deletion was successful
                const updatedEvents = selectedDateEvents.filter(event => event.id !== eventId);
                setSelectedDateEvents(updatedEvents);
                setSelectedEvent(null);
    
                // Refresh the monthly events to update the dots
                const currentDate = new Date();
                const events = await displayEvents2(userID, 1, currentDate.getMonth(), currentDate.getFullYear());
                
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);
                    if (!eventsByDate[date]) {
                        eventsByDate[date] = [];
                    }
                    eventsByDate[date].push(event);
                });
                
                setMonthlyEvents(eventsByDate);
                setCurrentMonthEvents(events);
            } else {
                console.error('Failed to delete event:', result.message);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
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

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        // Split the date string and reconstruct it to preserve local timezone
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    const handleSave = async () => {
        if (!selectedEvent) return;

        setIsSaving(true);
        try {
            const success = await updateEvent(userID, selectedEvent.id, {
                title: editedEvent.title,
                start_time: editedEvent.startTime,
                end_time: editedEvent.endTime,
                category: editedEvent.category,
                description: editedEvent.description,
            });
    
            if (success) {
                // Refresh events
                const currentDate = new Date();
                const events = await displayEvents2(userID, 1, currentDate.getMonth(), currentDate.getFullYear());
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);
                    if (!eventsByDate[date]) eventsByDate[date] = [];
                    eventsByDate[date].push(event);
                });
                
                setMonthlyEvents(eventsByDate);
                setCurrentMonthEvents(events);
                setIsEditing(false);
                setSelectedEvent(null);
            }
        } catch (error) {
            console.error('Error updating event:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditEvent = (event) => {
        setEditedEvent({
            title: event.title || '',
            category: event.category || '',
            startTime: event.start_time ? new Date(event.start_time) : new Date(),
            endTime: event.end_time ? new Date(event.end_time) : new Date(),
            description: event.description || '',
        });
        setSelectedEvent(event);
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (!selectedEvent) return;
        
        // Reset all edited values to original event values
        setEditedEvent({
            title: selectedEvent.title,
            category: selectedEvent.category,
            startTime: new Date(selectedEvent.start_time),
            endTime: new Date(selectedEvent.end_time),
            description: selectedEvent.description || '',
        });
        setIsEditing(false);
    };

    const EventCard = React.memo(({ event, isCollapsed }) => {
        const formatEventTime = (start, end) => {
            const startTime = formatTime(start);
            const endTime = formatTime(end);
            return `${startTime} - ${endTime}`;
        };
    
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
                            <Text style={styles.eventTime}>
                                Time: {formatEventTime(event.start_time, event.end_time)}
                            </Text>
                            <Text style={styles.eventDescription}>Category: {event.category}</Text>
                            <Text style={styles.eventDescription}>Description: {event.description || 'No description available'}</Text>
                        </View>
    
                        {isEditing && selectedEvent?.id === event.id ? (
                            <View style={styles.editContainer}>
                                <Text style={styles.editTitle}>Editing Event</Text>
                                
                                <TextInput
                                    style={styles.editInput}
                                    value={editedEvent.title}
                                    onChangeText={(text) => setEditedEvent(prev => ({ ...prev, title: text }))}
                                    placeholder={event.title}
                                />
                                <View style={{ marginBottom: 15 }}>
                                    <DateTimePicker
                                        value={new Date(event.start_time)}
                                        mode="datetime"
                                        onChange={(eventChange, date) => {
                                            if (date) setEditedEvent(prev => ({ ...prev, startTime: date }));
                                        }}
                                    />
                                </View>
                                
                                <View style={{ marginBottom: 15 }}>
                                    <DateTimePicker
                                        value={new Date(event.end_time)}
                                        mode="datetime"
                                        onChange={(eventChange, date) => {
                                            if (date) setEditedEvent(prev => ({ ...prev, endTime: date }));
                                        }}
                                    />
                                </View>
                            
                                <TextInput
                                    style={styles.editInput}
                                    value={editedEvent.category}
                                    onChangeText={(text) => setEditedEvent(prev => ({ ...prev, category: text }))}
                                    placeholder={event.category}
                                />
                            
                                <TextInput
                                    style={[styles.editInput, styles.descriptionInput]}
                                    multiline
                                    value={editedEvent.description}
                                    onChangeText={(text) => setEditedEvent(prev => ({ ...prev, description: text }))}
                                    placeholder={event.description || 'Add event description...'}
                                />
                            
                                <View style={styles.editButtonsContainer}>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, styles.saveButton]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.buttonText}>
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={handleCancel}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => handleEditEvent(event)}
                                >
                                    <Text style={styles.buttonText}>Edit Event</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDeleteEvent(event.id, event.title)}
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
                    setEditedEvent({
                        title: event.title,
                        category: event.category,
                        startTime: new Date(event.start_time),
                        endTime: new Date(event.end_time),
                        description: event.description || '',
                    });
                    setIsEditing(false);
                }}
            >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                    <Text style={styles.eventTime}>
                        {formatEventTime(event.start_time, event.end_time)}, {event.category}
                    </Text>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description || 'No description available'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={[styles.headerText, { fontFamily: theme.fonts.bold }]}>Calendar</Text>
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
                            if (selectedEvent) setSelectedEvent(null);
                        }}
                        markedDates={{
                            ...Object.keys(monthlyEvents).reduce((acc, date) => ({
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
                                marked: monthlyEvents[selected]?.length > 0
                            }
                        }}
                    />
                    
                    <View style={styles.eventsContainer}>
                        <Text style={styles.eventsTitle}>
                            {selected ? `Events for ${formatDisplayDate(selected)}` : 'Select a date to view events'}
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
        fontSize: 12,
        color: '#444',
        marginTop: 5,
        lineHeight: 16,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 15,
    },
    editInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    descriptionInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    datePickerContainer: {
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'purple',
        marginTop: 10,
        marginBottom: 5,
    }
});

export default Calendar;