const fs = require('fs');

const darkStyleJson = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const featureTypeMap = {
  "administrative": 6,
  "administrative.locality": 6,
  "landscape": 2,
  "poi": 3,
  "poi.park": 3,
  "road": 1,
  "road.highway": 1,
  "road.arterial": 1,
  "road.local": 1,
  "transit": 4,
  "transit.station": 4,
  "water": 5,
  "all": 0
};

const elementTypeMap = {
  "geometry": "g",
  "geometry.fill": "g.f",
  "geometry.stroke": "g.s",
  "labels": "l",
  "labels.text": "l.t",
  "labels.text.fill": "l.t.f",
  "labels.text.stroke": "l.t.s",
  "all": "a"
};

const encodeRule = (rule) => {
  let parts = [];
  
  if (rule.featureType && featureTypeMap[rule.featureType] !== undefined) {
    parts.push(`s.t:${featureTypeMap[rule.featureType]}`);
  }
  
  if (rule.elementType && elementTypeMap[rule.elementType] !== undefined) {
    parts.push(`s.e:${elementTypeMap[rule.elementType]}`);
  }
  
  rule.stylers.forEach(styler => {
    if (styler.color) {
      parts.push(`p.c:${styler.color}`); // Keep the # for URL encoding later
    }
  });
  
  return parts.join('|');
};

const apistyle = darkStyleJson.map(encodeRule).join(',');
const encoded = encodeURIComponent(apistyle);
console.log('DARK:', `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=${encoded}`);
