import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const ProfilePage = () => {
    return (
        <Container className="py-5">
            <Row>
                <Col md={8} className="mx-auto">
                    <Card>
                        <Card.Header>
                            <h4>Hồ sơ cá nhân</h4>
                        </Card.Header>
                        <Card.Body>
                            <p>Trang hồ sơ cá nhân đang được phát triển...</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
