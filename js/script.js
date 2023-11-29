window.onload = () => {
    renderPlaces();
};
  
  function renderPlaces() {
    let scene = document.querySelector('a-scene');
    let lat = JSON.parse(sessionStorage.getItem('lat'));
    let lon = JSON.parse(sessionStorage.getItem('lon'));
    // console.log(lat);
    // console.log(lon);
  
    for (let i = lat.length-1; i > -1; i--) {
        let latitude = lat[i];
        let longitude = lon[i];
        console.log(latitude);
        console.log(longitude);
        let model = document.createElement('a-entity');
        model.setAttribute('gps-new-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        // model.setAttribute('material', { color: 'blue' } );
        model.setAttribute('look-at', '[gps-new-camera]');
        let id = 'target'+i;
        let target = '#target'+(i+1);
        model.setAttribute('id', id);
        if (i != lat.length-1) {
            model.setAttribute('look-at', target);
            console.log(id);
            console.log(target);
            model.setAttribute('gltf-model', '#arrow');
        } 
        else{
            model.setAttribute('gltf-model', '#location');
        }
        model.setAttribute('animation-mixer', 'loop: repeat');
        model.setAttribute('scale', '0.6633601288757837 0.6633601288757837 0.6633601288757837');

        model.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });
        scene.appendChild(model);
    }
  }
  
