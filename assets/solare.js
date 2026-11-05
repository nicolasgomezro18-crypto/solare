/* ==========================================================================
   Solare — arma las páginas (inicio, línea y producto) a partir de datos.js
   y maneja lo que comparten: carrito, popup de bienvenida y lentes formulados.
   Cada página trae <body data-pagina="inicio|categoria|producto" data-categoria="…" data-producto="…">.
   ========================================================================== */

/* ---------- Utilidades ---------- */
var NF = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
function cop(n) { return '$' + NF.format(Math.round(n)); }
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function leer(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
var MOVIMIENTO = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

function gafa(id) { for (var i = 0; i < GAFAS.length; i++) if (GAFAS[i].id === id) return GAFAS[i]; return null; }
function categoria(id) { for (var i = 0; i < CATEGORIAS.length; i++) if (CATEGORIAS[i].id === id) return CATEGORIAS[i]; return null; }
function gafasDe(catId) { return GAFAS.filter(function (g) { return g.categoria === catId; }); }
function colorDe(g, cid) { for (var i = 0; i < g.colores.length; i++) if (g.colores[i].id === cid) return g.colores[i]; return null; }
function foto(g, cid, vista) { return '/img/' + g.id + '-' + cid + '-' + vista + '.webp'; }
function nombreVista(g, v) { for (var i = 0; i < g.vistas.length; i++) if (g.vistas[i][0] === v) return g.vistas[i][1]; return v; }
function waLink(texto) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto); }

var sel = {};
GAFAS.forEach(function (g) { sel[g.id] = { color: g.colores[0].id, vista: g.vistas[0][0] }; });

// Cambia la foto con un fundido corto, sin parpadeo (espera a que la nueva esté decodificada)
function ponerFoto(img, src) {
  if (img.getAttribute('src') === src) return;
  var n = new Image(); n.src = src;
  var listo = n.decode ? n.decode() : Promise.resolve();
  listo.catch(function () {}).then(function () {
    img.src = src;
    if (MOVIMIENTO && img.animate) img.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
  });
}

/* ---------- Íconos ---------- */
var ICONOS = {
  cuelga: '<path d="M8 17c4 21 28 21 32 0"/><rect class="acf" x="3.5" y="9" width="9" height="10" rx="3"/><rect class="acf" x="35.5" y="9" width="9" height="10" rx="3"/><path d="M21 33.5h6"/>',
  clip: '<path d="M5 18h15v6a8 8 0 0 1-8 8 7 7 0 0 1-7-7z"/><path class="acf" d="M43 18H28v6a8 8 0 0 0 8 8 7 7 0 0 0 7-7z"/><path d="M20 20h8M24 20v-6"/>',
  kit: '<rect x="6" y="17" width="36" height="23" rx="4"/><path d="M18 17v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><rect class="acf" x="19.5" y="22.5" width="9" height="12" rx="1.5"/><path d="M6 27h13.5M28.5 27H42"/>',
  regalo: '<rect x="8" y="20" width="32" height="21" rx="2.5"/><rect class="acf" x="5" y="13" width="38" height="8" rx="2"/><path d="M24 13v28"/><path d="M24 13c-3-6-11-7-11-2 0 3 6 3 11 2zM24 13c3-6 11-7 11-2 0 3-6 3-11 2z"/>',
  lab: '<circle cx="21" cy="27" r="13"/><path d="M14 23a8 8 0 0 1 6-5"/><path class="acf" d="M38 5l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>',
  archivo: '<path d="M12 5h17l9 9v29H12z"/><path d="M29 5v9h9"/><path d="M25 36V22M19 28l6-6 6 6"/>',
  manual: '<path d="M9 39l3-10L33 8l7 7-21 21z"/><path d="M29 12l7 7"/><path class="acf" d="M9 39l3-10 7 7z"/>',
  despues: '<path d="M8 38l2.5-7.5A15 15 0 1 1 17 37z"/><path d="M17 22h14M17 28h9"/>'
};
function iconoAcc(k) { return '<svg viewBox="0 0 48 48" aria-hidden="true">' + ICONOS[k] + '</svg>'; }
var ICO_CAMION = '<path d="M2.5 6h11.5v10H2.5z"/><path d="M14 9h4.2l3.3 3.4V16H14z"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="17.5" cy="17.5" r="1.9"/>';
var ICO_CHECK = '<circle cx="12" cy="12" r="9"/><path d="M7.5 12.3l3 3 6-6.3"/>';
var ICO_ESCUDO = '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>';
var SVG_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var SVG_BOLSA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
function svgFlecha(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>'; }

/* ---------- Carrito: estado ---------- */
function prod(it) {
  if (it.tipo === 'gafa') return gafa(it.id);
  for (var i = 0; i < ACCESORIOS.length; i++) if (ACCESORIOS[i].id === it.id) return ACCESORIOS[i];
  return null;
}
var carrito = leer('solare_carrito_v2', []).filter(function (it) {
  var p = prod(it);
  return p && it.n > 0 && (it.tipo !== 'gafa' || (colorDe(p, it.color) && (!it.rx || FORMULA[it.rx.tipo])));
});
var codigo = leer('solare_codigo_v1', '');
var eraGratis = null;

function nGafas() { var n = 0; carrito.forEach(function (it) { if (it.tipo === 'gafa') n += it.n; }); return n; }
function precioGafa(it) { return gafa(it.id).precio + (it.rx ? FORMULA[it.rx.tipo].precio : 0); }
function unidadesAcc(id) { var n = 0; carrito.forEach(function (it) { if (it.tipo === 'acc' && it.id === id) n += it.n; }); return n; }
// Los accesorios con precio "conGafas" van a ese precio hasta una unidad por cada par
function totalLinea(it, ng) {
  if (it.tipo === 'gafa') return precioGafa(it) * it.n;
  var p = prod(it);
  if (!p.conGafas) return p.precio * it.n;
  var rebajadas = Math.min(it.n, ng);
  return rebajadas * p.conGafas + (it.n - rebajadas) * p.precio;
}
function precioSiguiente(a, ng) { return a.conGafas && unidadesAcc(a.id) < ng ? a.conGafas : a.precio; }
function totales() {
  var sub = 0, unidades = 0, ng = nGafas();
  carrito.forEach(function (it) { sub += totalLinea(it, ng); unidades += it.n; });
  var pct = codigo ? BIENVENIDA.porcentaje : 0;
  var desc = Math.round(sub * pct / 100);
  var neto = sub - desc;
  var falta = Math.max(0, ENVIO_GRATIS_DESDE - neto);
  return { sub: sub, pct: pct, desc: desc, neto: neto, falta: falta, gratis: sub > 0 && falta === 0, unidades: unidades, ng: ng };
}
function guardarCarrito() { guardar('solare_carrito_v2', carrito); }
// rx: null, { tipo: 'clip' } o { tipo: 'lab', modo, receta?, archivo? }. Cada fórmula tallada va en su propia línea.
function agregar(tipo, id, color, abrir, rx) {
  var k = tipo + ':' + id + (color ? ':' + color : '') + (rx ? ':' + (rx.tipo === 'lab' ? 'lab-' + Date.now() : 'clip') : '');
  var it = null;
  carrito.forEach(function (x) { if (x.k === k) it = x; });
  if (it) it.n = Math.min(10, it.n + 1);
  else carrito.push({ k: k, tipo: tipo, id: id, color: color || '', n: 1, rx: rx || null });
  guardarCarrito();
  pintarCarrito();
  var b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  if (abrir) abrirCarrito();
}

/* ---------- Marco común ---------- */
function marcoArriba(pagina, cat, g) {
  var enDeportivas = (cat && cat.id === 'deportivas') || (g && g.categoria === 'deportivas');
  var lineas = CATEGORIAS.map(function (c) {
    return c.estado === 'disponible'
      ? '<a href="' + c.url + '"' + ((cat && cat.id === c.id) || (g && g.categoria === c.id) ? ' aria-current="page"' : '') + '>' + c.nombre + '</a>'
      : '<span class="off">' + c.nombre + '<span class="pronto">Pronto</span></span>';
  }).join('');
  var sub = '';
  if (g) {
    sub = '<div class="subnav" id="subnav" aria-hidden="true" inert><div class="wrap"><b>' + g.nombre + '</b>' +
      '<nav aria-label="Secciones del producto"><a href="#proteccion">Protección</a>' + (g.detalles && g.detalles.length ? '<a href="#detalles">Detalles</a>' : '') +
      '<a href="#comprar">Colores</a><a href="#specs">Especificaciones</a></nav>' +
      '<span class="sn-precio">' + cop(g.precio) + '</span><a class="btn btn-sun btn-mini" href="#comprar">Comprar</a></div></div>';
  }
  return '<div class="anuncio" role="region" aria-label="Novedades"><div class="marquee"><div class="mq-track" id="mqTrack"></div></div></div>' +
    '<header class="nav"><div class="wrap"><a class="logo" href="/" aria-label="Solare, inicio"><span class="logo-mark"></span></a>' +
    '<nav aria-label="Principal">' + lineas + '<a href="/deportivas/#formula">Fórmula</a><a href="/#accesorios">Accesorios</a></nav>' +
    '<button class="cart-btn" id="cartBtn" type="button" aria-label="Abrir carrito">' + SVG_BOLSA + '<span class="txt">Carrito</span><span class="cart-count" id="cartCount">0</span></button></div></header>' + sub;
}

function marcoAbajo() {
  var lineas = CATEGORIAS.map(function (c) {
    return c.estado === 'disponible' ? '<a href="' + c.url + '">' + c.nombre + '</a>' : '<span>' + c.nombre + ' (pronto)</span>';
  }).join('');
  return '<footer class="foot carbon"><div class="wrap">' +
      '<div class="f-brand"><span class="logo-mark" role="img" aria-label="Solare"></span><p>Gafas seleccionadas. Empezamos con deportivas en fibra de carbono.</p></div>' +
      '<div class="f-col"><h4>Tienda</h4>' + lineas + '<a href="/#accesorios">Accesorios</a><button class="linkbtn" type="button" data-promo><span data-pct>10</span>% en tu primera compra</button></div>' +
      '<div class="f-col"><h4>Ayuda</h4><span>WhatsApp <span class="mono" data-wa-txt></span></span><span class="mono">' + CORREO + '</span>' +
        '<a href="/terminos.html">Términos y condiciones</a><a href="/privacidad.html">Política de privacidad</a></div>' +
      '<p class="f-legal">© 2026 SOLARE COMPANY S.A.S. · NIT 901.855.513-4 · Precios en pesos colombianos, impuestos incluidos.</p>' +
    '</div></footer>' +
    // Carrito
    '<div class="scrim" id="scrim"></div>' +
    '<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="true" inert>' +
      '<div class="meta" id="meta"><p class="meta-txt" aria-live="polite"><svg viewBox="0 0 24 24" id="metaIco" aria-hidden="true"></svg><span id="metaTxt"></span></p>' +
        '<div class="bar"><i id="metaBar"></i></div><div class="bar-escala"><span>$0</span><span>Envío gratis · <span data-envio></span></span></div></div>' +
      '<div class="dhead"><h2 id="drawerTitle">Carrito <small id="drawerCount"></small></h2><button class="icon-btn" id="drawerClose" type="button" aria-label="Cerrar carrito">' + SVG_X + '</button></div>' +
      '<div class="dbody" id="dbody">' +
        '<div class="empty" id="cartEmpty">' + SVG_BOLSA.replace('aria-hidden="true"', 'aria-hidden="true" style="width:44px;height:44px;stroke:var(--muted)"') +
          '<h3>Tu carrito está vacío</h3><p>Todavía no has elegido tus gafas. Empieza por la línea deportiva en fibra de carbono.</p><a class="btn btn-ink" href="/deportivas/">Ver deportivas</a></div>' +
        '<ul class="items" id="items"></ul>' +
        '<section class="antojos" id="antojos" aria-labelledby="antTitulo" hidden><div class="ant-head"><div><h3 id="antTitulo">Antójate antes de pagar</h3><p id="antSub"></p></div>' +
          '<div class="arrows"><button class="icon-btn" id="antPrev" type="button" aria-label="Ver anteriores">' + svgFlecha('M15 6l-6 6 6 6') + '</button><button class="icon-btn" id="antNext" type="button" aria-label="Ver siguientes">' + svgFlecha('M9 6l6 6-6 6') + '</button></div></div>' +
          '<div class="track" id="track"></div></section>' +
        '<div class="dfoot" id="dfoot" hidden>' +
          '<details class="codigo" id="codigoBox"><summary>¿Tienes un código de descuento?</summary><form class="code-form" id="codeForm" novalidate><label class="sr" for="codeIn">Código de descuento</label><input class="in" id="codeIn" autocomplete="off" placeholder="Escribe tu código"><button class="btn btn-ink" type="submit">Aplicar</button></form><p class="code-msg" id="codeMsg" hidden></p></details>' +
          '<div class="code-on" id="codeOn" hidden><span>Código <b id="codeOnTxt"></b> aplicado</span><button class="icon-btn" id="codeOff" type="button" aria-label="Quitar código">' + SVG_X + '</button></div>' +
          '<dl class="tot"><div><dt>Subtotal</dt><dd id="tSub"></dd></div><div class="desc" id="rowDesc" hidden><dt id="tDescLbl">Descuento</dt><dd id="tDesc"></dd></div><div id="rowEnvio"><dt>Envío</dt><dd id="tEnvio"></dd></div><div class="grand"><dt>Total</dt><dd id="tTotal"></dd></div></dl>' +
          '<p class="nota">Impuestos incluidos. Te llevamos a WhatsApp con tu pedido listo para confirmar el pago y el envío.</p></div>' +
      '</div>' +
      '<div class="dpay" id="dpay" hidden><label class="terms" id="termsBox"><input type="checkbox" id="terms"> <span>Acepto los <a href="/terminos.html" target="_blank" rel="noopener">términos y condiciones</a></span></label>' +
        '<p class="terms-err" id="termsErr" hidden>Marca la casilla de términos para continuar.</p>' +
        '<div class="dbtns"><button class="btn btn-line" type="button" id="seguir">Seguir comprando</button><a class="btn btn-sun soft" id="pagar" href="#" target="_blank" rel="noopener">Finalizar compra · <span id="pagarTotal"></span></a></div></div>' +
    '</aside>' +
    // Popup de bienvenida
    '<div class="modal" id="promo" hidden><div class="promo-box" id="promoBox" role="dialog" aria-modal="true" aria-labelledby="promoTitle" tabindex="-1">' +
      '<button class="icon-btn promo-close" id="promoClose" type="button" aria-label="Cerrar">' + SVG_X + '</button><div class="promo">' +
      '<form class="promo-form" id="leadForm" novalidate><h2 id="promoTitle">Obtén <span data-pct>10</span>% en tu primera compra</h2><p>Déjanos tus datos y el descuento queda aplicado en tu carrito.</p>' +
        '<label class="field"><span>Correo</span><input class="in" id="lEmail" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com"></label>' +
        '<div class="field"><span id="lFechaLbl">¿Cuándo cumples años?</span><div class="fecha" role="group" aria-labelledby="lFechaLbl"><input class="in" id="lY" inputmode="numeric" maxlength="4" placeholder="AAAA" aria-label="Año"><input class="in" id="lM" inputmode="numeric" maxlength="2" placeholder="MM" aria-label="Mes"><input class="in" id="lD" inputmode="numeric" maxlength="2" placeholder="DD" aria-label="Día"></div></div>' +
        '<div class="field"><span id="lTelLbl">Celular</span><div class="tel"><span class="pref" aria-hidden="true"><i class="flag"></i>+57</span><input class="in" id="lTel" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="12" placeholder="300 123 4567" aria-labelledby="lTelLbl"></div></div>' +
        '<label class="check"><input type="checkbox" id="lOk"> <span>Autorizo a Solare a tratar mis datos y a enviarme novedades y promociones.</span></label>' +
        '<p class="form-err" id="leadErr" role="alert" hidden></p><button class="btn btn-ink" type="submit">Quiero mi descuento</button>' +
        '<p class="legal">Puedes darte de baja cuando quieras. Consulta cómo usamos tus datos en nuestra <a href="/privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</p>' +
        '<button class="linkbtn no-gracias" type="button" id="noGracias">No, gracias</button></form>' +
      '<div class="promo-form" id="leadOk" hidden><h2>Listo, ya tienes tu <span data-pct>10</span>%</h2><p>Tu código quedó aplicado en el carrito. Si compras por WhatsApp, menciónalo y lo respetamos.</p>' +
        '<div class="ok-code"><span id="okCode"></span><button class="btn btn-line btn-mini" type="button" id="copyCode">Copiar</button></div><button class="btn btn-sun" type="button" id="okVer">Ver las gafas</button></div>' +
      '<div class="promo-art" aria-hidden="true"><img src="/img/vertice-azul-varilla.webp" alt="" loading="lazy"><p class="promo-big"><span data-pct>10</span>%</p><p>en tu primera compra</p></div>' +
    '</div></div></div>' +
    // Configurador de lentes formulados
    '<div class="modal" id="rx" hidden><div class="rx-box" id="rxBox" role="dialog" aria-modal="true" aria-labelledby="rxTitulo" tabindex="-1">' +
      '<div class="rx-head"><button class="icon-btn" id="rxAtras" type="button" aria-label="Paso anterior">' + svgFlecha('M19 12H5M11 6l-6 6 6 6') + '</button><p class="rx-paso" id="rxPaso"></p><button class="icon-btn" id="rxCerrar" type="button" aria-label="Cerrar">' + SVG_X + '</button></div>' +
      '<div class="rx-body" id="rxBody"></div>' +
      '<div class="rx-foot"><dl class="rx-sum"><div><dt>Gafas</dt><dd id="rxMarco"></dd></div><div id="rxLenteRow" hidden><dt id="rxLenteLbl"></dt><dd id="rxLente"></dd></div><div class="grand"><dt>Subtotal</dt><dd id="rxTotal"></dd></div></dl>' +
        '<button class="btn btn-sun" id="rxSiguiente" type="button" disabled>Continuar</button></div>' +
    '</div></div>';
}

/* ---------- Componentes ---------- */
function migasHTML(items) {
  return '<nav class="migas" aria-label="Estás en">' + items.map(function (it, i) {
    return (i ? '<span aria-hidden="true">›</span>' : '') + (it[1] ? '<a href="' + it[1] + '">' + it[0] + '</a>' : '<span aria-current="page">' + it[0] + '</span>');
  }).join('') + '</nav>';
}
function swatchesHTML(g, conNombre) {
  return g.colores.map(function (c) {
    return '<button class="sw' + (conNombre ? ' sw-l' : '') + '" type="button" role="radio" aria-checked="' + (c.id === sel[g.id].color) + '" data-p="' + g.id + '" data-c="' + c.id + '" aria-label="' + c.nombre + '">' +
      '<i style="--m:' + c.montura + ';--l:' + c.lente + '"></i>' + (conNombre ? '<span>' + c.nombre + '</span>' : '') + '</button>';
  }).join('');
}
function tarjetaHTML(g) {
  return '<article class="tarjeta">' +
    '<a class="tarjeta-img" href="' + g.url + '" aria-label="Ver ' + g.nombre + '"><img data-f="' + g.id + ':frente" src="' + foto(g, sel[g.id].color, 'frente') + '" alt="Gafas ' + g.marca + ' ' + g.nombre + '" loading="lazy"></a>' +
    '<div class="tarjeta-info"><p class="marca">' + g.marca + '</p>' +
      '<div class="fila"><h3><a href="' + g.url + '">' + g.nombre + '</a></h3><span class="precio">' + cop(g.precio) + '</span></div>' +
      '<p class="tipo">' + g.tipo + '</p>' +
      '<div class="chips"><span class="chipf">' + g.peso + ' g</span><span class="chipf">UV400 cat. 3</span><span class="chipf">Antiempañante</span>' + (g.carbono ? '<span class="chipf">Fibra de carbono</span>' : '') + '</div>' +
      '<div class="sws" role="radiogroup" aria-label="Color de ' + g.nombre + '">' + swatchesHTML(g, false) + '</div>' +
      '<div class="acciones"><a class="btn btn-ink" href="' + g.url + '">Ver detalles</a><button class="btn btn-line btn-icono" type="button" data-comprar="' + g.id + '" aria-label="Agregar ' + g.nombre + ' al carrito"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>' +
    '</div></article>';
}
function comboHTML(g) {
  var lista = ACCESORIOS.filter(function (a) { return a.conGafas; });
  if (!lista.length) return '';
  return '<p class="combo-lbl">Llévalo completo y ahorra</p>' + lista.map(function (a) {
    return '<label class="combo"><input type="checkbox" data-combo="' + g.id + '" value="' + a.id + '">' +
      '<span class="combo-ico">' + iconoAcc(a.icono) + '</span>' +
      '<span class="combo-txt"><b>' + a.nombre + '</b><small>Mitad de precio con tus gafas</small></span>' +
      '<span class="combo-precio">' + cop(a.conGafas) + '<s>' + cop(a.precio) + '</s></span></label>';
  }).join('');
}
function garantiaHTML() {
  return '<details class="garantia"><summary><svg viewBox="0 0 24 24" aria-hidden="true">' + ICO_ESCUDO + '</svg><span>Garantía de <b>' + GARANTIA.meses + ' meses</b> por defectos de fabricación</span></summary>' +
    '<div class="g-cuerpo"><p>Cubre:</p><ul>' + GARANTIA.cubre.map(function (d) { return '<li>' + d + '</li>'; }).join('') + '</ul>' +
    '<p>' + GARANTIA.compromiso + '</p><p class="g-req">' + GARANTIA.requisito + '</p>' +
    '<a href="/terminos.html#garantia" target="_blank" rel="noopener">Ver condiciones completas</a></div></details>';
}
function pdpHTML(g) {
  var s = sel[g.id], c = colorDe(g, s.color);
  return '<div class="pdp">' +
    '<div class="gal"><div class="stage" style="--ar:' + g.ar + '">' +
      '<img data-stage="' + g.id + '"' + (DE_CERCA[s.vista] ? ' class="cover"' : '') + ' src="' + foto(g, s.color, s.vista) + '" alt="' + g.nombre + ' ' + c.nombre + ', ' + nombreVista(g, s.vista) + '" loading="lazy">' +
      '<button class="icon-btn nav-v prev" type="button" data-paso="-1" data-p="' + g.id + '" aria-label="Vista anterior">' + svgFlecha('M15 6l-6 6 6 6') + '</button>' +
      '<button class="icon-btn nav-v next" type="button" data-paso="1" data-p="' + g.id + '" aria-label="Vista siguiente">' + svgFlecha('M9 6l6 6-6 6') + '</button>' +
      '<span class="vista-nombre" data-vn="' + g.id + '">' + nombreVista(g, s.vista) + '</span></div>' +
      '<div class="thumbs" role="group" aria-label="Vistas">' + g.vistas.map(function (v) {
        return '<button class="thumb" type="button" data-vista="' + v[0] + '" data-p="' + g.id + '" aria-pressed="' + (v[0] === s.vista) + '" aria-label="' + v[1] + '">' +
          '<img' + (DE_CERCA[v[0]] ? ' class="cover"' : '') + ' data-f="' + g.id + ':' + v[0] + '" src="' + foto(g, s.color, v[0]) + '" alt="" loading="lazy"></button>';
      }).join('') + '</div></div>' +
    '<div class="buy"><p class="marca">' + g.marca + '</p><h3>' + g.nombre + '</h3><p class="tipo">' + g.tipo + '</p><span class="precio">' + cop(g.precio) + '</span>' +
      '<p class="color-lbl">Color: <b data-cn="' + g.id + '">' + c.nombre + '</b></p>' +
      '<div class="sws" role="radiogroup" aria-label="Color de ' + g.nombre + '">' + swatchesHTML(g, false) + '</div>' +
      comboHTML(g) +
      '<button class="btn btn-rx" type="button" data-rx="' + g.id + '">Lentes formulados</button>' +
      '<button class="btn btn-ink" type="button" data-comprar="' + g.id + '">Agregar al carrito · ' + cop(g.precio) + '</button>' +
      '<p class="regalo-nota"><svg viewBox="0 0 48 48" aria-hidden="true">' + ICONOS.regalo + '</svg><span>Con tus gafas te regalamos el <b>' + REGALO.nombre.toLowerCase() + '</b>: ' + REGALO.incluye.toLowerCase() + '.</span></p>' +
      garantiaHTML() +
      '<p class="nota-envio" data-nota="' + g.id + '"></p>' +
    '</div></div>';
}
function specsHTML(g) { return g.specs.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join(''); }
function compararHTML(lista) {
  return '<div class="comp">' + lista.map(function (g) {
    return '<article class="comp-col"><img class="foto" data-f="' + g.id + ':frente" src="' + foto(g, sel[g.id].color, 'frente') + '" alt="' + g.nombre + '" loading="lazy">' +
      '<h3>' + g.nombre + '</h3><dl><div><dt>Diseño</dt><dd>' + g.comparar.diseno + '</dd></div><div><dt>Ventilación</dt><dd>' + g.comparar.ventilacion + '</dd></div>' +
      '<div><dt>Colores</dt><dd><div class="sws" role="radiogroup" aria-label="Color de ' + g.nombre + '">' + swatchesHTML(g, false) + '</div></dd></div>' +
      '<div><dt>Precio</dt><dd class="mono">' + cop(g.precio) + '</dd></div></dl><a class="btn btn-ink" href="' + g.url + '">Ver ' + g.nombre + '</a></article>';
  }).join('') + '</div>';
}
function formulaHTML(lista) {
  return '<p class="eyebrow rv">Fórmula</p><h2 class="h2 rv">¿Usas fórmula? También son para ti.</h2>' +
    '<p class="intro rv">Nuestras deportivas llevan un clip óptico por dentro. Elige cómo quieres resolver tu fórmula.</p>' +
    '<div class="rx-cards"><article class="rx-card rv"><span class="label">Opción 1</span><h3>Clip para fórmula</h3><p class="rx-precio">' + cop(FORMULA.clip.precio) + '</p><p>El sobrepuesto óptico que va por dentro de las gafas. Lo llevas a tu óptica de confianza y allá le montan tus lentes.</p></article>' +
    '<article class="rx-card on rv"><span class="label">Opción 2 · La más fácil</span><h3>Lentes formulados Solare</h3><p class="rx-precio">' + cop(FORMULA.lab.precio) + '</p><p>Tallamos tus lentes de forma digital, los montamos en el clip y te llegan listas para usar. Un solo precio para cualquier fórmula dentro del rango.</p></article></div>' +
    '<h3 class="specs-tit">Rango de fórmula que tallamos</h3><dl class="specs">' + filasRango().map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
    '<p class="rango-nota">¿Tu fórmula está fuera de este rango o usas progresivos? <a href="' + waLink('Hola Solare, quiero saber si pueden tallar mi fórmula en unas gafas deportivas.') + '" target="_blank" rel="noopener">Escríbenos por WhatsApp</a> y la revisamos.</p>' +
    '<div class="rx-botones">' + lista.map(function (g) { return '<button class="btn btn-ink" type="button" data-rx="' + g.id + '">Configurar ' + g.nombre + ' con fórmula</button>'; }).join('') + '</div>';
}
function accesoriosHTML() {
  return '<div class="sec-head"><div><p class="label">Complementos</p><h2 class="h2s">Accesorios para tus gafas</h2></div><p>Pequeños, útiles y a buen precio. Suma uno y acércate a tu envío gratis.</p></div>' +
    '<div class="grid-a">' + ACCESORIOS.map(function (a) {
      return '<article class="acard"><div class="aico">' + iconoAcc(a.icono) + '</div><h3>' + a.nombre + '</h3><span class="price">' + cop(a.precio) + '</span>' +
        (a.conGafas ? '<p class="acc-nota">' + cop(a.conGafas) + ' con tus gafas</p>' : '') +
        '<button class="btn btn-line btn-mini" type="button" data-acc="' + a.id + '">Agregar</button></article>';
    }).join('') + '</div>';
}
function beneficiosHTML() {
  var b = [
    ['<path d="M2.5 6h11.5v10H2.5z"/><path d="M14 9h4.2l3.3 3.4V16H14z"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="17.5" cy="17.5" r="1.9"/>', 'Envío gratis desde ' + cop(ENVIO_GRATIS_DESDE), 'A toda Colombia. El carrito te dice cuánto te falta.'],
    ['<rect x="4" y="10" width="16" height="11" rx="1.5"/><path d="M3 7h18v3H3zM12 7v14"/><path d="M12 7c-1.5-3-5.5-3.5-5.5-1 0 1.5 3 1.5 5.5 1zM12 7c1.5-3 5.5-3.5 5.5-1 0 1.5-3 1.5-5.5 1z"/>', 'Kit de protección de regalo', 'Con cada par te regalamos estuche rígido, funda y paño.'],
    [ICO_ESCUDO, 'Garantía de ' + GARANTIA.meses + ' meses', 'Por defectos de fabricación. Reparamos o cambiamos tus gafas.'],
    ['<path d="M4 18.5l1.2-3.6A7.5 7.5 0 1 1 8.6 18z"/><path d="M9 10.5h6M9 13.5h4"/>', 'Asesoría por WhatsApp', 'Te ayudamos a elegir modelo y color antes de pagar.']
  ];
  return '<section class="benef"><div class="wrap">' + b.map(function (x) {
    return '<div class="b"><svg viewBox="0 0 24 24" aria-hidden="true">' + x[0] + '</svg><div><h3>' + x[1] + '</h3><p>' + x[2] + '</p></div></div>';
  }).join('') + '</div></section>';
}
function dropsHTML() {
  var n = GAFAS.length, colores = 0; GAFAS.forEach(function (g) { colores += g.colores.length; });
  return '<section class="sec banda carbon drops" id="lanzamientos"><div class="wrap centro">' +
    '<p class="eyebrow rv">Cómo lanzamos</p><h2 class="h2 rv">Pocos modelos. Elegidos uno a uno.</h2>' +
    '<p class="intro rv">No sacamos colecciones de cien referencias. Lanzamos por etapas y solo cuando un modelo nos convence.</p>' +
    '<div class="drop-list"><article class="drop on"><span class="estado">Disponible</span><span class="num">01</span><h3>Deportivas en fibra de carbono</h3><p>' + n + ' modelos y ' + colores + ' combinaciones de color.</p><a class="btn btn-sun" href="/deportivas/">Ver deportivas</a></article>' +
    '<article class="drop off"><span class="estado">Próximamente</span><span class="num">02</span><h3>Lifestyle</h3><p>Gafas de sol para el día a día, también con fórmula. Si quieres saberlo antes que nadie, te escribimos el día del lanzamiento.</p><a class="btn btn-line" href="' + waLink('Hola Solare, quiero que me avisen cuando salga la línea lifestyle.') + '" target="_blank" rel="noopener">Avísame por WhatsApp</a></article></div>' +
    '</div></section>';
}

/* ---------- Páginas ---------- */
function paginaInicio() {
  var dep = gafasDe('deportivas'), g0 = dep[0];
  return '<section class="hero inicio-hero" id="inicio"><div class="wrap">' +
      '<p class="eyebrow"><b>Solare</b> · Drop 01</p><h1>Elegidas una a una.</h1>' +
      '<p class="lema">Pocos modelos, probados y bien escogidos. Empezamos con deportivas en fibra de carbono de 25 gramos.</p>' +
      '<img class="hero-img foto" data-f="' + g0.id + ':frente" src="' + foto(g0, sel[g0.id].color, 'frente') + '" width="767" height="382" fetchpriority="high" alt="Gafas ' + g0.marca + ' ' + g0.nombre + '">' +
      '<div class="hero-buy"><a class="btn btn-sun" href="/deportivas/">Ver deportivas</a><a class="btn btn-line" href="#lineas">Ver líneas</a></div>' +
    '</div></section>' +
    '<section class="sec" id="lineas"><div class="wrap centro"><p class="eyebrow rv">Líneas</p><h2 class="h2 rv">Elige tu línea</h2><div class="lineas">' +
      CATEGORIAS.map(function (c) {
        if (c.estado === 'disponible') {
          var g = gafasDe(c.id)[0];
          return '<a class="linea linea-on rv" href="' + c.url + '"><span class="label">' + gafasDe(c.id).length + ' modelos</span><h3>' + c.nombre + '</h3><p>' + c.titulo + '. ' + (c.datos || []).slice(0, 3).join(' · ') + '.</p>' +
            '<span class="btn btn-ink">Ver ' + c.nombre.toLowerCase() + '</span><img src="' + foto(g, (g.colores[1] || g.colores[0]).id, 'tres') + '" alt="" loading="lazy"></a>';
        }
        return '<div class="linea linea-off carbon rv"><span class="label">Próximamente</span><h3>' + c.nombre + '</h3><p>' + c.intro + '</p>' +
          '<a class="btn btn-sun" href="' + waLink('Hola Solare, quiero que me avisen cuando salga la línea ' + c.nombre.toLowerCase() + '.') + '" target="_blank" rel="noopener">Avísame por WhatsApp</a></div>';
      }).join('') + '</div></div></section>' +
    '<section class="sec seccion-papel" id="destacados"><div class="wrap centro"><p class="eyebrow rv">Disponibles ahora</p><h2 class="h2 rv">Deportivas de 25 gramos</h2>' +
      '<div class="tarjetas" style="margin-top:clamp(28px,4vw,48px)">' + dep.map(tarjetaHTML).join('') + '</div>' +
      '<a class="btn btn-line" href="/deportivas/" style="margin-top:28px">Ver la línea deportiva</a></div></section>' +
    dropsHTML() +
    '<section class="sec" id="accesorios"><div class="wrap">' + accesoriosHTML() + '</div></section>' +
    beneficiosHTML();
}

function paginaCategoria(cat) {
  var lista = gafasDe(cat.id);
  return '<section class="cat-hero"><div class="wrap">' + migasHTML([['Inicio', '/'], [cat.nombre]]) +
      '<p class="eyebrow">Línea</p><h1>' + cat.titulo + '</h1><p class="intro">' + cat.intro + '</p>' +
      '<div class="chips">' + (cat.datos || []).map(function (d) { return '<span class="chipf">' + d + '</span>'; }).join('') + '</div></div></section>' +
    '<section class="sec seccion-papel" id="modelos" style="padding-top:clamp(36px,5vw,64px)"><div class="wrap centro"><div class="tarjetas">' + lista.map(tarjetaHTML).join('') + '</div></div></section>' +
    (lista.length > 1 ? '<section class="sec" id="comparar"><div class="wrap centro"><p class="eyebrow rv">Comparar</p><h2 class="h2 rv">' + lista.map(function (g) { return g.nombre; }).join(' o ') + '</h2>' + compararHTML(lista) +
      '<p class="comp-nota">Todas pesan 25 g, tienen filtro UV400 categoría 3, tecnología antiempañante, aceptan fórmula y tienen ' + GARANTIA.meses + ' meses de garantía.</p></div></section>' : '') +
    '<section class="sec seccion-papel" id="formula"><div class="wrap centro">' + formulaHTML(lista) + '</div></section>' +
    beneficiosHTML();
}

function paginaProducto(g) {
  var cat = categoria(g.categoria), c0 = sel[g.id].color;
  var h = '<section class="hero" id="inicio"><div class="wrap">' + migasHTML([['Inicio', '/'], [cat.nombre, cat.url], [g.nombre]]) +
      '<p class="eyebrow"><b>Nuevo</b> · ' + g.marca + ' · ' + (g.carbono ? 'Fibra de carbono' : g.tipo) + '</p>' +
      '<h1>' + g.nombre + '</h1><p class="lema">' + g.lema + '</p>' +
      '<p class="tipo">' + g.peso + ' g · UV400 categoría 3 · Tecnología antiempañante</p>' +
      '<img class="hero-img foto" data-f="' + g.id + ':frente" src="' + foto(g, c0, 'frente') + '" fetchpriority="high" alt="Gafas ' + g.marca + ' ' + g.nombre + ' de frente">' +
      '<div class="hero-buy"><span class="precio">' + cop(g.precio) + '</span><a class="btn btn-sun" href="#comprar">Comprar</a><a class="btn btn-line" href="#proteccion">Ver de cerca</a></div>' +
      '<div class="sws" role="radiogroup" aria-label="Color">' + swatchesHTML(g, true) + '</div>' +
    '</div></section>' +
    // 25 gramos
    '<section class="peso" id="ligereza" aria-labelledby="pesoTit"><div class="wrap centro">' +
      '<p class="eyebrow">Ligereza' + (g.carbono ? ' · fibra de carbono' : '') + '</p>' +
      '<p class="peso-num" aria-hidden="true"><span class="n" id="pesoNum">' + g.peso + '</span><span class="u">g</span></p>' +
      '<h2 class="h2 rv" id="pesoTit">Pesan ' + g.peso + ' gramos. Nada más.</h2><p class="intro rv">' + g.pesoTexto + '</p></div></section>' +
    // Protección
    '<section class="prot" id="proteccion" aria-label="Protección y tecnología"><div class="wrap">' +
      '<article class="ptile ptile-uv carbon rv"><div class="uv-info"><p class="label">Protección</p><p class="pbig">UV400</p><span class="pchip">Categoría 3</span>' +
        '<div class="cats" role="img" aria-label="Categorías de filtro solar de 0 a 4, resaltada la 3"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span></div>' +
        '<p class="cats-nota">De 0 (casi transparente) a 4 (alta montaña). La 3 es la de sol fuerte.</p><h3>Filtro UV400 categoría 3</h3>' +
        '<p class="txt">Bloquea los rayos UVA y UVB hasta 400 nm y deja pasar solo entre el 8 % y el 18 % de la luz. Desliza la foto y mira la misma calle a ojo descubierto y a través del lente.</p></div>' +
        '<div class="uv-cmp"><div class="cmp" id="cmp" style="--pos:50%;--cmp-ar:690/931">' +
          '<img src="/img/uv-con.webp?v=3" width="690" height="931" loading="lazy" alt="Calle vista a través del lente UV400 categoría 3: cielo azul profundo, colores vivos y buen contraste">' +
          '<div class="cmp-sin"><img src="/img/uv-sin.webp?v=3" width="690" height="931" loading="lazy" alt="La misma calle a ojo descubierto: cielo pálido, brillo excesivo y destello del sol"></div>' +
          '<span class="cmp-tag izq">Sin filtro</span><span class="cmp-tag der">Con UV400 cat. 3</span><span class="cmp-linea" aria-hidden="true"></span>' +
          '<span class="cmp-knob" id="cmpKnob" tabindex="0" role="slider" aria-label="Deslizar para comparar sin filtro y con filtro UV400" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg></span></div>' +
          '<p class="cmp-nota">Fotos reales tomadas desde el mismo punto, a ojo descubierto y a través del lente. Ajustamos brillo y nitidez para que la diferencia se note en pantalla.</p></div></article>' +
      '<article class="ptile ptile-af rv"><p class="label">Tecnología</p><p class="pbig">Anti&shy;empañante</p><div class="af-txt"><h3>Tecnología antiempañante</h3>' +
        '<p class="txt">El lente se mantiene claro cuando sudas, subes un alto o cambia la temperatura de golpe. Menos paradas para limpiarlas.</p></div></article>' +
    '</div></section>';
  // Fibra de carbono (solo modelos con varillas de carbono y fotos de cerca)
  if (g.carbono) {
    h += '<section class="sec banda carbon" id="carbono"><div class="wrap centro"><p class="eyebrow rv">Material</p><h2 class="h2 rv">Fibra de carbono, a la vista.</h2>' +
      '<p class="intro rv">Las varillas llevan tejido de carbono real, el mismo material de los cuadros de bicicleta de ruta. Rígidas, livianas y con un patrón que no se repite.</p>' +
      '<div class="plato zoom"><img data-f="' + g.id + ':varilla" src="' + foto(g, c0, 'varilla') + '" width="510" height="234" loading="lazy" alt="Varilla en fibra de carbono, de cerca"><span class="tag">Varilla · fibra de carbono</span></div>' +
      '<div class="acabados" role="radiogroup" aria-label="Acabado">' + g.colores.map(function (c) {
        return '<button class="acabado" type="button" role="radio" aria-checked="' + (c.id === c0) + '" data-p="' + g.id + '" data-c="' + c.id + '"><span><img src="' + foto(g, c.id, 'varilla') + '" alt="" loading="lazy"></span><span>' + c.nombre + '</span></button>';
      }).join('') + '</div>' +
      '<div class="datos"><div class="dato"><span>Varillas</span><b>Fibra de carbono</b></div><div class="dato"><span>Peso</span><b>' + g.peso + ' g</b></div><div class="dato"><span>Filtro</span><b>UV400 categoría 3</b></div></div></div></section>';
  }
  // Detalles de cerca
  if (g.detalles && g.detalles.length) {
    h += '<section class="sec" id="detalles"><div class="wrap centro"><p class="eyebrow rv">Diseño</p><h2 class="h2 rv">Cada detalle, de cerca.</h2><div class="bento">' +
      g.detalles.map(function (d) {
        var cerca = DE_CERCA[d.vista];
        return '<article class="tile c' + d.col + ' rv"><div class="cap"><h3>' + d.titulo + '</h3><p>' + d.texto + '</p></div>' +
          '<div class="im' + (cerca ? ' cover' : '') + '"><img' + (cerca ? '' : ' class="foto"') + ' data-f="' + g.id + ':' + d.vista + '" src="' + foto(g, c0, d.vista) + '" loading="lazy" alt="' + d.titulo + '"></div></article>';
      }).join('') + '</div></div></section>';
  }
  // Comprar
  h += '<section class="sec seccion-papel" id="comprar"><div class="wrap centro"><p class="eyebrow rv">Colores y ángulos</p><h2 class="h2 rv">Míralas por todos lados.</h2>' + pdpHTML(g) +
    '<h3 class="specs-tit" id="specs">Especificaciones</h3><dl class="specs">' + specsHTML(g) + '</dl>' +
    '<p class="rango-nota">¿Usas fórmula? Mira <a href="' + cat.url + '#formula">cómo funcionan los lentes formulados</a> y el rango que tallamos.</p></div></section>';
  // Otros modelos de la misma línea
  var otros = gafasDe(g.categoria).filter(function (x) { return x.id !== g.id; });
  if (otros.length) h += '<section class="sec" id="otros"><div class="wrap centro"><p class="eyebrow rv">' + cat.nombre + '</p><h2 class="h2 rv">También te puede gustar</h2><div class="tarjetas" style="margin-top:clamp(28px,4vw,48px)">' + otros.map(tarjetaHTML).join('') + '</div></div></section>';
  return h + beneficiosHTML();
}

/* ---------- Textos comunes ---------- */
function pintarComunes() {
  $$('[data-envio]').forEach(function (el) { el.textContent = cop(ENVIO_GRATIS_DESDE); });
  $$('[data-pct]').forEach(function (el) { el.textContent = BIENVENIDA.porcentaje; });
  $$('[data-wa-txt]').forEach(function (el) { el.textContent = '+' + WHATSAPP.slice(0, 2) + ' ' + WHATSAPP.slice(2, 5) + ' ' + WHATSAPP.slice(5, 8) + ' ' + WHATSAPP.slice(8); });
  $('#okCode').textContent = BIENVENIDA.codigo;
}
function pintarAnuncio() {
  var items = [
    'Envío gratis desde <b>' + cop(ENVIO_GRATIS_DESDE) + '</b>',
    'Pesan solo <b>25 gramos</b>',
    '<button type="button" data-promo><b>' + BIENVENIDA.porcentaje + '%</b> en tu primera compra</button>',
    'Filtro <b>UV400 categoría 3</b>',
    REGALO.nombre + ' <b>de regalo</b> con tus gafas',
    'Lentes formulados con tallado digital: <b>' + cop(FORMULA.lab.precio) + '</b>',
    'Garantía de <b>' + GARANTIA.meses + ' meses</b>'
  ];
  var grupo = items.map(function (h) { return '<span class="mq-item">' + h + '</span>'; }).join('');
  // Tres copias para que el recorrido no deje huecos en pantallas anchas
  $('#mqTrack').innerHTML = [0, 1, 2].map(function (i) { return '<div class="mq-grupo"' + (i ? ' aria-hidden="true"' : '') + '>' + grupo + '</div>'; }).join('');
  $$('#mqTrack [aria-hidden] button').forEach(function (b) { b.tabIndex = -1; });
  var ancho = $('#mqTrack .mq-grupo').offsetWidth || 1400;
  $('#mqTrack').style.setProperty('--mq-dur', Math.round(ancho / 45) + 's');
}

/* ---------- Color y vistas ---------- */
function elegirColor(gid, cid) {
  var g = gafa(gid), s = sel[gid];
  if (!g || !colorDe(g, cid)) return;
  s.color = cid;
  $$('img[data-f^="' + gid + ':"]').forEach(function (img) { ponerFoto(img, foto(g, cid, img.getAttribute('data-f').split(':')[1])); });
  $$('img[data-stage="' + gid + '"]').forEach(function (img) { ponerFoto(img, foto(g, cid, s.vista)); });
  $$('[data-p="' + gid + '"][data-c]').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.c === cid); });
  $$('[data-cn="' + gid + '"]').forEach(function (el) { el.textContent = colorDe(g, cid).nombre; });
  if (g.carbono) $('.promo-art img').src = foto(g, cid, 'varilla');
}
function elegirVista(gid, v) {
  var g = gafa(gid), s = sel[gid], img = $('img[data-stage="' + gid + '"]');
  if (!img) return;
  s.vista = v;
  img.classList.toggle('cover', !!DE_CERCA[v]);
  img.alt = g.nombre + ' ' + colorDe(g, s.color).nombre + ', ' + nombreVista(g, v);
  ponerFoto(img, foto(g, s.color, v));
  $('[data-vn="' + gid + '"]').textContent = nombreVista(g, v);
  $$('.thumb[data-p="' + gid + '"]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.vista === v); });
}
function pasoVista(gid, d) {
  var g = gafa(gid), idx = 0;
  g.vistas.forEach(function (v, k) { if (v[0] === sel[gid].vista) idx = k; });
  elegirVista(gid, g.vistas[(idx + d + g.vistas.length) % g.vistas.length][0]);
}

// El 25 "baja" desde el doble cuando entra en pantalla. Sin JS o sin movimiento queda fijo.
function animarPeso(meta) {
  var el = $('#pesoNum');
  if (!el || !MOVIMIENTO || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    var desde = meta * 2, t0 = performance.now(), dur = 1200;
    (function paso(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(desde - (desde - meta) * e);
      if (p < 1) requestAnimationFrame(paso);
    })(t0);
  }, { threshold: .6 });
  io.observe(el);
}

/* ---------- Comparación sin filtro / con filtro ---------- */
function iniciarComparador() {
  var c = $('#cmp');
  if (!c) return;
  var knob = $('#cmpKnob'), izq = $('.cmp-tag.izq', c), der = $('.cmp-tag.der', c);
  var tocado = false, arrastre = false, x0 = 0, y0 = 0, tipo = '';
  function poner(p) {
    p = Math.max(0, Math.min(100, p));
    c.style.setProperty('--pos', p + '%');
    knob.setAttribute('aria-valuenow', Math.round(p));
    knob.setAttribute('aria-valuetext', Math.round(p) + ' % sin filtro');
    izq.style.opacity = p < 24 ? 0 : 1;
    der.style.opacity = p > 76 ? 0 : 1;
  }
  // Un solo cambio de posición por cuadro de pantalla: el arrastre va fluido aunque el dedo mande muchos eventos
  var pendiente = null;
  function pedir(p) {
    if (pendiente === null) requestAnimationFrame(function () { poner(pendiente); pendiente = null; });
    pendiente = p;
  }
  function desde(e) { var r = c.getBoundingClientRect(); pedir((e.clientX - r.left) / r.width * 100); }
  function empezar(e) { arrastre = true; tocado = true; c.classList.add('arrastrando'); try { c.setPointerCapture(e.pointerId); } catch (x) {} desde(e); }
  function soltar() { arrastre = false; tipo = ''; c.classList.remove('arrastrando'); }
  // Con mouse, o tocando la bolita, arrastra de una. Con el dedo sobre la foto espera un gesto horizontal para no estorbar el scroll vertical
  c.addEventListener('pointerdown', function (e) {
    tipo = e.pointerType; x0 = e.clientX; y0 = e.clientY;
    if (tipo === 'mouse' || e.target.closest('.cmp-knob')) { e.preventDefault(); empezar(e); }
  });
  c.addEventListener('pointermove', function (e) {
    if (arrastre) { desde(e); return; }
    if (tipo && tipo !== 'mouse' && Math.abs(e.clientX - x0) > 6 && Math.abs(e.clientX - x0) > Math.abs(e.clientY - y0)) empezar(e);
  });
  c.addEventListener('pointerup', function (e) {
    if (!arrastre && tipo && tipo !== 'mouse' && Math.abs(e.clientX - x0) < 6 && Math.abs(e.clientY - y0) < 6) { tocado = true; desde(e); }
    soltar();
  });
  c.addEventListener('pointercancel', soltar);
  // En celular el navegador le da el gesto a la bolita; al pasarlo al recuadro, la bolita "pierde" la captura.
  // Ese aviso sube hasta aquí y cortaba el arrastre: solo cuenta si lo pierde el recuadro mismo.
  c.addEventListener('lostpointercapture', function (e) { if (e.target === c) soltar(); });
  knob.addEventListener('keydown', function (e) {
    var m = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key];
    if (m === undefined) return;
    e.preventDefault(); tocado = true;
    poner(parseFloat(knob.getAttribute('aria-valuenow')) + m);
  });
  poner(50);
  // Pista: la línea se mueve sola una vez para mostrar que se puede deslizar
  if (MOVIMIENTO && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now(), dur = 1800;
      (function paso(t) {
        if (tocado) return;
        var p = Math.min(1, (t - t0) / dur);
        poner(50 + Math.sin(p * Math.PI * 2) * 24 * (1 - p));
        if (p < 1) requestAnimationFrame(paso); else poner(50);
      })(t0);
    }, { threshold: .6 });
    io.observe(c);
  }
}

/* ---------- Fórmula: utilidades ---------- */
function fmtD(n) { n = Number(n); return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(2); }
function filasRango() {
  var R = FORMULA.rango;
  return [['Esfera', fmtD(R.esfMin) + ' a ' + fmtD(R.esfMax)], ['Cilindro', 'Hasta ' + fmtD(R.cilMin)],
    ['Esfera + cilindro', 'Hasta ' + fmtD(R.sumaMin)], ['Distancia pupilar', R.dpMin + ' a ' + R.dpMax + ' mm'],
    ['Tipo de lente', 'Visión sencilla (monofocal)'], ['Tallado', 'Digital, precio único']];
}
function recetaTexto(r) {
  function ojo(o) { return 'esf ' + fmtD(o.esf) + ' cil ' + fmtD(o.cil) + (+o.cil !== 0 ? ' eje ' + o.eje + '°' : ''); }
  return 'OD ' + ojo(r.od) + ' · OI ' + ojo(r.oi) + (r.dp && r.dp !== 'nose' ? ' · DP ' + r.dp + ' mm' : '');
}
function rxDetalle(r, paraWA) {
  if (!r || r.tipo !== 'lab') return '';
  if (r.modo === 'manual') return 'Fórmula: ' + recetaTexto(r.receta);
  if (r.modo === 'archivo') return FORMULA_WEBHOOK ? 'Fórmula: subida en la web (' + r.archivo + ')'
    : paraWA ? 'Fórmula: te envío la foto (' + r.archivo + ') por este chat' : 'Fórmula: adjunta la foto en el chat de WhatsApp al finalizar';
  return paraWA ? 'Fórmula: te la envío por este chat' : 'Fórmula: la envías por WhatsApp al finalizar';
}

/* ---------- Pintar carrito ---------- */
function pintarNotas(t) {
  GAFAS.forEach(function (g) {
    var el = $('[data-nota="' + g.id + '"]'); if (!el) return;
    var falta = ENVIO_GRATIS_DESDE - (t.neto + g.precio * (1 - t.pct / 100));
    var ok = t.gratis || falta <= 0;
    el.classList.toggle('ok', ok);
    el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ok ? ICO_CHECK : ICO_CAMION) + '</svg><span>' +
      (t.gratis ? 'Tu pedido ya tiene envío gratis.'
        : falta <= 0 ? 'Con estas gafas tu envío sale gratis.'
        : 'Si las agregas, te faltan <b>' + cop(falta) + '</b> para el envío gratis. El carrito te sugiere cómo completarlo.') + '</span>';
  });
}
function pintarCarrito() {
  var t = totales();
  $('#cartCount').textContent = t.unidades;
  $('#cartBtn').setAttribute('aria-label', 'Abrir carrito, ' + t.unidades + (t.unidades === 1 ? ' producto' : ' productos'));
  $('#drawerCount').textContent = t.unidades ? '(' + t.unidades + ')' : '';
  var meta = $('#meta');
  meta.classList.toggle('done', t.gratis);
  $('#metaIco').innerHTML = t.gratis ? ICO_CHECK : ICO_CAMION;
  $('#metaTxt').innerHTML = t.gratis ? '¡Listo! Tu envío es <b>gratis</b>.' : 'Te faltan <b>' + cop(t.falta) + '</b> para tu <b>envío gratis</b>.';
  $('#metaBar').style.setProperty('--p', Math.min(1, t.neto / ENVIO_GRATIS_DESDE).toFixed(4));
  if (eraGratis === false && t.gratis) { meta.classList.remove('festeja'); void meta.offsetWidth; meta.classList.add('festeja'); }
  eraGratis = t.gratis;

  var vacio = carrito.length === 0;
  $('#cartEmpty').hidden = !vacio;
  $('#dfoot').hidden = vacio;
  $('#dpay').hidden = vacio;
  $('#items').innerHTML = carrito.map(function (it) {
    var p = prod(it), esGafa = it.tipo === 'gafa';
    var c = esGafa ? colorDe(p, it.color) : null;
    var linea = totalLinea(it, t.ng), lleno = esGafa ? precioGafa(it) * it.n : p.precio * it.n;
    var detalle = esGafa
      ? ['Color ' + c.nombre, it.rx ? FORMULA[it.rx.tipo].corto : '', it.n > 1 ? cop(precioGafa(it)) + ' c/u' : ''].filter(Boolean).join(' · ')
      : linea < lleno ? 'Mitad de precio con tus gafas <s>' + cop(lleno) + '</s>' : 'Accesorio';
    return '<li class="item" data-k="' + it.k + '">' +
      '<div class="item-img' + (esGafa ? '' : ' acc') + '">' + (esGafa ? '<a href="' + p.url + '"><img class="foto" src="' + foto(p, it.color, 'mini') + '" alt="' + p.nombre + '"></a>' : iconoAcc(p.icono)) + '</div>' +
      '<div class="item-info"><h3>' + (esGafa ? p.marca + ' ' + p.nombre : p.nombre) + '</h3><p class="var">' + detalle + '</p>' +
        (esGafa && it.rx && it.rx.tipo === 'lab' ? '<p class="rx-linea">' + rxDetalle(it.rx, false) + '</p>' : '') +
        '<div class="item-ctrl"><div class="qty">' +
          '<button type="button" data-q="-1" aria-label="Quitar una unidad"' + (it.n <= 1 ? ' disabled' : '') + '>−</button>' +
          '<output aria-label="Cantidad">' + it.n + '</output>' +
          '<button type="button" data-q="1" aria-label="Agregar una unidad"' + (it.n >= 10 ? ' disabled' : '') + '>+</button></div>' +
          '<button class="icon-btn" type="button" data-del aria-label="Eliminar ' + p.nombre + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v5.5M14 11v5.5"/></svg></button>' +
        '</div></div>' +
      '<div class="item-price">' + cop(linea) + '</div></li>';
  }).join('') + (t.ng ? '<li class="item regalo">' +
      '<div class="item-img regalo-img">' + iconoAcc('regalo') + '</div>' +
      '<div class="item-info"><p class="regalo-tag">Por tu compra te regalamos</p><h3>' + REGALO.nombre + '</h3><p class="var">' + REGALO.incluye + '</p></div>' +
      '<div class="item-price"><span class="gratis">Gratis</span>' + (t.ng > 1 ? '<small>× ' + t.ng + '</small>' : '') + '</div></li>' : '');

  pintarAntojos(t);
  pintarNotas(t);
  $('#tSub').textContent = cop(t.sub);
  $('#rowDesc').hidden = !t.desc;
  $('#tDescLbl').textContent = 'Descuento ' + codigo + ' (' + t.pct + '%)';
  $('#tDesc').textContent = '−' + cop(t.desc);
  $('#tEnvio').textContent = t.gratis ? 'Gratis' : 'Por confirmar';
  $('#rowEnvio').classList.toggle('envio-ok', t.gratis);
  $('#tTotal').textContent = cop(t.neto);
  $('#pagarTotal').textContent = cop(t.neto);
  $('#codigoBox').hidden = !!codigo;
  $('#codeOn').hidden = !codigo;
  $('#codeOnTxt').textContent = codigo;
  $('#pagar').href = linkWhatsApp(t);
  $('#pagar').classList.toggle('soft', !$('#terms').checked);
}
function pintarAntojos(t) {
  var sec = $('#antojos'), enCarrito = {};
  carrito.forEach(function (it) { if (it.tipo === 'acc') enCarrito[it.id] = 1; });
  var factor = 1 - t.pct / 100;
  var lista = ACCESORIOS.filter(function (a) { return !enCarrito[a.id] && a.antojo !== false; }).map(function (a) {
    var precio = precioSiguiente(a, t.ng);
    return { a: a, precio: precio, rebaja: precio < a.precio, cierra: !t.gratis && precio * factor >= t.falta };
  });
  if (!carrito.length || !lista.length) { sec.hidden = true; return; }
  // Primero los que completan el envío, luego los destacados (cuelga gafas) y después por precio
  lista.sort(function (x, y) { return (y.cierra - x.cierra) || ((y.a.destacado ? 1 : 0) - (x.a.destacado ? 1 : 0)) || (x.precio - y.precio); });
  var hayCierre = lista.some(function (x) { return x.cierra; });
  sec.hidden = false;
  $('#antSub').textContent = t.gratis ? 'Ya tienes envío gratis. Esto es lo que más se lleva con las gafas.'
    : hayCierre ? 'Agrega uno de los marcados y tu envío sale gratis.' : 'Te faltan ' + cop(t.falta) + '. Suma un par de estos y llegas.';
  $('#track').innerHTML = lista.map(function (x) {
    return '<article class="ant' + (x.cierra ? ' cierra' : '') + '"><div class="aico">' + iconoAcc(x.a.icono) + (x.rebaja ? '<span class="chip-50">−50%</span>' : '') + (x.cierra ? '<span class="badge">Te da envío gratis</span>' : '') + '</div>' +
      '<h4>' + x.a.nombre + '</h4><span class="price">' + cop(x.precio) + (x.rebaja ? '<s>' + cop(x.a.precio) + '</s>' : '') + '</span>' +
      '<button class="btn ' + (x.cierra ? 'btn-sun' : 'btn-line') + '" type="button" data-acc="' + x.a.id + '">Agregar</button></article>';
  }).join('');
  $('#track').scrollLeft = 0;
  flechas();
}
function flechas() {
  var tr = $('#track');
  $('#antPrev').disabled = tr.scrollLeft < 4;
  $('#antNext').disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4;
}
function linkWhatsApp(t) {
  var l = ['Hola Solare, quiero finalizar esta compra:', ''];
  carrito.forEach(function (it) {
    var p = prod(it), linea = totalLinea(it, t.ng);
    if (it.tipo === 'gafa') {
      l.push('• ' + it.n + ' × ' + p.marca + ' ' + p.nombre + ' (color ' + colorDe(p, it.color).nombre + ')' + (it.rx ? ' + ' + FORMULA[it.rx.tipo].nombre.toLowerCase() : '') + ': ' + cop(linea));
      if (it.rx && it.rx.tipo === 'lab') l.push('   ' + rxDetalle(it.rx, true));
    } else {
      l.push('• ' + it.n + ' × ' + p.nombre + (linea < p.precio * it.n ? ' (mitad de precio con las gafas)' : '') + ': ' + cop(linea));
    }
  });
  if (t.ng) l.push('• Regalo: ' + t.ng + ' × ' + REGALO.nombre.toLowerCase() + ' (' + REGALO.incluye.toLowerCase() + ')');
  l.push('', 'Subtotal: ' + cop(t.sub));
  if (t.desc) l.push('Descuento ' + codigo + ' (' + t.pct + '%): −' + cop(t.desc));
  l.push('Envío: ' + (t.gratis ? 'gratis' : 'por confirmar'));
  l.push('Total: ' + cop(t.neto));
  return waLink(l.join('\n'));
}

/* ---------- Capas: carrito, popup y fórmula ---------- */
var focoCarrito = null, focoPromo = null, promoPendiente = false, rx = null, focoRx = null;
function carritoAbierto() { return $('#drawer').classList.contains('on'); }
function bloquear() { document.body.classList.toggle('lock', carritoAbierto() || !$('#promo').hidden || !$('#rx').hidden); }
function abrirCarrito() {
  var d = $('#drawer');
  if (!$('#promo').hidden) cerrarPromo(true);
  if (!carritoAbierto()) focoCarrito = document.activeElement;
  d.removeAttribute('inert'); d.setAttribute('aria-hidden', 'false'); d.classList.add('on');
  $('#scrim').classList.add('on');
  bloquear();
  setTimeout(function () { $('#drawerClose').focus({ preventScroll: true }); }, 50);
}
function cerrarCarrito() {
  var d = $('#drawer');
  if (!carritoAbierto()) return;
  d.classList.remove('on'); $('#scrim').classList.remove('on');
  d.setAttribute('aria-hidden', 'true'); d.setAttribute('inert', '');
  bloquear();
  if (focoCarrito && focoCarrito.focus) focoCarrito.focus({ preventScroll: true });
  if (promoPendiente) { promoPendiente = false; setTimeout(abrirPromo, 900); }
}
function abrirPromo() {
  if (carritoAbierto() || !$('#rx').hidden) { promoPendiente = true; return; }
  focoPromo = document.activeElement;
  $('#promo').hidden = false;
  bloquear();
  // En celular no se enfoca el correo: abriría el teclado y taparía la oferta
  var fino = window.matchMedia && matchMedia('(pointer:fine)').matches;
  setTimeout(function () { (codigo ? $('#okVer') : fino ? $('#lEmail') : $('#promoBox')).focus({ preventScroll: true }); }, 60);
}
function cerrarPromo(silencioso) {
  $('#promo').hidden = true;
  guardar('solare_popup_v1', 1);
  bloquear();
  if (!silencioso && focoPromo && focoPromo.focus) focoPromo.focus({ preventScroll: true });
}
function aplicarCodigo(c) { codigo = c; guardar('solare_codigo_v1', c); pintarCarrito(); }

/* ---------- Configurador de lentes formulados (flujo tipo Pixxiesx con un solo tipo de lente) ---------- */
function ICONO(k) { return '<span class="ico"><svg viewBox="0 0 48 48" aria-hidden="true">' + ICONOS[k] + '</svg></span>'; }
function recetaVacia() { return { od: { esf: '0', cil: '0', eje: '' }, oi: { esf: '0', cil: '0', eje: '' }, dp: '' }; }
function abrirRx(gid) {
  if (carritoAbierto()) cerrarCarrito();
  if (!$('#promo').hidden) cerrarPromo(true);
  rx = { gid: gid, color: sel[gid].color, tipo: null, modo: null, paso: 1, receta: recetaVacia(), archivo: null, file: null, prev: null };
  focoRx = document.activeElement;
  $('#rx').hidden = false;
  bloquear();
  pintarRx();
  setTimeout(function () { $('#rxBox').focus({ preventScroll: true }); }, 50);
}
function cerrarRx() {
  $('#rx').hidden = true;
  bloquear();
  if (rx && rx.prev) URL.revokeObjectURL(rx.prev);
  if (focoRx && focoRx.focus) focoRx.focus({ preventScroll: true });
}
function opcionesNum(desde, hasta, paso, actual) {
  var h = '';
  for (var v = desde; v >= hasta - 1e-9; v -= paso) {
    var s = (Math.round(v * 100) / 100).toFixed(2);
    h += '<option value="' + s + '"' + (Number(s) === Number(actual) ? ' selected' : '') + '>' + (v > 0 ? '+' : '') + s + '</option>';
  }
  return h;
}
function transponer(o) { var esf = Number(o.esf), cil = Number(o.cil); return cil > 0 ? { esf: esf + cil, cil: -cil } : { esf: esf, cil: cil }; }
// '' = bien, 'fuera' = fuera de rango, otro texto = dato faltante
function revisarOjo(nombre, o) {
  var R = FORMULA.rango, t = transponer(o);
  if (Number(o.cil) !== 0 && !(o.eje !== '' && +o.eje >= 0 && +o.eje <= 180)) return 'Escribe el eje del ' + nombre + ' (0 a 180). Está junto al cilindro en tu fórmula.';
  if (t.esf < R.esfMin || t.esf > R.esfMax || t.cil < R.cilMin || t.esf + t.cil < R.sumaMin) return 'fuera';
  return '';
}
function revisarReceta() {
  if (rx.modo === 'despues') return { ok: true };
  if (rx.modo === 'archivo') return { ok: !!rx.archivo };
  if (rx.modo !== 'manual') return { ok: false };
  var r = rx.receta, R = FORMULA.rango;
  var a = revisarOjo('ojo derecho', r.od), b = revisarOjo('ojo izquierdo', r.oi);
  var dpFuera = r.dp && r.dp !== 'nose' && (+r.dp < R.dpMin || +r.dp > R.dpMax);
  if (a === 'fuera' || b === 'fuera' || dpFuera) return { ok: false, msg: 'Esta fórmula está fuera del rango que tallamos a precio único. <a href="' + waLink('Hola Solare, quiero saber si pueden tallar mi fórmula en unas gafas deportivas.') + '" target="_blank" rel="noopener">Escríbenos por WhatsApp</a> y te la cotizamos.' };
  if (a || b) return { ok: false, msg: a || b };
  if (+r.od.esf === 0 && +r.od.cil === 0 && +r.oi.esf === 0 && +r.oi.cil === 0) return { ok: false, msg: 'Tu fórmula quedó en 0.00 en los dos ojos. Revisa los valores o elige otra opción.' };
  return { ok: true };
}
function pintarRx() {
  var g = gafa(rx.gid), c = colorDe(g, rx.color);
  $('#rxPaso').textContent = 'Paso ' + (rx.tipo === 'clip' && rx.paso === 3 ? 2 : rx.paso) + ' de ' + (rx.tipo === 'clip' ? 2 : 3);
  $('#rxAtras').style.visibility = rx.paso > 1 ? 'visible' : 'hidden';
  var h = '';
  if (rx.paso === 1) {
    h = '<h2 id="rxTitulo">¿Cómo quieres tu fórmula?</h2><p class="rx-sub">' + g.marca + ' ' + g.nombre + ' · ' + c.nombre + '</p>' +
      ['clip', 'lab'].map(function (k) {
        var f = FORMULA[k];
        return '<button class="rx-op" type="button" data-rxtipo="' + k + '" aria-pressed="' + (rx.tipo === k) + '">' + ICONO(k) +
          '<span><span class="t">' + (k === 'lab' ? 'Lentes formulados Solare' : f.nombre) + '</span><span class="d">' + f.desc + '</span></span><span class="mas">+' + cop(f.precio) + '</span></button>';
      }).join('') +
      '<p class="rx-rango">Tallamos a precio único fórmulas de visión sencilla con esfera de ' + fmtD(FORMULA.rango.esfMin) + ' a ' + fmtD(FORMULA.rango.esfMax) + ' y cilindro hasta ' + fmtD(FORMULA.rango.cilMin) + '.</p>';
  } else if (rx.paso === 2) {
    var modos = [['archivo', 'Subir foto o archivo', 'Una foto clara de tu fórmula médica.'], ['manual', 'Ingresarla a mano', 'Esfera, cilindro y eje de cada ojo.'], ['despues', 'Enviarla después por WhatsApp', 'Terminas la compra y nos la mandas por el chat.']];
    h = '<h2 id="rxTitulo">Agrega tu fórmula</h2><p class="rx-sub">No tallamos nada hasta revisarla. Tu fórmula es un dato sensible: solo la usamos para tus lentes (<a href="/privacidad.html#sensibles" target="_blank" rel="noopener">ver política</a>).</p>' +
      modos.map(function (m) {
        return '<button class="rx-op" type="button" data-rxmodo="' + m[0] + '" aria-pressed="' + (rx.modo === m[0]) + '">' + ICONO(m[0]) +
          '<span><span class="t">' + m[1] + '</span><span class="d">' + m[2] + '</span></span><span></span></button>' + (rx.modo === m[0] ? panelModo(m[0]) : '');
      }).join('') + '<p class="rx-err" id="rxErr" hidden></p>';
  } else {
    var f = FORMULA[rx.tipo];
    var det = rx.tipo === 'lab' ? rxDetalle({ tipo: 'lab', modo: rx.modo, receta: rx.receta, archivo: rx.archivo && rx.archivo.nombre }, false) : 'Para montar tus lentes en tu óptica.';
    h = '<h2 id="rxTitulo">Revisa y agrega</h2><div class="rx-resumen">' +
      '<div class="rx-res"><span class="ico"><img src="' + foto(g, rx.color, 'mini') + '" alt=""></span><span><h3>' + g.marca + ' ' + g.nombre + '</h3><p>Color ' + c.nombre + '</p></span><span class="mono">' + cop(g.precio) + '</span></div>' +
      '<div class="rx-res">' + ICONO(rx.tipo) + '<span><h3>' + f.nombre + '</h3><p>' + det + '</p></span><span class="mono">' + cop(f.precio) + '</span></div>' +
      '<div class="rx-res">' + ICONO('regalo') + '<span><h3>' + REGALO.nombre + '</h3><p>Te lo regalamos por tu compra: ' + REGALO.incluye.toLowerCase() + '.</p></span><span class="gratis">Gratis</span></div></div>';
  }
  $('#rxBody').innerHTML = h;
  $('#rxBody').scrollTop = 0;
  pintarRxPie();
}
function panelModo(m) {
  if (m === 'archivo') {
    return '<div class="rx-extra"><label class="rx-file">' + (rx.prev ? '<img src="' + rx.prev + '" alt="Vista previa de tu fórmula">' : '') +
      '<b>' + (rx.archivo ? rx.archivo.nombre : 'Toca para elegir la foto o el PDF') + '</b><span class="rx-rango">' + (rx.archivo ? 'Toca para cambiarla' : 'JPG, PNG o PDF') + '</span>' +
      '<input type="file" id="rxFile" accept="image/*,application/pdf"></label>' +
      (FORMULA_WEBHOOK ? '' : '<p class="rx-rango">Al finalizar la compra, adjunta esta misma foto en el chat de WhatsApp para que el laboratorio la revise.</p>') + '</div>';
  }
  if (m === 'manual') {
    var r = rx.receta;
    var fila = function (lbl, k, o) {
      return '<div class="rx-fila"><b title="' + (k === 'od' ? 'Ojo derecho' : 'Ojo izquierdo') + '">' + lbl + '</b>' +
        '<select id="' + k + 'Esf" data-ojo="' + k + '" data-campo="esf" aria-label="Esfera ' + lbl + '">' + opcionesNum(8, -12, .25, o.esf) + '</select>' +
        '<select id="' + k + 'Cil" data-ojo="' + k + '" data-campo="cil" aria-label="Cilindro ' + lbl + '">' + opcionesNum(6, -6, .25, o.cil) + '</select>' +
        '<input type="text" id="' + k + 'Eje" data-ojo="' + k + '" data-campo="eje" inputmode="numeric" maxlength="3" placeholder="0–180" value="' + o.eje + '" aria-label="Eje ' + lbl + '"></div>';
    };
    var dps = '<option value="">Elige</option><option value="nose"' + (r.dp === 'nose' ? ' selected' : '') + '>No la sé</option>';
    for (var d = 50; d <= 80; d++) dps += '<option value="' + d + '"' + (String(d) === r.dp ? ' selected' : '') + '>' + d + ' mm</option>';
    return '<div class="rx-extra"><div class="rx-tabla" role="group" aria-label="Fórmula"><div class="rx-fila rx-enc"><span></span><span>Esfera</span><span>Cilindro</span><span>Eje</span></div>' +
      fila('OD', 'od', r.od) + fila('OI', 'oi', r.oi) + '</div>' +
      '<label class="rx-dp">Distancia pupilar (DP)<select id="rxDp" data-campo="dp">' + dps + '</select></label>' +
      '<p class="rx-rango">OD es el ojo derecho y OI el izquierdo. Si no conoces tu DP, te ayudamos a medirla por WhatsApp.</p></div>';
  }
  return '<div class="rx-extra"><p class="rx-rango" style="margin:0">Al finalizar la compra se abre WhatsApp con tu pedido. Ahí nos envías la foto de tu fórmula y empezamos el tallado cuando la revisemos.</p></div>';
}
function pintarRxPie() {
  var g = gafa(rx.gid), f = rx.tipo ? FORMULA[rx.tipo] : null;
  $('#rxMarco').textContent = cop(g.precio);
  $('#rxLenteRow').hidden = !f;
  if (f) { $('#rxLenteLbl').textContent = f.corto; $('#rxLente').textContent = cop(f.precio); }
  $('#rxTotal').textContent = cop(g.precio + (f ? f.precio : 0));
  var b = $('#rxSiguiente'), ok = false;
  if (rx.paso === 1) ok = !!rx.tipo;
  else if (rx.paso === 2) {
    var v = revisarReceta(), err = $('#rxErr');
    ok = v.ok;
    if (err) { err.hidden = !v.msg; err.innerHTML = v.msg || ''; }
  } else ok = true;
  b.disabled = !ok;
  b.textContent = rx.paso === 3 ? 'Agregar al carrito · ' + cop(g.precio + f.precio) : 'Continuar';
}
function agregarCombo(gid) {
  $$('[data-combo="' + gid + '"]:checked').forEach(function (c) { agregar('acc', c.value, '', false); c.checked = false; });
}
function agregarDesdeRx() {
  var r = { tipo: rx.tipo };
  if (rx.tipo === 'lab') {
    r.modo = rx.modo;
    if (rx.modo === 'manual') r.receta = JSON.parse(JSON.stringify(rx.receta));
    if (rx.modo === 'archivo') {
      r.archivo = rx.archivo.nombre;
      if (FORMULA_WEBHOOK && rx.file) {
        var fd = new FormData();
        fd.append('archivo', rx.file); fd.append('gafa', rx.gid); fd.append('color', rx.color); fd.append('fecha', new Date().toISOString());
        try { fetch(FORMULA_WEBHOOK, { method: 'POST', mode: 'no-cors', body: fd }).catch(function () {}); } catch (e) {}
      }
    }
  }
  var gid = rx.gid, color = rx.color;
  cerrarRx();
  agregar('gafa', gid, color, false, r);
  agregarCombo(gid);
  abrirCarrito();
}

/* ---------- Eventos ---------- */
function conectarEventos() {
  document.addEventListener('click', function (e) {
    var t = e.target, b;
    if ((b = t.closest('[data-c][data-p]'))) { elegirColor(b.dataset.p, b.dataset.c); return; }
    if ((b = t.closest('.thumb'))) { elegirVista(b.dataset.p, b.dataset.vista); return; }
    if ((b = t.closest('[data-paso]'))) { pasoVista(b.dataset.p, Number(b.dataset.paso)); return; }
    if ((b = t.closest('[data-comprar]'))) { var gid = b.dataset.comprar; agregar('gafa', gid, sel[gid].color, false); agregarCombo(gid); abrirCarrito(); return; }
    if ((b = t.closest('[data-rx]'))) { abrirRx(b.dataset.rx); return; }
    if ((b = t.closest('[data-acc]'))) { agregar('acc', b.dataset.acc, '', !b.closest('#drawer')); return; }
    if (t.closest('[data-promo]')) { abrirPromo(); return; }
  });
  // Deslizar sobre la foto grande cambia de vista
  $$('.pdp').forEach(function (pdp) {
    var x0 = null;
    pdp.addEventListener('touchstart', function (e) { if (e.target.closest('.stage')) x0 = e.touches[0].clientX; }, { passive: true });
    pdp.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, img = $('img[data-stage]', pdp); x0 = null;
      if (Math.abs(dx) > 40 && img) pasoVista(img.dataset.stage, dx < 0 ? 1 : -1);
    });
  });
  $('#cartBtn').addEventListener('click', abrirCarrito);
  $('#drawerClose').addEventListener('click', cerrarCarrito);
  $('#scrim').addEventListener('click', cerrarCarrito);
  $('#seguir').addEventListener('click', cerrarCarrito);
  $('#items').addEventListener('click', function (e) {
    var li = e.target.closest('.item'); if (!li) return;
    var idx = -1;
    carrito.forEach(function (x, i) { if (x.k === li.dataset.k) idx = i; });
    if (idx < 0) return;
    var q = e.target.closest('[data-q]');
    if (q) carrito[idx].n = Math.max(1, Math.min(10, carrito[idx].n + Number(q.dataset.q)));
    else if (e.target.closest('[data-del]')) carrito.splice(idx, 1);
    else return;
    guardarCarrito(); pintarCarrito();
    if (!carrito.length) $('#drawerClose').focus({ preventScroll: true });
  });
  $('#track').addEventListener('scroll', flechas, { passive: true });
  $('#antPrev').addEventListener('click', function () { $('#track').scrollBy({ left: -$('#track').clientWidth * .8, behavior: 'smooth' }); });
  $('#antNext').addEventListener('click', function () { $('#track').scrollBy({ left: $('#track').clientWidth * .8, behavior: 'smooth' }); });
  $('#terms').addEventListener('change', function () { $('#pagar').classList.toggle('soft', !this.checked); if (this.checked) $('#termsErr').hidden = true; });
  $('#pagar').addEventListener('click', function (e) {
    if ($('#terms').checked) return;
    e.preventDefault();
    $('#termsErr').hidden = false;
    var box = $('#termsBox'); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
    $('#terms').focus();
  });
  $('#codeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#codeIn').value.trim().toUpperCase(), msg = $('#codeMsg');
    if (v === BIENVENIDA.codigo) { msg.hidden = true; $('#codeIn').value = ''; aplicarCodigo(v); }
    else { msg.textContent = v ? 'Ese código no existe o ya venció. Revisa cómo lo escribiste.' : 'Escribe un código para aplicarlo.'; msg.hidden = false; }
  });
  $('#codeOff').addEventListener('click', function () { aplicarCodigo(''); });
  // Popup
  $('#promoClose').addEventListener('click', function () { cerrarPromo(); });
  $('#noGracias').addEventListener('click', function () { cerrarPromo(); });
  $('#promo').addEventListener('click', function (e) { if (e.target === $('#promo')) cerrarPromo(); });
  $('#okVer').addEventListener('click', function () { cerrarPromo(true); if (document.body.dataset.pagina === 'inicio') location.href = '/deportivas/'; });
  $('#copyCode').addEventListener('click', function () {
    var b = this;
    function ok() { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1600); }
    function seleccionar() { var r = document.createRange(); r.selectNodeContents($('#okCode')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    try { navigator.clipboard.writeText(BIENVENIDA.codigo).then(ok, seleccionar); } catch (err) { seleccionar(); }
  });
  $$('#lY,#lM,#lD,#lTel').forEach(function (el) {
    el.addEventListener('input', function () {
      this.value = this.value.replace(this.id === 'lTel' ? /[^\d ]/g : /\D/g, '');
      if (this.id !== 'lTel' && this.value.length === this.maxLength) { var sig = { lY: '#lM', lM: '#lD' }[this.id]; if (sig) $(sig).focus(); }
    });
  });
  $('#leadForm').addEventListener('submit', enviarLead);
  // Fórmula
  $('#rx').addEventListener('click', function (e) {
    var b;
    if (e.target === $('#rx')) { cerrarRx(); return; }
    if ((b = e.target.closest('[data-rxtipo]'))) { rx.tipo = b.dataset.rxtipo; pintarRx(); return; }
    if ((b = e.target.closest('[data-rxmodo]'))) { rx.modo = b.dataset.rxmodo; pintarRx(); }
  });
  $('#rx').addEventListener('change', function (e) {
    var el = e.target;
    if (el.id === 'rxFile' && el.files && el.files[0]) {
      var f = el.files[0];
      if (rx.prev) URL.revokeObjectURL(rx.prev);
      rx.file = f; rx.archivo = { nombre: f.name };
      rx.prev = /^image\//.test(f.type) ? URL.createObjectURL(f) : null;
      pintarRx(); return;
    }
    if (el.dataset.campo === 'dp') rx.receta.dp = el.value;
    else if (el.dataset.ojo) rx.receta[el.dataset.ojo][el.dataset.campo] = el.value;
    pintarRxPie();
  });
  $('#rx').addEventListener('input', function (e) {
    var el = e.target;
    if (el.dataset.campo === 'eje') { el.value = el.value.replace(/\D/g, ''); rx.receta[el.dataset.ojo].eje = el.value; pintarRxPie(); }
  });
  $('#rxCerrar').addEventListener('click', cerrarRx);
  $('#rxAtras').addEventListener('click', function () { rx.paso = rx.paso === 3 ? (rx.tipo === 'clip' ? 1 : 2) : 1; pintarRx(); });
  $('#rxSiguiente').addEventListener('click', function () {
    if (this.disabled) return;
    if (rx.paso === 1) rx.paso = rx.tipo === 'clip' ? 3 : 2;
    else if (rx.paso === 2) rx.paso = 3;
    else { agregarDesdeRx(); return; }
    pintarRx();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#rx').hidden) cerrarRx();
    else if (!$('#promo').hidden) cerrarPromo();
    else if (carritoAbierto()) cerrarCarrito();
  });
}
function fechaValida(y, m, d) {
  if (!/^\d{4}$/.test(y) || !m || !d) return false;
  var f = new Date(+y, +m - 1, +d), hoy = new Date();
  return f.getFullYear() === +y && f.getMonth() === +m - 1 && f.getDate() === +d && +y > hoy.getFullYear() - 100 && f < hoy;
}
function enviarLead(e) {
  e.preventDefault();
  var email = $('#lEmail').value.trim(), y = $('#lY').value, m = $('#lM').value, d = $('#lD').value;
  var tel = $('#lTel').value.replace(/\D/g, ''), err = '', campo = null;
  $$('#leadForm .in').forEach(function (i) { i.removeAttribute('aria-invalid'); });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err = 'Revisa tu correo: parece incompleto.'; campo = '#lEmail'; }
  else if ((y || m || d) && !fechaValida(y, m, d)) { err = 'Revisa tu fecha de cumpleaños: año de 4 dígitos, mes y día.'; campo = !/^\d{4}$/.test(y) ? '#lY' : !m ? '#lM' : '#lD'; }
  else if (!/^3\d{9}$/.test(tel)) { err = 'Escribe tu celular de 10 dígitos. Empieza por 3.'; campo = '#lTel'; }
  else if (!$('#lOk').checked) { err = 'Marca la autorización para poder darte el código.'; campo = '#lOk'; }
  var box = $('#leadErr');
  if (err) { box.textContent = err; box.hidden = false; if (campo !== '#lOk') $(campo).setAttribute('aria-invalid', 'true'); $(campo).focus(); return; }
  box.hidden = true;
  var lead = { email: email, cumpleanos: y ? y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2) : '', celular: '+57' + tel, autoriza: true, fecha: new Date().toISOString(), pagina: location.href };
  guardar('solare_lead_v1', lead);
  if (LEADS_WEBHOOK) { try { fetch(LEADS_WEBHOOK, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(lead) }).catch(function () {}); } catch (x) {} }
  aplicarCodigo(BIENVENIDA.codigo);
  $('#leadForm').hidden = true; $('#leadOk').hidden = false; $('#okVer').focus();
}

/* ---------- Barra fija del producto ---------- */
function iniciarSubnav() {
  var sn = $('#subnav'), ancla = $('#inicio .hero-buy');
  if (!sn || !ancla || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) {
    var on = !es[0].isIntersecting && es[0].boundingClientRect.top < 0;
    sn.classList.toggle('on', on);
    sn.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) sn.removeAttribute('inert'); else sn.setAttribute('inert', '');
  }, { rootMargin: '-80px 0px 0px 0px', threshold: .15 }).observe(ancla);
}

/* ---------- Inicio ---------- */
(function iniciar() {
  var b = document.body, pagina = b.dataset.pagina, app = $('#app');
  var cat = pagina === 'categoria' ? categoria(b.dataset.categoria) : null;
  var g = pagina === 'producto' ? gafa(b.dataset.producto) : null;
  if (g) cat = categoria(g.categoria);
  app.insertAdjacentHTML('beforebegin', marcoArriba(pagina, pagina === 'categoria' ? cat : null, g));
  app.innerHTML = g ? paginaProducto(g) : cat ? paginaCategoria(cat) : paginaInicio();
  app.insertAdjacentHTML('afterend', marcoAbajo());
  pintarComunes();
  pintarAnuncio();
  conectarEventos();
  pintarCarrito();
  if (g) { animarPeso(g.peso); iniciarComparador(); iniciarSubnav(); }
  if (codigo) { $('#leadForm').hidden = true; $('#leadOk').hidden = false; }
  if (!leer('solare_popup_v1', 0) && !codigo) setTimeout(abrirPromo, POPUP_ESPERA_MS);
  // Precarga las fotos de los colores de esta página cuando ya está quieta, para que cambiar de color sea instantáneo
  window.addEventListener('load', function () {
    var cola = [], lista = g ? [g] : cat ? gafasDe(cat.id) : gafasDe('deportivas');
    lista.forEach(function (x) { x.colores.forEach(function (c) { (g ? x.vistas : [['frente']]).forEach(function (v) { cola.push(foto(x, c.id, v[0])); }); }); });
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    idle(function () { cola.forEach(function (s) { var i = new Image(); i.src = s; }); });
  });
})();
