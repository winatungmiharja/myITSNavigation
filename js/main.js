function saveBookmark(properties) {
  if (localStorage.getItem("bookmarks") === null) {
    var bookmarks = [];
  } else {
    var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
  }

  bookmarks.push(properties);

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  fetchBookmarks();
}

function centerOnMarkerIndex(i) {
  var location = mapMarkers[i].position;
  map.panTo(location);
  map.setZoom(13);
}

function deleteBookmark(i) {
  var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
  bookmarks.splice(i, 1);
  mapMarkers[i].setMap(null);
  mapMarkers.splice(i, 1);

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  fetchBookmarks();
}

function fetchBookmarks(addMapMarker) {
  var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
  var bookmarksResults = document.getElementById("bookmarksResults");

  bookmarksResults.innerHTML = "";
  for (let i = 0; i < bookmarks.length; i++) {
    var content = bookmarks[i].content;
    var showBtn = document.createElement("a");
    showBtn.className = "btn btn-default btn-sm float-right";
    showBtn.addEventListener("click", function () {
      centerOnMarkerIndex(i);
    });
    showBtn.appendChild(document.createTextNode("show"));

    var deleteBtn = document.createElement("a");
    deleteBtn.className = "btn btn-danger btn-sm float-right delete";
    deleteBtn.addEventListener("click", function () {
      deleteBookmark(i);
    });
    deleteBtn.appendChild(document.createTextNode("X"));

    var text = document.createElement("strong");
    text.appendChild(document.createTextNode(content));
    text.appendChild(document.createTextNode("  "));
    text.appendChild(showBtn);
    text.appendChild(document.createTextNode("  "));
    text.appendChild(deleteBtn);

    var div = document.createElement("div");
    div.className = "well";
    div.appendChild(text);

    bookmarksResults.appendChild(div);
    if (addMapMarker == true) {
      addMarker(bookmarks[i]);
    }
  }
}

// GOOGLE MAP
var map;
var mapMarkers = [];

google.load("visualization", "1", { packages: ["columnchart"] });

function initMap() {
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var elevator = new google.maps.ElevationService();
  var center = {
    lat: -7.279749199999999,
    lng: 112.7975646,
  };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: center,
    mapTypeId: "roadmap",
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
  });
  var onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsDisplay, elevator);
  };
  document.getElementById("route").addEventListener("click", onChangeHandler);

  directionsDisplay.setMap(map);

  fetchBookmarks(true);
}

function calculateAndDisplayRoute(
  directionsService,
  directionsDisplay,
  elevator
) {
  directionsService.route(
    {
      origin: document.getElementById("start-input").value,
      destination: document.getElementById("end-input").value,
      travelMode: "WALKING",
    },
    function (response, status) {
      if (status === "OK") {
        // @hasna disini response nya
        let path = response.routes[0].overview_path;
        let lat = path.map((p) => p.lat());
        let lon = path.map((p) => p.lng());
        sessionStorage.setItem("lat", JSON.stringify(lat));
        sessionStorage.setItem("lon", JSON.stringify(lon));
        directionsDisplay.setDirections(response);
        afterSubmit();
        showNavigationControls();
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function showNavigationControls() {
  var navigationControls = document.getElementById("navigationControls");
  navigationControls.style.display = "flex";
  var onCancel = function () {
    cancelNavigation();
  };
  document.getElementById("cancel").addEventListener("click", onCancel);
}

function cancelNavigation() {
  var routeButton = document.getElementById("route");
  var startInput = document.getElementById("start-input");
  var endInput = document.getElementById("end-input");
  var navigationControls = document.getElementById("navigationControls");

  navigationControls.style.display = "none";

  startInput.style.pointerEvents = "auto";
  startInput.value = "";
  endInput.style.pointerEvents = "auto";
  endInput.value = "";

  routeButton.style.display = "flex";
}

function afterSubmit() {
  var routeButton = document.getElementById("route");
  var startInput = document.getElementById("start-input");
  var endInput = document.getElementById("end-input");

  startInput.style.pointerEvents = "none";
  endInput.style.pointerEvents = "none";

  routeButton.style.display = "none";
}

function plotElevation(elevations, status) {
  var chartDiv = document.getElementById("elevation_chart");
  if (status !== "OK") {
    chartDiv.innerHTML =
      "Cannot show elevation: request failed because " + status;
    return;
  }

  var chart = new google.visualization.ColumnChart(chartDiv);

  var data = new google.visualization.DataTable();
  data.addColumn("string", "Sample");
  data.addColumn("number", "Elevation");
  for (var i = 0; i < elevations.length; i++) {
    data.addRow(["", elevations[i].elevation]);
  }

  chart.draw(data, {
    height: 150,
    legend: "none",
    titleY: "Elevation (m)",
  });
}

function addMarker(properties) {
  var marker = new google.maps.Marker({
    position: properties.position,
    map: map,
  });
  if (properties.icon) {
    marker.setIcon(properties.icon);
  }
  if (properties.content) {
    var infoWindow = new google.maps.InfoWindow({
      content: "<strong>" + properties.content + "</strong>",
    });

    marker.addListener("click", function () {
      infoWindow.open(map, marker);
    });
  }
  mapMarkers.push(marker);
}

var locationForm = document.getElementById("location-form");
locationForm.addEventListener("submit", submitGeocode);

function submitGeocode(e) {
  e.preventDefault();
  var address = document.getElementById("address-input").value;

  axios
    .get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address: address,
        key: "AIzaSyDllvOEeUfsMmZP-omhBXjJKmlHc1N5094",
      },
    })
    .then(function (response) {
      var place = response.data.results[0];
      var formattedAddress = "";
      if (place.address_components) {
        formattedAddress = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
            "",
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
            "",
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
            "",
        ].join(" ");
      }
      var location = place.geometry.location;
      var properties = {
        position: location,
        content: `${formattedAddress}`,
      };
      var startSelect = document.getElementById("start-select");
      var endSelect = document.getElementById("end-select");
      console.log(place);
      var latlng = location.lat + "," + location.lng;
      startSelect.options[startSelect.options.length] = new Option(
        formattedAddress,
        latlng
      );
      endSelect.options[endSelect.options.length] = new Option(
        formattedAddress,
        latlng
      );
      addMarker(properties);
      saveBookmark(properties);

      if (!map.getBounds().contains(location)) {
        map.panTo(location);
        map.setZoom(13);
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  locationForm.reset();
}
