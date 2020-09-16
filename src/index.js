import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import data from './watersheds.json';
import data2 from './powerplants.json';
import Tooltip from './components/Tooltip';
import Slider from './components/slider';
import {within} from '@turf/turf';



mapboxgl.accessToken = 'pk.eyJ1Ijoic2Z1MjM0IiwiYSI6ImNrM29wM3phazFnMXIzanFxdGNuMG05ZzgifQ.AAYvpsqsW56C4GggaNdNrA';

class Application extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                lng: 2.28,
                lat: 11.77,
                zoom: 1.2
            };
        }

        componentDidMount() {
            const map = new mapboxgl.Map({
                container: this.mapContainer,
                style: 'mapbox://styles/mapbox/dark-v9',
                center: [this.state.lng, this.state.lat],
                zoom: this.state.zoom
            })

            let hoveredStateId = null;

            const colorCodes = {
                1: "#7F3C8D",
                2: "#11A579",
                3: "#3969AC",
                4: "#F2B701",
                5: "#E73F74",
                6: "#80BA5A",
                7: "#E68310",
                8: "#008695",
                9: "#CF1C90",
                10: "#f97b72",
                11: "#4b4b8f",
                12: "#A5AA99",
                13: "#7ccba2",
                14: "#f40cd4",
                15: "#00364e",
                16: "#045275",
                17: "#00718b",
                18: "#089099",
                19: "#46aea0",
                20: "#7ccba2",
                21: "#b7e6a5",
                22: "#f40cd4"
            }

            map.on('load', () => {
                //request geojson
                // when loaded
                countPoints(data, data2);
                addLayer(data, data2);
                addLegend(data);
                addInteraction();


            })

            function countPoints(data, data2){
                data.features.forEach(function(feature){
                    let ptsWithin = within(data2, feature);
                    feature.properties.PLANTS = ptsWithin.features.length;
                })
                

            }

            function addLayer(geojson, geojson2) {
                // first add the source to the map
                map.addSource('watershed', {
                    type: 'geojson',
                    data: geojson, // use our data as the data source
                    'generateId': true
                });

                // add the GeoJSON data as a mapbox gl layer
                map.addLayer({
                    'id': 'phz',
                    'type': 'fill',
                    'source': 'watershed',
                    'paint': {
                        "fill-color": [
                            "match", // match the numbers below to the GRIDCODES
                            ["string", ["get", "HUC2"]],
                            "1", colorCodes[1],
                            "2", colorCodes[2],
                            "3", colorCodes[3],
                            "4", colorCodes[4],
                            "5", colorCodes[5],
                            "6", colorCodes[6],
                            "7", colorCodes[7],
                            "8", colorCodes[8],
                            "9", colorCodes[9],
                            "10", colorCodes[10],
                            "11", colorCodes[11],
                            "12", colorCodes[12],
                            "13", colorCodes[13],
                            "14", colorCodes[14],
                            "15", colorCodes[15],
                            "16", colorCodes[16],
                            "17", colorCodes[17],
                            "18", colorCodes[18],
                            "19", colorCodes[19],
                            "20", colorCodes[20],
                            "21", colorCodes[21],
                            "22", colorCodes[22],
                            "#000000" // default for no match
                        ],
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            1,
                            0.5
                        ]

                    }
                });

                map.addSource('power', {
                    type: 'geojson',
                    data: geojson2, // use our data as the data source
                    'generateId': true
                });

                map.addLayer({
                    'id': 'pws',
                    'type': 'circle',
                    'source': 'power',
                    'paint': {
                        'circle-radius': 3.5,
                        'circle-color': '#223b53',
                        'circle-stroke-color': 'yellow',
                        'circle-stroke-width': 1,
                        'circle-opacity': 0.5
                    }
                });

                map.addSource('wms-source', {
                    'type': 'raster',
                    'tiles': [
                        'https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=EPSG%3A3857&layers=3&layerDefs=&size=256%2c256&imageSR=&format=png&transparent=true&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&f=image'
                    ],
                    'tileSize': 256
                });
                map.addLayer({
                    'id': 'wms-layer',
                    'type': 'raster',
                    'source': 'wms-source',
                    'paint': {}
                });

                const onZoomend = () => {

                    // set the max bounds
                    map.setMaxBounds(map.getBounds())

                    // display the legend
                    let el = document.getElementById('legend');
                    el.classList.remove('none')

                    // remove the listener
                    map.off('zoomend', onZoomend);
                };

                // when the map is done zooming
                map.on('zoomend', onZoomend);

                // map will flyTo the bounds provided
                map.fitBounds([-129.07, 23.02, -65.74, 50.53], {
                    padding: {
                        top: 20,
                        bottom: 10,
                        left: 12,
                        right: 220
                    }
                });

                let element = document.getElementById('customRange1');
                element.addEventListener('change', function () {
                    let newTime = timestamps[element.value];
                    map.removeLayer('wms-test-layer')
                    map.removeSource('wms-test-source')
                    addTiles(newTime)
                });


                let timestamps = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];

                function addTiles(timestamp) {
                    var urlTemplate = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-' + timestamp + '/{z}/{x}/{y}.png';
                    map.addSource('wms-test-source', {
                        'type': 'raster',
                        'tiles': [
                            urlTemplate
                        ],
                        'tileSize': 256
                    });
                    map.addLayer({
                        'id': 'wms-test-layer',
                        'type': 'raster',
                        'source': 'wms-test-source',
                        'paint': {}
                    });
                }
                addTiles('900913-m50m');

            }

            function addLegend(geojson) {

                // build it an object for associated GRIDECODES 
                // with the Zone descriptions from the data
                const labelCodes = {};

                // loop through all the features
                geojson.features.forEach((feature) => {
                    // shortcut for the code
                    let code = feature.properties.HUC2;
                    // if it's not in our labelsCodes object yet
                    if (!labelCodes[code]) {
                        // create it and assign the Zone description
                        labelCodes[code] = feature.properties.NAME
                    }
                })

                // empty string for building our list items
                let listItems = '';

                // loop through all the colorCodes
                for (let code in colorCodes) {
                    // create a item for each zone 
                    listItems += `<li class='li h-full txt-m'>
                <span class='w24 h18 mt6 fl mr12' 
                      style='background: ${colorCodes[code]}'>
                </span>${labelCodes[code]}</li>`;
                }
                // select the legend ul element and insert the HTML list items
                let el = document.querySelector("#legend ul")
                el.innerHTML = listItems;

            }

            function addInteraction() {

                // Create a popup, but don't add it to the map yet.
                const tooltipRef = new mapboxgl.Popup({
                    offset: 15,
                    closeButton: false,
                    closeOnClick: false
                });

                map.on('mousemove', 'phz', e => {
                        // Change the cursor style as a UI indicator.
                        map.getCanvas().style.cursor = 'pointer';

                        let prop = e.features[0].properties;
                        let zone = prop.NAME;
                        let plants = prop.PLANTS;
                        let data = `Watershed: ${zone} Hydro Plants: ${plants}`;

                        // popup.setLngLat(e.lngLat).setHTML(data).addTo(map);
                        // Create tooltip node
                        const tooltipNode = document.createElement('div');
                        ReactDOM.render(<Tooltip feature = {data}/>, tooltipNode);
                            // Set tooltip on map
                            tooltipRef.setLngLat(e.lngLat).setDOMContent(tooltipNode).addTo(map);

                            //Hover effect
                            if (e.features.length > 0) {
                                if (hoveredStateId) {
                                    map.setFeatureState({
                                        source: 'watershed',
                                        id: hoveredStateId
                                    }, {
                                        hover: false
                                    });
                                }
                                hoveredStateId = e.features[0].id;
                                map.setFeatureState({
                                    source: 'watershed',
                                    id: hoveredStateId
                                }, {
                                    hover: true
                                });
                            }

                        });

                    map.on('mouseleave', 'phz', function () {
                        map.getCanvas().style.cursor = '';
                        tooltipRef.remove();

                        if (hoveredStateId) {
                            map.setFeatureState({
                                source: 'watershed',
                                id: hoveredStateId
                            }, {
                                hover: false
                            });
                        }
                        hoveredStateId = null;
                    });

                }
                ReactDOM.render( < Slider / > , document.getElementById('slider'));

            }
            render() {
                return ( <div>
                    <div id = 'legend' className = 'w180 bg-white absolute top right mt18 mr18 round shadow-darken10 px12 py12 txt-s none' >
                        <strong className = 'block mb6 txt-l'>Watershed Regions</strong>  
                        <ul className = 'ul mb6'>
                        </ul>
                        <br/>
                        <div>
                        <span className="dot"></span><span className="font">Power Plants</span>
                        </div>
                        <br></br>  
                        <div id = 'slider'>
                        </div>
                    </div> 
                    <div ref = {el => this.mapContainer = el} className = 'mapContainer'/>
                    </div>


                )
            }
        }

        ReactDOM.render( < Application / > , document.getElementById('app'));