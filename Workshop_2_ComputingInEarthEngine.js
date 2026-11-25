
// COMPUTATION IN EARTH ENGINE
Map.setOptions('SATELLITE')
var srtm = ee.Image("CGIAR/SRTM90_V4"); // remeber to check your letter, er de store eller sma
//Map.addLayer(srtm, {palette: ['black','#f84001','#ff9470','yellow','white', 'black'], min:0, max:2500},'srtm');

//var srtm_fixed = srtm.add(10) // fix if there was something wrong with the data
//Map.addLayer(srtm_fixed, {palette: ['black','#f84001','#ff9470','yellow','white', 'black'], min:0, max:2500},'srtm_fixed');

var snow_line = srtm.gt(1800).selfMask()
var tree_line = srtm.gt(1015).selfMask()
//Map.addLayer(tree_line,{palette: ['black', 'green']}, 'tree threshold')
//Map.addLayer(snow_line,{palette: ['black','pink']}, 'snow threshold')

// Calculate slope
var slope = ee.Terrain.slope(srtm)
//Map.addLayer(slope, {paletter: ['black', 'white']}, 'slope')

// parks 
var wdpa = (ee.FeatureCollection("WCMC/WDPA/current/polygons"));
//Map.addLayer (wdpa, {color:'orange'}, 'wdpa');

// Analyse the the avrage elavation 
var taranaki = wdpa.filter(ee.Filter.eq('NAME','Egmont National Park'));
//Map.addLayer(taranaki, {color:'orange'},'Mt Taranaki')

// Apply a spiartial reducer to estimate mean slope
var slopeOutput = slope.reduceRegion({reducer:ee.Reducer.mean(),//compute the mean of all slope pixels
  geometry: taranaki, scale:90 // pixel size in meters - get this from the metadata (search for it 
  })
  
print ('slopeOutput',slopeOutput)

// try clipping 
var taranakiSlope = slope.clip(taranaki)
//Map.addLayer(taranakiSlope, {palette: ['white','darkred','black'],min:0, max:45}, 'taranaki slope')
var slopeOutput2 =taranakiSlope.reduceRegion({reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the metadata
geometry: taranaki, scale:90})
print('slopeOuput2', slopeOutput2) // same answer 



// Find the maximum and minimum elevation values 
var elevOutput_Max = srtm.reduceRegion({reducer: ee.Reducer.max(), // we compute the max of all pixel values in the national park
geometry: taranaki, scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Max', elevOutput_Max)

var elevOutput_Min = srtm.reduceRegion({reducer: ee.Reducer.min(),// we compute the min of all slope pixel values in the national park
geometry: taranaki, scale: 90 })
print ('elevOutput_Min', elevOutput_Min)

// Use reduce regions with a different reducer
var elevOutput_MinMax = srtm.reduceRegion({reducer:ee.Reducer.minMax(),// we compute the mean of all slope pixel values in the national park
geometry: taranaki, scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_MinMax', elevOutput_MinMax)

// Get area of >1500m
var elevGt1500  = srtm.gt(1500).selfMask()
var areaGt1500m = elevGt1500 // binary 1 == yes 
.multiply(ee.Image.pixelArea()) // get the area of each pixel
.reduceRegion({reducer:ee.Reducer.sum(), // sum all pixel areas together
geometry: taranaki, scale: 90})

print ('The area of Taranaki above 1500m (m2)', areaGt1500m) // in square metres
print ('The area of Taranaki above 1500m (km2)', ee.Number(areaGt1500m.get('elevation')).divide(1000 * 1000)) // in square metres

//3.7 Image Reducers
var dataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');
print (dataset) // 12 images where each one is a month

// Get two months
var jan_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/01")
var july_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/07")

var jan_climate_avg = jan_climate.select('tavg') // get average band
var july_climate_avg = july_climate.select('tavg')

// Set vis parameters
var meanTemperatureVis = {min: -40, max: 30, palette:['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],}
Map.addLayer(jan_climate_avg, meanTemperatureVis, 'janClimate')
Map.addLayer(july_climate_avg, meanTemperatureVis, 'julyClimate')

// Note the pixel scaling error and fix it
// need to devide all pixel values by 10, or multiply by 1 (.multiply(0.1))

// We want to reduce to get the yearly avrae
var annualMeanTemprature = dataset
.select('tavg')
.mean()// this is the reducer
.multiply(0.1); // scale pixel to real values

Map.setCenter(71.7,52.4,3);
Map.addLayer(annualMeanTemprature,meanTemperatureVis,'Mean Annual Temprature');

var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate('2017-01-01', '2017-12-31'); // only images from 2017
var trueColour = dataset.select(['B4', 'B3', 'B2']);
var trueColourVis = {
  min: 0.0,
  max: 0.4,
};
Map.setCenter(146.746, -19.529, 9);
Map.addLayer(trueColour, trueColourVis, 'True Colour Landsat');

// Let's use reduce these
var LandsatMedian = trueColour.median()
Map.addLayer(LandsatMedian, trueColourVis, 'True Color Median');
