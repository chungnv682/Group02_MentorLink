# 📅 MentorSchedule Component - Ví Dụ Sử Dụng

## Ví Dụ 1: Basic Usage trong MentorDetailPage

```jsx
import React from 'react';
import MentorSchedule from '../../components/mentor/MentorSchedule';

function MentorDetailPage() {
    const { id } = useParams();
    const [mentor, setMentor] = useState(null);

    useEffect(() => {
        fetchMentorDetail();
    }, [id]);

    const fetchMentorDetail = async () => {
        try {
            const response = await MentorService.getMentorById(id);
            setMentor(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (!mentor) return <Spinner />;

    return (
        <Container>
            {/* Mentor Profile Section */}
            <div className="mentor-header mb-5">
                {/* ... mentor info ... */}
            </div>

            {/* Mentor Schedule Tab */}
            <Tab eventKey="schedule">
                <h5 className="mb-4">
                    <FaCalendarAlt className="me-2" />
                    Lịch làm việc
                </h5>
                <MentorSchedule 
                    mentorId={mentor.id} 
                    mentorName={mentor.fullname}
                />
            </Tab>
        </Container>
    );
}
```

---

## Ví Dụ 2: Sử Dụng useSchedule Hook Directly

```jsx
import useSchedule from '../../hooks/useSchedule';

function CustomScheduleView() {
    const mentorId = 4;
    const {
        schedules,
        groupedSchedules,
        loading,
        error,
        formatTimeSlot,
        formatPrice,
        getDateLabel,
        bookSlot
    } = useSchedule(mentorId);

    const handleQuickBook = async (schedule, timeSlot) => {
        try {
            const response = await bookSlot(
                schedule.scheduleId,
                timeSlot.timeSlotId
            );
            alert('Đặt lịch thành công!');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {Object.entries(groupedSchedules).map(([date, dateSchedules]) => (
                <div key={date}>
                    <h6>{getDateLabel(date)}</h6>
                    {dateSchedules.map(schedule => (
                        <div key={schedule.scheduleId}>
                            <p>Giá: {formatPrice(schedule.price)}</p>
                            {schedule.timeSlots.map(slot => (
                                <button
                                    key={slot.timeSlotId}
                                    onClick={() => handleQuickBook(schedule, slot)}
                                    disabled={schedule.isBooked}
                                >
                                    {formatTimeSlot(slot.timeStart, slot.timeEnd)}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
```

---

## Ví Dụ 3: Sử Dụng ScheduleService Trực Tiếp

```jsx
import ScheduleService from '../../services/mentor/ScheduleService';

async function getScheduleData() {
    try {
        // Get upcoming schedules for mentor ID 4
        const response = await ScheduleService.getUpcomingSchedules(4);
        
        if (response.respCode === "0") {
            console.log('Schedules:', response.data);
            // Process schedules
        } else {
            console.error('Error:', response.description);
        }
    } catch (error) {
        console.error('API Error:', error);
    }
}
```

---

## Ví Dụ 4: Booking Flow Complete

```jsx
async function handleBookingFlow(mentorId) {
    try {
        // Step 1: Fetch schedules
        const response = await ScheduleService.getUpcomingSchedules(mentorId);
        const schedules = response.data;

        // Step 2: Select a schedule and time slot
        const selectedSchedule = schedules[0];
        const selectedTimeSlot = selectedSchedule.timeSlots[0];

        // Step 3: Show confirmation modal
        const userConfirms = await showConfirmationModal(
            selectedSchedule,
            selectedTimeSlot
        );

        if (userConfirms) {
            // Step 4: Book the slot
            const bookingResponse = await ScheduleService.bookScheduleSlot(
                selectedSchedule.scheduleId,
                selectedTimeSlot.timeSlotId,
                {
                    notes: 'Customer notes here'
                }
            );

            if (bookingResponse.respCode === "0") {
                alert('Đặt lịch thành công!');
                // Refresh schedules
                await ScheduleService.getUpcomingSchedules(mentorId);
            } else {
                alert('Lỗi: ' + bookingResponse.description);
            }
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}
```

---

## Ví Dụ 5: Date Filtering

```jsx
import useSchedule from '../../hooks/useSchedule';

function FilteredScheduleView() {
    const { schedules, getDateLabel, formatDate } = useSchedule(4);

    // Filter schedules for specific date
    const getSchedulesForDate = (targetDate) => {
        return schedules.filter(s => s.date === targetDate);
    };

    // Get all unique dates
    const getUniqueDates = () => {
        const dates = new Set(schedules.map(s => s.date));
        return Array.from(dates).sort();
    };

    return (
        <div>
            <h5>Available Dates:</h5>
            {getUniqueDates().map(date => (
                <div key={date} className="date-section">
                    <h6>
                        {getDateLabel(date)} - {date}
                    </h6>
                    <div className="schedules">
                        {getSchedulesForDate(date).map(schedule => (
                            <ScheduleCard 
                                key={schedule.scheduleId}
                                schedule={schedule}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
```

---

## Ví Dụ 6: Price Filtering

```jsx
import useSchedule from '../../hooks/useSchedule';
import { useState } from 'react';

function PriceFilteredSchedule() {
    const { schedules, formatPrice } = useSchedule(4);
    const [maxPrice, setMaxPrice] = useState(600000);

    // Filter by price
    const filteredSchedules = schedules.filter(
        s => s.price <= maxPrice
    );

    const minPrice = Math.min(...schedules.map(s => s.price));
    const maxPriceAvailable = Math.max(...schedules.map(s => s.price));

    return (
        <div>
            <div className="filter-section">
                <label>
                    Filter by price (Max: {formatPrice(maxPrice)})
                </label>
                <input
                    type="range"
                    min={minPrice}
                    max={maxPriceAvailable}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
            </div>

            <div className="filtered-schedules">
                {filteredSchedules.map(schedule => (
                    <ScheduleCard 
                        key={schedule.scheduleId}
                        schedule={schedule}
                        price={formatPrice(schedule.price)}
                    />
                ))}
            </div>
        </div>
    );
}
```

---

## Ví Dụ 7: Error Handling

```jsx
import useSchedule from '../../hooks/useSchedule';
import { Alert, Spinner, Button } from 'react-bootstrap';

function ScheduleWithErrorHandling() {
    const { loading, error, schedules, fetchUpcomingSchedules } = useSchedule(4);

    if (loading) {
        return (
            <div className="loading-state">
                <Spinner animation="border" />
                <p>Loading schedules...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <Alert variant="danger">
                    <h5>Failed to Load Schedules</h5>
                    <p>{error}</p>
                    <Button 
                        onClick={fetchUpcomingSchedules}
                        variant="outline-danger"
                    >
                        Try Again
                    </Button>
                </Alert>
            </div>
        );
    }

    if (schedules.length === 0) {
        return (
            <div className="empty-state">
                <Alert variant="info">
                    <p>No schedules available for the next 3 days</p>
                </Alert>
            </div>
        );
    }

    return <MentorSchedule mentorId={4} />;
}
```

---

## Ví Dụ 8: Auto-Refresh Schedules

```jsx
import useSchedule from '../../hooks/useSchedule';
import { useEffect } from 'react';

function AutoRefreshSchedule() {
    const { 
        schedules, 
        fetchUpcomingSchedules 
    } = useSchedule(4);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Auto-refreshing schedules...');
            fetchUpcomingSchedules();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [fetchUpcomingSchedules]);

    return (
        <div>
            <MentorSchedule mentorId={4} />
            <small className="text-muted">
                Last updated: {new Date().toLocaleTimeString()}
            </small>
        </div>
    );
}
```

---

## Ví Dụ 9: Mentor Availability Status

```jsx
import useSchedule from '../../hooks/useSchedule';

function MentorAvailabilityStatus() {
    const { schedules } = useSchedule(4);

    const getAvailabilityStats = () => {
        const totalSlots = schedules.reduce(
            (sum, s) => sum + s.timeSlots.length,
            0
        );
        const bookedSlots = schedules.filter(s => s.isBooked).length;
        const availableSlots = totalSlots - bookedSlots;

        return {
            total: totalSlots,
            booked: bookedSlots,
            available: availableSlots,
            percentage: totalSlots > 0 
                ? ((availableSlots / totalSlots) * 100).toFixed(0)
                : 0
        };
    };

    const stats = getAvailabilityStats();

    return (
        <div className="availability-stats">
            <h5>Mentor Availability</h5>
            <p>Total Slots: {stats.total}</p>
            <p>Available: {stats.available}</p>
            <p>Booked: {stats.booked}</p>
            <div className="progress">
                <div 
                    className="progress-bar"
                    style={{ width: `${stats.percentage}%` }}
                >
                    {stats.percentage}% Available
                </div>
            </div>
        </div>
    );
}
```

---

## Ví Dụ 10: Time Slot Grouping by Hour

```jsx
import useSchedule from '../../hooks/useSchedule';

function TimeSlotGroupedView() {
    const { schedules, getSortedTimeSlots, formatTimeSlot } = useSchedule(4);

    // Group time slots by hour
    const groupByHour = (schedule) => {
        const groups = {};
        getSortedTimeSlots(schedule).forEach(slot => {
            const hour = slot.timeStart;
            if (!groups[hour]) {
                groups[hour] = [];
            }
            groups[hour].push(slot);
        });
        return groups;
    };

    return (
        <div>
            {schedules.map(schedule => (
                <div key={schedule.scheduleId} className="schedule-item">
                    <h6>Schedule {schedule.scheduleId}</h6>
                    {Object.entries(groupByHour(schedule)).map(([hour, slots]) => (
                        <div key={hour} className="hour-group">
                            <p className="hour-label">Hour {hour}</p>
                            {slots.map(slot => (
                                <button key={slot.timeSlotId}>
                                    {formatTimeSlot(slot.timeStart, slot.timeEnd)}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
```

---

## Key Takeaways

✅ **Component Props**:
- `mentorId` - Required mentor ID
- `mentorName` - Optional mentor name for display

✅ **Hook Usage**:
- Auto-fetches data on mount
- Provides formatting utilities
- Handles loading/error states

✅ **Service API**:
- `getUpcomingSchedules()` - Get next 3 days
- `bookScheduleSlot()` - Book a slot

✅ **Best Practices**:
- Always handle loading state
- Show error messages clearly
- Display empty state when no data
- Auto-refresh if needed

---

**Last Updated**: October 27, 2025
