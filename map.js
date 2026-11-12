// Import Mapbox as an ESM module
import * as mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Import D3
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


// Check that Mapbox GL JS loaded
console.log('Mapbox GL JS loaded:', mapboxgl);

// Initialize the map
const map = new mapboxgl.default.Map({
    accessToken: 'pk.eyJ1IjoiamF5bGVlbnNoIiwiYSI6ImNtd2RoZmxobDAzaWoyeG9sMjRxN2gzbGwifQ.EubXMbDQ2cgVbmCO5ow6UA',
    container: 'map',
    style: 'mapbox://styles/jayleensh/cmwdnbmew006y01smeca97lwq',
    center: [-71.09415, 42.36027],
    zoom: 12,
    minZoom: 5,
    maxZoom: 18,
});

function getCoords(station) {
    const point = new mapboxgl.default.LngLat(
        +station.lon,
        +station.lat
    );

    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

map.on('load', async () => {
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });

    map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'boston_route',
        paint: {
            'line-color': '#32D400',
            'line-width': 5,
            'line-opacity': 0.6
        }
    });

    // Add Cambridge bike lanes
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://data.cambridgema.gov/resource/9aey-9g9p.geojson?$limit=5000'
    });

    map.addLayer({
        id: 'cambridge-bike-lanes',
        type: 'line',
        source: 'cambridge_route',
        paint: {
            'line-color': '#32D400',
            'line-width': 5,
            'line-opacity': 0.6
        }
    });

    // Load station data
    try {
        const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

        // Await JSON fetch
        const jsonData = await d3.json(jsonurl);

        console.log('Loaded JSON Data:', jsonData);

        let stations = jsonData.data.stations;
        console.log('Stations Array:', stations);
        
        // Load bike traffic data
        const trips = await d3.csv(
            'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv'
        );
        
        const departures = d3.rollup(
            trips,
            (v) => v.length,
            (d) => d.start_station_id,
        );
        
        const arrivals = d3.rollup(
            trips,
            (v) => v.length,
            (d) => d.end_station_id,
        );

        stations = stations.map((station) => {
            let id = station.short_name;

            station.arrivals = arrivals.get(id) ?? 0;
            station.departures = departures.get(id) ?? 0;
            station.totalTraffic = station.arrivals + station.departures;

            return station;
        });

        const svg = d3.select('#map')
            .append('svg');
        const radiusScale = d3
            .scaleSqrt()
            .domain([0, d3.max(stations, (d) => d.totalTraffic)])
            .range([0, 25]);
        const circles = svg
            .selectAll('circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('r', (d) => radiusScale(d.totalTraffic))
            .attr('fill', 'steelblue')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8)
            .each(function (d) {
                d3.select(this)
                    .append('title')
                    .text(
                        `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`
                    );
            });

        function updatePositions() {
            circles
                .attr('cx', (d) => getCoords(d).cx)
                .attr('cy', (d) => getCoords(d).cy);
        }

        // Initial position update
        updatePositions();

        // Reposition markers on map interactions
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);

    } catch (error) {
        console.error('Error loading JSON:', error);
    }

});