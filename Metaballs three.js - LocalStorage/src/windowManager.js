class GestorVentanas {
    constructor() {
        this.id = Date.now().toString();  // Generamos un identificador único para la pestaña actual usando la fecha en milisegundos.
        this.ventanas = {}; // Un objeto local donde guardaremos una copia de lo que hay en el localStorage para consultarlo rápido.

        // Al cerrar la ventana avisamos a las demás
        window.addEventListener('unload', () => this.eliminarVentana()); // beforeunload: Este evento se dispara justo antes de que cierres la pestaña o recargues. Es vital para borrar los datos de esta ventana del localStorage; de lo contrario, las otras ventanas pensarían que esta sigue abierta ("ventanas fantasma").

        // Escuchamos cuando otra ventana cambia el localStorage
        window.addEventListener('storage', (e) => {  // storage: Este es el secreto de la magia. Este evento solo se dispara en una ventana cuando otra ventana cambia algo en el localStorage
            if (e.key === 'estado_ventanas') this.ventanas = JSON.parse(e.newValue);
        });

        this.actualizar();

    }

    actualizar() {
        const estadoActual = JSON.parse(localStorage.getItem('estado_ventanas') || '{}');
        const ahora = Date.now();

        //Nueva lógica de limpieza de ventanas fantasma 
        for (const id in estadoActual) {
            // Si una ventana no se ha actualizado en más de 5 segundos, la borramos
            if (ahora - estadoActual[id].ultimaActualización > 5000) {
                delete estadoActual[id];
            }
        }

        // Guardamos los datos de esta ventana especifica
        estadoActual[this.id] = {
            id: this.id,
            x: window.screenX,
            y: window.screenY,
            ancho: window.innerWidth,
            alto: window.innerHeight,
            centro: {
                x: window.screenX + window.innerWidth / 2,
                y: window.screenY + window.innerHeight / 2
            },
            ultimaActualización: ahora
        };


        estadoActual[this.id].ultimaActualización = Date.now();


        this.ventanas = estadoActual;
        localStorage.setItem('estado_ventanas', JSON.stringify(estadoActual));

        // Llamamos al siguiente frame
        requestAnimationFrame(() => this.actualizar());
    }

    eliminarVentana() {
        const estadoActual = JSON.parse(localStorage.getItem('estado_ventanas') || '{}');
        delete estadoActual[this.id];
        localStorage.setItem('estado_ventanas', JSON.stringify(estadoActual));
    }


    obtenerOtrasVentanas() {
        const ahora = Date.now();
        // Filtramos para devolver solo las ventanas que NO son esta.
        return Object.entries(this.ventanas)
        .filter(([id, datos]) => {
            // Solo queremos ventanas que no sean esta Y que esten "vivas" (actualizadas en menos de 2 seg)
            const estaViva = (ahora - datos.ultimaActualización) < 2000;
            return id !== this.id && estaViva;  
        })
        .map(([, datos]) => datos);

    }


}

export default GestorVentanas;