const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// ── 1. Modal: agregar campos N° Serie y Estado Físico ──────────────────────────
c = c.replace(
  '            <input type="hidden" id="ma-item-val"/>\n' +
  '          </div>\n' +
  '        </div>\n' +
  '        <div class="fg full"><label>Observaciones</label><textarea id="ma-obs" rows="2"></textarea></div>',
  '            <input type="hidden" id="ma-item-val"/>\n' +
  '          </div>\n' +
  '        </div>\n' +
  '        <div class="fg">\n' +
  '          <label>N° de Serie / S·N</label>\n' +
  '          <input type="text" id="ma-serie" readonly placeholder="Se auto-completa al seleccionar el ítem" style="background:#f8fafc;color:#555"/>\n' +
  '        </div>\n' +
  '        <div class="fg">\n' +
  '          <label>Estado Físico *</label>\n' +
  '          <select id="ma-estado-fisico">\n' +
  '            <option value="">— Seleccionar —</option>\n' +
  '            <option>Nuevo</option>\n' +
  '            <option>Buen Estado</option>\n' +
  '            <option>Regular</option>\n' +
  '            <option>Mal Estado</option>\n' +
  '            <option>Dañado</option>\n' +
  '          </select>\n' +
  '        </div>\n' +
  '        <div class="fg full"><label>Observaciones</label><textarea id="ma-obs" rows="2"></textarea></div>'
);

// ── 2. seleccionarItemDD: auto-rellenar ma-serie al seleccionar ítem ───────────
c = c.replace(
  '  } else if (prefix === \'ma\') {\n' +
  '    mostrarAlertaStock(\'alerta-asig\', it.cantidad_disponible || 0);\n' +
  '  } else {',
  '  } else if (prefix === \'ma\') {\n' +
  '    mostrarAlertaStock(\'alerta-asig\', it.cantidad_disponible || 0);\n' +
  '    document.getElementById(\'ma-serie\').value = it.serie_sn || \'\';\n' +
  '  } else {'
);

// ── 3. abrirModalAsignacion: limpiar nuevos campos ────────────────────────────
c = c.replace(
  '  document.getElementById(\'alerta-asig\').style.display    = \'none\';\n' +
  '  abrir(\'modal-asignacion\');',
  '  document.getElementById(\'alerta-asig\').style.display    = \'none\';\n' +
  '  document.getElementById(\'ma-serie\').value         = \'\';\n' +
  '  document.getElementById(\'ma-estado-fisico\').value = \'\';\n' +
  '  abrir(\'modal-asignacion\');'
);

// ── 4. guardarAsignacion: leer estado físico + serie, añadirlos al payload ────
c = c.replace(
  '  var btn = document.getElementById(\'btn-guardar-asignacion\');\n' +
  '  btn.disabled = true; btn.textContent = \'Guardando…\';\n' +
  '\n' +
  '  var foto_url = null;',
  '  var estadoFisico = document.getElementById(\'ma-estado-fisico\').value;\n' +
  '  var serieSn      = document.getElementById(\'ma-serie\').value.trim();\n' +
  '\n' +
  '  var btn = document.getElementById(\'btn-guardar-asignacion\');\n' +
  '  btn.disabled = true; btn.textContent = \'Guardando…\';\n' +
  '\n' +
  '  var foto_url = null;'
);

// ── 5. guardarAsignacion: agregar estado_entregar al payload ──────────────────
c = c.replace(
  '    observaciones:     document.getElementById(\'ma-obs\').value.trim() || null,\n' +
  '    foto_url:          foto_url,\n' +
  '    usuario_email:     currentUser ? (currentUser.email || null) : null,\n' +
  '  };',
  '    observaciones:     document.getElementById(\'ma-obs\').value.trim() || null,\n' +
  '    foto_url:          foto_url,\n' +
  '    estado_entregar:   estadoFisico || null,\n' +
  '    usuario_email:     currentUser ? (currentUser.email || null) : null,\n' +
  '  };'
);

// ── 6. guardarAsignacion: actualizar historial del ítem al asignar ─────────────
c = c.replace(
  '  // Descontar disponible y marcar En Uso\n' +
  '  if (itSel) {\n' +
  '    await sb.from(\'inventario_items\').update({\n' +
  '      estado: \'En Uso\',\n' +
  '      cantidad_disponible: Math.max(0, dispActual - 1)\n' +
  '    }).eq(\'id\', itemId);\n' +
  '  }',
  '  // Descontar disponible, marcar En Uso y registrar en historial\n' +
  '  if (itSel) {\n' +
  '    var cargo = document.getElementById(\'ma-cargo\').value.trim();\n' +
  '    var cambiosAsig = [\n' +
  '      { campo: \'Asignado a\', antes: null, despues: trab + (cargo ? \' (\' + cargo + \')\' : \'\') },\n' +
  '      { campo: \'Fecha asignación\', antes: null, despues: fecha },\n' +
  '    ];\n' +
  '    if (estadoFisico) cambiosAsig.push({ campo: \'Estado físico\', antes: null, despues: estadoFisico });\n' +
  '    if (serieSn)      cambiosAsig.push({ campo: \'N° Serie\', antes: null, despues: serieSn });\n' +
  '    var entradaAsig = { fecha: new Date().toISOString(), usuario: currentUser ? (currentUser.email || \'?\') : \'?\', cambios: cambiosAsig };\n' +
  '    var histAsig = [entradaAsig].concat(itSel.historial || []).slice(0, 50);\n' +
  '    await sb.from(\'inventario_items\').update({\n' +
  '      estado: \'En Uso\',\n' +
  '      cantidad_disponible: Math.max(0, dispActual - 1),\n' +
  '      historial: histAsig\n' +
  '    }).eq(\'id\', itemId);\n' +
  '  }'
);

// ── 7. liberarAsignacion: registrar devolución en historial ───────────────────
c = c.replace(
  '  if (itemId) {\n' +
  '    const it = items.find(function(x){ return x.id === itemId; });\n' +
  '    await sb.from(\'inventario_items\').update({\n' +
  '      estado: \'Disponible\',\n' +
  '      cantidad_disponible: (it ? (it.cantidad_disponible || 0) : 0) + 1\n' +
  '    }).eq(\'id\', itemId);\n' +
  '  }\n' +
  '  await Promise.all([cargarItems(), cargarMovs()]);\n' +
  '  renderEntrega(); renderSalida(); renderAsignaciones(); renderHistorialMovimientos();\n' +
  '}',
  '  if (itemId) {\n' +
  '    const it = items.find(function(x){ return x.id === itemId; });\n' +
  '    var entradaLib = { fecha: new Date().toISOString(), usuario: currentUser ? (currentUser.email || \'?\') : \'?\', cambios: [{ campo: \'Devolución\', antes: \'En Uso\', despues: \'Disponible — \' + desc }] };\n' +
  '    var histLib = [entradaLib].concat(it ? (it.historial || []) : []).slice(0, 50);\n' +
  '    await sb.from(\'inventario_items\').update({\n' +
  '      estado: \'Disponible\',\n' +
  '      cantidad_disponible: (it ? (it.cantidad_disponible || 0) : 0) + 1,\n' +
  '      historial: histLib\n' +
  '    }).eq(\'id\', itemId);\n' +
  '  }\n' +
  '  await Promise.all([cargarItems(), cargarMovs()]);\n' +
  '  renderEntrega(); renderSalida(); renderAsignaciones(); renderHistorialMovimientos();\n' +
  '}'
);

// ── 8. renderAsignaciones: mostrar serie y estado físico en columna Ítem ───────
c = c.replace(
  '  tb.innerHTML = asigs.map(function(m) {\n' +
  '    const itmInfo = m.descripcion || \'—\';\n' +
  '    const itmSub  = (m.correlativo ? \'Corr. \' + m.correlativo : \'\') + (m.correlativo && m.categoria ? \' · \' : \'\') + (m.categoria || \'\');\n' +
  '    return \'<tr>\' +\n' +
  '      \'<td>\' + ff(m.fecha) + \'</td>\' +\n' +
  '      \'<td><strong>\' + (m.nombre_trabajador || \'—\') + \'</strong>\' +\n' +
  '        (m.rut_trabajador ? \'<br><small style="color:#888">\' + m.rut_trabajador + \'</small>\' : \'\') + \'</td>\' +\n' +
  '      \'<td>\' + (m.cargo_trabajador || \'—\') + \'</td>\' +\n' +
  '      \'<td><strong>\' + itmInfo + \'<\\strong>\' + (itmSub ? \'<br><small style="color:#888">\' + itmSub + \'</small>\' : \'\') + \'</td>\' +\n' +
  '      \'<td>\' + (m.categoria ? \'<span class="badge b-info">\' + m.categoria + \'<\\span>\' : \'—\') + \'</td>\' +',
  '  tb.innerHTML = asigs.map(function(m) {\n' +
  '    const itmInfo = m.descripcion || \'—\';\n' +
  '    const itmSub  = (m.correlativo ? \'Corr. \' + m.correlativo : \'\') + (m.correlativo && m.categoria ? \' · \' : \'\') + (m.categoria || \'\');\n' +
  '    const itAsig  = m.item_id ? items.find(function(x){ return x.id === m.item_id; }) : null;\n' +
  '    const serieMov = itAsig ? (itAsig.serie_sn || \'\') : \'\';\n' +
  '    const estadoMov = m.estado_entregar || \'\';\n' +
  '    const itmExtra = [serieMov ? \'S/N: \' + serieMov : \'\', estadoMov ? \'Estado: \' + estadoMov : \'\'].filter(Boolean).join(\' · \');\n' +
  '    return \'<tr>\' +\n' +
  '      \'<td>\' + ff(m.fecha) + \'</td>\' +\n' +
  '      \'<td><strong>\' + (m.nombre_trabajador || \'—\') + \'</strong>\' +\n' +
  '        (m.rut_trabajador ? \'<br><small style="color:#888">\' + m.rut_trabajador + \'</small>\' : \'\') + \'</td>\' +\n' +
  '      \'<td>\' + (m.cargo_trabajador || \'—\') + \'</td>\' +\n' +
  '      \'<td><strong>\' + itmInfo + \'<\\/strong>\' + (itmSub ? \'<br><small style="color:#888">\' + itmSub + \'</small>\' : \'\') + (itmExtra ? \'<br><small style="color:#1a3a5c;font-weight:600">\' + itmExtra + \'</small>\' : \'\') + \'</td>\' +\n' +
  '      \'<td>\' + (m.categoria ? \'<span class="badge b-info">\' + m.categoria + \'<\\/span>\' : \'—\') + \'</td>\' +'
);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch12 OK');
