const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// Reemplazar bloque diagnóstico (patch16) con la solución correcta:
// El trigger de Supabase incrementa disponible al insertar movimiento.
// Solución: un solo update que sube total Y restaura disponible al valor previo.
const OLD =
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
'    .eq(\'id\', itemId);';

const NEW =
'  // El trigger de Supabase incrementa disponible automáticamente al insertar\n' +
'  // cualquier movimiento. Corregimos en un solo update:\n' +
'  //   • total    = totalActual + 1   (nueva unidad entra al inventario)\n' +
'  //   • disponible = dispActual      (restaurar al valor previo, deshaciendo el trigger)\n' +
'  //   • estado   según disponibilidad\n' +
'  var newTotal  = totalActual + 1;\n' +
'  var newEstado = (dispActual <= 0) ? \'En Uso\' : (itSel ? (itSel.estado || \'Disponible\') : \'Disponible\');\n' +
'  await sb.from(\'inventario_items\')\n' +
'    .update({\n' +
'      cantidad_total:     newTotal,\n' +
'      cantidad_disponible: dispActual,  // deshace incremento automático del trigger\n' +
'      estado:             newEstado\n' +
'    })\n' +
'    .eq(\'id\', itemId);';

if (!c.includes(OLD)) { console.error('ERROR: bloque OLD no encontrado'); process.exit(1); }
c = c.replace(OLD, NEW);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch17 OK');
