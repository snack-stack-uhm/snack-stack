'use client';

import { Table } from 'react-bootstrap';
import type { ProduceRelations } from '@/types/ProduceRelations';
import { useEffect, useState } from 'react';
import ProduceItem from './ProduceItem';

const ProduceTable = ({ rows }: { rows: ProduceRelations[] }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <Table
        striped
        bordered
        hover
        style={{
          textAlign: 'center',
          tableLayout: isMobile ? 'auto' : 'fixed',
          width: '100%',
          verticalAlign: 'middle',
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Location</th>
            <th>Storage</th>
            <th>Quantity</th>
            <th>Restock At</th>
            <th>Expiration</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((p) => <ProduceItem key={p.id} {...p} restockThreshold={p.restockThreshold ?? 1} />)
          ) : (
            <tr>
              <td colSpan={10} className="text-center">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ProduceTable;
