'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Badge, Col, Container, Row } from 'react-bootstrap';
import styles from '@/styles/hero.module.css';

export default function Hero() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const parent = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

  return (
    <section className={styles.heroSection}>
      <Container>
        <Row className="align-items-center g-4">
          <Col lg={6} className="order-2 order-lg-1">
            <motion.div
              className={styles.logoShell}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, rotate: 0.6 }}
            >
              <Image
                src="/snack-stack-logo.png"
                alt="Snack Stack Logo"
                width={420}
                height={420}
                priority
                className={styles.logoImage}
              />
            </motion.div>
          </Col>

          <Col lg={6} className="order-1 order-lg-2 text-center text-lg-start">
            <motion.div variants={parent} initial="hidden" animate="show">
              <motion.p className={styles.eyebrow} variants={item}>
                Pantry Management Made Easy
              </motion.p>

              <motion.h1
                className={styles.title}
                variants={item}
              >
                Welcome to
                {' '}
                <span className={styles.titleAccent}>Snack Stack</span>
              </motion.h1>

              <motion.p
                className={styles.subtitle}
                variants={item}
              >
                Keep track of your pantry, cut down on food waste, and discover
                recipes with what you already have. Smarter cooking, simplified.
              </motion.p>

              <motion.div className="d-flex gap-3 justify-content-center justify-content-lg-start flex-wrap" variants={item}>
                {!isLoading && (
                  !session ? (
                    <>
                      <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.12 }}>
                        <Link href="/auth/signup" className={styles.primaryButton}>
                          Sign Up
                        </Link>
                      </motion.div>

                      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.12 }}>
                        <Link href="/auth/signin" className={styles.secondaryButton}>
                          Log In
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.12 }}>
                      <Link href="/dashboard" className={styles.primaryButton}>
                        Go to Dashboard
                      </Link>
                    </motion.div>
                  )
                )}
              </motion.div>

              <motion.div className={styles.metaRow} variants={item}>
                <Badge pill className={styles.metaPill}>Track Food</Badge>
                <Badge pill className={styles.metaPill}>Reduce Waste</Badge>
                <Badge pill className={styles.metaPill}>Cook Smarter</Badge>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
