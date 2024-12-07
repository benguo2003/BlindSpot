// __tests__/firebase.test.js

import {
    updateEvent,
    updateTitle,
    updateRecurrence,
    updateTime,
    updateDescription,
    updateLocation,
    displayEvents,
} from '../backend/updateEvent';

import { FIREBASE_DB } from '../backend/FirebaseConfig';

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

describe('Calendar App Firebase Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Suite 3: Updating Events
    describe('updateEvent', () => {
        test('should successfully update specific fields of an event', async () => {
            const mockGetDoc = jest.fn().mockResolvedValue({
                exists: () => true,
                data: () => ({ calendar_id: 'user123_calendar' })
            });

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

            const mockUpdateDoc = jest.fn().mockResolvedValue(true);
            require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);

            const updateFields = {
                title: 'Updated Meeting',
                location: 'Room 102'
            };

            const result = await updateEvent('user123', 'event123', updateFields);
            expect(result).toBe(true);
            //expect(mockUpdateDoc).toHaveBeenCalledWith(expect.any(Object), updateFields);
        });

        test('should return false if event update fails', async () => {
            const mockGetDoc = jest.fn().mockRejectedValue(new Error('Failed to fetch event'));

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

            const updateFields = { title: 'Updated Meeting' };
            const result = await updateEvent('user123', 'event123', updateFields);
            expect(result).toBe(false);
        });
    });

    // Test Suite for updateTitle
    describe('updateTitle', () => {
        test('should update the title of an event successfully', async () => {
            const mockGetDoc = jest.fn().mockResolvedValue({
                data: () => ({ calendar_id: 'user123_calendar' })
            });
            const mockGetDocs = jest.fn().mockResolvedValue({
                forEach: (callback) => callback({ id: 'event123', data: () => ({title: 'Old Title'}) })
            });
            const mockUpdateDoc = jest.fn().mockResolvedValue(true);

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);
            require('firebase/firestore').getDocs.mockImplementation(mockGetDocs);
            require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);

            const result = await updateTitle('user123', 'Old Title', 'New Title');
            expect(result).toBe(true);
            //expect(mockUpdateDoc).toHaveBeenCalledWith(expect.any(Object), { title: 'New Title' });
        });

        test('should return false if title update fails', async () => {
            const mockGetDoc = jest.fn().mockRejectedValue(new Error('Failed to fetch user'));

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

            const result = await updateTitle('user123', 'Old Title', 'New Title');
            expect(result).toBe(false);
        });
    });

    // Test Suite for updateTime
    describe('updateTime', () => {
        test('should update the time of an event successfully', async () => {
            const mockGetDoc = jest.fn().mockResolvedValue({
                data: () => ({ calendar_id: 'user123_calendar' })
            });
            const mockGetDocs = jest.fn().mockResolvedValue({
                forEach: (callback) => callback({ id: 'event123', data: () => ({title: 'Event Title',
                    start_time: new Date('2025-12-08T10:00:00'),
                    end_time: new Date('2025-12-08T11:00:00'),
                }) })
            });
            const mockUpdateDoc = jest.fn().mockResolvedValue(true);

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);
            require('firebase/firestore').getDocs.mockImplementation(mockGetDocs);
            require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);

            const result = await updateTime(
                'user123',
                'Event Title',
                new Date('2024-12-06T10:00:00'),
                new Date('2024-12-06T11:00:00')
            );
            expect(result).toBe(true);
        });

        test('should return false if time update fails', async () => {
            const mockGetDoc = jest.fn().mockRejectedValue(new Error('Failed to fetch user'));

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

            const result = await updateTime(
                'user123',
                'Event Title',
                new Date('2024-12-06T10:00:00'),
                new Date('2024-12-06T11:00:00')
            );
            expect(result).toBe(false);
        });
    });

    // Test Suite for updateDescription
    describe('updateDescription', () => {
        test('should update the description of an event successfully', async () => {
            const mockGetDoc = jest.fn().mockResolvedValue({
                exists: () => true,
                data: () => ({ calendar_id: 'user123_calendar' })
            });
            const mockGetDocs = jest.fn().mockResolvedValue({
                forEach: (callback) => callback({ id: 'event123', data: () => ({title: 'Event Title',
                    description: 'Event Description',
                }) })
            });
            const mockUpdateDoc = jest.fn().mockResolvedValue(true);

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);
            require('firebase/firestore').getDocs.mockImplementation(mockGetDocs);
            require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);

            const result = await updateDescription('user123', 'event123', 'New Description');
            expect(result).toBe(true);
            //expect(mockUpdateDoc).toHaveBeenCalledWith(expect.any(Object), { description: 'New Description' });
        });

        test('should return false if description update fails', async () => {
            const mockGetDoc = jest.fn().mockRejectedValue(new Error('Failed to fetch event'));

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

            const result = await updateDescription('user123', 'event123', 'New Description');
            expect(result).toBe(false);
        });
    });

    // Test Suite for updateLocation
    describe('updateLocation', () => {
        test('should update the location of an event successfully', async () => {
            const mockGetDoc = jest.fn().mockResolvedValue({
                data: () => ({ calendar_id: 'user123_calendar' })
            });
            const mockGetDocs = jest.fn().mockResolvedValue({
                forEach: (callback) => callback({ id: 'event123', data: () => ({title: 'Event Title',
                    location: 'Room 101',
                }) })
            });
            const mockUpdateDoc = jest.fn().mockResolvedValue(true);

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);
            require('firebase/firestore').getDocs.mockImplementation(mockGetDocs);
            require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);

            const result = await updateLocation('user123', 'Event Title', 'Room 102');
            expect(result).toBe(true);
        });

        test('should return false if location update fails', async () => {
            const mockGetDoc = jest.fn().mockRejectedValue(new Error('Failed to fetch user'));

            require('firebase/firestore').getDoc.mockImplementation(mockGetDoc);

            const result = await updateLocation('user123', 'Event Title', 'New Location');
            expect(result).toBe(false);
        });
    });
});


