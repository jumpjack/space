// Basic script for offline standalone Cesium

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZWYwMzkyNy1kZWI4LTQ0ZDctYWE2Ni1jZDc5OWY3YjEwZDQiLCJpZCI6Mzc2NjgsImlhdCI6MTYwNTM2NTcwMn0.gfyVDKfjLzWGxgFxRcEmWzxdzgMNlbUEo96qALfrDp8';
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
    });
    viewer.scene.globe.enableLighting = true;

    // Add Cesium OSM Buildings, a global 3D buildings layer.
    const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
