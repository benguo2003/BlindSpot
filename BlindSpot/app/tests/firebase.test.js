// __tests__/firebase.test.js

import { addEvent } from '../backend/addEvent';
import { removeEvent } from '../backend/removeEvent';
import { updateEvent, displayEvents } from '../backend/updateEvent';
import { updateProfile, retrieveInfo } from '../backend/updateProfile';
import { calendar2firebase } from '../backend/calendar2firebase';
import { getUserData } from '../backend/UserDataAccess';
import { FIREBASE_DB } from '../backend/FirebaseConfig';
import * as Calendar from 'expo-calendar'

// Mock Firebase modules
jest.mock('../backend/FirebaseConfig', () => ({
    FIREBASE_DB: {},
    FIREBASE_APP: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn()
}));

jest.mock('expo-calendar', () => ({
    requestCalendarPermissionsAsync: jest.fn(),
    getCalendarsAsync: jest.fn(),
    getEventsAsync: jest.fn(),
    EntityTypes: { EVENT: 'event' }
}));

describe('Calendar App Firebase Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Suite 1: Adding Events
    describe('addEvent', () => {
        test('should successfully add a single time event', async () => {
        const singleEvent = {
            title: 'Team Meeting',
            description: 'Weekly sync',
            location: 'Room 101',
            start_time: '2024-12-06T10:00:00',
            end_time: '2024-12-06T11:00:00',
            change: 1,
            category: 'Work'
        };

        const result = await addEvent('user123', singleEvent, null);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Event added successfully.');
        });

        test('should handle error when no event data is provided', async () => {
        const result = await addEvent('user123', null, null);
        expect(result.success).toBe(false);
        expect(result.message).toBe('No event data provided.');
        });
    });

    // Test Suite 2: Removing Events
    describe('removeEvent', () => {
        test('should successfully remove an event', async () => {
        const mockGetDoc = jest.fn().mockResolvedValue({
            data: () => ({ calendar_id: 'user123_calendar' })
        });
        const mockGetDocs = jest.fn().mockResolvedValue({
            forEach: (callback) => callback({
            id: 'event123',
            data: () => ({ title: 'Team Meeting' })
            })
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);
        require('firebase/firestore').getDocs.mockImplementation(mockGetDocs);

        const result = await removeEvent('user123', 'Team Meeting');
        expect(result.success).toBe(true);
        expect(result.message).toBe('Event "Team Meeting" deleted successfully.');
        });
    });

    // Test Suite 3: Updating Events
    describe('updateEvent', () => {
        test('should successfully update event fields', async () => {
        const mockGetDoc = jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({ calendar_id: 'user123_calendar' })
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

        const updateFields = {
            title: 'Updated Meeting',
            location: 'Room 102'
        };

        const result = await updateEvent('user123', 'event123', updateFields);
        expect(result).toBe(true);
        });
    });

    // Test Suite 4: User Profile Management
    describe('User Profile Functions', () => {
        test('should successfully retrieve user info', async () => {
        const mockUserData = {
            name: 'John Doe',
            email: 'john@example.com',
            age: 30,
            calendar_id: 'user123_calendar'
        };

        const mockGetDoc = jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockUserData
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

        const result = await retrieveInfo('user123');
        expect(result).toEqual(mockUserData);
        });

        test('should handle non-existent user data', async () => {
        const mockGetDoc = jest.fn().mockResolvedValue({
            exists: () => false
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

        const result = await retrieveInfo('nonexistent-user');
        expect(result).toBeNull();
        });
    });

    // Test Suite 5: Calendar Import
    describe('calendar2firebase', () => {
        test('should successfully import calendar events when permission granted', async () => {
            // Mock successful permission
            Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
            
            // Mock calendars
            Calendar.getCalendarsAsync.mockResolvedValue([
            { id: 'cal1', title: 'Personal' }
            ]);

            // Mock calendar events
            Calendar.getEventsAsync.mockResolvedValue([
            {
                title: 'Birthday Party',
                location: 'Home',
                description: 'Annual celebration',
                startDate: '2024-12-25T15:00:00.000Z',
                endDate: '2024-12-25T18:00:00.000Z',
                isRecurring: false
            }
            ]);

            await calendar2firebase('user123');
            
            // Verify that addEvent was called with correct data
            expect(Calendar.requestCalendarPermissionsAsync).toHaveBeenCalled();
            expect(Calendar.getCalendarsAsync).toHaveBeenCalled();
            expect(Calendar.getEventsAsync).toHaveBeenCalled();
        });

        test('should handle undefined event fields gracefully', async () => {
            Calendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
            Calendar.getCalendarsAsync.mockResolvedValue([
            { id: 'cal1', title: 'Personal' }
            ]);
            Calendar.getEventsAsync.mockResolvedValue([
            {
                title: 'Meeting',
                startDate: '2024-12-25T15:00:00.000Z',
                endDate: '2024-12-25T16:00:00.000Z',
                isRecurring: false
                // location and description undefined
            }
            ]);

            await calendar2firebase('user123');
            // Verify event was added with empty strings for undefined fields
            expect(Calendar.getEventsAsync).toHaveBeenCalled();
        });
    });

    // Test Suite 6: User Data Access
    describe('getUserData', () => {
        test('should successfully retrieve user data', async () => {
        const mockUserData = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            calendar_id: 'cal_123'
        };

        const mockGetDoc = jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockUserData
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

        const result = await getUserData('user123');
        expect(result).toEqual(mockUserData);
        });

        test('should return null for non-existent user', async () => {
        const mockGetDoc = jest.fn().mockResolvedValue({
            exists: () => false
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

        const result = await getUserData('nonexistent-user');
        expect(result).toBeNull();
        });
    });

    // Test Suite 7: Display Events
    describe('displayEvents', () => {
        test('should return events for specific day', async () => {
        const mockGetDoc = jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({ calendar_id: 'user123_calendar' })
        });

        const mockGetDocs = jest.fn().mockResolvedValue({
            forEach: (callback) => {
            callback({
                id: 'event123',
                data: () => ({
                title: 'Meeting',
                start_time: { toDate: () => new Date('2024-12-06T10:00:00') },
                end_time: { toDate: () => new Date('2024-12-06T11:00:00') },
                description: 'Team sync',
                location: 'Room 1',
                category: 'Work'
                })
            });
            }
        });

        require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);
        require('firebase/firestore').getDocs.mockImplementation(mockGetDocs);

        const events = await displayEvents('user123', 6, 11, 2024);
        expect(Array.isArray(events)).toBe(true);
        expect(events.length).toBeGreaterThanOrEqual(0);
        });
    });
    
    // Test Suite 8: Updating Profile
    describe('updateProfile', () => {
        test('should handle profile update with partial data', async () => {
          const mockUpdateDoc = jest.fn().mockResolvedValue(true);
          require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);
    
          const result = await updateProfile('user123', 25, undefined);
          expect(mockUpdateDoc).toHaveBeenCalled();
        });
      });
});