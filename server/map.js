import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef } from "react";

function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      //console.log("map init");
      console.log("API Key:", process.env.NEXT_PUBLIC_MAPS_API_KEY);

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY, // No need for 'as string'
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps");
      const position = {
        lat: 43,
        lng: -79,
      };

      // Map options in plain JS
      const mapOptions = {
        center: position,
        zoom: 17,
        mapId: "c255817c5ea381b9",
      };

      // Setup the map
      const map = new Map(mapRef.current, mapOptions);
    };

    initMap();
  }, []);

  return <div style={{ height: "600px" }} ref={mapRef} />;
}

export default Map;
