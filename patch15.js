const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// Agregar manejo de error al update de cantidad_total en guardarAsignacion
c = c.replace(
  '  // 1) Sumar al total — la unidad entra al inventario directamente asignada\n' +
  '  var newTotal = totalActual + 1;\n' +
  '  // Si no quedan unidades disponibles, marcar como En Uso\n' +
  '  var newEstado = (dispActual <= 0) ? \'En Uso\' : (itSel ? (itSel.estado || \'Disponible\') : \'Disponible\');\n' +
  '  await sb.from(\'inventario_items\')\n' +
  '    .update({ cantidad_total: newTotal, estado: newEstado })\n' +
  '    .eq(\'id\', itemId);',
  '  // 1) Sumar al total — la unidad entra al inventario directamente asignada\n' +
  '  var newTotal = totalActual + 1;\n' +
  '  // Si no quedan unidades disponibles, marcar como En Uso\n' +
  '  var newEstado = (dispActual <= 0) ? \'En Uso\' : (itSel ? (itSel.estado || \'Disponible\') : \'Disponible\');\n' +
  '  var updRes = await sb.from(\'inventario_items\')\n' +
  '    .update({ cantidad_total: newTotal, estado: newEstado })\n' +
  '    .eq(\'id\', itemId)\n' +
  '    .select(\'id,cantidad_total\');\n' +
  '  if (updRes.error) {\n' +
  '    alert(\'⚠️ Error al actualizar el total del ítem: \' + updRes.error.message);\n' +
  '  } else if (!updRes.data || !updRes.data.length) {\n' +
  '    alert(\'⚠️ No se encontró el ítem para actualizar (id: \' + itemId + \'). Recarga la página e intenta de nuevo.\');\n' +
  '  }'
);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch15 OK');
