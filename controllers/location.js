

const returnDistanceBetween2Coordinates = (first, second) => {
    return Math.sqrt((Math.pow(first.lat - second.lat,2)) + (Math.pow(first.lng - second.lng,2)))
}




const checkforUserDistance = (userLocation) => {
    const {lat, lng} = userLocation;
    const houseLocation = {
        lat: 32.0766887,
        lng: 34.8002835
    }

    const distance = returnDistanceBetween2Coordinates(userLocation, houseLocation);
    console.log({distance})
    return distance;
}


module.exports = {
    checkforUserDistance
}

//(5,3),(6,7) => 4.123