const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// Reemplazar el bloque de actualización de ítem en guardarAsignacion
// Separar decremento de disponible (solo) del update de historial (aparte)
const OLD_ITEM_UPDATE =
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
'  }';

const NEW_ITEM_UPDATE =
'  // 1) Descontar disponible — update simple y directo (sin historial para garantizar éxito)\n' +
'  var newDisp = Math.max(0, dispActual - 1);\n' +
'  await sb.from(\'inventario_items\')\n' +
'    .update({ cantidad_disponible: newDisp })\n' +
'    .eq(\'id\', itemId);\n' +
'\n' +
'  // 2) Registrar en historial del ítem (aparte, sin afectar la cantidad si falla)\n' +
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
'    await sb.from(\'inventario_items\')\n' +
'      .update({ historial: histAsig })\n' +
'      .eq(\'id\', itemId);\n' +
'  }';

if (!c.includes(OLD_ITEM_UPDATE)) { console.error('ERROR: bloque OLD_ITEM_UPDATE no encontrado'); process.exit(1); }
c = c.replace(OLD_ITEM_UPDATE, NEW_ITEM_UPDATE);

// Misma separación en liberarAsignacion
const OLD_LIB_UPDATE =
'    var entradaLib = { fecha: new Date().toISOString(), usuario: currentUser ? (currentUser.email || \'?\') : \'?\', cambios: [{ campo: \'Devolución\', antes: \'En Uso\', despues: \'Disponible — \' + desc }] };\n' +
'    var histLib = [entradaLib].concat(it ? (it.historial || []) : []).slice(0, 50);\n' +
'    await sb.from(\'inventario_items\').update({\n' +
'      estado: \'Disponible\',\n' +
'      cantidad_disponible: (it ? (it.cantidad_disponible || 0) : 0) + 1,\n' +
'      historial: histLib\n' +
'    }).eq(\'id\', itemId);';

const NEW_LIB_UPDATE =
'    // 1) Restaurar disponible — update simple\n' +
'    var restoredDisp = (it ? (it.cantidad_disponible || 0) : 0) + 1;\n' +
'    await sb.from(\'inventario_items\')\n' +
'      .update({ cantidad_disponible: restoredDisp })\n' +
'      .eq(\'id\', itemId);\n' +
'    // 2) Historial — aparte\n' +
'    var entradaLib = { fecha: new Date().toISOString(), usuario: currentUser ? (currentUser.email || \'?\') : \'?\', cambios: [{ campo: \'Devolución\', antes: \'En Uso\', despues: \'Disponible — \' + desc }] };\n' +
'    var histLib = [entradaLib].concat(it ? (it.historial || []) : []).slice(0, 50);\n' +
'    await sb.from(\'inventario_items\')\n' +
'      .update({ historial: histLib })\n' +
'      .eq(\'id\', itemId);';

if (!c.includes(OLD_LIB_UPDATE)) { console.error('ERROR: bloque OLD_LIB_UPDATE no encontrado'); process.exit(1); }
c = c.replace(OLD_LIB_UPDATE, NEW_LIB_UPDATE);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch13 OK');
