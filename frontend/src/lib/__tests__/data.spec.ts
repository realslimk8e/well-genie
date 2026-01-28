import { describe, it, expect } from 'vitest';
import { mockWeek, WeekRow } from '../data';

describe('mockWeek data', () => {
    it('should be an array of WeekRow objects', () => {
        expect(Array.isArray(mockWeek)).toBe(true);
        mockWeek.forEach((item) => {
            expect(item).toHaveProperty('day');
            expect(typeof item.day).toBe('string');
            expect(item).toHaveProperty('sleepHrs');
            expect(typeof item.sleepHrs).toBe('number');
            expect(item).toHaveProperty('steps');
            expect(typeof item.steps).toBe('number');
        });
    });

    it('should contain 7 items, one for each day of the week', () => {
        expect(mockWeek.length).toBe(7);
    });

    it('should have correct data for each day', () => {
        const expectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        mockWeek.forEach((item, index) => {
            expect(item.day).toBe(expectedDays[index]);
            // You can add more specific value checks if needed, e.g.:
            // expect(item.sleepHrs).toBeGreaterThan(0);
            // expect(item.steps).toBeGreaterThan(0);
        });
    });
});
