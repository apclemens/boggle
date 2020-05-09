<template>
  <div class="board">
      <svg v-bind:width=width*boardSize v-bind:height=width*boardSize>
          <rect v-for="squareNum in boardSize**2"
                v-bind:x="((squareNum-1)%boardSize)*width"
                v-bind:y="width*Math.floor((squareNum-1)/boardSize)"
                v-bind:width=width
                v-bind:height=width
                style="fill:rgba(0,0,0,0);stroke-width:1;stroke:black"
          />
            <text v-for="squareNum in boardSize**2"
                v-bind:x="width/2+((squareNum-1)%boardSize)*width"
                v-bind:y="width/2+width/6+width*Math.floor((squareNum-1)/boardSize)"
                v-bind:style="{fontSize: width/2+'px'}"
            >
              {{
                letters[squareNum-1] == 'q' ? 'Qu' : letters[squareNum-1].toUpperCase()
              }}
            </text>
          <polyline
              v-bind:points="polylinePath"
              style="fill:none;stroke:black;stroke-width:3"
          />
      </svg>
  </div>
</template>

<script>
export default {
  name: 'Board',
  props: {
    letters: String,
    path: Array,
    width: Number,
    boardSize: Number,
  },
  computed: {
      polylinePath: function() {
          var toRet = [];
          for (var i=0; i<this.path.length; i++) {
              toRet.push(""+(this.width/2+this.width*(this.path[i]%this.boardSize))+","+(this.width/2+this.width*Math.floor(this.path[i]/this.boardSize)))
          }
          return toRet.join(" ");
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.board {
    display: inline-block;
}

text {
    text-anchor: middle;
}
</style>
