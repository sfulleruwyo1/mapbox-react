import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import data from './phm.json';
import Tooltip from './components/Tooltip';
import Slider from './components/slider';



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

            const colorCodes = {
                5: "#00364e",
                6: "#045275",
                7: "#00718b",
                8: "#089099",
                9: "#46aea0",
                10: "#7ccba2",
                11: "#b7e6a5",
                12: "#f7feae",
                13: "#fcde9c",
                14: "#faa476",
                15: "#f0746e",
                16: "#e34f6f",
                17: "#dc3977",
                18: "#b9257a",
                19: "#7c1d6f",
                20: "#941c84",
                21: "#c610ad",
                22: "#f40cd4"
            }

            map.on('load', () => {
                //request geojson
                // when loaded
                //console.log(data);
                addLayer(data);
                addLegend(data);
                addInteraction();


            })

            function addLayer(geojson) {
                // first add the source to the map
                map.addSource('zone-data', {
                    type: 'geojson',
                    data: geojson // use our data as the data source
                });

                // add the GeoJSON data as a mapbox gl layer
                map.addLayer({
                    'id': 'phz',
                    'type': 'fill',
                    'source': 'zone-data',
                    'paint': {
                        "fill-color": [
                            "match", // match the numbers below to the GRIDCODES
                            ["number", ["get", "GRIDCODE"]],
                            5, colorCodes[5],
                            6, colorCodes[6],
                            7, colorCodes[7],
                            8, colorCodes[8],
                            9, colorCodes[9],
                            10, colorCodes[10],
                            11, colorCodes[11],
                            12, colorCodes[12],
                            13, colorCodes[13],
                            14, colorCodes[14],
                            15, colorCodes[15],
                            16, colorCodes[16],
                            17, colorCodes[17],
                            18, colorCodes[18],
                            19, colorCodes[19],
                            20, colorCodes[20],
                            21, colorCodes[21],
                            22, colorCodes[22],
                            "#000000" // default for no match
                        ],
                        "fill-opacity": .75
                    }
                });


                // map.addSource('wms', {
                //     'type': 'raster',
                //     'tiles': [
                //         'https://img.nj.gov/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=Natural2015'
                //     ],
                //     'tileSize': 256
                // });
                // map.addLayer({
                //         'id': 'wms',
                //         'type': 'raster',
                //         'source': 'wms',
                //         'paint': {}
                //     }
                // );




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
                        top: 12,
                        bottom: 18,
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


                // let count = 0;
                // setInterval(function () {
                //     map.removeLayer('wms-test-layer')
                //     map.removeSource('wms-test-source')
                //     count = (count + 1) % timestamps.length;
                //       let newTime = timestamps[count];
                //     addTiles(newTime)
                // }, 600);

            }

            function addLegend(geojson) {

                // build it an object for associated GRIDECODES 
                // with the Zone descriptions from the data
                const labelCodes = {};

                // loop through all the features
                geojson.features.forEach((feature) => {
                    // shortcut for the code
                    let code = feature.properties.GRIDCODE;
                    // if it's not in our labelsCodes object yet
                    if (!labelCodes[code]) {
                        // create it and assign the Zone description
                        labelCodes[code] = feature.properties.ZONE
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
                </span>${labelCodes[code]}"</li>`;
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
                        // //let grid = prop.GRIDCODE;
                        let zone = prop.ZONE;
                        let data = `Zone ${zone}`;

                        // popup.setLngLat(e.lngLat).setHTML(data).addTo(map);
                        // Create tooltip node
                        const tooltipNode = document.createElement('div');
                        ReactDOM.render( < Tooltip feature = {
                                data
                            }
                            />, tooltipNode);
                            // Set tooltip on map
                            tooltipRef.setLngLat(e.lngLat).setDOMContent(tooltipNode).addTo(map);

                        });

                    map.on('mouseleave', 'phz', function () {
                        map.getCanvas().style.cursor = '';
                        tooltipRef.remove();
                    });

                }
                ReactDOM.render( < Slider / > , document.getElementById('slider'));

            }
            render() {
                return ( < div >
                    <
                    div id = 'legend'
                    className = 'w180 bg-white absolute top right mt18 mr18 round shadow-darken10 px12 py12 txt-s none' >
                    <
                    strong className = 'block mb6 txt-l' > Zones < /strong>  <
                    ul className = 'ul mb6' > < /ul>  <
                    div id = 'slider' >
                    <
                    /div>                            <
                    /div >  <
                    div ref = {
                        el => this.mapContainer = el
                    }
                    className = 'mapContainer' / >

                    <
                    /div>


                )
            }
        }

        ReactDOM.render( < Application / > , document.getElementById('app'));