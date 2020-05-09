<template>
  <div class="create-game-link">
      <button v-on:click="startCreating">
          Create game!
      </button>
      <div class="modal" v-if="creating">
          <!--
          <label class="label" for="rounds">Number of rounds:</label><input type="number" name="rounds" id="rounds" min="1" max="10" value="10" v-model="settings.rounds" /></br>
          <label class="label" for="roundLength">Length of round:</label><input type="number" name="roundLength" id="roundLength" min="30" max="120" value="60" v-model="settings.roundLength" /></br>
          <label class="label" for="waitTime">Time between rounds:</label><input type="number" name="waitTime" id="waitTime" min="5" max="60" value="30" v-model="settings.waitTime" /></br>
          -->
          <label class="label" for="boardSize">Size of board:</label>
          <div>
              <div v-for="size in 2">
                  <input type="radio" name="boardSize" :id="'boardSize'+size" :value="size + 3" v-model="settings.boardSize" /></br>
                  <label :for="'boardSize'+size">{{size+3}}x{{size+3}}</label>
              </div>
          </div>
          <!--
          <label class="label" for="minWordLength">Minimum word length:</label><input type="number" name="minWordLength" id="minWordLength" min="2" max="5" value="3" v-model="settings.minWordLength" /></br>
          <label class="label" for="maxNumPlayers">Maximum number of players:</label><input type="number" name="maxNumPlayers" id="maxNumPlayers" min="2" max="5" value="5" v-model="settings.maxNumPlayers" /></br>
          <label class="label">Public or private?</label>
          <div>
              <div>
                  <input type="radio" name="publicPrivate" id="public" value="public" v-model="publicPrivate" /></br>
                  <label for="public">Public</label>
              </div>
              <div>
                  <input type="radio" name="publicPrivate" id="private" value="private" v-model="publicPrivate" /></br>
                  <label for="private">Private</label>
              </div>
              <div v-if="publicPrivate=='private'">
                  <label class="label" for="password">Password:</label><input type="text" name="password" id="password" v-model="settings.password" /></br>
              </div>
          </div>
          -->
          <button v-on:click="create">
              Create
          </button>
      </div>
      {{settings}}
      {{publicPrivate}}
  </div>
</template>

<script>
var backend;

backend = 'https://flask-boggle.herokuapp.com/';
backend = 'http://localhost:5000/';

export default {
  name: 'creategamelink',
  data: function() {
      return {
          creating: false,
          publicPrivate: 'public',
          settings: {
              'rounds': 10,
              'roundLength': 60,
              'waitTime': 30,
              'boardSize': 4,
              'minWordLength': 3,
              'maxNumPlayers': 5,
              'password': '',
          },
      }
  },
  methods: {
      startCreating: function() {
          this.creating = true
      },
      create: function() {
          const axios = require('axios').default;

          axios.post(backend + 'creategame', {
              headers: {
                 "Access-Control-Allow-Origin": "*",
              },
              settings: this.settings
          }).then((response) => {
              this.$router.push({ name: 'game', params: { gameId: response.data}})
          })
      }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.create-game-link span {
    cursor: pointer;
}
.modal {

}
</style>
