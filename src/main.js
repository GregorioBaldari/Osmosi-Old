console.log('Starting Vue Application');
var socket = io.connect("localhost:8000");
var bodies = [];
var tracking = false;
var synth1 = new Tone.Synth().toMaster();
var synth2 = new Tone.Synth({
			"oscillator" : {
				"type" : "amtriangle",
				"harmonicity" : 0.5,
				"modulationType" : "sine"
			},
			"envelope" : {
				"attackCurve" : "exponential",
				"attack" : 0.05,
				"decay" : 0.2,
				"sustain" : 0.2,
				"release" : 1.5,
			},
			"portamento" : 0.05
		}).toMaster();
socket.on('bodyFrame', function(bodyFrame){
  //console.log('Getting Kinect BodyFrame event in Vue Application');
  vm.bodies = bodyFrame.bodies;
});

var canvas = document.getElementById('bodyCanvas');
var ctx = canvas.getContext('2d');
var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];

var vm  = new Vue({
  el: '#app',
  data:{
    message: 'Hello Vue is ' + tracking,
    tracking: tracking,
    monitorReadyMessage: 'Waitin Body',
    ctx: null,
    bodies:bodies,
    isPlaying : false,
    scale:{},
    audioContext:null,
    instrument: synth1,
    noOfJoint:24,
    scale: ['C','D','E','G','A'],  //majorPentatonic
    openess: 0
  },
  mounted(){
   var vm = this
   vm.canvas = vm.$refs.canvas
   vm.ctx = vm.canvas.getContext("2d");
   console.log('hello mounted');
 },
  watch: {
    bodies  : function(){
      vm.draw();
    }
  },
  methods:{
    startPlaySound: function () {
      this.isPlaying = true;
      vm.audioContext = new AudioContext();
      //console.log('Now Is Playing is TRUE');
    },
    stopPlaySound: function () {
      this.isPlaying = false;
      //console.log('Now Is Playing is FLASE');

    },
    draw: function () {
      //console.log('Let's draw!!');
      vm.ctx.clearRect(0, 0, canvas.width, canvas.height);
      var index = 0;
      var centerBodyX = 0;
      var centerBodyY= 0;
      this.bodies.forEach(function(body){
        if(body.tracked) {

          //console.log('Look, One body is tracked');
          this.tracking = true;
           //playSound(body, play)
           for(var jointType in body.joints) {
               var joint = body.joints[jointType];
               vm.ctx.fillStyle = colors[index];
               vm.ctx.fillRect(joint.depthX * 512, joint.depthY * 424, 10, 10);
               centerBodyX += joint.depthX*canvas.width;
               centerBodyY += joint.depthY*canvas.height;
           }
           vm.ctx.fillStyle = colors[index];
           vm.ctx.fillRect((centerBodyX/vm.noOfJoint), (centerBodyY/vm.noOfJoint) , 30, 30);
           if(vm.isPlaying){
             vm.playSound(body,centerBodyX/vm.noOfJoint,centerBodyY/vm.noOfJoint);
           }
        }
      })
    },
    playSound: function (user, userX, userY) {
        vm.openess = vm.setOpeness(user, userX, userY);
        console.log(vm.openess);
        vm.audioContext.resume();
        var pitch =3;

        if(vm.openess>120){
          pitch = 5
        };
        if(vm.openess<119 &&  vm.openess>100){
          pitch = 4
        };
        if(vm.openess<=99 &&  vm.openess>50){
          pitch = 3
        };
        if(vm.openess<=49){
          pitch = 2
        };
        var note = 'A';
        var Xvalue = userX/canvas.width;
        if( Xvalue > 0.0 && Xvalue < 0.20){
          note = vm.scale[0]
        }
        if( Xvalue > 0.16 && Xvalue < 0.40){
          note = vm.scale[1]
        }
        if( Xvalue > 0.31 && Xvalue < 0.60){
          note = vm.scale[2]
        }
        if(Xvalue > 0.46 && Xvalue < 0.80){
          note = vm.scale[3]
        }
        if(Xvalue > 0.61 && Xvalue < 1){
          note = vm.scale[4]
        }
        // if(Xvalue > 0.76 && Xvalue < 0.90){
        //   note = 'F'
        // }
        // if(Xvalue > 0.91 && Xvalue < 1){
        //   note = 'G'
        // }
        console.log('Note Sound: ' + note + pitch);

        vm.instrument.triggerAttackRelease(note + pitch, '8n');
      },
    playInstrument1: function (){
      vm.instrument = synth1
    },
    playInstrument2: function (){
      vm.instrument = synth2
    },
    calculateNote: function (user,userCenterX,userCenterY) {

    },
    setOpeness: function (user,userCenterX,userCenterY) {
      // var leftX = user.joints[7].depthX*canvas.width;
      // var leftY = user.joints[7].depthY*canvas.height;
      // var rightX = user.joints[11].depthX*canvas.width;
      // var rightY = user.joints[11].depthY*canvas.height;
      // var leftDistance = Math.sqrt( (userCenterX-leftX)*(userCenterX-leftX) + (userCenterY-leftY)*(userCenterY-leftY));
      // var rightDistance = Math.sqrt( (userCenterX-leftX)*(userCenterX-leftX) + (userCenterY-leftY)*(userCenterY-leftY));
      var leftX = user.joints[7].depthX*canvas.width;
      var leftY = user.joints[7].depthY*canvas.height;
      var rightX = user.joints[11].depthX*canvas.width;
      var rightY = user.joints[11].depthY*canvas.height;
      var leftDistance = Math.sqrt( (userCenterX-leftX)*(userCenterX-leftX) + (userCenterY-leftY)*(userCenterY-leftY));
      var rightDistance = Math.sqrt( (userCenterX-leftX)*(userCenterX-leftX) + (userCenterY-leftY)*(userCenterY-leftY));

      return (leftDistance + rightDistance)/2
    }

  }
});

var keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
var majorPentatonic = ['C','D','E','G','A'];
var scale = {
  "lydian": [ "1 2 3 4# 5 6 7" ],
  "major": [ "1 2 3 4 5 6 7" , [ "ionian" ] ],
  "mixolydian": [ "1 2 3 4 5 6 7b" , [ "dominant" ] ],
  "dorian": [ "1 2 3b 4 5 6 7b" ],
  "aeolian": [ "1 2 3b 4 5 6b 7b" , [ "minor" ] ],
  "phrygian": [ "1 2b 3b 4 5 6b 7b" ],
  "locrian": [ "1 2b 3b 4 5b 6b 7b" ],
  "melodic minor": [ "1 2 3b 4 5 6 7" ],
  "melodic minor second mode": [ "1 2b 3b 4 5 6 7b" ],
  "lydian augmented": [ "1 2 3 4# 5A 6 7" ],
  "lydian dominant": [ "1 2 3 4# 5 6 7b" , [ "lydian b7" ] ],
  "melodic minor fifth mode": [ "1 2 3 4 5 6b 7b" , [ "hindu", "mixolydian b6" ] ],
  "locrian #2": [ "1 2 3b 4 5b 6b 7b" ],
  "locrian major": [ "1 2 3 4 5b 6b 7b" , [ "arabian" ] ],
  "altered": [ "1 2b 3b 3 5b 6b 7b" , [ "super locrian", "diminished whole tone", "pomeroy" ] ],
  "major pentatonic": [ "1 2 3 5 6" , [ "pentatonic" ] ],
  "lydian pentatonic": [ "1 3 4# 5 7" , [ "chinese" ] ],
  "mixolydian pentatonic": [ "1 3 4 5 7b" , [ "indian" ] ],
  "locrian pentatonic": [ "1 3b 4 5b 7b" , [ "minor seven flat five pentatonic" ] ],
  "minor pentatonic": [ "1 3b 4 5 7b" ],
  "minor six pentatonic": [ "1 3b 4 5 6" ],
  "minor hexatonic": [ "1 2 3b 4 5 7" ],
  "flat three pentatonic": [ "1 2 3b 5 6" , [ "kumoi" ] ],
  "flat six pentatonic": [ "1 2 3 5 6b" ],
  "major flat two pentatonic": [ "1 2b 3 5 6" ],
  "whole tone pentatonic": [ "1 3 5b 6b 7b" ],
  "ionian pentatonic": [ "1 3 4 5 7" ],
  "lydian #5 pentatonic": [ "1 3 4# 5A 7" ],
  "lydian dominant pentatonic": [ "1 3 4# 5 7b" ],
  "minor #7 pentatonic": [ "1 3b 4 5 7" ],
  "super locrian pentatonic": [ "1 3b 4d 5b 7b" ],
  "in-sen": [ "1 2b 4 5 7b" ],
  "iwato": [ "1 2b 4 5b 7b" ],
  "hirajoshi": [ "1 2 3b 5 6b" ],
  "kumoijoshi": [ "1 2b 4 5 6b" ],
  "pelog": [ "1 2b 3b 5 6b" ],
  "vietnamese 1": [ "1 3b 4 5 6b" ],
  "vietnamese 2": [ "1 3b 4 5 7b" ],
  "prometheus": [ "1 2 3 4# 6 7b" ],
  "prometheus neopolitan": [ "1 2b 3 4# 6 7b" ],
  "ritusen": [ "1 2 4 5 6" ],
  "scriabin": [ "1 2b 3 5 6" ],
  "piongio": [ "1 2 4 5 6 7b" ],
  "major blues": [ "1 2 3b 3 5 6" ],
  "minor blues": [ "1 3b 4 5b 5 7b" , [ "blues" ] ],
  "composite blues": [ "1 2 3b 3 4 5b 5 6 7b" ],
  "augmented": [ "1 2A 3 5 5A 7" ],
  "augmented heptatonic": [ "1 2A 3 4 5 5A 7" ],
  "dorian #4": [ "1 2 3b 4# 5 6 7b" ],
  "lydian diminished": [ "1 2 3b 4# 5 6 7" ],
  "whole tone": [ "1 2 3 4# 5A 7b" ],
  "leading whole tone": [ "1 2 3 4# 5A 7b 7" ],
  "harmonic minor": [ "1 2 3b 4 5 6b 7" ],
  "lydian minor": [ "1 2 3 4# 5 6b 7b" ],
  "neopolitan": [ "1 2b 3b 4 5 6b 7" ],
  "neopolitan minor": [ "1 2b 3b 4 5 6b 7b" ],
  "neopolitan major": [ "1 2b 3b 4 5 6 7" , [ "dorian b2" ] ],
  "neopolitan major pentatonic": [ "1 3 4 5b 7b" ],
  "romanian minor": [ "1 2 3b 5b 5 6 7b" ],
  "double harmonic lydian": [ "1 2b 3 4# 5 6b 7" ],
  "diminished": [ "1 2 3b 4 5b 6b 6 7" ],
  "harmonic major": [ "1 2 3 4 5 6b 7" ],
  "double harmonic major": [ "1 2b 3 4 5 6b 7" , [ "gypsy" ] ],
  "egyptian": [ "1 2 4 5 7b" ],
  "hungarian minor": [ "1 2 3b 4# 5 6b 7" ],
  "hungarian major": [ "1 2A 3 4# 5 6 7b" ],
  "oriental": [ "1 2b 3 4 5b 6 7b" ],
  "spanish": [ "1 2b 3 4 5 6b 7b" , [ "phrygian major" ] ],
  "spanish heptatonic": [ "1 2b 3b 3 4 5 6b 7b" ],
  "flamenco": [ "1 2b 3b 3 4# 5 7b" ],
  "balinese": [ "1 2b 3b 4 5 6b 7" ],
  "todi raga": [ "1 2b 3b 4# 5 6b 7" ],
  "malkos raga": [ "1 3b 4 6b 7b" ],
  "kafi raga": [ "1 3b 3 4 5 6 7b 7" ],
  "purvi raga": [ "1 2b 3 4 4# 5 6b 7" ],
  "persian": [ "1 2b 3 4 5b 6b 7" ],
  "bebop": [ "1 2 3 4 5 6 7b 7" ],
  "bebop dominant": [ "1 2 3 4 5 6 7b 7" ],
  "bebop minor": [ "1 2 3b 3 4 5 6 7b" ],
  "bebop major": [ "1 2 3 4 5 5A 6 7" ],
  "bebop locrian": [ "1 2b 3b 4 5b 5 6b 7b" ],
  "minor bebop": [ "1 2 3b 4 5 6b 7b 7" ],
  "mystery #1": [ "1 2b 3 5b 6b 7b" ],
  "enigmatic": [ "1 2b 3 5b 6b 7b 7" ],
  "minor six diminished": [ "1 2 3b 4 5 6b 6 7" ],
  "ionian augmented": [ "1 2 3 4 5A 6 7" ],
  "lydian #9": [ "1 2b 3 4# 5 6 7" ],
  "ichikosucho": [ "1 2 3 4 5b 5 6 7" ],
  "six tone symmetric": [ "1 2b 3 4 5A 6" ]
}
