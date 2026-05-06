import './style.css';
import * as THREE from 'three';
import GestorVentanas from './windowManager';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';

const gestor = new GestorVentanas();
const lienzo = document.querySelector('#canvas');

const escena = new THREE.Scene();
// CAMBIO 1: Fondo gris para saber si el canvas está vivo
escena.background = new THREE.Color(0x111111); 

const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camara.position.z = 500; 

const renderizador = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);

const materialLiquido = new THREE.MeshPhongMaterial({ 
    color: 0x00ff00, 
    emissive: 0x112211, // Que brille un poco por sí solo
    specular: 0xffffff, 
    shininess: 100 
});

// Aumentamos resolución a 100 para que se vea mejor
const efecto = new MarchingCubes(100, materialLiquido, true, true); // Resolución
efecto.scale.set(1000, 1000, 1000); // Tamaño de la caja
escena.add(efecto);

// Creación de luz ambiental.
const luzDireccional = new THREE.DirectionalLight(0xffffff, 5);
luzDireccional.position.set(-200, 900, 900); // Dirección de la luz x,y,z
escena.add(luzDireccional);
escena.add(new THREE.AmbientLight(0xffffff, 0.6)); // Color + potencia de la luz



let bolaPos = {x: 0.5, y: 0.5}; // Posición actual de la bola (inicia al centro)
let bolaVel = {x: 0, y: 0};  // Velocidad para el rebote





function actualizarLiquido() {
    // CAMBIO 2: Si los datos no están listos, no hagas nada (evita el error fatal)
    if (!gestor.ventanas || !gestor.id || !gestor.ventanas[gestor.id]) return;

    efecto.reset();

    

    
    const misDatos = gestor.ventanas[gestor.id];
    const otras = gestor.obtenerOtrasVentanas();
    const todas = [misDatos, ...otras];

    todas.forEach((v) => {
        if (!v || !v.centro) return;

        
        if (v.id === gestor.id) {
            // calculamos hacia donde deberia ir el centro (0.5)
            const destinoX = 0.5;
            const destinoY = 0.5;

            // Efecto muelle: la esfera persigue el destino
            bolaVel.x += (destinoX - bolaPos.x) * 0.9;
            bolaVel.y += (destinoY - bolaPos.y) * 0.9;

            // Razonamiento: para que no oscile para siempre
            bolaVel.x *= 0.2;
            bolaVel.y *= 0.2;

            // Actualizar posición
            bolaPos.x += bolaVel.x;
            bolaPos.y += bolaVel.y;


            // Rebote: Si toca los limites (0.1) o (0.9) invierte velocidad
            if (bolaPos.x > 0.55 || bolaPos.x < 0.10) bolaVel.x *= 0.4;
            if (bolaPos.y > 0.55 || bolaPos.y < 0.10) bolaVel.y *= 0.4;

            efecto.addBall(bolaPos.x, bolaPos.y, 0.5, 0.8, 16);


        }

        else {
            // lógica para otras ventanas se mantienen relativas
            const dx = v.centro.x - misDatos.centro.x;
            const dy = v.centro.y - misDatos.centro.y;
            const px = (dx / 1000) + 0.5;
            const py = (dy / 1000) + 0.5;

            efecto.addBall(
                Math.max(0.05, Math.min(0.95, px)),
                Math.max(0.05, Math.min(0.95, py)), 
                0.5, 0.3, 12
            );
        }


    });
    
    efecto.update();
}


let ultimaPosVentana = { x: window.screenX, y: window.screenY};


function animar() {
    requestAnimationFrame(animar);
    
    // Calculamos cuánto s emovio la ventana desde el frame anterior
    const movY = window.screenY - ultimaPosVentana.y;
    const movX = window.screenX - ultimaPosVentana.x;

    // Le pasamos esa "fuerza" a la velocidad de la bola
    // Si mueves la ventana a la derecha, la bola se siente pesada y va a la izquierda
    bolaVel.x -= movX * 0.008;
    bolaVel.y += movY * 0.008;


    ultimaPosVentana.x = window.screenX;
    ultimaPosVentana.y = window.screenY;


    actualizarLiquido();
    renderizador.render(escena, camara);
}





window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
});

animar();