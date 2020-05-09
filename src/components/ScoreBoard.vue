<template>
  <div class="scoreboard"
       v-on:mousemove="mouseOverWords"
       v-on:mouseleave="hover_word=''"
  >
      <div v-if="waiting">Scoring...</div>
      <div v-for="(wordList, indexA) in wordLists" class="wordList">
          <h3>{{names[indexA][0]}} - {{names[indexA][1]}}</h3>
          <ul>
              <li
                  v-for="(word, indexB) in wordList"
                  v-bind:class= "{good: goodWords.indexOf(word) != -1, bad: badWords.indexOf(word) != -1}"
              >
              {{goodWords.concat(badWords).indexOf(word) == -1 && (currentIndex[0] != indexA || currentIndex[1] != indexB) ? Array(word.length+1).join('*') : word}}
              </li>
          </ul>
      </div>
      <!--
      <div
          id="word_hover"
          v-if="hover_word"
          v-bind:style="{left: ''+mouse_location_x+'px', top: ''+mouse_location_y+'px'}"
      >
            {{hover_word}}
      </div>
      -->
  </div>
</template>

<script>
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
        return [[1,5,6], [0,5,6,7,2], [1,6,7,8,3], [2,7,8,9,4], [3,8,9], [0,1,6,11,10], [0,1,2,5,7,10,11,12], [1,2,3,6,8,11,12,13], [2,3,4,7,9,12,13,14], [3,4,8,13,14], [5,6,11,15,16], [5,6,7,10,12,15,16,17], [6,7,8,11,13,16,17,18], [7,8,9,12,13,17,18,19], [8,9,13,18,19], [10,11,16,20,21], [10,11,12,15,17,20,21,22], [11,12,13,16,18,21,22,23], [12,13,14,17,19,22,23,24], [13,14,18,23,24], [15,16,21], [15,16,17,20,22], [16,17,18,21,23], [17,18,19,22,24], [18,19,23]][a];
}

function pathIsValid(boardSize, path) {
    if ((new Set(path)).size !== path.length) return false;
    for (var i=1; i<path.length; i++) {
        if (adjacents(boardSize, path[i-1]).indexOf(path[i]) == -1) {
            return false;
        }
    }
    return true;
}

import Grid from './Grid.vue'

export default {
  name: 'ScoreBoard',
  components: {
    Grid,
  },
  props: {
    wordLists: Array,
    names: Array,
    boardLetters: String,
    boardSize: Number,
  },
  data: function() { return {
          goodWords: [],
          badWords: [],
          currentIndex: [-1,-1],
          waiting: true,
          path: [],

          mouse_location_x: 0,
          mouse_location_y: 0,
          hover_word: '',
  }},
  methods: {
      mouseOverWords: function(e) {
          this.mouse_location_x = e.clientX;
          this.mouse_location_y = e.clientY;
          if (e.target.classList.contains('good')) {
              this.hover_word = e.target.innerHTML.trim();
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
                      paths.push(path.concat(positions[i][j]))
                  }
              }
          }
          for (i=0; i<paths.length; i++) {
              if (pathIsValid(this.boardSize, paths[i])) return paths[i];
          }
          return false;
      },
      runAnimation: function(wordInfo) {
          this.waiting = false;
          var doneWords = [];
          var globalWordIndex = 0;
          var points = [0,0,0,1,1,2,3,5,11];
          this.wordLists.forEach((player, indexA) => {
              player.forEach((word, indexB) => {
                  if (doneWords.indexOf(word) == -1) {
                      doneWords.push(word);
                      globalWordIndex++;
                      setTimeout(() => {
                          this.currentIndex = [indexA, indexB];
                          this.path = this.checkWord(word);
                          // evaluate word
                          setTimeout(() => {
                              if (wordInfo[word].length == 1) {
                                  this.goodWords.push(word);
                                  this.names[indexA][1] += points[Math.min(8, word.length)]
                              } else {
                                  this.badWords.push(word);
                              }
                          }, 1000);
                      }, 2000*globalWordIndex);
                  }
              })
          })
          return globalWordIndex;
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.scoreboard {
    display: inline-block;
    vertical-align: top;
}
.wordList {
    display: inline-block;
    vertical-align: top;
    padding-left: 50px;
}
.bad {
    text-decoration: line-through;
    color: red;
}

.good {
    color: green;
    list-style: none;
    margin-left: -14px;
}
.good::before {
    content: '✓';
}

.score_grid {
    display: inline-block;
    transform: scale(.5);
}
#word_hover {
    position: absolute;
    pointer-events: none;
}
</style>
