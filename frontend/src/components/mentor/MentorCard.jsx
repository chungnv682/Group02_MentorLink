import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaLinkedin, FaBookmark, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCountryName, getCountryFlagUrl } from '../../utils/mentorUtils';

const MentorCard = ({ mentor }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/mentors/${mentor.id}`);
    };

    const handleBookNow = () => {
        // Navigate to booking page or show booking modal
        navigate(`/mentors/${mentor.id}/booking`);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-warning" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStar key="half" className="text-warning opacity-50" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="text-muted" />);
        }

        return stars;
    };

    return (
        <Card className="mentor-card h-100 shadow-sm">
            <div className="mentor-avatar-container position-relative">
                <div className="mentor-avatar-wrapper">
                    <img
                        src={mentor.avatarUrl || '/images/default-avatar.png'}
                        alt={mentor.fullname}
                        className="mentor-avatar"
                    />
                </div>
                <Badge
                    bg={mentor.gender === 'M' ? 'primary' : 'pink'}
                    className="position-absolute"
                    style={{ top: '10px', right: '10px' }}
                >
                    {mentor.gender === 'M' ? 'Nam' : 'Nữ'}
                </Badge>
            </div>

            <Card.Body className="d-flex flex-column text-center">
                <div className="mb-3">
                    <Card.Title className="mentor-name">{mentor.fullname}</Card.Title>
                    <Card.Subtitle className="mentor-title">
                        {mentor.title}
                    </Card.Subtitle>
                </div>

                <div className="mb-3">
                    <div className="d-flex justify-content-center align-items-center mb-2">
                        <div className="me-2">
                            {renderStars(mentor.rating)}
                        </div>
                        <span className="text-muted fw-semibold">
                            {mentor.rating}
                        </span>
                    </div>
                    <small className="text-muted">
                        {mentor.numberOfBooking} lượt booking thành công
                    </small>
                </div>

                <div className="mb-3">
                    <small className="text-muted d-flex align-items-center justify-content-center">
                        <FaMapMarkerAlt className="me-1" />
                        {mentor.currentLocation}
                    </small>
                </div>

                {/* Approved Countries Section */}
                {mentor.approvedCountries && mentor.approvedCountries.length > 0 && (
                    <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-center mb-2">
                            <FaGlobe className="text-primary me-1" style={{ fontSize: '0.9rem' }} />
                            <small className="text-muted fw-semibold">Hỗ trợ du học:</small>
                        </div>
                        <div className="d-flex flex-wrap justify-content-center gap-1">
                            {mentor.approvedCountries.slice(0, 3).map((country, index) => (
                                <Badge
                                    key={index}
                                    bg="outline-primary"
                                    className="country-badge d-flex align-items-center"
                                    style={{
                                        fontSize: '0.7rem',
                                        padding: '0.25rem 0.5rem',
                                        border: '1px solid #0d6efd',
                                        color: '#0d6efd',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    {getCountryFlagUrl(country) ? (
                                        <img
                                            src={getCountryFlagUrl(country)}
                                            alt={`${getCountryName(country)} flag`}
                                            style={{
                                                width: '16px',
                                                height: '12px',
                                                marginRight: '4px',
                                                objectFit: 'cover',
                                                borderRadius: '1px'
                                            }}
                                        />
                                    ) : null}
                                    {getCountryName(country)}
                                </Badge>
                            ))}
                            {mentor.approvedCountries.length > 3 && (
                                <Badge
                                    bg="secondary"
                                    style={{
                                        fontSize: '0.7rem',
                                        padding: '0.25rem 0.5rem'
                                    }}
                                >
                                    +{mentor.approvedCountries.length - 3}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <Card.Text className="mentor-intro flex-grow-1">
                    {mentor.intro && mentor.intro.length > 80
                        ? `${mentor.intro.substring(0, 80)}...`
                        : mentor.intro}
                </Card.Text>

                <div className="mentor-card-footer mt-auto">
                    <div className="d-grid gap-2">
                        <div className="row g-2">
                    
                            <div className="col-12">
                                <Button
                                    variant="outline-primary"
                                    onClick={handleViewDetails}
                                    className="fw-semibold w-100"
                                    size="sm"
                                >
                                    Xem chi tiết
                                </Button>
                            </div>
                        </div>
                        <div className="d-flex gap-2 justify-content-center">
                            {mentor.linkedinUrl && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    href={mentor.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="LinkedIn Profile"
                                >
                                    <FaLinkedin />
                                </Button>
                            )}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {/* Add to favorites logic */ }}
                                title="Lưu mentor"
                            >
                                <FaBookmark />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default MentorCard;
