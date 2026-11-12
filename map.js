// Import Mapbox as an ESM module
import * as mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Check that Mapbox GL JS loaded
console.log('Mapbox GL JS loaded:', mapboxgl);

// Initialize the map
const map = new mapboxgl.default.Map({
    accessToken: 'pk.eyJ1IjoiamF5bGVlbnNoIiwiYSI6ImNtd2RoZmxobDAzaWoyeG9sMjRxN2gzbGwifQ.EubXMbDQ2cgVbmCO5ow6UA',
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-71.09415, 42.36027],
    zoom: 12,
    minZoom: 5,
    maxZoom: 18,
});