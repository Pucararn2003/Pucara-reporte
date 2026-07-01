const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// ── 1. Tab button ──────────────────────────────────────────────────────────────
c = c.replace(
  '<button class="tab-btn" onclick="switchTab(\'salida\',this)">🔧 Salida Insumos</button>',
  '<button class="tab-btn" onclick="switchTab(\'salida\',this)">🔧 Salida Insumos</button>\n    <button class="tab-btn" onclick="switchTab(\'asignacion\',this)">📌 Asignaciones</button>'
);

// ── 2. Tab panel (antes del Dashboard) ────────────────────────────────────────
const TAB_ASIG = `
  <!-- ── TAB: Asignaciones ── -->
  <div id="tab-asignacion" class="tab-panel">
    <div class="stats-row">
      <div class="stat-card"><div class="val" id="st-asig-total">0</div><div class="lbl">Asignaciones activas</div></div>
    </div>
    <div class="toolbar" style="gap:8px">
      <button class="btn" style="background:#7b1fa2;color:#fff;border:none" onclick="abrirModalAsignacion()">📌 Registrar Asignación</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Fecha</th><th>Trabajador</th><th>Cargo</th><th>Ítem</th><th>Categoría</th>
          <th>Foto</th><th>Responsable</th><th>Observaciones</th><th></th>
        </tr></thead>
        <tbody id="tb-asig"><tr><td colspan="9" style="text-align:center;color:#999;padding:30px">Cargando…</td></tr></tbody>
      </table>
    </div>
  </div>

`;

c = c.replace('  <!-- ── TAB: Dashboard ── -->', TAB_ASIG + '  <!-- ── TAB: Dashboard ── -->');

// ── 3. Modal Asignación (antes del MODAL: PDF) ────────────────────────────────
const MODAL_ASIG = `
<!-- ══════════════════════════════════════
     MODAL: Asignación
══════════════════════════════════════ -->
<div class="modal-bd" id="modal-asignacion">
  <div class="modal">
    <div class="mhdr">
      <h3>📌 Registrar Asignación de Ítem</h3>
      <button class="mclose" onclick="cerrar('modal-asignacion')">✕</button>
    </div>
    <div class="mbody">
      <div id="alerta-asig" class="alert alert-warn" style="display:none"></div>
      <div class="fgrid">
        <div class="fg"><label>Fecha *</label><input type="date" id="ma-fecha"/></div>
        <div class="fg">
          <label>Responsable</label>
          <select id="ma-resp"><option value="">Seleccionar…</option></select>
        </div>
        <div class="fg full">
          <label>Trabajador asignado *</label>
          <div class="item-search-wrap">
            <input type="text" id="ma-trab" placeholder="🔍 Buscar o escribir nombre del trabajador..."
                   oninput="filtrarTrabA()" onfocus="filtrarTrabA()" autocomplete="off"
                   onblur="setTimeout(()=>{const l=document.getElementById('ma-trab-list');if(l)l.style.display='none'},160)"/>
            <div id="ma-trab-list" class="item-dropdown"></div>
          </div>
        </div>
        <div class="fg"><label>RUT</label><input type="text" id="ma-rut" placeholder="12.345.678-9"/></div>
        <div class="fg"><label>Cargo</label><input type="text" id="ma-cargo" placeholder="Cargo del trabajador"/></div>
        <div class="fg full">
          <label>Ítem a asignar *</label>
          <div class="item-search-wrap">
            <input type="text" id="ma-item-search" placeholder="🔍 Buscar ítem por nombre o correlativo..."
                   oninput="filtrarItems('ma')" onfocus="filtrarItems('ma')" autocomplete="off"
                   style="width:100%;padding:9px 12px;border:1px solid #cdd8e3;border-radius:7px;font-size:14px;outline:none"/>
            <div id="ma-item-list" class="item-dropdown"></div>
            <input type="hidden" id="ma-item-val"/>
          </div>
        </div>
        <div class="fg full"><label>Observaciones</label><textarea id="ma-obs" rows="2"></textarea></div>
        <div class="fg full">
          <label>Foto de asignación</label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input type="file" id="ma-foto-file" accept="image/*" capture="environment" onchange="previewFotoA(this)"
                   style="flex:1;min-width:0;padding:6px;border:1px solid #cdd8e3;border-radius:7px;font-size:13px"/>
            <button type="button" class="btn btn-secondary btn-sm" onclick="quitarFotoA()">✕ Quitar</button>
          </div>
          <img id="ma-foto-preview" src="" alt="preview"
               style="display:none;max-height:160px;max-width:100%;border-radius:8px;margin-top:8px;object-fit:contain;border:1px solid #eee"/>
        </div>
      </div>
    </div>
    <div class="mftr">
      <button class="btn btn-secondary" onclick="cerrar('modal-asignacion')">Cancelar</button>
      <button id="btn-guardar-asignacion" class="btn" style="background:#7b1fa2;color:#fff;border:none" onclick="guardarAsignacion()">📌 Registrar Asignación</button>
    </div>
  </div>
</div>

`;

c = c.replace(
  '<!-- ══════════════════════════════════════\n     MODAL: PDF',
  MODAL_ASIG + '<!-- ══════════════════════════════════════\n     MODAL: PDF'
);

// ── 4. Responsables IIFE: agregar ma-resp ─────────────────────────────────────
c = c.replace(
  "  document.getElementById('me-resp').innerHTML = opts;\n  document.getElementById('ms-resp').innerHTML = opts;",
  "  document.getElementById('me-resp').innerHTML = opts;\n  document.getElementById('ms-resp').innerHTML = opts;\n  document.getElementById('ma-resp').innerHTML = opts;"
);

// ── 5. seleccionarItemDD: manejar prefijo 'ma' ────────────────────────────────
c = c.replace(
  "  if (prefix === 'me') {\n    document.getElementById('me-talla').value = it.talla || '';\n    mostrarAlertaStock('alerta-epp', it.cantidad_disponible || 0);\n  } else {\n    mostrarAlertaStock('alerta-sal', it.cantidad_disponible || 0);\n  }",
  "  if (prefix === 'me') {\n    document.getElementById('me-talla').value = it.talla || '';\n    mostrarAlertaStock('alerta-epp', it.cantidad_disponible || 0);\n  } else if (prefix === 'ma') {\n    mostrarAlertaStock('alerta-asig', it.cantidad_disponible || 0);\n  } else {\n    mostrarAlertaStock('alerta-sal', it.cantidad_disponible || 0);\n  }"
);

// ── 6. switchTab: agregar caso 'asignacion' ───────────────────────────────────
c = c.replace(
  "  if (name === 'historial-movs') renderHistorialMovimientos();\n  if (name === 'dashboard') renderDashboard();",
  "  if (name === 'historial-movs') renderHistorialMovimientos();\n  if (name === 'dashboard') renderDashboard();\n  if (name === 'asignacion') renderAsignaciones();"
);

// ── 7. cargarDatos: agregar renderAsignaciones ────────────────────────────────
c = c.replace(
  "  renderEntrega();\n  renderSalida();\n  renderHistorialMovimientos();",
  "  renderEntrega();\n  renderSalida();\n  renderAsignaciones();\n  renderHistorialMovimientos();"
);

// ── 8. Funciones JS de Asignaciones (insertar antes de renderInventario) ──────
const JS_ASIG = `
// ── Render Asignaciones ───────────────────────────────────────
function renderAsignaciones() {
  const asigs = movs.filter(function(m){ return m.tipo === 'asignacion'; });
  const stEl = document.getElementById('st-asig-total');
  if (stEl) stEl.textContent = asigs.length;
  const tb = document.getElementById('tb-asig');
  if (!tb) return;
  if (!asigs.length) {
    tb.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#999;padding:30px">Sin asignaciones activas</td></tr>';
    return;
  }
  tb.innerHTML = asigs.map(function(m) {
    const itmInfo = m.descripcion || '—';
    const itmSub  = (m.correlativo ? 'Corr. ' + m.correlativo : '') + (m.correlativo && m.categoria ? ' · ' : '') + (m.categoria || '');
    return '<tr>' +
      '<td>' + ff(m.fecha) + '</td>' +
      '<td><strong>' + (m.nombre_trabajador || '—') + '</strong>' +
        (m.rut_trabajador ? '<br><small style="color:#888">' + m.rut_trabajador + '</small>' : '') + '</td>' +
      '<td>' + (m.cargo_trabajador || '—') + '</td>' +
      '<td><strong>' + itmInfo + '</strong>' + (itmSub ? '<br><small style="color:#888">' + itmSub + '</small>' : '') + '</td>' +
      '<td>' + (m.categoria ? '<span class="badge b-info">' + m.categoria + '</span>' : '—') + '</td>' +
      '<td>' + (m.foto_url ? '<img src="' + m.foto_url + '" class="img-thumb" style="cursor:pointer" onclick="window.open(\\'' + m.foto_url + '\\')" title="Ver foto">' : '<span style="color:#bbb;font-size:11px">Sin foto</span>') + '</td>' +
      '<td>' + (m.responsable || '—') + '</td>' +
      '<td>' + (m.observaciones || '—') + '</td>' +
      '<td style="white-space:nowrap">' +
        '<button class="btn btn-warn btn-sm" onclick="liberarAsignacion(\\'' + m.id + '\\',' +
          '\\'' + (m.item_id || '') + '\\',' +
          '\\'' + (m.descripcion || '').replace(/'/g,"\\\\'") + '\\')" title="Devolver ítem">↩ Liberar</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="eliminarAsignacion(\\'' + m.id + '\\')" title="Eliminar">🗑️</button>' +
      '</td></tr>';
  }).join('');
}

// ── Trabajadores picker (asignación) ─────────────────────────
function filtrarTrabA() {
  var q    = (document.getElementById('ma-trab').value || '').toLowerCase();
  var list = document.getElementById('ma-trab-list');
  var fil  = q ? TRABAJADORES.filter(function(t){ return t.nombre.toLowerCase().includes(q) || (t.cargo||'').toLowerCase().includes(q); }) : TRABAJADORES;
  list.innerHTML = fil.length
    ? fil.map(function(t){
        return '<div class="item-dd-row" onmousedown="seleccionarTrabA(\\'' + t.nombre.replace(/'/g,"\\\\'") + '\\')">' +
          '<strong>' + t.nombre + '</strong><br><small style="color:#888">' + t.cargo + '</small></div>';
      }).join('')
    : '<div class="item-dd-row" style="color:#999">Sin coincidencias</div>';
  list.style.display = 'block';
}

function seleccionarTrabA(nombre) {
  var t = TRABAJADORES.find(function(x){ return x.nombre === nombre; });
  document.getElementById('ma-trab').value  = nombre;
  document.getElementById('ma-rut').value   = (t && t.rut)   ? t.rut   : '';
  document.getElementById('ma-cargo').value = (t && t.cargo) ? t.cargo : '';
  document.getElementById('ma-trab-list').style.display = 'none';
}

// ── Foto de asignación ────────────────────────────────────────
function previewFotoA(input) {
  var f = input.files[0];
  if (!f) return;
  var pr = document.getElementById('ma-foto-preview');
  pr.src = URL.createObjectURL(f);
  pr.style.display = 'block';
}

function quitarFotoA() {
  document.getElementById('ma-foto-file').value = '';
  var pr = document.getElementById('ma-foto-preview');
  pr.src = ''; pr.style.display = 'none';
}

async function subirFotoAsignacion(file) {
  var ext  = file.name.split('.').pop().toLowerCase();
  var path = 'asignaciones/' + Date.now() + '.' + ext;
  var res  = await sb.storage.from('inventario').upload(path, file, { upsert: true, contentType: file.type });
  if (res.error) throw new Error('Error al subir foto: ' + res.error.message);
  return sb.storage.from('inventario').getPublicUrl(path).data.publicUrl;
}

// ── Abrir modal ───────────────────────────────────────────────
function abrirModalAsignacion() {
  document.getElementById('ma-fecha').value = hoy();
  document.getElementById('ma-resp').value  = '';
  document.getElementById('ma-trab').value  = '';
  document.getElementById('ma-trab-list').style.display = 'none';
  document.getElementById('ma-rut').value   = '';
  document.getElementById('ma-cargo').value = '';
  document.getElementById('ma-item-search').value = '';
  document.getElementById('ma-item-list').style.display  = 'none';
  document.getElementById('ma-item-val').value    = '';
  document.getElementById('ma-obs').value   = '';
  document.getElementById('ma-foto-file').value   = '';
  document.getElementById('ma-foto-preview').src  = '';
  document.getElementById('ma-foto-preview').style.display = 'none';
  document.getElementById('alerta-asig').style.display    = 'none';
  abrir('modal-asignacion');
}

// ── Guardar ───────────────────────────────────────────────────
async function guardarAsignacion() {
  var fecha  = document.getElementById('ma-fecha').value;
  var trab   = document.getElementById('ma-trab').value.trim();
  var itemId = document.getElementById('ma-item-val').value;
  var itSel  = items.find(function(x){ return x.id === itemId; });

  if (!fecha)  { alert('Ingresa la fecha'); return; }
  if (!trab)   { alert('Ingresa el nombre del trabajador'); return; }
  if (!itemId) { alert('Selecciona un ítem del listado'); return; }

  var btn = document.getElementById('btn-guardar-asignacion');
  btn.disabled = true; btn.textContent = 'Guardando…';

  var foto_url = null;
  var fotoFile = document.getElementById('ma-foto-file').files[0];
  if (fotoFile) {
    try { foto_url = await subirFotoAsignacion(fotoFile); }
    catch(e) { alert(e.message); btn.disabled = false; btn.textContent = '📌 Registrar Asignación'; return; }
  }

  var payload = {
    tipo:              'asignacion',
    fecha:             fecha,
    item_id:           itemId,
    descripcion:       itSel ? (itSel.descripcion || null) : null,
    categoria:         itSel ? (itSel.categoria   || null) : null,
    correlativo:       itSel ? (itSel.correlativo || null) : null,
    nombre_trabajador: trab,
    cargo_trabajador:  document.getElementById('ma-cargo').value.trim() || null,
    rut_trabajador:    document.getElementById('ma-rut').value.trim()   || null,
    cantidad:          1,
    responsable:       document.getElementById('ma-resp').value  || null,
    observaciones:     document.getElementById('ma-obs').value.trim() || null,
    foto_url:          foto_url,
    usuario_email:     currentUser ? (currentUser.email || null) : null,
  };

  var res = await sb.from('inventario_movimientos').insert(payload);
  if (res.error) {
    alert('Error: ' + res.error.message);
    btn.disabled = false; btn.textContent = '📌 Registrar Asignación';
    return;
  }

  // Marcar ítem como En Uso
  if (itemId) {
    await sb.from('inventario_items').update({ estado: 'En Uso' }).eq('id', itemId);
  }

  cerrar('modal-asignacion');
  btn.disabled = false; btn.textContent = '📌 Registrar Asignación';
  await Promise.all([cargarItems(), cargarMovs()]);
  renderEntrega(); renderSalida(); renderAsignaciones(); renderHistorialMovimientos();
}

// ── Liberar (devolver) ────────────────────────────────────────
async function liberarAsignacion(movId, itemId, desc) {
  if (!confirm('¿Devolver "' + desc + '" y marcarlo como Disponible?')) return;
  await sb.from('inventario_movimientos').update({ tipo: 'asignacion_devuelta' }).eq('id', movId);
  if (itemId) {
    await sb.from('inventario_items').update({ estado: 'Disponible' }).eq('id', itemId);
  }
  await Promise.all([cargarItems(), cargarMovs()]);
  renderEntrega(); renderSalida(); renderAsignaciones(); renderHistorialMovimientos();
}

// ── Eliminar asignación ──────────────────────────────────────────
async function eliminarAsignacion(id) {
  if (!confirm('¿Eliminar esta asignación?')) return;
  await sb.from('inventario_movimientos').delete().eq('id', id);
  await cargarMovs();
  renderAsignaciones();
}

`;

// Insertar funciones antes de renderInventario
c = c.replace(
  '// ── Render Inventario ─────────────────────────────────────────',
  JS_ASIG + '// ── Render Inventario ─────────────────────────────────────────'
);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch10 OK');
