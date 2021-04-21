import { requestWrapper } from '../utils';

export const state = () => ({
  users: [],
  rotas: [],
  snackbar: {
    visible: false,
    color: '#2b9263',
    text: '',
  },
  pageState: '',
});

export const mutations = {
  // Set users
  setUsers(state, users) {
    state.users = users.map((user) => {
      // Get a random decimal
      const randomNumber = Math.random();
      // Infer a random gender
      const gender = randomNumber > 0.5 ? 'men' : 'women';
      // Infer a random user id between 1 - 100
      const userId = Math.floor(randomNumber * 99);

      return {
        ...user,
        // Set a random avatar
        avatar: `https://randomuser.me/api/portraits/med/${gender}/${userId}.jpg`,
        // Set the recorded amount of times user occurs in the data
        records: state.rotas.filter(({ userId }) => userId === user.userId).length,
      };
    });
  },

  // Set rotas
  setRotas(state, rotas) {
    state.rotas = rotas;
  },

  // Set snackbar text, visibility and color
  setSnackbarValues(state, updatedSnackbar) {
    state.snackbar = {
      ...state.snackbar,
      ...updatedSnackbar,
    };
  },

  // Add a new rota to the current rotas
  addRota(state, newRota) {
    // Get a list of dates that we want exiled from the current data
    const possibleConflictingDates = newRota.map(({ date }) => date);

    state.rotas = [
      // Filter out conflicting dates
      ...state.rotas.filter(({ date }) => !possibleConflictingDates.includes(date)),
      ...newRota,
    ];
  },

  // Set the page state
  setPageState(state, pageState) {
    state.pageState = pageState;
  },
};

// NOTE: These API calls don't really make much sense, even as dummy endpoints.
//  /rotas returns 2 rotas with id's #11 & #12...
// /generate generates 1 rota with id #13 and its identical to #12...
// Recalling /rotas after /generate doesn't include the newly 'generated' #13...

export const actions = {
  // API call for /rotas
  async getUsersAndRotas(context) {
    const { commit } = context;

    await requestWrapper(context, async () => {
      const { data: { rotas, users } } = await this.$axios.get('rotas');

      // Format the rotas data structure to only what we need.
      const formattedRotas = rotas
        .map(({ rota }) => rota)
        .flat();

      // Set the users and rotas in the state
      commit('setRotas', formattedRotas);
      commit('setUsers', users);
    });
  },

  // API call for /generate & /rota/{generated rota id}
  async generateNewRota(context) {
    const { commit } = context;

    await requestWrapper(context, async () => {
      const { data: { rotaId } } = await this.$axios.get('generate');
      const { data: { rota } } = await this.$axios.get(`rota/${rotaId}`);

      // Add the new rota to the current rota's
      commit('addRota', rota);
    });
  },

  // Show snackbar
  showSnackbar({ commit }, updatedSnackbar) {
    // Set the snackbar to visible
    commit('setSnackbarValues', { ...updatedSnackbar, visible: true });

    // Remove after 3 seconds
    setTimeout(() => {
      commit('setSnackbarValues', { visible: false });
    }, 3000);
  },
};

export const getters = {
  // Checks if the page is in a state of loading
  isLoading(state) {
    return state.pageState === 'loading';
  },
};
