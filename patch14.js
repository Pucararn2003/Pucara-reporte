const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// ── 1. guardarAsignacion: leer totalActual, quitar aviso de stock ──────────────
// Reemplazar la lectura de dispActual y el confirm de stock
c = c.replace(
  '  if (!fecha)  { alert(\'Ingresa la fecha\'); return; }\n' +
  '  if (!trab)   { alert(\'Ingresa el nombre del trabajador\'); return; }\n' +
  '  if (!itemId) { alert(\'Selecciona un ítem del listado\'); return; }\n' +
  '\n' +
  '  // Advertir si no hay stock disponible\n' +
  '  var dispActual = itSel ? (itSel.cantidad_disponible || 0) : 0;\n' +
  '  if (dispActual <= 0) {\n' +
  '    if (!confirm(\'⚠️ Este ítem no tiene stock disponible (Disponible: \' + dispActual + \').\\n¿Registrar la asignación de todas formas?\')) return;\n' +
  '  }',
  '  if (!fecha)  { alert(\'Ingresa la fecha\'); return; }\n' +
  '  if (!trab)   { alert(\'Ingresa el nombre del trabajador\'); return; }\n' +
  '  if (!itemId) { alert(\'Selecciona un ítem del listado\'); return; }\n' +
  '\n' +
  '  // Asignación = unidad nueva que entra directamente al trabajador → incrementa Total\n' +
  '  var dispActual   = itSel ? (itSel.cantidad_disponible || 0) : 0;\n' +
  '  var totalActual  = itSel ? (itSel.cantidad_total      || 0) : 0;'
);

// ── 2. payload: cantidad_restante = dispActual (disponible no cambia) ──────────
c = c.replace(
  '    cantidad:          1,\n' +
  '    cantidad_restante: Math.max(0, dispActual - 1),',
  '    cantidad:          1,\n' +
  '    cantidad_restante: dispActual,   // disponible no cambia en asignación'
);

// ── 3. update del ítem: total +1 en lugar de disponible -1 ────────────────────
c = c.replace(
  '  // 1) Descontar disponible — update simple y directo (sin historial para garantizar éxito)\n' +
  '  var newDisp = Math.max(0, dispActual - 1);\n' +
  '  await sb.from(\'inventario_items\')\n' +
  '    .update({ cantidad_disponible: newDisp })\n' +
  '    .eq(\'id\', itemId);',
  '  // 1) Sumar al total — la unidad entra al inventario directamente asignada\n' +
  '  var newTotal = totalActual + 1;\n' +
  '  // Si no quedan unidades disponibles, marcar como En Uso\n' +
  '  var newEstado = (dispActual <= 0) ? \'En Uso\' : (itSel ? (itSel.estado || \'Disponible\') : \'Disponible\');\n' +
  '  await sb.from(\'inventario_items\')\n' +
  '    .update({ cantidad_total: newTotal, estado: newEstado })\n' +
  '    .eq(\'id\', itemId);'
);

// ── 4. liberarAsignacion: disponible +1 y estado Disponible (total no cambia) ─
c = c.replace(
  '    // 1) Restaurar disponible — update simple\n' +
  '    var restoredDisp = (it ? (it.cantidad_disponible || 0) : 0) + 1;\n' +
  '    await sb.from(\'inventario_items\')\n' +
  '      .update({ cantidad_disponible: restoredDisp })\n' +
  '      .eq(\'id\', itemId);',
  '    // 1) Devolver al pool disponible (total no cambia, la unidad sigue existiendo)\n' +
  '    var restoredDisp = (it ? (it.cantidad_disponible || 0) : 0) + 1;\n' +
  '    await sb.from(\'inventario_items\')\n' +
  '      .update({ cantidad_disponible: restoredDisp, estado: \'Disponible\' })\n' +
  '      .eq(\'id\', itemId);'
);

// ── 5. alerta de stock: ocultar alerta-asig (ya no aplica aviso de sin stock) ──
// Cambiar el mostrarAlertaStock del picker 'ma' por una versión informativa
c = c.replace(
  '  } else if (prefix === \'ma\') {\n' +
  '    mostrarAlertaStock(\'alerta-asig\', it.cantidad_disponible || 0);\n' +
  '    document.getElementById(\'ma-serie\').value = it.serie_sn || \'\';',
  '  } else if (prefix === \'ma\') {\n' +
  '    // En asignación, la unidad se agrega al total — no se descuenta del stock\n' +
  '    document.getElementById(\'alerta-asig\').style.display = \'none\';\n' +
  '    document.getElementById(\'ma-serie\').value = it.serie_sn || \'\';'
);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch14 OK');
