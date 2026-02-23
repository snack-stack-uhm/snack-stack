'use client';

import Image from 'next/image';

const features = [
  {
    title: 'Track Your Pantry',
    description: 'Easily keep track of your pantry, fridge, freezer, and spices, so you always know what you have.',
    icon: '/apple.png',
  },
  {
    title: 'Reduce Food Waste',
    description: 'Get expiration reminders and suggestions to finish food before it spoils.',
    icon: '/banana.png',
  },
  {
    title: 'Generate Shopping Lists',
    description: 'Automatically create shopping lists based on low or missing items in your pantry.',
    icon: '/carrot.png',
  },
  {
    title: 'Discover Recipes',
    description: 'Find recipes based on ingredients you already have, reducing waste and meal prep stress.',
    icon: '/chickenbreast.png',
  },
];

export default function Features() {
  return (
    <section
      style={{
        padding: '6rem 2rem',
        backgroundColor: 'var(--cream)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {features.map((feature) => (
          <div
            key={feature.title}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            className="hover-card"
          >
            <Image
              src={feature.icon}
              alt={feature.title}
              width={80}
              height={80}
              style={{ marginBottom: '1.5rem' }}
            />
            <h3
              style={{
                fontWeight: 600,
                fontSize: '1.25rem',
                marginBottom: '1rem',
                color: 'var(--rich-brown)',
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--cozy-brown)',
                lineHeight: 1.5,
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      <style>
        {`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }
      `}
      </style>
    </section>
  );
}
