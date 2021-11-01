/* JSON de productos */
const miJSON = "js/api.json";

//////////////////// TRAER JSON Y REALIZAR MODIFICACIONES

$(document).ready(function(){    
    $.getJSON(miJSON, (respuesta, estado) => {
        let miNuevoJSON = [];
        if (estado === "success") {                    
            $.each(respuesta, function (index, value) {
                miNuevoJSON.push(value);
            });
        } else {
            console.log("No toma json");
        };

        console.log(miNuevoJSON);
        mostrarLista(miNuevoJSON);

        /* Clase para las propiedades del producto a agregar en caso de ingresar como ADMIN */
        class Producto{
            constructor(marca, tipo, precio, imagen){        
                this.marca = marca;
                this.tipo = tipo;
                this.precio = parseFloat(precio);   
                this.imagen = imagen;  
            };
            sumar_producto(){         
                
                this.id = miNuevoJSON.length +1;
                miNuevoJSON.push({id:this.id, marca: this.marca, tipo: this.tipo, precio: this.precio, imagen:this.imagen});        

            };
        };

        /* Funciones para agregar productos a la lista principal de productos*/
        /* Función para botón ingresar con = "ADMIN". Apare el botón para agregar productos */
        $('#btnIngresar').click( () =>{
            let ingreso = $('#recipient-usuario').val().toUpperCase();
            if(ingreso === "ADMIN"){
                $('#btnCerrarUsuario').click();
                $('#btnCerveza').attr('class', 'btn btn-danger');
                
                alert('Ingreso con usuario Admin');
            }else{
                alert("Ingresaste un dato incorrecto");
            };
        });

        /* Función de botón agregar Cervezas */
        $('#btnAgregar').click( () =>{        
            let marca = $('#recipient-marca').val();
            let tipo = $('#recipient-tipo').val();
            let precio = $('#recipient-precio').val();
            let imagen = "./img/fondo.png"; /* Faltaría forma de agregar imagen */
            if(marca== "" || tipo== "" || precio == ""){
                alert("no hay datos");
            }else{
                const ingreso = new Producto(marca, tipo, precio, imagen);
                console.log(ingreso);
                ingreso.sumar_producto();
                $('#btnCerrarCerveza').click();
                alert("Se agregó el producto al listado");                
                $('.card').remove();                 
                mostrarLista(miNuevoJSON);            
            };         
        });   

        
         
    });    
});

//////////////////// FIN DE GETJSON 

/* Obtengo IDs de HTML */
const lista = document.getElementById("listaBebidas");
const items = document.getElementById("items");
const carritoFooter = document.getElementById("carritoFooter");
const btnIngreso = document.getElementById("btnIngreso");
const templateCard = document.getElementById("template-card").content;
const templateFooter = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;
const filtro = document.getElementById("filtro");
const fragment = document.createDocumentFragment();


/*Se suma los items comprados en este carrito*/
let carrito = {};

/* Función para botones +/- de carrito */
items.addEventListener('click', e => {
    btnAccion(e);
});

/* Funcion para obtener template donde mostrar los productos del listado */
const mostrarLista = data =>{
    let elFiltro = new Array();
    
    data.forEach(producto =>{
        templateCard.querySelector('h4').textContent = producto.marca;
        templateCard.querySelector('h5').textContent = producto.tipo;
        templateCard.querySelector('span').textContent = producto.precio;
        templateCard.querySelector('img').setAttribute('src', producto.imagen);        
        templateCard.querySelector('.btn-dark').dataset.id = producto.id;
        
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
        
        /* Agrego Marcas al array FILTRO */
        if(elFiltro.includes(producto.marca)){
            return      
        }else{
            elFiltro.push(producto.marca);
        };       
        
    });
    /* Plasmo en html las marcas del filtro */
    elFiltro.sort();
    for(const list of elFiltro){
        $('#filtro').append(`<a id="itemMarca" class="dropdown-item">${list}</a>
            `);

        $('#filtro a').click((e)=>{
            console.log(e);
        });
    }
    lista.appendChild(fragment);    
    
    
};    


/////////////////////////// Area de carrito //////////////////////////////////////////

/* Ejecutar botón para comprar productos */
lista.addEventListener('click', e => {
    agregarCarrito(e);
})

/* Obtengo la información del botón Comprar de cada producto */
const agregarCarrito = e =>{   
    if(e.target.classList.contains('btn-dark')){        
        modCarrito(e.target.parentElement);        
    }
    e.stopPropagation();
}

/* Manipulación de la info del carrito */
const modCarrito = objeto => {    
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        marca: objeto.querySelector('h4').textContent,
        tipo: objeto.querySelector('h5').textContent,
        cantidad: 1,
        precio: objeto.querySelector('span').textContent        
    };    
    
    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }
    carrito[producto.id] = {...producto};
    mostrarCarrito();
    
};

/* Función para mostrar los items del carrito */
const mostrarCarrito = () =>{    
    items.innerHTML = '';
    Object.values(carrito).forEach(producto =>{
        templateCarrito.querySelector('th').textContent = producto.marca;
        templateCarrito.querySelector('.tipe').textContent = producto.tipo;
        templateCarrito.querySelectorAll('td')[2].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);

    mostrarFooter();

    /* Creación de LocalStorage del carrito */
    localStorage.setItem('carrito', JSON.stringify(carrito));    
};

/* Función para mostrar el Footer del carrito */
const mostrarFooter = () =>{
    carritoFooter.innerHTML = '';
    if(Object.keys(carrito).length == 0){
        carritoFooter.innerHTML = `<th scope="row" colspan="4">Carrito vacío - comience a comprar!</th>`;
        $('.btnComprar').addClass("d-none");
        return
    }else{
        $('.btnComprar').removeClass("d-none");
    };

    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0);
    
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    console.log(nPrecio);
    

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    carritoFooter.appendChild(fragment);

    /* Función de botón vaciar carrito */
    const btnVaciar = document.getElementById('vaciarCarrito');
    btnVaciar.addEventListener("click", () => {
        carrito = {};
        mostrarCarrito();
    });
};

/* Puebas boton finalizar */


/* Función sumar y restar items del carrito */
function btnAccion(e) {
    /* acción de aumentar items */
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = { ...producto };
        mostrarCarrito();
    };

    /* acción de disminuir items */
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id];
        }
        mostrarCarrito();
    };
    e.stopPropagation();
}

/* Se recupera datos de LocalStorage */
if (localStorage.getItem('carrito')){
    carrito = JSON.parse(localStorage.getItem('carrito'));
    mostrarCarrito();
};
/////////////////////////// Fin Area de carrito //////////////////////////////////////////







