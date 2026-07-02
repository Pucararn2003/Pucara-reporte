const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// Reemplazar el bloque de update con versión diagnóstica más detallada
// que separa cantidad_total de estado y muestra el valor real retornado por la DB
c = c.replace(
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
  '  }',

  '  // 1a) Actualizar SOLO cantidad_total (aislado para detectar problema)\n' +
  '  var newTotal = totalActual + 1;\n' +
  '  var updTotal = await sb.from(\'inventario_items\')\n' +
  '    .update({ cantidad_total: newTotal })\n' +
  '    .eq(\'id\', itemId)\n' +
  '    .select(\'id,cantidad_total\');\n' +
  '  if (updTotal.error) {\n' +
  '    alert(\'❌ Error cantidad_total: \' + updTotal.error.message);\n' +
  '  } else if (!updTotal.data || !updTotal.data.length) {\n' +
  '    alert(\'❌ ítem no encontrado (id="\'+ itemId +\'") — revisa si hay espacios extra.\');\n' +
  '  } else {\n' +
  '    var realTotal = updTotal.data[0].cantidad_total;\n' +
  '    if (realTotal !== newTotal) {\n' +
  '      alert(\'⚠️ Trigger Supabase detectado: intenté poner Total=\' + newTotal + \' pero la DB devolvió Total=\' + realTotal + \'. Revisa los triggers en el dashboard de Supabase.\');\n' +
  '    }\n' +
  '  }\n' +
  '  // 1b) Actualizar estado\n' +
  '  var newEstado = (dispActual <= 0) ? \'En Uso\' : (itSel ? (itSel.estado || \'Disponible\') : \'Disponible\');\n' +
  '  await sb.from(\'inventario_items\')\n' +
  '    .update({ estado: newEstado })\n' +
  '    .eq(\'id\', itemId);'
);

if (!c.includes('Trigger Supabase detectado')) {
  console.error('ERROR: reemplazo no aplicado');
  process.exit(1);
}

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch16 OK');
