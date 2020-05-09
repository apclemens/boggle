<template>
  <div id="game">
      <div
       class="admin_panel"
       v-if="admin"
       >
        <button 
            v-if="before_game"
            v-on:click="sendStartCommand()"
        >Start game</button>
      </div>
      <div class="grid">
    <Grid
       v-bind:letters=boardLetters
       v-bind:boardSize=boardSize
           v-show="!countDown"
       v-bind:path=currentWordPath
           v-bind:width=80
    />
      </div>
    <span v-if=(!scoring)>{{minutes}}:{{seconds}}</span>
    <ul class="submitted_word_list">
        <li v-for="submittedWord in submittedWords">
            {{submittedWord}}
        </li>
    </ul>
    <span>{{message}}</span>
    <input
        v-model="word"
        v-on:keyup.enter="submitWord"
        v-if=!scoring
    >
    <div v-if="longestWords.length" style="display: inline-block;vertical-align:top;">
        <h3>Longest possible words</h3>
        <ul>
            <li v-for="longestWord in longestWords">{{longestWord}}</li>
        </ul>
    </div>
    <ScoreBoard
        ref="scoreboard"
        v-if=scoring
        v-bind:wordInfo=wordInfo
        v-bind:wordLists=wordLists
        v-bind:boardSize=boardSize
        v-bind:names=names
        v-bind:boardLetters=boardLetters
    />
  </div>
</template>

<script>
const zeroPad = (num, places) => String(num).padStart(places, '0')
function indexes(source, find) {
  if (!source) {
    return [];
  }
  // if find is empty string return all indexes.
  if (!find) {
    // or shorter arrow function:
    // return source.split('').map((_,i) => i);
    return source.split('').map(function(_, i) { return i; });
  }
  var result = [];
  for (var i = 0; i < source.length; ++i) {
    // If you want to search case insensitive use 
    // if (source.substring(i, i + find.length).toLowerCase() == find) {
    if (source.substring(i, i + find.length) == find) {
      result.push(i);
    }
  }
  return result;
}

function adjacents(boardSize, a) {
    if (boardSize == 4)
        return [[1,4,5],[0,4,5,6,2],[1,5,6,7,3],[2,6,7],[0,1,5,8,9],[0,1,2,4,6,8,9,10],[1,2,3,5,7,9,10,11],[2,3,6,10,11],[4,5,9,12,13],[4,5,6,8,10,12,13,14],[5,6,7,9,11,13,14,15],[6,7,10,14,15],[8,9,13],[8,9,10,12,14],[9,10,11,13,15],[10,11,14]][a];
    if (boardSize == 5)
        return [[1,5,6], [0,5,6,7,2], [1,6,7,8,3], [2,7,8,9,4], [3,8,9], [0,1,6,11,10], [0,1,2,5,7,10,11,12], [1,2,3,6,8,11,12,13], [2,3,4,7,9,12,13,14], [3,4,8,13,14], [5,6,11,15,16], [5,6,7,10,12,15,16,17], [6,7,8,11,13,16,17,18], [7,8,9,12,14,17,18,19], [8,9,13,18,19], [10,11,16,20,21], [10,11,12,15,17,20,21,22], [11,12,13,16,18,21,22,23], [12,13,14,17,19,22,23,24], [13,14,18,23,24], [15,16,21], [15,16,17,20,22], [16,17,18,21,23], [17,18,19,22,24], [18,19,23]][a];
}

function pathIsValid(boardSize, path) {
    if ((new Set(path)).size !== path.length) return false;
    for (var i=1; i<path.length; i++) {
        console.log(boardSize);
        if (adjacents(boardSize, path[i-1]).indexOf(path[i]) == -1) {
            return false;
        }
    }
    return true;
}
var backend;

backend = 'http://localhost:5000/';
backend = 'https://flask-boggle.herokuapp.com/';

import Grid from './components/Grid.vue'
import ScoreBoard from './components/ScoreBoard.vue'

export default {
  name: 'game',
  components: {
    Grid,
    ScoreBoard,
  },
  data: function() {
      return {
          gameID: '',
          boardSize: 4,
          admin: true,
          name: '',
          boardLetters: "                ",
          submittedWords: [],
          word: '',
          message: '',
          startTime: new Date().getTime(),
          minutes: 0,
          seconds: 0,
          scoring: false,
          before_game: true,
          wordInfo: {},
          wordLists: [],
          names: [],
          countDown: false,
          longestWords: [],
      };
  },
  computed: {
      currentWordPath: function() {
          if (this.word)
              return this.checkWord(this.word)
          return []
      }
  },
  beforeMount: function() {
      this.name = prompt('What is your name?');
      this.gameID = this.$route.params.gameId;
  },
  mounted: function() {
      this.waitForStart(Math.random());
  },
  methods: {
      sendStartCommand() {

          const axios = require('axios').default;

          axios.get(backend + 'startgame/'+this.gameID, {
           headers: {
                  "Access-Control-Allow-Origin": "*",
                }
            })
      },
      waitForStart(seed) {
          const axios = require('axios').default;
          var x = setInterval(() => {
              axios.get(backend + 'getstarttime/'+this.gameID, {
                  headers: {
                      "Access-Control-Allow-Origin": "*",
                  }
              }).then(response => {
                  if (response.data.start) {
                      if (x) {
                          clearInterval(x)
                          x = 0;
                          this.startTime = response.data.start
                          this.startGame()
                      }
                  }
              })
          }, 1000)
      },
      startGame() {
          var gameLength = 60;
          this.before_game = false;
          this.scoring = false;
          this.wordLists.splice(0, this.wordLists.length);
          this.names.splice(0, this.names.length);
          this.longestWords.splice(0, this.longestWords.length);

          const axios = require('axios').default;

          axios.get(backend + 'gameinfo/'+this.gameID, {
           headers: {
                  "Access-Control-Allow-Origin": "*",
                }
            }).then(response => {
                console.log(response);
              this.boardLetters = response.data.board;
              this.boardSize = response.data.boardSize;
              this.countDown = true;
              this.startTime = new Date(response.data.startTime).getTime();
              var endTime = this.startTime + gameLength * 1000;
              var nowA = new Date().getTime();
              var distanceA = this.startTime - nowA;
              var y = setInterval(() => {
                  var now = new Date().getTime();
                  var distance = this.startTime - now;
                  this.minutes = zeroPad(Math.floor(((distance+1000) % (1000 * 60 * 60)) / (1000 * 60))/2);
                  this.seconds = zeroPad(Math.floor(((distance+1000) % (1000 * 60)) / 1000),2);
                  if (distance <= 1) {
                      clearInterval(y);
                  }
              }, 1000)

              setTimeout(() => {

                  axios.get(backend + 'getlongestwords/'+this.gameID, {
                        headers: {
                          "Access-Control-Allow-Origin": "*",
                        }
                  })

                  this.countDown = false;
                  // now the game is starting
                  var x = setInterval(() => {
                      var now = new Date().getTime();
                      var distance = endTime - now;
                      this.minutes = zeroPad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), 2);
                      this.seconds = zeroPad(Math.floor((distance % (1000 * 60)) / 1000), 2);

                      if (distance < 0) {
                          this.message = '';
                          this.word = '';
                          this.scoring = true;
                          clearInterval(x);

                          axios.post(backend + 'submitWords/'+this.gameID, {
                              headers: {
                                  "Access-Control-Allow-Origin": "*",
                              },
                              wordList: this.submittedWords,
                              name: this.name,
                          })
                      }
                  }, 1000)

                  setTimeout(() => {
                      axios.get(backend + 'getScore/'+this.gameID, {
                          headers: {
                              'Access-Control-Allow-Origin': '*',
                          }
                      }).then(response2 => {
                          this.submittedWords.splice(0, this.submittedWords.length);
                          console.log(response2);
                          for (var i=0; i<response2.data.longestWords.length; i++) {
                              this.longestWords.push(response2.data.longestWords[i])
                          }
                          for (var i=0; i<response2.data.wordLists.length; i++) {
                              this.wordLists.push(response2.data.wordLists[i])
                              this.names.push([response2.data.names[i],0])
                          }
                          var globalWordIndex = this.$refs.scoreboard.runAnimation(response2.data.wordInfo)+1;
                          setTimeout(() => {
                              this.before_game = true;
                              this.waitForStart(Math.random());
                          }, globalWordIndex*2000);
                      })
                  }, (gameLength+3) * 1000)
              }, distanceA)
          });
      },
      submitWord() {
          var currentWord = this.word;
          this.word = '';
          this.message = '';
          if (this.submittedWords.indexOf(currentWord) != -1) {
              this.message = "You've already submitted " + currentWord;
              return;
          }
          if (currentWord.length < 3) {
              this.message = 'Word must have 3 or more letters';
              return;
          }
          var path = this.checkWord(currentWord);
          if (path) {
              this.submittedWords.push(currentWord);
          } else {
              this.message = '"' + currentWord + '" is not on the board';
          }
      },
      checkWord(wordInit) {
          var word = wordInit.replace('qu','q');
          var positions = [];
          for (var i=0; i<word.length; i++) {
              positions.push(indexes(this.boardLetters, word[i]));
          }
          var paths = [];
          for (i=0; i<positions[0].length; i++) {
              paths.push([positions[0][i]]);
          }
          var path;
          for (i=1; i<word.length; i++) {
              while (true) {
                  if (!paths.length) return false;
                  if (paths[0].length != i) break;
                  path = paths.shift();
                  for (var j = 0; j<positions[i].length; j++) {
                      if (pathIsValid(this.boardSize, [path[path.length-1], positions[i][j]]) && path.indexOf(positions[i][j]) == -1) {
                          paths.push(path.concat(positions[i][j]))
                      }
                  }
              }
          }
          for (i=0; i<paths.length; i++) {
//              if (pathIsValid(this.boardSize, paths[i]))
                    return paths[i];
          }
          return false;
      },
  }
}
</script>

<style>
.grid {
    display: inline-block;
}
.submitted_word_list {
    display: inline-block;
    vertical-align: top;
}
</style>
