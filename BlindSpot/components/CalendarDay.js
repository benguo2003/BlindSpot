import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import AppContext from '../contexts/appContext';

/**
 * Renders a single day component for a calendar interface. Shows day name and number with selection state.
 * @param {Object} props - Component props
 * @param {number} props.dayIndex - Index of the day (0-6 for Mon-Sun)
 * @param {number} props.dayNum - Numeric day of month (1-31)
 * @param {Date} props.date - Full date object for this day
 * @param {string} props.colorDefault - Background color when unselected
 * @param {string} props.colorSelect - Background color when selected 
 * @param {number} props.widthSize - Width of the day component
 * @param {number} props.fontSizeDayName - Font size for day name (Mon, Tue, etc)
 * @param {number} props.fontSizeDayNum - Font size for day number
 * @param {boolean} props.isSelected - Whether this day is currently selected
 * @param {Function} props.onPress - Callback function when day is pressed
 * @returns {JSX.Element} A pressable day component for calendar
*/
const CalendarDay = ({
    dayIndex = 0,
    dayNum = 1,
    date,
    colorDefault = 'white',
    colorSelect = '#6A0DAD',
    widthSize = 44,
    fontSizeDayName = 12,
    fontSizeDayNum = 20,
    isSelected = false,
    onPress,
}) => {
    const { theme } = useContext(AppContext);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setScreenWidth(Dimensions.get('window').width);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const getDayName = (dayIndex) => {
        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        return days[dayIndex];
    };

    const handlePress = () => {
        if (onPress && date) {
            onPress(date);
        }
    };

    return (
        <TouchableOpacity 
            style={[
                styles.container, 
                {
                    width: widthSize,
                    backgroundColor: isSelected ? colorSelect : colorDefault
                }
            ]}
            onPress={handlePress}  // Add the onPress handler
        >
            <View style={styles.card}>
                <Text 
                    style={{
                        fontSize: fontSizeDayName, 
                        color: isSelected ? 'white' : 'black'
                    }}
                >
                    {getDayName(dayIndex)}
                </Text>
                <Text 
                    style={[
                        styles.dayNum, 
                        {
                            fontSize: fontSizeDayNum, 
                            color: isSelected ? 'white' : 'black',
                            fontFamily: theme.fonts.regular
                        }
                    ]}
                >
                    {dayNum}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginVertical: 5,
        marginHorizontal: 2,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    dayName: {
        color: 'black',
    },
    dayNum: {
        color: 'black',
    },
});

export default CalendarDay;