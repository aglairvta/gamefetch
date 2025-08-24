particlesJS('particles-js', {
  "particles": {
    "number": { "value": 80, "density": { "enable": true, "value_area": 900 } },
    "color": { "value": ["#00f0ff", "#6a00ff"] },
    "shape": {
      "type": "edge", 
      "stroke": { "width": 1, "color": "#fff" }
    },
    "opacity": {
      "value": 0.7,
      "random": true,
      "anim": { "enable": true, "speed": 2, "opacity_min": 0.1, "sync": false }
    },
    "size": {
      "value": 4,
      "random": true,
      "anim": { "enable": false }
    },
    "move": {
      "enable": true,
      "speed": 3,
      "direction": "right",
      "random": false,
      "straight": true,
      "out_mode": "out",
      "bounce": false
    },
    "line_linked": {
      "enable": true,
      "distance": 120,
      "color": "#00f0ff",
      "opacity": 0.3,
      "width": 1
    }
  },
  "interactivity": {
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": false }
    },
    "modes": {
      "grab": { "distance": 140, "line_linked": { "opacity": 0.7 } }
    }
  },
  "retina_detect": true
});