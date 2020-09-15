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

## Load Data using Mapbox GL with REACT
File Names: index.js, site.css, index.html, components/slider.js, components/Tooltip.js

Source:
[Mapbox GL Tutorial](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)