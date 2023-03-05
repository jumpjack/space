// Basic functions:
// addPoint(x,y,z, name, alt)
// arrowFromTo(latitude, longitude, height, elev, azimut, length, width, color, drawOrNot, targetName)
// drawLine(x1,y1,z1, x2, y2, z2, width, color,  dashed, targetName)


function addPoint(x,y,z, name, alt) {
// Create a point "alt" km above specified coordinates

  var origin = Cesium.Cartesian3.fromDegrees(x,y,z); //lon, lat,  alt (meters)

	viewer.entities.add({
	  position:  Cesium.Cartesian3.fromDegrees(x,y,alt * 1000),
	  point: {
	      color: Cesium.Color.YELLOW,
	      pixelSize: 10,
	},
	  label: {
	    text: "Point",
	    font: "24px Helvetica",
	    pixelOffset: new Cesium.Cartesian2(0.0, 20),
	},
	});
}




function arrowFromTo(latitude, longitude, height, elev, azimut, length, width, color, drawOrNot, targetName){
	if ((targetName == null)  || (targetName.length == 0 )) {
//		console.log("WARNING: target has no name, dist= " , length , ", alt=", elev, ", az=", azimut);
	}

  latitude = Cesium.Math.toRadians(latitude);
  longitude = Cesium.Math.toRadians(longitude);
  var origin = new Cesium.Cartographic(longitude, latitude, height);
  var originC3 = new Cesium.Cartographic.toCartesian(origin);

  // Altitude (aka Elevation) and Azimuth can also be seen as Pitch and Heading, with Roll = 0:
  var heading = Cesium.Math.toRadians(azimut);
  var pitch = Cesium.Math.toRadians(elev);
  var roll = 0.0;
  var direction = new Cesium.HeadingPitchRoll(heading, pitch, roll);

  ////////////
  var result = createROIfromRotation(origin, direction, length);
  ////////////

	if (drawOrNot) {
  	drawLine(originC3.x ,originC3.y, originC3.z, result.x ,result.y, result.z, width, color, false, targetName);
	} else {
//console.log("not drawn target ' " + targetName + "'");
		return result;
	}

}

function createROIfromRotation(position,  rotation, length) {
// Return cartesian coordinates of a point given a base point ("position"),
// a direction ("rotation", expressed as  Cesium.HeadingPitchRoll(heading, pitch, roll))
// and a length.

  // position: Cartographic - Cesium.Cartographic(longitude, latitude, height)
  // rotation: HeadingPitchRoll - Cesium.HeadingPitchRoll(heading, pitch, roll}

  // Based on answer found here:
  // https://stackoverflow.com/questions/58021985/create-a-point-in-a-direction-in-cesiumjs

    var cartesianPosition = Cesium.Ellipsoid.WGS84.cartographicToCartesian(position);

    rotation.heading = rotation.heading - Cesium.Math.toRadians(90);
    var referenceFrame1 = Cesium.Transforms.headingPitchRollQuaternion(cartesianPosition, rotation);
    var rotationMatrix = Cesium.Matrix3.fromQuaternion(referenceFrame1, new Cesium.Matrix3());
    var rotationScaled = Cesium.Matrix3.multiplyByVector(rotationMatrix, new Cesium.Cartesian3(length, 0, 0), new Cesium.Cartesian3());
    var roiPos = Cesium.Cartesian3.add(cartesianPosition, rotationScaled, new Cesium.Cartesian3());
    return roiPos;
}


function drawLine(x1,y1,z1, x2, y2, z2, width, color,  dashed, targetName) {
// Draw a straight line between two points in space, using cartesian coordinates for points.
// Parameters:
// Points x,y,z coordinates
// Line width
// Line color
// Line dashed or not
// Name of second point (optional); if specified, draw a dot and assign a label to it.

  var origin = new Cesium.Cartesian3(x1,y1,z1);
  var dest = new Cesium.Cartesian3(x2,y2,z2);


	if (dashed) {
		mat = new Cesium.PolylineDashMaterialProperty({color: color});
	} else {
		mat = new Cesium.PolylineArrowMaterialProperty(color);
  }

	entLine = viewer.entities.add({
	  polyline: {
	      positions: [
	        origin,
	        dest
	        ],
	    arcType: Cesium.ArcType.NONE,
	    width: width,
	    material: mat,
		description : targetName
	  }
	});


	if ((targetName != "") && (targetName != null)) {
	  // add target label:
		viewer.entities.add({
				  position: dest,
				  point: {
				      color: Cesium.Color.YELLOW,
				      pixelSize: 18,
				},
				  label: {
				    text: targetName,
				    font: "14px Helvetica",
				    pixelOffset: new Cesium.Cartesian2(0.0, 20),
				},
				  description : targetName
				});
	}
}

function getElevation(startPoint, endPoint) {
// Return elevation in degree of endPoint w.r.t. startPoint
// https://community.cesium.com/t/calculate-elevation-angle-between-two-points/5629/5
// https://sandcastle.cesium.com/?src=Hello%20World.html&label=Showcases&gist=d917ac40dfb225cb9899a84403b0c719

// startPoint = new Cesium.Cartesian3.fromDegrees(12.636018, 41.995557, 167);  (lon, lat, alt)
// endPoint = new Cesium.Cartesian3.fromDegrees(12.801439, 42.058937, 1181); (lon, lat, alt)

	//Obtain vector by taking difference of the end points
	var scratch1= new Cesium.Cartesian3();
	var difference = Cesium.Cartesian3.subtract(endPoint, startPoint, scratch1);
	difference = Cesium.Cartesian3.normalize(difference, scratch1);
	//console.log("Difference: " + difference);

	//Obtain surface normal by normalizing the starting point position
	var scratch2 = new Cesium.Cartesian3();
	var surfaceNormal = Cesium.Cartesian3.normalize(startPoint, scratch2);
	//console.log("Surface normal: " + surfaceNormal);

	//Take the dot product of your given vector and the surface normal
	var dotProduct = Cesium.Cartesian3.dot(difference, surfaceNormal);
	//console.log("Dot product: " + dotProduct);

	//Arcos the result
	var angle = 90 - Math.acos(dotProduct) * Cesium.Math.DEGREES_PER_RADIAN ;
	//console.log("Result: " + angle);
	return angle;
}


 // Converts from degrees to radians.
function   toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

// Converts from radians to degrees.
function   toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

function getBearing(startLat , startLng, destLat, destLng) {
// Return bearing in degree of second point w.r.t. first point.
// Points given in cartographic format.
// https://stackoverflow.com/questions/54398596/cesium-calculate-bearing-rotation-from-2-positions



    startLat = this.toRadians(startLat);
    startLng = this.toRadians(startLng);
    destLat = this.toRadians(destLat);
    destLng = this.toRadians(destLng);

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    let brngDgr = this.toDegrees(brng);
    return (brngDgr + 360) % 360;
}
