// Visualising Data

// 1. Set up map
Map.setOptions('SATELLITE');
Map.setCenter(174.0638, -39.2981, 11); //TAKES US TO A SPECIFIC SPOT ON THE MAP

// Viz an image
var srtm = ee.Image("CGIAR/SRTM90_V4"); // remeber to check your letter, er de store eller sma
print(srtm)
Map.addLayer(srtm, {palette: ['black', 'gray', 'white', 'blue', 'green','lime', 'yellow', 'red', 'purple'], min:0, max:3000},'srtm');


// Visu;asise a Feautere collection 
var wdpa = ee.FeatureCollection("WCMC/WDPA/current/polygons");
//Map.addLayer (wdpa, {color:'orange'}, 'wdpa');

//filtering data

//How many PAs on Earth?
var no_pas = wdpa.size();
print ('Number of PAs:',no_pas);
//var first_pa=wdpa.sort('STATUS_YR',false).first() //sorts in desending orger, gives us the newest national park/protected area
//print ('First pa:', first_pa)

// How many national level II protected areas?
var national_parks = wdpa.filter(ee.Filter.eq('IUCN_CAT','II'));
print('National parks size:', national_parks.size());
//Map.addLayer(national_parks,{color: 'lime'},'national parks');

//Spatial filter
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
print('countries', countries)//print
//Map.addLayer(countries)//ad it to the map window


// Newzeland df
var nz = countries.filter(ee.Filter.eq('country_co','NZ'));// filter to NZ
//Map.addLayer(nz, {color:'white'}, 'nz');// add to map

// Filter Pas to NZ boundery
var nz_pas = wdpa.filter(ee.Filter.bounds(nz));
print('no. pas in NZ:', nz_pas.size()) //answer = 10130
//Map.addLayer(nz_pas, {color: '#a12a88'},'NZ PAs')


// how many 'National Parks (e.g paluma) are in NZ?
var nz_nps = national_parks.filter(ee.Filter.bounds(nz));
print('no. National parks in NZ:', nz_nps.size()) //answer = 18
//Map.addLayer(nz_nps, {color: 'green'},'NZ PAs')

// COMPUTATION IN EARTH ENGINE

// Change opacity
var elevationVis = {palette: ['black', 'gray', 'white', 'blue', 'green','lime', 'yellow', 'red', 'purple'], min:0, max:3000}
print (srtm)

//Computation
print (srtm) 
var srtm_fixed = srtm.add(100)
Map.addLayer(srtm_fixed, elevationVis, 'fixed srtm')

var elevGt1500 = srtm.greaterThan(1500) 
Map.addLayer(elevGt1500) // Binary white == true
