<template>
  <v-overlay :value="value">
    <v-progress-circular
      indeterminate
      color="amber darken-2"
      :size="70"
      :width="7"
      class="text-center"
    ></v-progress-circular>
  </v-overlay>
</template>

<script>
export default {
  name: "FullScreenLoadingOverlay",
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
}
</script>
