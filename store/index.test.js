/* eslint-disable no-undef */
import Vuex from 'vuex';
import axios from 'axios';
import { createLocalVue } from '@vue/test-utils';
import MockAdapter from 'axios-mock-adapter';

describe('store/movies', () => {
  const localVue = createLocalVue();

  localVue.use(Vuex);

  let NuxtStore;
  let store;
  let mock;

  beforeAll(async () => {
    const storePath = `${process.env.buildDir}/store.js`;
    NuxtStore = await import(storePath);
  });

  beforeEach(async () => {
    store = await NuxtStore.createStore();
    store.$axios = axios;
    mock = new MockAdapter(store.$axios);
  });

  describe('Action methods', () => {
    describe('getUsersAndRotas()', () => {
      test('initial user and rota state should be empty', () => {
        expect(store.state.users).toStrictEqual([]);
        expect(store.state.rotas).toStrictEqual([]);
      });

      test('after invocation, users and rotas should be populated and formatted', async () => {
        // Mock of /rota endpoint
        mock.onGet('rotas').reply(200, {
          users: [
            { userId: 1, user: 'placeholder' },
          ],
          rotas: [
            {
              rotaId: 1,
              rota: [
                { userId: 1, type: 'morning', date: '2020-11-10' },
              ],
            },
          ],
        });

        await store.dispatch('getUsersAndRotas');

        // Populated
        expect(store.state.users.length).toBeGreaterThan(0);
        expect(store.state.rotas.length).toBeGreaterThan(0);

        const firstItem = store.state.users[0];

        // Formatted
        expect(firstItem).toHaveProperty('records');
        expect(firstItem).toHaveProperty('avatar');
      });

      test('after invocation, if an error is thrown a snackbar should be displayed', async () => {
        // Mock of /rota endpoint with an error
        mock.onGet('rotas').networkError();

        await store.dispatch('getUsersAndRotas');

        expect(store.state.snackbar.visible).toBe(true);
      });
    });
  });
});
