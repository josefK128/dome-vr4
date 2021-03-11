var camera, cubeCamera, scene, renderer;
var cube, sphere, torus;
var controls;

init();
animate();


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set (0,80,80);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x880000);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    document.body.appendChild(renderer.domElement);

    light = new THREE.PointLight(0xffffff);
    light.position.set(100, 300, 200);
    scene.add(light);

    /////////////////////////////////////////////////////////////////////////
    /// pure skybox
       THREE.ImageUtils.crossOrigin = '';
    var pztex = THREE.ImageUtils.loadTexture(
        "http://i.imgur.com/yEOMzQg.jpg");
    var pytex = THREE.ImageUtils.loadTexture(
        "http://i.imgur.com/nVMAfLw.jpg");
    var pxtex = THREE.ImageUtils.loadTexture(
        "http://i.imgur.com/EnD4hQd.jpg");
    var nztex = THREE.ImageUtils.loadTexture(
        "http://i.imgur.com/GhEpGuR.jpg");
    var nytex = THREE.ImageUtils.loadTexture(
        "http://i.imgur.com/k6UxiiZ.jpg");
    var nxtex = THREE.ImageUtils.loadTexture(
        "http://i.imgur.com/tUboeCr.jpg");

    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial({
        map: pxtex,
        side: THREE.BackSide
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        map: nxtex,
        side: THREE.BackSide
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        map: pytex,
        side: THREE.BackSide
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        map: nytex,
        side: THREE.BackSide
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        map: pztex,
        side: THREE.BackSide
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        map: nztex,
        side: THREE.BackSide
    }));

    var skyboxGeometry = new THREE.BoxGeometry(500, 500, 500);
    var skyboxMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);

    /*
    var torus = new THREE.Mesh(
        new THREE.TorusKnotGeometry(60, 20, 100),
        reflectionMaterial);
    scene.add(torus);
    torus.visible = true;
*/
    cubeCamera = new THREE.CubeCamera(1, 1000, 256);
    cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add(cubeCamera);

    var material = new THREE.MeshBasicMaterial({
        envMap: cubeCamera.renderTarget
    });

    sphere = new THREE.Mesh(new THREE.SphereGeometry(20, 30, 15), material);
    scene.add(sphere);

    cube = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), material);
    scene.add(cube);

    torus = new THREE.Mesh(new THREE.TorusKnotGeometry(20, 5, 100, 25), material);
    scene.add(torus);
    
    /*
    /////////////////////////////////////////////////////////
    var shader = THREE.ShaderLib["cube"];
    shader.uniforms["tCube"].texture = cubemap;
    var material = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    
    var skybox = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), material);
    //scene.add(skybox);
    */
}

function animate() {
    controls.update();
    requestAnimationFrame(animate);
    render();
}

function render() {

    var time = Date.now();

    sphere.position.x = Math.sin(time * 0.001) * 30;
    sphere.position.y = Math.sin(time * 0.0011) * 30;
    sphere.position.z = Math.sin(time * 0.0012) * 30;

    sphere.rotation.x += 0.02;
    sphere.rotation.y += 0.03;

    cube.position.x = Math.sin(time * 0.001 + 2) * 30;
    cube.position.y = Math.sin(time * 0.0011 + 2) * 30;
    cube.position.z = Math.sin(time * 0.0012 + 2) * 30;

    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;

    torus.position.x = Math.sin(time * 0.001 + 4) * 30;
    torus.position.y = Math.sin(time * 0.0011 + 4) * 30;
    torus.position.z = Math.sin(time * 0.0012 + 4) * 30;

    torus.rotation.x += 0.02;
    torus.rotation.y += 0.03;

    sphere.visible = false; // *cough*

    cubeCamera.updateCubeMap(renderer, scene);

    sphere.visible = true; // *cough*

    renderer.render(scene, camera);

}
