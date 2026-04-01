'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { Clock, Search, ExclamationTriangle } from 'react-bootstrap-icons';
import Link from 'next/link';

type QuickAlertsProps = {
  ownerEmail: string;
  recipes: any[];
  produce: any[];
};

export default function QuickAlerts({ ownerEmail, recipes, produce }: QuickAlertsProps) {
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerEmail) {
      setExpiringItems([]);
      setLowStockItems([]);
      return () => {};
    }

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const [expiringRes, lowStockRes] = await Promise.all([
          fetch(`/api/expiring?owner=${encodeURIComponent(ownerEmail)}`),
          fetch(`/api/shopping-lists?owner=${encodeURIComponent(ownerEmail)}`),
          fetch(`/api/low-stock?owner=${encodeURIComponent(ownerEmail)}`),
        ]);

        if (expiringRes.ok) setExpiringItems((await expiringRes.json()).expiringItems || []);
        if (lowStockRes.ok) setLowStockItems((await lowStockRes.json()).lowStockItems || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [ownerEmail]);

  const pantryNames = useMemo(
    () => new Set(produce.map((p) => p.name.toLowerCase())),
    [produce],
  );

  const availableRecipes = useMemo(
    () => recipes.filter((r) => {
      const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
      return ingredients.length > 0 && ingredients.every((ing: string) => pantryNames.has(ing.toLowerCase()));
    }),
    [recipes, pantryNames],
  );

  const recipeCount = availableRecipes.length;

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm border-light">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <ExclamationTriangle className="me-2 text-warning" size={20} />
            <Card.Title className="mb-0">Quick Alerts</Card.Title>
          </div>
          <div className="text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading alerts...
          </div>
        </Card.Body>
      </Card>
    );
  }

  const formatExpiringText = () => {
    if (expiringItems.length === 0) return 'No items expiring soon';
    if (expiringItems.length === 1) return `${expiringItems[0].name} expires soon`;
    return `${expiringItems[0].name} and ${expiringItems.length - 1} other items`;
  };

  const formatLowStockText = () => {
    if (lowStockItems.length === 0) return 'All items sufficiently stocked';
    if (lowStockItems.length === 1) return `${lowStockItems[0].name} is low`;
    return `${lowStockItems[0].name} and ${lowStockItems.length - 1} other items low`;
  };

  const formatRecipesText = () => {
    if (recipeCount === 0) return 'No recipes available with current pantry';
    if (recipeCount === 1) {
      return (
        <>
          You can make
          {' '}
          <Link
            href={`/recipes/${availableRecipes[0].id}`}
            className="text-success text-decoration-none"
            style={{ transition: 'font-weight 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.fontWeight = '900')}
            onMouseLeave={(e) => (e.currentTarget.style.fontWeight = '600')}
          >
            {availableRecipes[0].title}
          </Link>
        </>
      );
    }
    if (recipeCount === 2) {
      return (
        <>
          You can make
          {' '}
          <Link
            href={`/recipes/${availableRecipes[0].id}`}
            className="text-success text-decoration-none"
            style={{ transition: 'font-weight 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.fontWeight = '900')}
            onMouseLeave={(e) => (e.currentTarget.style.fontWeight = '600')}
          >
            {availableRecipes[0].title}
          </Link>
          {' '}
          and
          {' '}
          <Link
            href={`/recipes/${availableRecipes[1].id}`}
            className="text-success text-decoration-none"
            style={{ transition: 'font-weight 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.fontWeight = '900')}
            onMouseLeave={(e) => (e.currentTarget.style.fontWeight = '600')}
          >
            {availableRecipes[1].title}
          </Link>
        </>
      );
    }

    return (
      <>
        You can make
        {' '}
        <Link
          href={`/recipes/${availableRecipes[0].id}`}
          className="text-success text-decoration-none"
          style={{ transition: 'font-weight 0.2s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.fontWeight = '900')}
          onMouseLeave={(e) => (e.currentTarget.style.fontWeight = '600')}
        >
          {availableRecipes[0].title}
        </Link>
        ,
        {' '}
        <Link
          href={`/recipes/${availableRecipes[1].id}`}
          className="text-success text-decoration-none"
          style={{ transition: 'font-weight 0.2s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.fontWeight = '900')}
          onMouseLeave={(e) => (e.currentTarget.style.fontWeight = '600')}
        >
          {availableRecipes[1].title}
        </Link>
        , and more
      </>
    );
  };

  return (
    <Card className="mb-4 shadow-sm border-light">
      <Card.Body>
        <div className="d-flex align-items-center mb-4">
          <ExclamationTriangle className="me-2 text-warning" size={20} />
          <Card.Title className="mb-0">Quick Alerts</Card.Title>
        </div>

        <Row xs={1} md={3} className="g-4">
          {/* Expiring Soon */}
          <Col>
            <Link href="/view-pantry" className="text-success text-decoration-none fw-semibold">
              <Card className="h-100 border-start border-4 border-warning shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <Clock className="me-2 text-secondary" />
                      <Card.Subtitle className="fw-semibold text-dark">Expiring Soon</Card.Subtitle>
                    </div>
                    <Badge bg="warning" text="dark">
                      {expiringItems.length}
                      {' '}
                      {expiringItems.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small mb-0">{formatExpiringText()}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Low Stock */}
          <Col>
            <Link href="/view-pantry" className="text-danger text-decoration-none fw-semibold">
              <Card className="h-100 border-start border-4 border-danger shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <ExclamationTriangle className="me-2 text-secondary" />
                      <Card.Subtitle className="fw-semibold text-dark">Low Stock</Card.Subtitle>
                    </div>
                    <Badge bg="danger">
                      {lowStockItems.length}
                      {' '}
                      {lowStockItems.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small mb-0">{formatLowStockText()}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Recipes Available */}
          <Col>
            <Link href="/recipes" className="text-danger text-decoration-none fw-semibold">
              <Card className="h-100 border-start border-4 border-success shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <Search className="me-2 text-secondary" />
                      <Card.Subtitle className="fw-semibold text-dark">Recipes Available</Card.Subtitle>
                    </div>
                    <Badge bg="success">
                      {recipeCount}
                      {' '}
                      new
                    </Badge>
                  </div>
                  <Card.Text className="text-muted small mb-0">{formatRecipesText()}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
