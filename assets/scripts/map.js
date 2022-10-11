mapboxgl.accessToken = 'pk.eyJ1IjoiZG9ubHV5ZW5kaWprIiwiYSI6ImNsN3lpaHJtZDBsNmwzb210azJzY3Q3eWcifQ.IpyU5qZRzyUOXwnc4GaSeQ'

var homeStations = [];

function getData()
{
    var array = [];
    var tableArray = {};
    $.get("/get_weather_data", function( data ) {

        for(i=0; i < data.array.length; i++)
        {
            currentRecord = data.array[i];
    
            nextRecord = data.array[i+1];
            
            var fieldName = currentRecord._field;
            var tagName = currentRecord.tag; 

            if(nextRecord != null)
            {
                if((currentRecord.table != nextRecord.table) || (i >= data.array.length))
                {
                    tableArray["Tag"] = tagName;
                    tableArray[fieldName] = currentRecord._value;
                    array.push(tableArray);
                    tableArray = {};
                }else
                {
                    tableArray["Tag"] = tagName;
                    tableArray[fieldName] = currentRecord._value;
                }
            }else
            {
                tableArray["Tag"] = tagName;
                tableArray[fieldName] = currentRecord._value;
                array.push(tableArray);
                tableArray = {};
            }
            
        }

        homeStations = array;
	});
}

function generatePopUpData(homeStation)
{
    var message = "";

    Object.entries(homeStation).forEach(entry => {
        const [key, value] = entry;
        if(key == "Tag")
        {
            message += "<strong>Home station " + String(value) + "</strong><br>";
        }
        message += String(key) + " : " + String(value) + "<br>";
    });

    return message;
}

function generateLabelData() {
    return {
        'type': 'FeatureCollection',
        'features': homeStations.map((homeStation) => {
            return {
                'type': 'Feature',
                'properties': {
                    'description': generatePopUpData(homeStation),
                    'icon': 'rocket-15'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [homeStation.longitude, homeStation.latitude]
                }
            }
        })
    }
}

function updateLabelData() {
    map.getSource('labels').setData(generateLabelData())
}

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [4.5, 51.9],
    zoom: 10,
    projection: 'globe'
})

map.on('load', () => {

    // add label data
    map.addSource('labels', {
        'type': 'geojson',
        'data': generateLabelData()
    })

    // add layer for popups
    map.addLayer({
        'id': 'labels',
        'type': 'symbol',
        'source': 'labels',
        'layout': {
            'icon-image': '{icon}',
            'icon-allow-overlap': true,
            'icon-size': 1.5
        }
    })

    // open popup on click
    map.on('click', 'labels', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice()
        const description = e.features[0].properties.description

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map)
    })

    // change cursor when hovering over a label
    map.on('mouseenter', 'labels', () => {
        map.getCanvas().style.cursor = 'pointer'
    })

    // change cursor back
    map.on('mouseleave', 'labels', () => {
        map.getCanvas().style.cursor = ''
    })

    // demonstrate updating by incrementing the temperature every second
    setInterval(() => {

        getData()
        updateLabelData()
        //console.log(document.getElementsByClassName('mapboxgl-popup'));
    }, 1000)
})
