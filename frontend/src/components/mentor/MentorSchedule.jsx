import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Badge,
    Spinner,
    Alert,
    Modal,
    ListGroup,
    Tabs,
    Tab
} from 'react-bootstrap';
import {
    FaCalendarAlt,
    FaClock,
    FaCheckCircle,
    FaTimes,
    FaLock,
    FaTag,
    FaShoppingCart,
    FaArrowRight
} from 'react-icons/fa';
import useSchedule from '../../hooks/useSchedule';
import '../../styles/components/MentorSchedule.css';

/**
 * MentorSchedule Component
 * Displays mentor's available schedules for the next 3 days
 * Mentees can book entire schedule (all time slots together)
 * Features: Date filtering, schedule-level booking, responsive design
 */
const MentorSchedule = ({ mentorId, mentorName = 'Mentor' }) => {
    const {
        schedules,
        groupedSchedules,
        loading,
        error,
        fetchUpcomingSchedules,
        getSortedTimeSlots,
        formatTimeSlot,
        getDateLabel,
        formatPrice,
        bookSlot
    } = useSchedule(mentorId);

    // Get available dates (keys from groupedSchedules)
    const availableDates = React.useMemo(
        () => Object.keys(groupedSchedules).sort(),
        [groupedSchedules]
    );

    // Set default selected date to today (first date)
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Initialize selectedDate on first load
    React.useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    // Get schedules for selected date
    const schedulesForSelectedDate = React.useMemo(
        () => (selectedDate && groupedSchedules[selectedDate]) || [],
        [selectedDate, groupedSchedules]
    );

    /**
     * Handle schedule booking (entire schedule with all time slots)
     */
    const handleBookSchedule = (schedule) => {
        setSelectedSchedule(schedule);
        setShowBookingModal(true);
        setBookingError(null);
    };

    /**
     * Confirm booking entire schedule
     */
    const handleConfirmBooking = async () => {
        if (!selectedSchedule) return;

        setBookingLoading(true);
        setBookingError(null);

        try {
            const response = await bookSlot(
                selectedSchedule.scheduleId,
                null, // null = book entire schedule (all slots)
                {
                    notes: '' // Add any additional booking notes if needed
                }
            );

            setBookingSuccess(true);

            // Close modal and reset after 2 seconds
            setTimeout(() => {
                setShowBookingModal(false);
                setBookingSuccess(false);
                setSelectedSchedule(null);
                // Refresh schedules
                fetchUpcomingSchedules();
            }, 2000);
        } catch (err) {
            setBookingError(err.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
            console.error('Booking error:', err);
        } finally {
            setBookingLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="mentor-schedule-container">
                <Card className="border-0 shadow-sm">
                    <Card.Body className="py-5 text-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Đang tải lịch công tác...</p>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    // Error state
    if (error && schedules.length === 0) {
        return (
            <div className="mentor-schedule-container">
                <Card className="border-0 shadow-sm border-danger">
                    <Card.Body>
                        <Alert variant="warning" className="mb-0">
                            <FaCalendarAlt className="me-2" />
                            <strong>Lưu ý:</strong> {error}
                        </Alert>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-3"
                            onClick={fetchUpcomingSchedules}
                        >
                            Thử lại
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    // Empty state
    if (schedules.length === 0) {
        return (
            <div className="mentor-schedule-container">
                <Card className="border-0 shadow-sm">
                    <Card.Body className="py-5 text-center">
                        <FaCalendarAlt className="schedule-empty-icon text-muted mb-3" style={{ fontSize: '48px' }} />
                        <h6 className="text-muted mb-2">Chưa có lịch công tác</h6>
                        <p className="text-muted small">
                            Hiện tại {mentorName} chưa cập nhật lịch công tác trong 3 ngày tới.
                            Vui lòng quay lại sau.
                        </p>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="mentor-schedule-container">
            <Card className="schedule-card border-0 shadow-sm">
                <Card.Header className="schedule-header bg-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <FaCalendarAlt className="me-2" size={20} />
                            <h5 className="mb-0">Lịch công tác sắp tới</h5>
                        </div>
                        <Badge bg="light" text="dark" className="info-badge">
                        </Badge>
                    </div>
                </Card.Header>

                {/* Date Selection Tabs */}
                {availableDates.length > 0 && (
                    <div className="schedule-date-tabs px-3 pt-3">
                        <div className="date-tabs-container d-flex gap-2 flex-wrap">
                            {availableDates.map((date) => (
                                <Button
                                    key={date}
                                    variant={selectedDate === date ? 'primary' : 'outline-primary'}
                                    size="sm"
                                    onClick={() => setSelectedDate(date)}
                                    className="date-tab-btn"
                                >
                                    <div className="date-tab-label">
                                        <span className="date-label-text">
                                            {getDateLabel(date)}
                                        </span>
                                        <span className="date-label-date ms-2">
                                            {date}
                                        </span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <Card.Body className="schedule-body p-3">
                    {/* Show schedules for selected date */}
                    {selectedDate && (
                        <div className="schedule-selected-date">
                            {/* Date Header with Count */}
                            {schedulesForSelectedDate.length > 0 && (
                                <div className="schedule-selected-header mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <Badge bg="success" className="date-badge-lg">
                                            {getDateLabel(selectedDate)}
                                        </Badge>
                                        <span className="date-value text-muted">{selectedDate}</span>

                                    </div>
                                </div>
                            )}

                            {/* Empty state for selected date */}
                            {schedulesForSelectedDate.length === 0 ? (
                                <div className="text-center py-5">
                                    <FaCalendarAlt className="schedule-empty-icon text-muted mb-3" />
                                    <h6 className="text-muted mb-2">Chưa có lịch trong ngày</h6>
                                    <p className="text-muted small">
                                        Vui lòng chọn ngày khác hoặc quay lại sau
                                    </p>
                                </div>
                            ) : (
                                <div className="schedules-list">
                                    {schedulesForSelectedDate.map((schedule) => (
                                        <div
                                            key={schedule.scheduleId}
                                            className="schedule-card-item mb-3"
                                        >
                                            <Card className="schedule-slot-card border-0 shadow-sm">
                                                <Card.Body className="p-3">
                                                    {/* Top Section: Price, Status, Book Button */}
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="d-flex gap-2">
                                                            {/* Price Badge */}
                                                            <div className="price-badge">
                                                                <FaTag className="me-1" size={14} />
                                                                <span className="price-text">
                                                                    {formatPrice(schedule.price)}
                                                                </span>
                                                            </div>

                                                            {/* Status Badge */}
                                                            {schedule.isBooked ? (
                                                                <Badge bg="danger" className="status-badge">
                                                                    <FaLock className="me-1" size={12} />
                                                                    Đã đặt
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="success" className="status-badge">
                                                                    <FaCheckCircle className="me-1" size={12} />
                                                                    Còn trống
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* Book Button */}
                                                        <Button
                                                            variant={schedule.isBooked ? 'secondary' : 'success'}
                                                            size="sm"
                                                            onClick={() => handleBookSchedule(schedule)}
                                                            disabled={schedule.isBooked}
                                                            className="book-btn"
                                                        >
                                                            <FaShoppingCart className="me-1" size={12} />
                                                            Đặt lịch
                                                        </Button>
                                                    </div>

                                                    {/* Time Slots Display */}
                                                    <div className="time-slots-section">
                                                        <h6 className="time-slots-title mb-2 small text-muted">
                                                            <FaClock className="me-1" size={14} />
                                                            Các khung giờ:
                                                        </h6>

                                                        <div className="time-slots-inline d-flex flex-wrap gap-2">
                                                            {getSortedTimeSlots(schedule).map((timeSlot) => (
                                                                <Badge
                                                                    key={timeSlot.timeSlotId}
                                                                    bg="light"
                                                                    text="dark"
                                                                    className="time-slot-badge"
                                                                >
                                                                    {formatTimeSlot(
                                                                        timeSlot.timeStart,
                                                                        timeSlot.timeEnd
                                                                    )}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Mentor Email */}
                                                    <div className="mentor-info mt-3 pt-3 border-top">
                                                        <small className="text-muted">
                                                            📧 {schedule.emailMentor}
                                                        </small>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Card.Body>

                {/* Footer */}
                <Card.Footer className="schedule-footer bg-light border-top py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="info-text text-muted small">
                            <FaCalendarAlt className="me-1" />
                            Hiển thị lịch công tác trong 3 ngày tới
                        </div>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={fetchUpcomingSchedules}
                            className="refresh-btn"
                        >
                            🔄 Cập nhật
                        </Button>
                    </div>
                </Card.Footer>
            </Card>

            {/* Booking Confirmation Modal - Schedule Level */}
            <Modal show={showBookingModal} onHide={() => !bookingLoading && setShowBookingModal(false)} centered>
                <Modal.Header closeButton disabled={bookingLoading} className="border-0">
                    <Modal.Title>
                        <FaShoppingCart className="me-2 text-primary" />
                        Xác nhận đặt lịch
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="py-4">
                    {bookingSuccess ? (
                        <div className="text-center py-3">
                            <FaCheckCircle className="success-icon text-success mb-3" size={48} />
                            <h6 className="text-success mb-2">Đặt lịch thành công!</h6>
                            <p className="text-muted small">
                                Thông tin cuộc hẹn đã được gửi đến email của bạn
                            </p>
                        </div>
                    ) : (
                        <>
                            {bookingError && (
                                <Alert variant="danger" className="mb-3">
                                    <FaTimes className="me-2" />
                                    {bookingError}
                                </Alert>
                            )}

                            {selectedSchedule && (
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="border-0 px-0 py-2">
                                        <strong className="text-muted">Cố vấn:</strong>
                                        <div className="mt-1">{mentorName}</div>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="border-0 px-0 py-2">
                                        <strong className="text-muted">📅 Ngày:</strong>
                                        <div className="mt-1">
                                            {getDateLabel(selectedDate)} ({selectedDate})
                                        </div>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="border-0 px-0 py-2">
                                        <strong className="text-muted">🕒 Các khung giờ:</strong>
                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                            {getSortedTimeSlots(selectedSchedule).map((timeSlot) => (
                                                <Badge
                                                    key={timeSlot.timeSlotId}
                                                    bg="primary"
                                                    className="time-slot-badge-modal"
                                                >
                                                    {formatTimeSlot(timeSlot.timeStart, timeSlot.timeEnd)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </ListGroup.Item>

                                    <ListGroup.Item className="border-0 px-0 py-2">
                                        <strong className="text-muted">💰 Giá:</strong>
                                        <div className="mt-1 text-success fw-bold fs-5">
                                            {formatPrice(selectedSchedule.price)}
                                        </div>
                                        <small className="text-muted d-block mt-1">
                                            (bao gồm tất cả các khung giờ trên)
                                        </small>
                                    </ListGroup.Item>
                                </ListGroup>
                            )}
                        </>
                    )}
                </Modal.Body>

                {!bookingSuccess && (
                    <Modal.Footer className="border-0">
                        <Button
                            variant="secondary"
                            onClick={() => setShowBookingModal(false)}
                            disabled={bookingLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="me-2" />
                                    Xác nhận đặt lịch
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </div>
    );
};

export default MentorSchedule;
