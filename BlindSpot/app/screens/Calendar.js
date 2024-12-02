import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../contexts/appContext';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import Logo from '../../assets/images/blindSpotLogoTransparent.png';
import Navbar from '../../components/Navbar';
import { displayEvents2, updateEvent } from '../backend/updateEvent';
import { removeEvent } from '../backend/removeEvent';
import EventModal from '../../components/EventModal';
import { addEvent } from '../backend/addEvent';

const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function Calendar() {
    const navigation = useNavigation();
    const { theme, userID } = useContext(AppContext);
    const [selected, setSelected] = useState('');
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [monthlyEvents, setMonthlyEvents] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (selected) {
            setSelectedDateEvents(monthlyEvents[selected] || []);
        }
    }, [selected, monthlyEvents]);

    useEffect(() => {
        const fetchMonthlyEvents = async () => {
            try {
                const currentDate = new Date();
                const events = await displayEvents2(userID, 1, currentDate.getMonth(), currentDate.getFullYear());
                
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);
                    if (!eventsByDate[date]) eventsByDate[date] = [];
                    eventsByDate[date].push(event);
                });
                
                setMonthlyEvents(eventsByDate);
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
                setSelectedDateEvents(prev => prev.filter(event => event.id !== eventId));
                setSelectedEvent(null);
                setIsModalVisible(false);
                
                const currentDate = new Date();
                const events = await displayEvents2(userID, 1, currentDate.getMonth(), currentDate.getFullYear());
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);
                    if (!eventsByDate[date]) eventsByDate[date] = [];
                    eventsByDate[date].push(event);
                });
                
                setMonthlyEvents(eventsByDate);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleSave = async (editedFields) => {
        if (!selectedEvent) return;

        setIsSaving(true);
        try {
            const success = await updateEvent(userID, selectedEvent.id, {
                title: editedFields.title,
                start_time: editedFields.startTime,
                end_time: editedFields.endTime,
                category: editedFields.category,
                description: editedFields.description,
            });
    
            if (success) {
                const currentDate = new Date();
                const events = await displayEvents2(userID, 1, currentDate.getMonth(), currentDate.getFullYear());
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);
                    if (!eventsByDate[date]) eventsByDate[date] = [];
                    eventsByDate[date].push(event);
                });
                
                setMonthlyEvents(eventsByDate);
                setIsEditing(false);
                setSelectedEvent(null);
                setIsModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating event:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNew = async (editedFields) => {
        try {
            const result = await addEvent(userID, {
                title: editedFields.title,
                description: editedFields.description,
                start_time: editedFields.startTime,
                end_time: editedFields.endTime,
                category: editedFields.category,
                change: "create",
                location: ""
            }, null);
            
            if (result.success) {
                const currentDate = new Date();
                const events = await displayEvents2(userID, 1, currentDate.getMonth(), currentDate.getFullYear());
                const eventsByDate = {};
                events.forEach(event => {
                    const date = getLocalDateString(event.start_time);
                    if (!eventsByDate[date]) eventsByDate[date] = [];
                    eventsByDate[date].push(event);
                });
                setMonthlyEvents(eventsByDate);
                setIsModalVisible(false);
                setIsEditing(false);
                setSelectedEvent(null);
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    const EventCard = ({ event }) => {
        const formatEventTime = (start, end) => {
            const options = { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true,
                timeZone: 'America/Los_Angeles'
            };
            return `${new Date(start).toLocaleTimeString([], options)} - ${new Date(end).toLocaleTimeString([], options)}`;
        };

        return (
            <TouchableOpacity
                style={styles.eventCard}
                onPress={() => {
                    setSelectedEvent(event);
                    setIsModalVisible(true);
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
    };

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
                <RNCalendar
                    style={styles.calendar}
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
                    onDayPress={day => setSelected(day.dateString)}
                    markedDates={{
                        ...Object.keys(monthlyEvents).reduce((acc, date) => ({
                            ...acc,
                            [date]: { marked: true, dotColor: 'purple' }
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
                    <ScrollView>
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))
                        ) : (
                            <Text style={styles.noEventsText}>
                                {selected ? 'No events scheduled for this date' : 'Please select a date to view events'}
                            </Text>
                        )}
                    </ScrollView>
                    {selected && (
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => {
                                setSelectedEvent(null);
                                setIsModalVisible(true);
                                setIsEditing(true);
                            }}
                        >
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <EventModal
                selected={selected}
                visible={isModalVisible}
                event={selectedEvent}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedEvent(null);
                    setIsEditing(false);
                }}
                onDelete={handleDeleteEvent}
                onSave={selectedEvent ? handleSave : handleSaveNew}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isSaving={isSaving}
            />
            
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
    },
    calendar: {
        borderWidth: 1,
        borderColor: 'black',
        height: 350,
        backgroundColor: 'pink',
        borderRadius: 15,
        overflow: 'hidden',
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
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
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
    addButton: {
        position: 'absolute',
        right: 15,
        bottom: 15,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'purple',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
});

export default Calendar;