<script lang="ts">
  // cspell:word analyser Unsubscriber

  import { onMount, onDestroy } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import { currentTime, paused } from '$lib/player';

  let el: HTMLCanvasElement;
  let audio: HTMLAudioElement;

  let backColor: string;
  let themeColor: string;

  let animationFrame1: number;
  let animationFrame2: number;

  let stream: MediaElementAudioSourceNode;

  let currentTimeUnsubscribe: Unsubscriber;

  onMount(() => {
    backColor = getComputedStyle(document.body).getPropertyValue(
      '--back-color'
    );
    themeColor = getComputedStyle(document.body).getPropertyValue(
      '--theme-color'
    );

    audio = document.querySelector('#audio-player') as HTMLAudioElement;

    const audioCtx = new AudioContext();
    const dataAudio = audio.cloneNode(true) as HTMLAudioElement;

    const analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -100;
    analyser.maxDecibels = 100;
    analyser.smoothingTimeConstant = 0.85;

    currentTimeUnsubscribe = currentTime.subscribe(() => {
      if (audio.currentTime > 0) {
        dataAudio.currentTime = audio.currentTime;
      }
    });
    dataAudio.play();
    dataAudio.volume = 1;

    paused.subscribe(() => {
      if ($paused) {
        dataAudio.pause();
      } else {
        dataAudio.play();
      }
    });

    let hasPlayed = false;

    dataAudio.addEventListener('play', () => {
      if (hasPlayed) return;
      hasPlayed = true;
      stream = audioCtx.createMediaElementSource(dataAudio);

      stream.connect(analyser);
    });

    visualize();

    function visualize() {
      analyser.fftSize = 256;
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Float32Array(bufferLength);

      draw();
      function draw() {
        animationFrame1 = requestAnimationFrame(draw);

        analyser.getFloatFrequencyData(dataArray);
        update(dataArray.map((x) => (x + 100) * 2.5));
      }
    }

    const canvas = el;
    const ctx = canvas.getContext('2d', {
      alpha: true,
      antialias: false,
    }) as CanvasRenderingContext2D;

    var WIDTH = canvas.width * 2,
      HEIGHT = canvas.height;

    var bufferLength = 200;
    var value_changed = false;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw(similarity: Float32Array) {
      ctx.fillStyle = backColor;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = WIDTH / bufferLength;
      var barHeight: number;
      var x = 0;

      for (var i = 0; i < bufferLength; i += 1) {
        barHeight = similarity[i]; // ? similarity[i] : 0;

        // bar height normalize with 255
        const newHeight = ((barHeight / 256) * HEIGHT) >> 0;

        // ctx.fillStyle = 'rgb(' + (barHeight * 3 + 100) + ',50,50)';
        ctx.fillStyle = themeColor;
        ctx.fillRect(x, HEIGHT - newHeight, barWidth, newHeight);
        x += barWidth; // + 1;
      }

      value_changed = false;
    }

    function update(freq_arr: Float32Array) {
      // console.log(freq_arr[freq_arr.length - 1]);
      if (!freq_arr) ctx.clearRect(0, 0, WIDTH, HEIGHT);
      else {
        if (value_changed) return;
        value_changed = true;

        animationFrame2 = requestAnimationFrame(function () {
          draw(freq_arr);
        });
      }
    }
  });

  // prevent memory leak
  onDestroy(() => {
    cancelAnimationFrame(animationFrame1);
    cancelAnimationFrame(animationFrame2);
    stream.disconnect();
    currentTimeUnsubscribe();
  });
</script>

<canvas
  id="fr"
  width="600"
  height="188"
  style="width:100%;height:100%;display:block"
  bind:this={el}
/>

<style>
</style>
