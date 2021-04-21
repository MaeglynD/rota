<template>
  <div class="r-container">
    <!-- Header -->
    <div class="r-header">
      <div class="r-title">
        Rota information
      </div>

      <div class="r-controls">
        <v-btn
          v-ripple
          class="r-btn"
          :loading="isLoading"
          text
          @click="generateNewRota"
        >
          Generate new rota
        </v-btn>
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
            :weekday-format="getFormattedDay"
            color="#f88065"
            locale="en-GB"
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
              @change="getDatepickerEvents"
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
          <!-- Top row -->
          <div class="r-row r-top-header">
            <!-- Search -->
            <div class="r-col r-search r-user-col">
              <v-text-field
                v-model="searchTerm"
                prepend-inner-icon="mdi-magnify"
                hide-details
                height="49"
                placeholder="Search users..."
              />
            </div>

            <!-- Days of the week -->
            <div
              v-for="(date, i) in activeWeek"
              :key="`day-${i}`"
              :class="`r-col ${isColActiveClass(i)}`"
            >
              {{ getFormattedDate(date) }}
            </div>
          </div>

          <!-- Data rows -->
          <div
            v-for="(user, i) in tableData"
            :key="`row-${i}`"
            class="r-row"
          >
            <!-- User info column -->
            <div class="r-col r-user-col">
              <!-- Avatar -->
              <div class="r-avatar-container">
                <img
                  :src="user.avatar"
                  alt="avatar"
                >
              </div>

              <!-- Info and records found -->
              <div class="r-user-info">
                <div class="r-user-name">
                  {{ user.user }}
                </div>
                <div class="r-user-records">
                  {{ user.records }} records found
                </div>
              </div>
            </div>

            <!-- Data columns -->
            <div
              v-for="(shift, colI) in user.shifts"
              :key="`row-${i}-col-${colI}`"
              :class="`r-col ${isColActiveClass(colI)}`"
            >
              <div
                v-for="(typeOfShift, dataI) in shift"
                :key="`row-${i}-col-${colI}-record-${dataI}`"
                :class="`r-shift ${typeOfShift}`"
              >
                <div class="r-sidebar" />
                {{ typeOfShift }}
              </div>
            </div>
          </div>
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
    searchTerm: '',
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

    filteredUsers() {
      return this.selectedUsers.filter(({ user }) =>
        user.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    },

    activeWeek() {
      return this.datePicker ? this.getDaysOfTheWeek(this.datePicker) : [];
    },

    tableData() {
      const {
        activeWeek,
        datePicker,
        filteredUsers,
        rotas,
      } = this;

      // Performance measure, used later on when filtering shift data
      const filteredRotas = rotas.filter(({ date }) =>
        activeWeek.includes(date),
      );

      // Return users but with shift data
      return filteredUsers.map((user) => ({
        ...user,

        // Return an array representing the week's data...
        shifts: Array(7)
          // Fill with empty properties...
          .fill(0)
          // Filter data and format
          .map((x, i) =>
            rotas
              // Filter rotas for matching userIds and dates...
              .filter(({ userId, date }) =>
                // eslint-disable-next-line comma-dangle
                userId === user.userId && activeWeek[i] === date
              )
              // Format as ['morning'] or ['morning', 'afternoon']
              .map(({ type }) => type),
          ),
      }));
    },
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

    getFormattedDate(date) {
      return (new Date(date)).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    },

    removeUser(id) {
      this.selectedUsers = this.selectedUsers.filter(({ userId }) => userId !== id);
    },

    getDatepickerEvents(datePickerDate) {
      // Get the current selection of users userId's
      const availableUsers = this.selectedUsers.map(({ userId }) => userId);

      // An array of dates that match the given paramater
      const foundDate = this.rotas.filter(({ date, userId }) =>
        date === datePickerDate && availableUsers.includes(userId),
      );

      // If a date has been found..
      if (foundDate.length === 1) {
        // Return the morning color
        return foundDate[0].type === 'morning' ? '#1d85e8' : 'primary';
      }

      // If 2 dates have been found
      if (foundDate.length > 1) {
        // return morning and afternoon colors
        return ['#1d85e8', 'primary'];
      }

      return false;
    },

    getDaysOfTheWeek(date) {
      const dateObj = new Date(date);

      // Start with an empty array of length 7
      return Array(7).fill(0).map((x, i) => {
        // Get the day
        const day = dateObj.getDate() - dateObj.getDay() + i;

        // Return the formatted day
        return new Date(dateObj.setDate(day))
          .toISOString()
          .slice(0, 10);
      });
    },

    isColActiveClass(columnIndex) {
      return this.activeWeek[columnIndex] === this.datePicker ? 'r-active' : '';
    },
  },
};
</script>

<style scoped lang="scss">
  @import '~/assets/scss/rota.scss';
</style>
