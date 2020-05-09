<template>
    <div id="homepage">
        <p>This is the home page</p>
        <p>List of games</p>
        <CreateGameLink />
    </div>
</template>

<script>
import CreateGameLink from './components/CreateGameLink.vue';

export default {
  name: 'homepage',
  components: {
      CreateGameLink
  },
  data: function() {
      return {
      };
  },
}
</script>

<style>
</style>
