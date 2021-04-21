<template>
  <v-app light>
    <!-- Navbar -->
    <div class="r-navbar">
      <div class="r-navbar-inner">
        <!-- Logo -->
        <img
          src="~/assets/img/logo.png"
          alt="logo"
          class="r-logo"
        >

        <!-- Tabs -->
        <div class="r-navbar-tabs">
          <div
            v-for="tab in navTabs"
            :key="tab"
            class="r-tab"
          >
            {{ tab }}
          </div>
        </div>
      </div>
    </div>

    <!-- Nuxt component, used loading pages -->
    <nuxt />

    <!-- Global snackbar -->
    <v-snackbar
      v-model="snackbar.visible"
      transition="scroll-y-transition"
      :color="snackbar.color"
      bottom
      right
      :timeout="-1"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
    navTabs: [
      'Rota',
      'Schedule',
      'Listings',
    ],
  }),

  computed: {
    ...mapState([
      'snackbar',
    ]),
  },
};
</script>

<style scoped lang="scss">
  @import '~/assets/scss/default.scss';
</style>
