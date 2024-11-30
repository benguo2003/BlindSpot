import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import AppContext from '../contexts/appContext';

const CalendarDay = ({
    dayIndex = 0,
    dayNum = 1,
    date, // Add this prop
    colorDefault = 'white',
    colorSelect = '#6A0DAD',
    widthSize = 44,
    fontSizeDayName = 12,
    fontSizeDayNum = 20,
    isSelected = false,
    onPress, // Add this prop
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