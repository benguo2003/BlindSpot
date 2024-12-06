import React, { useRef, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_COLORS = {
    Imports: ['#B39CD0', '#9B7FC1'],    // Purple theme
    Routine: ['#9DC0D0', '#7FA3C1'],    // Blue-ish
    Leisure: ['#D09CB3', '#C17F96'],    // Pink-ish
    Work: ['#D0C29C', '#C1A67F'],       // Yellow-ish
    Default: ['#D3D3D3', '#A9A9A9'],    // Gray theme for unrecognized categories
};

const PRIORITY_FACTORS = {
    1: 1.2,  // Lighter
    2: 1.0,  // Base color
    3: 0.8,  // Darker
};

/**
 * Scrollable timeline view that displays events for a given day with time slots and colored event cards.
 * Supports refresh, event selection, and dynamic time-based display.
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of event objects to display
 * @param {Date} props.selectedDate - Currently selected date to display events for
 * @param {boolean} props.isLoading - Whether events are currently loading
 * @param {Function} props.onEventPress - Callback when an event is pressed
 * @param {Function} props.onRefresh - Callback for pull-to-refresh
 * @param {boolean} props.refreshing - Whether refresh is in progress
 * @param {Object} props.containerStyle - Additional styles for container
 * @param {string} props.backgroundColor - Background color for the timeline
 * @returns {JSX.Element} Scrollable timeline with events
*/
const ScrollableEventList = ({ 
    events = [],
    selectedDate,
    isLoading = false,
    onEventPress,
    onRefresh,
    refreshing = false,
    containerStyle,
    backgroundColor = '#C3A6D8'
}) => {
    const scrollViewRef = useRef(null);

    // Generate time slots for the day (24 hours)
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        return new Date(selectedDate).setHours(i, 0, 0, 0);
    });

    const formatTime = (date) => {
        if (!date) return '';
        const options = { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles'
        };
        return date.toLocaleTimeString([], options);
    };

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
        const startHour = event.start_time.getHours();
        const startMinutes = event.start_time.getMinutes();
        const startPosition = (startHour * 60) + startMinutes;
        
        const endHour = event.end_time.getHours();
        const endMinutes = event.end_time.getMinutes();
        const endPosition = (endHour * 60) + endMinutes;
        
        const duration = endPosition - startPosition;
        const minHeight = 30;
        const displayHeight = Math.max(duration, minHeight);
        const topAdjustment = duration < minHeight ? (minHeight - duration) / 2 : 0;
        
        return {
            top: startPosition - topAdjustment,
            height: displayHeight,
            left: '2%',
            right: '2%',
            zIndex: 1,
            borderWidth: duration < 45 ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.5)',
        };
    };

    const CurrentTimeLine = () => {
        const now = new Date();
        const today = new Date(selectedDate);
        const isToday = now.getDate() === today.getDate() && 
                       now.getMonth() === today.getMonth() && 
                       now.getFullYear() === today.getFullYear();
        
        if (!isToday) return null;
    
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

    const renderEvent = (event, index) => {
        if (!event) return null;
        return (
            <TouchableOpacity
                key={index}
                onPress={() => onEventPress && onEventPress(event)}
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

    return (
        <View style={[styles.container, containerStyle, { backgroundColor }]}>
            {isLoading ? (
                <Text style={styles.statusMessage}>Loading events...</Text>
            ) : events.length === 0 ? (
                <Text style={styles.statusMessage}>No events for this day</Text>
            ) : null}
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
                            const hours12 = hours % 12 || 12;
                            
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
                        {events.map(renderEvent)}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 350,
        width: '100%',
        borderRadius: 15,
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
        fontSize: 11,
        color: '#6A0DAD',
        paddingLeft: 4,
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
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minHeight: 30,
    },
    eventContent: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    eventTime: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    statusMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        marginBottom: 10,
        fontWeight: '500',
    },
});

export default ScrollableEventList;