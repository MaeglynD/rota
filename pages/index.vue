<template>
  <div class="r-container">
    <!-- Header -->
    <div class="r-header">
      <div class="r-title">
        Rota information
      </div>

      <div class="r-controls">
        <div
          v-ripple
          class="r-btn"
        >
          Generate new rota
        </div>
      </div>
    </div>

    <div class="r-rota-container">
      <!-- Skeleton loader splashscreen -->
      <template v-if="isLoading">
        <div class="r-left-container">
          <!-- datepicker -->
          <v-skeleton-loader
            type="date-picker-options, date-picker-days"
          />

          <!-- divider -->
          <v-skeleton-loader
            type="divider"
            class="my-9 mx-2"
          />

          <!-- box -->
          <v-skeleton-loader
            type="image"
            class="mx-2"
          />
        </div>

        <div class="r-right-container r-loader">
          <!-- box -->
          <v-skeleton-loader
            type="image"
          />
        </div>
      </template>

      <template v-else>
        <div class="r-left-container">
          <v-date-picker
            v-model="datePicker"
            no-title
            full-width
            :events="getDatepickerEvents"
            :event-color="(date) => date[9] % 2 ? '#1d85e8' : 'primary'"
            :weekday-format="getFormattedDay"
            color="#f88065"
          />

          <div class="r-divider" />

          <div class="r-select-users-container">
            <div class="r-label">
              Selected users
            </div>

            <v-select
              v-model="selectedUsers"
              :items="users"
              chips
              color="primary"
              item-color="primary"
              class="r-select-users"
              item-text="user"
              return-object
              placeholder="Select users"
              height="40"
              hide-details
              multiple
              solo
            >
              <template #selection="{ item, index }">
                <!-- Chip -->
                <v-chip
                  v-if="index === 0"
                  color="#fef0ed"
                >
                  <v-avatar left>
                    <v-img :src="item.avatar" />
                  </v-avatar>
                  {{ item.user.split(' ')[0] }}
                </v-chip>

                <!-- 'And x others' text -->
                <span
                  v-if="index === 1"
                  class="grey--text caption ml-1"
                >
                  (+{{ selectedUsers.length - 1 }} others)
                </span>
              </template>
              <template #item="data">
                <!-- Avatar -->
                <v-list-item-avatar>
                  <img :src="data.item.avatar">
                </v-list-item-avatar>

                <v-list-item-content>
                  <!-- Name -->
                  <v-list-item-title>
                    {{ data.item.user }}
                  </v-list-item-title>
                  <!-- Records -->
                  <v-list-item-subtitle>
                    {{ data.item.records }} records found
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-select>
          </div>
        </div>

        <div class="r-right-container">
        <!--  -->
        </div>
      </template>
    </div>

    <!--  -->
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { formattedDaysOfTheWeek, unreactiveClone } from '../utils';

export default {
  data: () => ({
    datePicker: '',
    selectedUsers: [],
  }),

  computed: {
    ...mapState([
      'users',
      'rotas',
      'pageState',
    ]),
    ...mapGetters([
      'isLoading',
    ]),
  },

  async created() {
    await this.getUsersAndRotas();

    const [year, month, day] = this.rotas[0].date.split('-');

    // Set the initial datepicker date as the last day of starting month
    this.datePicker = `${year}-${month}-${new Date(year, month, 0).getDate()}`;
    // Set the intial selected users
    this.selectedUsers = unreactiveClone(this.users);
  },

  methods: {
    ...mapActions([
      'getUsersAndRotas',
      'generateNewRota',
      'showSnackbar',
    ]),

    getFormattedDay(date) {
      return formattedDaysOfTheWeek[new Date(date).getDay(date)];
    },

    removeUser(id) {
      this.selectedUsers = this.selectedUsers.filter(({ userId }) => userId !== id);
    },

    getDatepickerEvents(datePickerDate) {
      const foundDate = this.rotas.filter(({ date }) => date === datePickerDate);

      // If a date has been found..
      if (foundDate.length === 1) {
        // Return the morning color
        return foundDate.type === 'morning' ? '#1d85e8' : 'primary';
      }

      // If 2 dates have been found
      if (foundDate.length > 1) {
        // return morning and afternoon colors
        return ['#1d85e8', 'primary'];
      }

      return false;
    },
  },
};
</script>

<style scoped lang="scss">
  @import '~/assets/scss/rota.scss';
</style>
