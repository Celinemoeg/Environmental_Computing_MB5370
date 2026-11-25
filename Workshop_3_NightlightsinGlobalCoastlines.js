//Workshop 3 - Nightlights in global coastlines

// 4.3 Identifying the data

// Population
var population = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Count");
//print (population)

// pull out the images for the years we want 
// import two images for start and end
var population_2000 = 
ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2000_30_sec');
var population_2015 = 
ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2015_30_sec');
//print (population_2000);

// visulaise them 
var population_vis = {
  'max': 1000.0,
  'palette':[
    'ffffe7',
    '86a192',
    '509791',
    '307296',
    '2c4484',
    '000066'
],
'min':0.0
};

//Map.addLayer(population_2000,population_vis, 'population_count_2000');
//Map.addLayer(population_2015,population_vis,'population_count_2015');


// Nightlights
var nl=ee.ImageCollection("NOAA/DMSP-OLS/NIGHTTIME_LIGHTS")
print (nl)

// Get two images for start and end 
var nl_2000 = ee.Image
('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F142000')
.select(['avg_vis'],['nightlight']);//select and rename

var nl_2013 = ee.Image
('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013')
.select(['avg_vis'],['nightlight'])
//print('nightlight 2000 processed', nl_2000)

// visulise them
var nightLight_vis = {
  'min':3,
  'palette':[
    'black',
    'yellow',
    'white'],
'max':63
};//visulise the data and f.ex. tap a point where i would asume its little light and where there is a lot 

//Map.addLayer(nl_2000, nightLight_vis,'Nighttime Lights 2000');
//Map.addLayer(nl_2013, nightLight_vis, 'Nighttime Lights 2013');


//4.3.2	Vector data

// import grid 
var grid_1d= ee.FeatureCollection('users/murrnick/mb5370/worldgrid_1deg'); // 1 degree grid
//Map.addLayer(grid_1d, {color:'white'}, '1 Degree Grid',false,0.4);

// Imoprt a coastline
var coast = 
ee.FeatureCollection('projects/UQ_intertidal/dataMasks/naturalEarthCoastline_v1');
print(coast)
//Map.addLayer(coast, {color:'yellow'},'coast')//coastline dataset

// filter grid 
var coastGrid = grid_1d.filter(ee.Filter.bounds(coast.geometry()))
//Map.addLayer(coastGrid, {colour:'blue'}, 'CoastGrid')

// 4.5 Global change
var pop_change = population_2015
.subtract(population_2000)
//.clip(coastGrid);

//Map.addLayer (pop_change, {palette:['red','black','lime'], min: -500, max: 500},'pop_change', true, 0.9);

var nl_change=nl_2013
.subtract(nl_2000)
//.clip(coastGrid)//clip to the coastal grid 


//Map.addLayer(nl_change,{palette:['red','black','lime'],min:-50,max:50},'nl_change',true,0.9)


// average change in nightlights per grid
var nl_changePergrid = nl_change.reduceRegions({
  collection: coastGrid,
  reducer:ee.Reducer.mean(),
  scale:1000, // note computing ay large scale for speed
})
//print (nl_changePergrid.first())//look at properties of the first one 

var pop_changePerGrid = pop_change.reduceRegions({
  collection: coastGrid,
  reducer:ee.Reducer.mean(),
  scale:1000, // note computing ay large scale for speed, why did we choose 1000, 
});

//4.6	Scaling your analysis: the importance of export
//Export the result
//Approx 10-20 minute export for scale 1000
//takes more than 28min
//Export the result to asset

Export.table.toAsset({
  collection: pop_changePerGrid,
  description:'export_pop_toAsset2',
  assetId:'pop_changePerGrid'
});

Export.table.toAsset({
  collection: nl_changePergrid,
  description:'export_nl_toAsset2',
  assetId:'nl_changePerGrid'
});
// did not work, tried twise, did not want to export, used about 3h

