import { PATCH } from '../src/app/api/produce/[id]/restock/route';

async function runApiTests() {
  const testCases = [
    {
      description: 'Valid restock update',
      input: { restockTrigger: 'half', customThreshold: 5 },
      params: { id: '2' },
      expectedStatus: 200,
    },
    {
      description: 'Invalid ID (non-numeric)',
      input: { restockTrigger: 'custom', customThreshold: 10 },
      params: { id: 'abc' },
      expectedStatus: 500,
    },
    {
      description: 'Missing fields',
      input: {},
      params: { id: '1' },
      expectedStatus: 500,
    },
    {
      description: 'Malicious input: SQL injection attempt',
      input: { restockTrigger: 'custom', customThreshold: '1; DROP TABLE produce;' },
      params: { id: '1' },
      expectedStatus: 500,
    },
  ];

  for (const test of testCases) {
    try {
      const request = {
        json: async () => test.input,
      } as Request;

      const response = await PATCH(request, { params: Promise.resolve(test.params) });
      const body = await response.json();
      if (response.status === test.expectedStatus) {
        console.log(`PASS: ${test.description}`);
      } else {
        console.error(`FAIL: ${test.description}`, body);
      }
    } catch (e) {
      console.error(`ERROR: ${test.description}`, e);
    }
  }
}

runApiTests();
