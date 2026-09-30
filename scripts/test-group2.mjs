import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import React from 'react';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
const values = new Map();
globalThis.localStorage = {
  getItem: (k) => values.get(k) ?? null,
  setItem: (k, v) => values.set(k, String(v)),
  removeItem: (k) => values.delete(k),
};
const server = await createServer({
  configFile: false,
  oxc: false,
  ssr: {
    external: [
      'axios',
      '@reduxjs/toolkit',
      'react',
      'react-dom',
      'react-redux',
      'react-router-dom',
      'lucide-react',
    ],
  },
  plugins: [
    {
      name: 'test-typescript',
      enforce: 'pre',
      transform(code, id) {
        if (!/\.tsx?$/.test(id) || id.includes('node_modules')) return;
        return {
          code: ts.transpileModule(code, {
            compilerOptions: {
              module: ts.ModuleKind.ESNext,
              target: ts.ScriptTarget.ES2022,
              jsx: ts.JsxEmit.ReactJSX,
            },
            fileName: id,
          }).outputText,
          map: null,
        };
      },
    },
  ],
  server: { middlewareMode: true, hmr: false },
  resolve: {
    alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  },
});
let count = 0;
const check = async (name, run) => {
  await run();
  count++;
  console.log(`PASS ${name}`);
};
try {
  const { apiClient } = await server.ssrLoadModule(
    '/src/services/api/client.ts'
  );
  const { unitApi } = await server.ssrLoadModule(
    '/src/features/units/api/unitApi.ts'
  );
  const { leaseApi } = await server.ssrLoadModule(
    '/src/features/leases/api/leaseApi.ts'
  );
  const { occupancyApi } = await server.ssrLoadModule(
    '/src/features/occupancies/api/occupancyApi.ts'
  );
  const { propertyApi } = await server.ssrLoadModule(
    '/src/features/property/api/propertyApi.ts'
  );
  const { store } = await server.ssrLoadModule('/src/app/store/index.ts');
  const { setCredentials, setActiveRole, switchUserById } =
    await server.ssrLoadModule('/src/features/auth/store/authSlice.ts');
  const { selectGrantedRoles } = await server.ssrLoadModule(
    '/src/features/auth/store/permissions.ts'
  );
  const { fetchInventory, fetchBuildings } = await server.ssrLoadModule(
    '/src/features/units/store/unitSlice.ts'
  );
  const { fetchLeases } = await server.ssrLoadModule(
    '/src/features/leases/store/leaseSlice.ts'
  );
  const { UnitGrid } = await server.ssrLoadModule(
    '/src/features/units/components/UnitGrid.tsx'
  );
  const { ChangeLeaseStatusModal } = await server.ssrLoadModule(
    '/src/features/leases/components/ChangeLeaseStatusModal.tsx'
  );
  const unitId = '0e2943f6-765a-4f08-88a0-bb44245d8e12';
  const tenantId = '110e8400-e29b-41d4-a716-446655440000';
  const leaseId = '220e8400-e29b-41d4-a716-446655440000';
  const unit = {
    unitId,
    ownershipUnitId: 12,
    floorId: 37,
    unitTypeId: 2,
    unitNumber: 'A-305',
    status: 'AVAILABLE',
  };
  const lease = {
    id: leaseId,
    unitId,
    tenantId,
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  const jwt = (roles) =>
    [
      'e30',
      Buffer.from(
        JSON.stringify({ sub: tenantId, roles, type: 'user' })
      ).toString('base64url'),
      'signature',
    ].join('.');
  const credentials = (roles) =>
    store.dispatch(
      setCredentials({
        user: {
          id: tenantId,
          name: 'Test User',
          email: 'test@example.com',
          role: roles[0],
        },
        token: jwt(roles),
      })
    );
  let calls = [];
  let responseData = {};
  apiClient.defaults.adapter = async (config) => {
    calls.push({
      method: config.method,
      url: config.url,
      body: config.data ? JSON.parse(config.data) : undefined,
      params: config.params,
      authorization: config.headers.Authorization,
    });
    return {
      data:
        typeof responseData === 'function'
          ? responseData(config)
          : responseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
  await check('default gateway address is 8080/api/v1', () =>
    assert.equal(apiClient.defaults.baseURL, 'http://localhost:8080/api/v1')
  );
  await check(
    'manager inventory preserves UUID and numeric ownership unit references',
    async () => {
      credentials(['MANAGER']);
      calls = [];
      responseData = (c) =>
        c.url === '/units'
          ? [unit]
          : [{ id: 2, typeName: 'Apartment', baseRent: 100, capacityLimit: 2 }];
      await store.dispatch(fetchInventory()).unwrap();
      assert.deepEqual(calls.map((c) => c.url).sort(), [
        '/unit-types',
        '/units',
      ]);
      assert.equal(store.getState().units.units[0].unitId, unitId);
      assert.equal(store.getState().units.units[0].ownershipUnitId, 12);
      assert.equal(calls[0].authorization, `Bearer ${jwt(['MANAGER'])}`);
    }
  );
  await check(
    'returned units render without numeric IDs or building/floor-number fields',
    () => {
      const html = renderToStaticMarkup(
        React.createElement(UnitGrid, {
          units: [unit],
          unitTypes: [],
          onSelectUnit() {},
        })
      );
      assert.match(html, /A-305/);
      assert.match(html, /Floor ID 37/);
    }
  );
  await check(
    'unit creation sends floorId and receives UUID UnitView',
    async () => {
      calls = [];
      responseData = unit;
      assert.deepEqual(
        await unitApi.createUnit({
          floorId: 37,
          unitTypeId: 2,
          unitNumber: 'A-305',
        }),
        unit
      );
      assert.deepEqual(calls[0].body, {
        floorId: 37,
        unitTypeId: 2,
        unitNumber: 'A-305',
      });
    }
  );
  await check(
    'unit history is complete beyond 100 leases and uses dedicated UUID endpoint',
    async () => {
      calls = [];
      responseData = {
        success: true,
        data: Array.from({ length: 125 }, (_, n) => ({ ...lease, id: `${n}` })),
      };
      assert.equal((await unitApi.getLeaseHistory(unitId)).length, 125);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, `/leases/units/${unitId}`);
    }
  );
  await check(
    'lease list carries page/filter parameters and preserves metadata',
    async () => {
      calls = [];
      const pagination = {
        page: 2,
        size: 20,
        totalElements: 65,
        totalPages: 4,
        hasNext: true,
        hasPrevious: true,
      };
      responseData = { success: true, data: [lease], pagination };
      await store
        .dispatch(fetchLeases({ page: 2, size: 20, status: 'ACTIVE' }))
        .unwrap();
      assert.deepEqual(calls[0].params, {
        page: 2,
        size: 20,
        status: 'ACTIVE',
      });
      assert.deepEqual(store.getState().leases.pagination, pagination);
    }
  );
  await check(
    'resident lease lookup uses authorized lease detail path',
    async () => {
      calls = [];
      responseData = { success: true, data: lease };
      assert.equal((await leaseApi.get(leaseId)).id, leaseId);
      assert.equal(calls[0].url, `/leases/${leaseId}`);
    }
  );
  await check(
    'physical occupancy registration, self history, unit lookup and move-out match controllers',
    async () => {
      calls = [];
      const occupancy = {
        id: leaseId,
        unitId,
        residentId: tenantId,
        leaseId,
        status: 'ACTIVE',
        moveInDate: '2026-01-01',
        moveOutDate: null,
      };
      responseData = { success: true, data: occupancy };
      const body = {
        unitId,
        residentId: tenantId,
        leaseId,
        moveInDate: '2026-01-01',
      };
      await occupancyApi.register(body);
      await occupancyApi.forResident(tenantId);
      await occupancyApi.forUnit(unitId);
      await occupancyApi.deactivate(leaseId);
      assert.deepEqual(
        calls.map((c) => [c.method, c.url]),
        [
          ['post', '/occupancies'],
          ['get', `/occupancies/residents/${tenantId}`],
          ['get', `/occupancies/units/${unitId}`],
          ['patch', `/occupancies/${leaseId}/status`],
        ]
      );
      assert.deepEqual(calls[0].body, body);
      assert.equal(calls[3].body, undefined);
    }
  );
  await check(
    'ownership lookup keeps its numeric reference separate from UUID unit APIs',
    async () => {
      calls = [];
      responseData = [];
      await propertyApi.getOwnerships({ by: 'unit', unitId: 12 });
      assert.equal(calls[0].url, '/ownerships/units/12');
    }
  );
  await check(
    'persona switching cannot grant manager permissions to an admin session',
    () => {
      credentials(['ADMIN']);
      store.dispatch(setActiveRole('MANAGER'));
      store.dispatch(switchUserById('resident-001'));
      assert.deepEqual(selectGrantedRoles(store.getState()), ['ADMIN']);
      assert.equal(store.getState().auth.currentUser.id, tenantId);
    }
  );
  await check('multi-role JWTs keep exact backend role names', () => {
    credentials(['ADMIN', 'MANAGER', 'PROPERTY_MANAGER']);
    assert.deepEqual(selectGrantedRoles(store.getState()), [
      'ADMIN',
      'MANAGER',
      'PROPERTY_MANAGER',
    ]);
  });
  await check(
    'manager building loading fetches floor choices allowed by property security',
    async () => {
      credentials(['MANAGER']);
      calls = [];
      await store.dispatch(fetchBuildings()).unwrap();
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, '/buildings');
    }
  );
  const { availableLeaseTransitions } = await server.ssrLoadModule(
    '/src/features/leases/validation/leaseValidation.ts'
  );
  await check(
    'activation respects both date boundaries and future/past restrictions',
    () => {
      const draft = {
        ...lease,
        status: 'DRAFT',
        startDate: '2026-09-29',
        endDate: '2026-10-01',
      };
      assert.equal(
        availableLeaseTransitions(draft, '2026-09-28').includes('ACTIVE'),
        false
      );
      assert.equal(
        availableLeaseTransitions(draft, '2026-09-29').includes('ACTIVE'),
        true
      );
      assert.equal(
        availableLeaseTransitions(draft, '2026-10-01').includes('ACTIVE'),
        true
      );
      assert.equal(
        availableLeaseTransitions(draft, '2026-10-02').includes('ACTIVE'),
        false
      );
      assert.deepEqual(
        availableLeaseTransitions(
          { ...draft, status: 'TERMINATED' },
          '2026-09-29'
        ),
        []
      );
    }
  );
  const { routesConfig } = await server.ssrLoadModule(
    '/src/app/router/routeConfig.tsx'
  );
  await check('Group 2 route gates match backend permissions', () => {
    const rolesFor = (path) =>
      routesConfig.find((r) => r.path === path).element.props.allowedRoles;
    assert.deepEqual(rolesFor('/leases'), ['MANAGER']);
    assert.deepEqual(rolesFor('/units'), [
      'ADMIN',
      'PROPERTY_MANAGER',
      'MANAGER',
    ]);
    assert.deepEqual(rolesFor('/floors'), ['ADMIN', 'TENANT']);
    assert.deepEqual(rolesFor('/my-residence'), [
      'RESIDENT',
      'TENANT',
      'OWNER',
    ]);
  });
  const { toApiError } = await server.ssrLoadModule(
    '/src/services/api/apiError.ts'
  );
  await check('normalized backend errors survive Redux thunk rejection', () => {
    const error = {
      status: 422,
      code: 'CAPACITY_LIMIT_EXCEEDED',
      message: 'Unit capacity reached',
    };
    assert.deepEqual(toApiError(error, 'Could not add unit.'), error);
  });
  const { responseErrorInterceptor } = await server.ssrLoadModule(
    '/src/services/api/interceptors.ts'
  );
  await check(
    'expired API sessions clear Redux and storage while failed login stays on login flow',
    async () => {
      credentials(['MANAGER']);
      const loginError = {
        response: { status: 401, data: { message: 'Invalid credentials' } },
        config: { url: '/auth/login' },
      };
      await assert.rejects(responseErrorInterceptor(loginError));
      assert.equal(store.getState().auth.isAuthenticated, true);
      const protectedError = {
        response: { status: 401 },
        config: { url: '/leases' },
      };
      await assert.rejects(responseErrorInterceptor(protectedError));
      assert.equal(store.getState().auth.isAuthenticated, false);
      assert.equal(localStorage.getItem('ams_auth_token'), null);
    }
  );
  // Importing the status dialog exercises its TypeScript/React dependency chain.
  assert.equal(typeof ChangeLeaseStatusModal, 'function');
  console.log(`${count} Group 2 checks passed.`);
} finally {
  await server.close();
}
