'use client';

import { Table } from 'react-bootstrap';
import type { ProduceRelations } from '@/types/ProduceRelations';
import ProduceItem from './ProduceItem';

const ProduceTable = ({ rows }: { rows: ProduceRelations[] }) => (
  <div>
    <div className="produce-table-desktop" style={{ overflowX: 'auto', width: '112%' }}>
      <Table
        striped
        bordered
        hover
        style={{
          textAlign: 'center',
          tableLayout: 'auto',
          width: '90%',
          verticalAlign: 'middle',
        }}
      >
        <thead>
          <tr>
            <th className="produce-name-column">Name</th>
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
              <td colSpan={8} className="text-center">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>

    <div className="produce-table-mobile">
      {rows.length ? (
        rows.map((p) => (
          <ProduceItem
            key={p.id}
            {...p}
            restockThreshold={p.restockThreshold ?? 1}
            layout="mobile"
          />
        ))
      ) : (
        <div className="text-center py-3">No items found</div>
      )}
    </div>
  </div>
);

export default ProduceTable;
