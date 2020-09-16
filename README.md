# mapbox-react
Trying out mapbox react

## Data Source
### Watershed Boundary
[USDA Data Gateway](https://datagateway.nrcs.usda.gov/GDGHome_DirectDownLoad.aspx)

## Data Processing
Simplify boundaries and convert to geojson
```CLI
mapshaper data/WATERSHEDS.shp -simplify 20% -filter-fields NAME,AREAACRES,HUC2 -o format=geojson precision=.00001 data/watersheds.json -verbose
```

Filter Point Hydro power plant data and convert to geojson
Had to limit powerplants to under 70, turf js point in polygon analysis is very slow.  Would best be handled on the backend.
```CLI
mapshaper data/Plant_operational_ExternalGISFY2020revised.shp -filter "CH_MW >= 200" -filter-fields PtName,County,State,Pt_Own,CH_MW -o format=geojson precision=.00001 data/powerplants.json -verbose
```

## Load Data using Mapbox GL with REACT
File Names: index.js, site.css, index.html, components/slider.js, components/Tooltip.js

Source:
[Mapbox GL Tutorial](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)