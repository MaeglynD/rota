export const successColor = '#2b9263';

export const failureColor = '#ff6161';

export const formattedDaysOfTheWeek = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
];

// Wrapper for API calls, helps avoid repeat code
export const requestWrapper = async (context, attempt, onError, successSnack, failureSnack) => {
  const { commit, dispatch } = context;

  // Set page state to loading
  commit('setPageState', 'loading');

  try {
    await attempt();

    // This delay is left here on purpose as to allow the loading screen to be shown
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If theres any string to show in the sucess snackbar...
    if (successSnack) {
      // Notify the user through the snackbar
      dispatch('showSnackbar', {
        text: successSnack,
        color: successColor,
      });
    }
  } catch (err) {
    console.log('hello');
    // If a function has been provided in the event of an error, invoke it
    if (onError) {
      await onError(err);
    }

    // Notify the user through the snackbar
    dispatch('showSnackbar', {
      text: failureSnack || err,
      color: failureColor,
    });
  } finally {
    // Remove loading
    commit('setPageState', '');
  }
};

// Return an unractive copy of an object
export const unreactiveClone = (obj) => JSON.parse(JSON.stringify(obj));
