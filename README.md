# mapbox-react
Trying out mapbox react

## Data Source
### Contour Data
[USGS Small Scale Topo Dataset](https://www.sciencebase.gov/catalog/item/581d051de4b08da350d523c3)

## Data Processing
```CLI
mapshaper data/cont49l010a.shp -simplify 1% -filter-fields Contour -o format=geojson precision=.00001 data/contours.json -verbose
```

