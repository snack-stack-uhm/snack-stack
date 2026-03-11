'use client';

import Image from 'next/image';
import { Card, Col, Container, Row } from 'react-bootstrap';
import styles from '@/styles/landing-features.module.css';

const features = [
  {
    title: 'Track Your Pantry',
    description: 'Easily keep track of your pantry, fridge, freezer, and spices, so you always know what you have.',
    icon: '/fridge.png',
  },
  {
    title: 'Reduce Food Waste',
    description: 'Get expiration reminders and suggestions to finish food before it spoils.',
    icon: '/avocado.png',
  },
  {
    title: 'Generate Shopping Lists',
    description: 'Automatically create shopping lists based on low or missing items in your pantry.',
    icon: '/cart.png',
  },
  {
    title: 'Discover Recipes',
    description: 'Find recipes based on ingredients you already have, reducing waste and meal prep stress.',
    icon: '/pasta.png',
  },
];

export default function Features() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Why Snack Stack</p>
          <h2 className={styles.heading}>Everything You Need In One Place</h2>
          <p className={styles.subheading}>
            Keep your current routine, but make it easier to manage ingredients,
            meals, and shopping in a single flow.
          </p>
        </div>

        <Row className="g-3 g-lg-4 justify-content-center">
          {features.map((feature) => (
            <Col key={feature.title} xs={12} lg={6}>
              <Card className={`${styles.card} h-100`}>
                <Card.Body className={styles.cardBody}>
                  <div className={styles.iconWrap}>
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={50}
                      height={50}
                      className={styles.icon}
                    />
                  </div>

                  <div className={styles.content}>
                    <Card.Title as="h3" className={styles.cardTitle}>{feature.title}</Card.Title>
                    <Card.Text className={styles.cardText}>{feature.description}</Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
