// script.js
let foundCountries = new Set();
let timeLeft = 300; // 5 minutes
let countriesData = {};

// Load countries data and world map
Promise.all([
    d3.json('countries.json'),
    d3.json('https://unpkg.com/world-atlas@2.0.2/countries-50m.json')
]).then(([countries, mapData]) => {
    countriesData = countries;
    createMap(mapData);
    startGame();
}).catch(error => {
    console.error('Error loading data:', error);
    alert('Error loading game data. Please refresh the page.');
});

function createMap(data) {
    const width = document.getElementById('map').offsetWidth;
    const height = 600;
    
    const svg = d3.select('#map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const projection = d3.geoMercator()
        .fitSize([width, height], topojson.feature(data, data.objects.countries));
    
    const path = d3.geoPath().projection(projection);
    
    svg.append('g')
        .selectAll('path')
        .data(topojson.feature(data, data.objects.countries).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'country')
        .attr('id', d => `country-${d.id}`)
        .attr('data-name', d => countriesData[d.id]?.toLowerCase());
}

function startGame() {
    const input = document.getElementById('countryInput');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkCountry(this.value);
            this.value = '';
        }
    });

    updateTimer();
    
    const timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function checkCountry(countryName) {
    countryName = countryName.toLowerCase().trim();
    const countryElement = document.querySelector(`[data-name="${countryName}"]`);
    
    if (countryElement && !foundCountries.has(countryName)) {
        foundCountries.add(countryName);
        countryElement.classList.add('found');
        updateScore();
    }
}

function updateScore() {
    document.getElementById('score').textContent = foundCountries.size;
}

function endGame() {
    const input = document.getElementById('countryInput');
    input.disabled = true;
    alert(`Game Over! You found ${foundCountries.size} countries!`);
}