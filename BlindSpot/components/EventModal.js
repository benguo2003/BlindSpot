import React, { useState, useEffect } from 'react';
import { 
    View, 
    Modal,
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView,
    TextInput,
    Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const EventModal = ({ 
    visible, 
    event, 
    onClose, 
    onDelete, 
    onSave, 
    isEditing, 
    setIsEditing,
    isSaving 
}) => {
    const [editedFields, setEditedFields] = useState({
        title: '',
        category: '',
        startTime: new Date(),
        endTime: new Date(),
        description: '',
    });

    useEffect(() => {
        if (event) {
            setEditedFields({
                title: event.title || '',
                category: event.category || '',
                startTime: new Date(event.start_time),
                endTime: new Date(event.end_time),
                description: event.description || '',
            });
        }
    }, [event]);

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

    const handleSave = () => {
        onSave(editedFields);
    };

    const formatDisplayDate = (date) => {
        if (!date) return '';
        const options = { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const [isStartPickerVisible, setStartPickerVisible] = useState(false);
    const [isEndPickerVisible, setEndPickerVisible] = useState(false);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {event?.title} | {formatDisplayDate(event?.start_time)}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {isEditing ? (
                            <View style={styles.editSection}>
                                <Text style={styles.inputLabel}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedFields.title}
                                    onChangeText={(text) => 
                                        setEditedFields(prev => ({...prev, title: text}))
                                    }
                                    placeholder="Event Title"
                                />
                                
                                <View style={styles.dateTimeField}>
                                    <Text style={styles.label}>Start Time</Text>
                                    <TouchableOpacity 
                                        style={styles.dateTimeButton}
                                        onPress={() => setStartPickerVisible(true)}
                                    >
                                        <Text style={styles.dateTimeText}>
                                            {formatTime(editedFields.startTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePickerModal
                                        isVisible={isStartPickerVisible}
                                        mode="datetime"
                                        date={editedFields.startTime}
                                        onConfirm={(date) => {
                                            setEditedFields(prev => ({...prev, startTime: date}));
                                            setStartPickerVisible(false);
                                        }}
                                        onCancel={() => setStartPickerVisible(false)}
                                    />
                                </View>
                            
                                <View style={styles.dateTimeField}>
                                    <Text style={styles.label}>End Time</Text>
                                    <TouchableOpacity 
                                        style={styles.dateTimeButton}
                                        onPress={() => setEndPickerVisible(true)}
                                    >
                                        <Text style={styles.dateTimeText}>
                                            {formatTime(editedFields.endTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePickerModal
                                        isVisible={isEndPickerVisible}
                                        mode="datetime"
                                        date={editedFields.endTime}
                                        onConfirm={(date) => {
                                            setEditedFields(prev => ({...prev, endTime: date}));
                                            setEndPickerVisible(false);
                                        }}
                                        onCancel={() => setEndPickerVisible(false)}
                                    />
                                </View>
                            
                                <Text style={styles.inputLabel}>Category</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedFields.category}
                                    onChangeText={(text) => 
                                        setEditedFields(prev => ({...prev, category: text}))
                                    }
                                    placeholder="Category"
                                />
                            
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.descriptionInput]}
                                    multiline
                                    value={editedFields.description}
                                    onChangeText={(text) => 
                                        setEditedFields(prev => ({...prev, description: text}))
                                    }
                                    placeholder="Description"
                                />
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.button, styles.saveButton]}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.buttonText}>
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => setIsEditing(false)}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.viewSection}>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.timeText}>
                                        {formatTime(event?.start_time)} - {formatTime(event?.end_time)}
                                    </Text>
                                    <Text style={styles.categoryText}>
                                        {event?.category}
                                    </Text>
                                    <Text style={styles.descriptionText}>
                                        {event?.description || 'No description available'}
                                    </Text>
                                </View>
                                
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.button, styles.editButton]}
                                        onPress={() => setIsEditing(true)}
                                    >
                                        <Text style={styles.buttonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.button, styles.deleteButton]}
                                        onPress={() => onDelete(event?.id, event?.title)}
                                    >
                                        <Text style={styles.buttonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'purple',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
        padding: 5,
    },
    modalBody: {
        marginBottom: 20,
    },
    viewSection: {
        gap: 20,
    },
    eventInfo: {
        gap: 10,
    },
    timeText: {
        fontSize: 16,
        color: '#666',
    },
    categoryText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    descriptionText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    editSection: {
        gap: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    descriptionInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
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
    dateTimeField: {
        marginBottom: 15,
    },
    dateTimeButton: {
        backgroundColor: '#F0F0F0',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    dateTimeText: {
        fontSize: 16,
        color: '#333',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'purple',
        marginBottom: 5,
    },
});

export default EventModal;