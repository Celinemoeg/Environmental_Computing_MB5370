//MB5370 - Assignment: Mapping the world’s deep ocean ecosystems

// sett map style
Map.setControlVisibility({
  drawingToolsControl: false,
  mapTypeControl: false
});// hide the map option in the top corners of the map
var snazzy = require("users/aazuspan/snazzy:styles");
snazzy.addStyle("https://snazzymaps.com/style/72543/assassins-creed-iv", "Dark Basemap"); 
//Map.setOptions('SATELLITE');
Map.setCenter(0, 0, 2);

// Part 1: import ETOPO1
// Import ETOPO1 
var etopo = ee.Image('NOAA/NGDC/ETOPO1');
//print('ETOPO1', etopo); // check the data: bands and properties

// Select the bedrock band
var bedrock = etopo.select('bedrock');
//print('bedrock', bedrock); // chek the data


// Visualisation parameters
//var bedrockVis = {
//  min: -10000,
//  max: 0,
//  palette: ['08306b', '08519c', '2171b5', '6baed6', 'c6dbef']
//};

// Add layer 
//Map.addLayer(oceanBedrock, bedrockVis, 'ETOPO1 bedrock');


// PART 2: Build a raster for each deep ocean ecosystem type

// Hadal trenches and troughs (deeper than 6000 m)
var hadal = bedrock.lt(-6000).selfMask();

// Abyssal plains (3000-6000 m deep)
var abyssal = bedrock.gte(-6000).and(bedrock.lt(-3000)).selfMask();
//Note to self diffrence between .gte and .lte is 
//.lte means less than or equal to and .gte means greater than or equal to
// while .lt.gt means less than and more than.

// Continental and island slopes (250-3000 m deep)
var slopes = bedrock.gte(-3000).and(bedrock.lt(-250)).selfMask();

// Submarine canyons (deeper than 200 m and slope > 6 degrees)
// Calculate slope
var terrain = ee.Terrain.products(bedrock);
var slope = terrain.select('slope');
//print('terrain', terrain);

var canyons = bedrock.lt(-200).and(slope.gt(6)).selfMask();

// Add them to the map
Map.addLayer(abyssal, {palette: ['3d85c6']}, 'Abyssal plains');
Map.addLayer(slopes, {palette: ['76a5af']}, 'Continental and island slopes');
Map.addLayer(hadal, {palette: ['073763']}, 'Hadal trenches and troughs');
Map.addLayer(canyons, {palette: ['e06666']}, 'Submarine canyons');

// PART 2: Add atleast one vector dataset to the map
// Submarine Hydrothermal Vent Fields: 
// https://usinterridge.org/vents-database/ url for the "InterRidge Global Database of Active Submarine Hydrothermal Vent Fields"
// I also want the WDPA: World Database on Protected Areas, an use the polygone version. 
// I wanna use the WDPA to map the marine protected areas

//Submarine Hydrothermal Vent Fields
var vents  = ee.FeatureCollection('projects/techniques-1-ecomputing/assets/Vent_fields');

// Inspect the data 
//print (vents)
//print('Vent field count:', vents.size()); // there are 721 vent field counts 
//print('First vent feature:', vents.first());

// add them to the map
// Create a vent colour and shape 
var ventsColour = vents.style({
  color: 'ffffff',
  fillColor: 'purple', // colours the inside of the shape
  pointShape: 'circle',
  pointSize: 2,
  width: 1
});

// Add to map to have a look
Map.addLayer(ventsColour, {}, 'Submarine hydrothermal vents', true);


// Marine protected areas (WDPA polygons)
var protected_areas = ee.FeatureCollection("WCMC/WDPA/current/polygons");

// Look at the properties to find the field that separates land from sea
//print('First protected area:', protected_areas.first());
// uses REALM  to specify wether its marine or land 

// Keep only the marine protected areas
var mpas = protected_areas.filter(ee.Filter.eq('REALM', 'Marine'));
//print('Number of marine PAs:', mpas.size()); //number is 6457

// Style: transparent fill with a outline so the ecosystem layers show through
var mpaStyled = mpas.style({
  color: '93c47d',         // outline
  fillColor: '93c47d80',   // same colour, mostly transparent
  width: 1
});
Map.addLayer(mpaStyled, {}, 'Marine protected areas', false);


// PART 4: Create app
// Build a panel to hold a title and the legend
// Dark semi-transparent legend panel
var panel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '12px 16px',
    width: '310px',
    backgroundColor: 'rgba(28, 33, 36, 0.88)' // Dark charcoal with slight transparency
  }
});

// title, description, and section headers to white/light grey
panel.add(ui.Label('Deep Ocean Ecosystems', {
  fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0)'
}));
panel.add(ui.Label('Deep ocean ecosystems mapped from ETOPO1 bathymetry, with marine protected areas and hydrothermal vents.', {
  fontSize: '12px', margin: '0 0 8px 0', color: '#cccccc', backgroundColor: 'rgba(0,0,0,0)'
}));

// text is white and row backgrounds are transparent
var makeRow = function(colour, name) {
  var colourBox = ui.Label('', {backgroundColor: '#' + colour, padding: '8px', margin: '0 8px 4px 0'});
  var description = ui.Label(name, {margin: '0 0 4px 0', fontSize: '12px', color: '#eeeeee', backgroundColor: 'rgba(0,0,0,0)'});
  return ui.Panel({
    widgets: [colourBox, description],
    layout: ui.Panel.Layout.Flow('horizontal'),
    style: {backgroundColor: 'rgba(0,0,0,0)'}
  });
};
// Ecosystems
// Final colours for the ecosystem layers
var slopesColour  = '76a5af';
var abyssalColour = '3d85c6'; 
var hadalColour   = '073763'; 
var canyonColour  = 'e06666';


panel.add(ui.Label('Ecosystems', {fontWeight: 'bold', fontSize: '18px', 
margin: '0 0 4px 0', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0)'}));
panel.add(makeRow(hadalColour, 'Hadal trenches and troughs (>6000 m)'));
panel.add(makeRow(abyssalColour, 'Abyssal plains (3000-6000 m)'));
panel.add(makeRow(canyonColour, 'Submarine canyons (>200 m, slope >6 degrees)'));
panel.add(makeRow(slopesColour, 'Continental and island slopes (250-3000 m)'));

// Submarine hydrothermal vents & Protected Areas
panel.add(ui.Label('Protected Areas & hydrothermal vents', {fontWeight: 'bold', fontSize: '18px', 
margin: '0 0 4px 0', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0)'}));
panel.add(makeRow('93c47d', 'Marine protected areas (WDPA)'));
panel.add(makeRow('800080', 'Submarine hydrothermal vents'));

Map.add(panel);

