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
// Lentes formulados para gafas de sol: se tallan directo en la montura (policarbonato, sirve también para monturas al aire).
// Precio por par según el rango de la fórmula (esfera y cilindro en forma negativa). Se cobra el rango del ojo
// que quede más alto. Fuera de todos los rangos o con progresivos: asesoría por WhatsApp. Precios aprobados por Solare (5 nov 2026).
var LENTES_SOL = [
  { id: 'tinte', nombre: 'Policarbonato tintado negro', corto: 'tintado negro',
    desc: 'Lente de sol oscuro con tu fórmula, en policarbonato liviano y resistente. Incluye el tinte.',
    rangos: [
      { esf: [-6, 4], cil: [-2, 0],     precio: 99900 },
      { esf: [-2, 2], cil: [-4, -2.25], precio: 129900 }
    ] },
  { id: 'transitions', nombre: 'Transitions', corto: 'Transitions',
    desc: 'Claro bajo techo y oscuro al sol (gris): te sirven para todo el día.',
    rangos: [
      { esf: [-2, 2], cil: [-2, 0], precio: 399900 },
      { esf: [-6, 4], cil: [-2, 0], precio: 539900 }
    ] },
  { id: 'blue', nombre: 'Blue protect', corto: 'blue protect',
    desc: 'Lente claro con filtro de luz azul para pantallas. Usas la montura como gafas formuladas.',
    rangos: [
      { esf: [-6, 3], cil: [-2, 0],     precio: 119900 },
      { esf: [-4, 2], cil: [-4, -2.25], precio: 219900 }
    ] }
];
var FORMULA_WEBHOOK = '';               // URL de n8n que recibe la foto de la fórmula (vacío = el cliente la adjunta en WhatsApp)
// fotos: foto real del kit por marca de la gafa. Las marcas sin foto muestran el ícono.
var REGALO = { nombre: 'Kit de protección', incluye: 'Estuche rígido, funda y paño de microfibra',
  fotos: { Wanderth: '/img/kit-wanderth.webp' } };
// Garantía definida por Solare (5 nov 2026). Debe coincidir con la sección 8 de terminos.html.
var GARANTIA = {
  meses: 6,
  cubre: ['Capas despegadas (no quebradas)', 'Partes sueltas', 'Oxidación', 'Lentes sueltos'],
  compromiso: 'Si es un defecto de fabricación dentro del tiempo de garantía, reparamos o cambiamos tus gafas.',
  requisito: 'Debes presentar tu certificado de garantía, recibo de compra o confirmación de pago.'
};

// Líneas de la tienda. estado: 'disponible' o 'pronto' (sale como "Próximamente" y no tiene página aún).
var CATEGORIAS = [
  { id: 'deportivas', nombre: 'Deportivas', url: '/deportivas/', estado: 'disponible', formula: 'clip', comparar: true,
    titulo: 'Deportivas en fibra de carbono',
    intro: 'Pocas, livianas y probadas. Elige el modelo y mira cada detalle antes de comprar.',
    datos: ['25 g', 'UV400 categoría 3', 'Tecnología antiempañante', 'Acepta fórmula', 'Garantía de 6 meses'] },
  { id: 'lifestyle', nombre: 'Lifestyle', url: '/lifestyle/', estado: 'disponible', formula: 'sol',
    titulo: 'Gafas de sol polarizadas',
    intro: 'Modelos Ferrati elegidos para el día a día, para dama y caballero. Todos aceptan lentes formulados.',
    datos: ['Polarizadas', 'UV400', 'Dama y caballero', 'Aceptan fórmula', 'Garantía de 6 meses'],
    generos: [['dama', 'Dama'], ['caballero', 'Caballero']] }
];

// Fotos: /img/<id>-<color>-<vista>.webp. El id no cambia aunque cambie el nombre comercial.
// Las vistas en DE_CERCA se recortan para llenar el cuadro.
var DE_CERCA = { varilla: 1, emblema: 1, puente: 1 };
var GAFAS = [
  {
    id: 'vertice', slug: 'maximus', categoria: 'deportivas', url: '/deportivas/maximus/', plantilla: 'deportiva',
    chips: ['25 g', 'UV400 cat. 3', 'Antiempañante', 'Fibra de carbono'],
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
    id: 'brisa', slug: 'speed-advance', categoria: 'deportivas', url: '/deportivas/speed-advance/', plantilla: 'deportiva',
    chips: ['25 g', 'UV400 cat. 3', 'Antiempañante'],
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

// ---------- Lifestyle: gafas de sol Ferrati (referencias del catálogo Ferrati, 5 nov 2026) ----------
// medida: [ancho del lente, puente, varilla] en mm, tal como viene impresa en la varilla.
function solar(o) {
  o.categoria = 'lifestyle'; o.plantilla = 'sol'; o.marca = 'Ferrati'; o.precio = 179900; o.ar = '5/3';
  o.url = '/lifestyle/' + o.id + '/'; o.slug = o.id;
  o.vistas = [['frente', 'Frente'], ['tres', 'Tres cuartos']];
  o.chips = ['Polarizadas', 'UV400', o.material, o.forma];
  o.specs = [['Marca', 'Ferrati'], ['Para', o.genero === 'dama' ? 'Dama' : 'Caballero'], ['Forma', o.forma], ['Material', o.material],
    ['Medidas', o.medida.join(' - ') + ' mm (lente - puente - varilla)'], ['Lente', 'Polarizado'], ['Protección', 'UV400'],
    ['Fórmula', 'Acepta lentes formulados'], ['Garantía', '6 meses por defectos de fabricación'],
    ['Colores', o.colores.map(function (c) { return c.nombre; }).join(', ')]];
  return o;
}
GAFAS.push(
  solar({ id: 'ascona', codigo: '7300', genero: 'dama', nombre: 'Ascona', tipo: 'Cat-eye al aire', material: 'Metálica', forma: 'Cat-eye',
    medida: [65, 15, 146], lema: 'Cat-eye sin aro: liviana y con carácter.',
    colores: [
      { id: 'c1', nombre: 'Negro',            montura: '#1B1B1D', lente: '#3A3B3E' },
      { id: 'c2', nombre: 'Oro rosa',         montura: '#C99A7E', lente: '#2E3236' },
      { id: 'c3', nombre: 'Café degradado',   montura: '#5A4535', lente: '#9A8A78' },
      { id: 'c4', nombre: 'Morado degradado', montura: '#8A7A86', lente: '#6F5F75' }
    ] }),
  solar({ id: 'lugano', codigo: '10003', genero: 'dama', nombre: 'Lugano', tipo: 'Ovalada metálica', material: 'Metálica', forma: 'Ovalada',
    medida: [55, 22, 147], lema: 'Ovaladas y finas, fáciles de llevar con todo.',
    colores: [
      { id: 'c1', nombre: 'Negro',    montura: '#1C1C1C', lente: '#2F2F31' },
      { id: 'c3', nombre: 'Grafito',  montura: '#7A7A78', lente: '#6E6458' },
      { id: 'c4', nombre: 'Oro rosa', montura: '#D9B8A3', lente: '#8B7D70' },
      { id: 'c5', nombre: 'Gris',     montura: '#2D2D33', lente: '#56556A' }
    ] }),
  solar({ id: 'montreux', codigo: '9810P', genero: 'caballero', nombre: 'Montreux', tipo: 'Cuadrada de acetato', material: 'Acetato', forma: 'Cuadrada',
    medida: [56, 16, 144], lema: 'Cuadrada de acetato grueso, hecha para destacar.',
    colores: [
      { id: 'c1', nombre: 'Negro',        montura: '#111111', lente: '#2C2D30' },
      { id: 'c2', nombre: 'Negro y café', montura: '#141414', lente: '#5B4A32' },
      { id: 'c4', nombre: 'Gris cristal', montura: '#9AA3AB', lente: '#2F3A40' },
      { id: 'c8', nombre: 'Café',         montura: '#6B3A1F', lente: '#2E2E2E' }
    ] }),
  solar({ id: 'lucerne', codigo: '7246', genero: 'caballero', nombre: 'Lucerne', tipo: 'Rectangular metálica', material: 'Metálica', forma: 'Rectangular',
    medida: [58, 17, 147], lema: 'Rectangular y metálica: sobria, liviana y para todos los días.',
    colores: [
      { id: 'c1', nombre: 'Negro',           montura: '#1B1B1B', lente: '#2E2E30' },
      { id: 'c2', nombre: 'Grafito',         montura: '#6A6A6A', lente: '#2C3236' },
      { id: 'c3', nombre: 'Dorado con azul', montura: '#C9A86A', lente: '#2C3B66' },
      { id: 'c4', nombre: 'Plata con café',  montura: '#B9B1AA', lente: '#5A4D45' }
    ] })
);

// Los "dulces de la fila": precios bajos que completan el envío gratis.
// conGafas: precio cuando hay gafas en el carrito (una unidad por cada par). destacado: va primero en el carrito.
// antojo:false = no se ofrece en el carrito.
var ACCESORIOS = [
  { id: 'cuelga', nombre: 'Cuelga gafas',      precio: 29900, conGafas: 14950, icono: 'cuelga', destacado: true },
  { id: 'clip',   nombre: 'Clip para fórmula', precio: FORMULA.clip.precio, icono: 'clip', antojo: false },
  { id: 'kit',    nombre: 'Kit de limpieza',   precio: 24900, icono: 'kit' }
];
