/* ==========================================================================
   Solare — datos de la tienda. TODO lo editable vive aquí.
   Para agregar una gafa: 1) sube sus fotos a /img con el nombre <id>-<color>-<vista>.webp
   2) agrégala a GAFAS con su categoría  3) copia la carpeta de una página de producto
   (por ejemplo /deportivas/maximus/) y cambia el id en data-producto y los textos del <head>.
   Al cambiar este archivo o solare.js, sube el número ?v= en las páginas para que los
   celulares no se queden con la versión vieja guardada.
   ========================================================================== */

var WHATSAPP = '573103941470';          // WhatsApp de ventas de Solare (57 + celular, sin espacios)
var CORREO = 'solare.infoventas@gmail.com';
var ENVIO_GRATIS_DESDE = 200000;        // COP. Se compara contra el total ya con descuentos
var BIENVENIDA = { codigo: 'SOLARE10', porcentaje: 10 };
var LEADS_WEBHOOK = '';                 // URL de n8n o Google Apps Script que recibe los datos del popup (vacío = no se envían)
var POPUP_ESPERA_MS = 3500;

// Fórmula: dos caminos. Rango confirmado por Solare con el laboratorio (5 nov 2026). Los $99.900 incluyen el clip.
var FORMULA = {
  clip: { nombre: 'Clip para fórmula', corto: 'Clip para fórmula', precio: 10900,
          desc: 'El sobrepuesto óptico que va por dentro. Lo llevas a tu óptica y allá le montan tus lentes.' },
  lab:  { nombre: 'Lentes formulados con tallado digital', corto: 'Lentes formulados', precio: 99900,
          desc: 'Tallamos tus lentes de forma digital y te llegan montados en el clip, listas para usar.' },
  rango: { esfMin: -6, esfMax: 4, cilMin: -2, sumaMin: -7, dpMin: 54, dpMax: 72 }
};
var FORMULA_WEBHOOK = '';               // URL de n8n que recibe la foto de la fórmula (vacío = el cliente la adjunta en WhatsApp)
var REGALO = { nombre: 'Kit de protección', incluye: 'Estuche rígido, funda y paño de microfibra' };
// Garantía definida por Solare (5 nov 2026). Debe coincidir con la sección 8 de terminos.html.
var GARANTIA = {
  meses: 6,
  cubre: ['Capas despegadas (no quebradas)', 'Partes sueltas', 'Oxidación', 'Lentes sueltos'],
  compromiso: 'Si es un defecto de fabricación dentro del tiempo de garantía, reparamos o cambiamos tus gafas.',
  requisito: 'Debes presentar tu certificado de garantía, recibo de compra o confirmación de pago.'
};

// Líneas de la tienda. estado: 'disponible' o 'pronto' (sale como "Próximamente" y no tiene página aún).
var CATEGORIAS = [
  { id: 'deportivas', nombre: 'Deportivas', url: '/deportivas/', estado: 'disponible',
    titulo: 'Deportivas en fibra de carbono',
    intro: 'Pocas, livianas y probadas. Elige el modelo y mira cada detalle antes de comprar.',
    datos: ['25 g', 'UV400 categoría 3', 'Tecnología antiempañante', 'Acepta fórmula', 'Garantía de 6 meses'] },
  { id: 'lifestyle', nombre: 'Lifestyle', url: '', estado: 'pronto',
    titulo: 'Lifestyle',
    intro: 'Gafas de sol para el día a día. Estamos eligiendo los modelos y saldrán con fórmula disponible.' }
];

// Fotos: /img/<id>-<color>-<vista>.webp. El id no cambia aunque cambie el nombre comercial.
// Las vistas en DE_CERCA se recortan para llenar el cuadro.
var DE_CERCA = { varilla: 1, emblema: 1, puente: 1 };
var GAFAS = [
  {
    id: 'vertice', slug: 'maximus', categoria: 'deportivas', url: '/deportivas/maximus/',
    marca: 'Wanderth', nombre: 'Maximus', precio: 189900, peso: 25,
    tipo: 'Media montura ventilada', lema: 'Fibra de carbono que se ve y se siente.', ar: '2/1',
    carbono: true,
    pesoTexto: 'Es lo que logra la fibra de carbono: una montura rígida que casi no pesa, más o menos lo mismo que una pila AA. Te las pones al amanecer y horas después sigues sin sentirlas.',
    vistas: [['frente', 'Frente'], ['tres', 'Tres cuartos'], ['reflejo', 'Reflejo'], ['interior', 'Interior'], ['varilla', 'Varilla de carbono'], ['emblema', 'Ventilación'], ['puente', 'Puente']],
    colores: [
      { id: 'azul',   nombre: 'Azul',            montura: '#16181C', lente: '#1C8BFF' },
      { id: 'dorado', nombre: 'Blanco y dorado', montura: '#F1F1EE', lente: '#D4AE45' },
      { id: 'humo',   nombre: 'Humo',            montura: '#6A6B6F', lente: '#CDD1D6' }
    ],
    detalles: [
      { vista: 'reflejo',  col: 4, titulo: 'Lente espejado de una pieza', texto: 'Un solo lente envolvente: visión abierta de lado a lado y menos brillo del sol.' },
      { vista: 'emblema',  col: 2, titulo: 'Ventilación y tecnología antiempañante', texto: 'Las ranuras dejan circular el aire y la tecnología antiempañante mantiene el lente claro.' },
      { vista: 'puente',   col: 2, titulo: 'Puente anatómico', texto: 'Se apoya firme en la nariz, sin puntos de presión.' },
      { vista: 'interior', col: 4, titulo: 'Por dentro', texto: 'Almohadillas de goma y varillas largas que sujetan sin apretar.' }
    ],
    specs: [['Marca', 'Wanderth'], ['Peso', '25 g'], ['Montura', 'Media montura con ranuras de ventilación'], ['Varillas', 'Fibra de carbono'], ['Lente', 'Espejado, de una sola pieza'], ['Protección', 'Filtro UV400 categoría 3'], ['Tecnología', 'Antiempañante'], ['Fórmula', 'Acepta clip óptico'], ['Garantía', '6 meses por defectos de fabricación'], ['Colores', 'Azul, blanco y dorado, humo']],
    comparar: { diseno: 'Media montura ventilada', ventilacion: 'Ranuras en montura y lente' }
  },
  {
    id: 'brisa', slug: 'speed-advance', categoria: 'deportivas', url: '/deportivas/speed-advance/',
    marca: 'Wanderth', nombre: 'Speed Advance', precio: 189900, peso: 25,
    tipo: 'Sin montura', lema: 'Sin montura. Nada que estorbe la vista.', ar: '5/3',
    carbono: false,
    pesoTexto: 'Sin aro alrededor del lente y con varillas delgadas, la montura casi desaparece. Te las pones al amanecer y horas después sigues sin sentirlas.',
    vistas: [['frente', 'Frente'], ['cerca', 'De cerca'], ['tres', 'Tres cuartos'], ['interior', 'Interior']],
    colores: [
      { id: 'azul',    nombre: 'Azul',    montura: '#F4F4F4', lente: '#1F6BFF' },
      { id: 'plata',   nombre: 'Plata',   montura: '#1A1A1A', lente: '#BFC3C9' },
      { id: 'rojo',    nombre: 'Rojo',    montura: '#77787C', lente: '#E8361D' },
      { id: 'lavanda', nombre: 'Lavanda', montura: '#C9B8F0', lente: '#E6B8F2' }
    ],
    detalles: [
      { vista: 'cerca',    col: 3, titulo: 'Lente al aire', texto: 'Sin aro alrededor: nada se interpone entre tus ojos y el camino.' },
      { vista: 'interior', col: 3, titulo: 'Por dentro', texto: 'Almohadillas de goma y ranuras laterales en el lente para que circule el aire.' }
    ],
    specs: [['Marca', 'Wanderth'], ['Peso', '25 g'], ['Montura', 'Sin aro: el lente va al aire'], ['Lente', 'Espejado, de una sola pieza'], ['Protección', 'Filtro UV400 categoría 3'], ['Tecnología', 'Antiempañante'], ['Ventilación', 'Ranuras laterales en el lente'], ['Fórmula', 'Acepta clip óptico'], ['Garantía', '6 meses por defectos de fabricación'], ['Colores', 'Azul, plata, rojo, lavanda']],
    comparar: { diseno: 'Sin montura', ventilacion: 'Ranuras laterales en el lente' }
  }
];

// Los "dulces de la fila": precios bajos que completan el envío gratis.
// conGafas: precio cuando hay gafas en el carrito (una unidad por cada par). destacado: va primero en el carrito.
// antojo:false = no se ofrece en el carrito.
var ACCESORIOS = [
  { id: 'cuelga', nombre: 'Cuelga gafas',      precio: 29900, conGafas: 14950, icono: 'cuelga', destacado: true },
  { id: 'clip',   nombre: 'Clip para fórmula', precio: FORMULA.clip.precio, icono: 'clip', antojo: false },
  { id: 'kit',    nombre: 'Kit de limpieza',   precio: 24900, icono: 'kit' }
];
