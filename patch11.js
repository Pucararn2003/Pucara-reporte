const fs = require('fs');
const file = 'inventario.html';
let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// ── 1. CSS para zonas de drag-drop ────────────────────────────────────────────
c = c.replace(
  '.th-info-icon{display:inline-block;margin-left:5px;font-size:11px;opacity:.75;cursor:help;vertical-align:middle}\n.th-info-icon:hover{opacity:1}',
  '.th-info-icon{display:inline-block;margin-left:5px;font-size:11px;opacity:.75;cursor:help;vertical-align:middle}\n.th-info-icon:hover{opacity:1}\n\n/* ── Drag-drop image slots ── */\n.img-drop-zone{border:2px dashed #cdd8e3;border-radius:8px;padding:8px;transition:border-color .15s,background .15s;cursor:default}\n.img-drop-zone.drag-over{border-color:#1E4F8C !important;background:#edf4ff}\n.img-drop-hint{text-align:center;font-size:10px;color:#bbb;margin-top:5px;pointer-events:none;user-select:none}'
);

// ── 2. Reemplazar los 3 slots HTML con versiones drag-drop ────────────────────
const OLD_SLOTS =
'          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px">\n' +
'            <div style="border:1px solid #cdd8e3;border-radius:8px;padding:8px">\n' +
'              <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px">Foto 1 (miniatura)</div>\n' +
'              <img id="mi-img-prev-1" src="" alt="" style="display:none;width:100%;max-height:110px;object-fit:contain;border-radius:6px;margin-bottom:6px;border:1px solid #eee"/>\n' +
'              <div style="display:flex;gap:4px;flex-wrap:wrap">\n' +
'                <input type="file" id="mi-img-file-1" accept="image/*" onchange="previewImgSlot(this,1)" style="flex:1;min-width:0;font-size:11px;padding:4px;border:1px solid #cdd8e3;border-radius:5px"/>\n' +
'                <button type="button" class="btn btn-secondary btn-sm" onclick="quitarImgSlot(1)">✕</button>\n' +
'              </div>\n' +
'            </div>\n' +
'            <div style="border:1px solid #cdd8e3;border-radius:8px;padding:8px">\n' +
'              <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px">Foto 2</div>\n' +
'              <img id="mi-img-prev-2" src="" alt="" style="display:none;width:100%;max-height:110px;object-fit:contain;border-radius:6px;margin-bottom:6px;border:1px solid #eee"/>\n' +
'              <div style="display:flex;gap:4px;flex-wrap:wrap">\n' +
'                <input type="file" id="mi-img-file-2" accept="image/*" onchange="previewImgSlot(this,2)" style="flex:1;min-width:0;font-size:11px;padding:4px;border:1px solid #cdd8e3;border-radius:5px"/>\n' +
'                <button type="button" class="btn btn-secondary btn-sm" onclick="quitarImgSlot(2)">✕</button>\n' +
'              </div>\n' +
'            </div>\n' +
'            <div style="border:1px solid #cdd8e3;border-radius:8px;padding:8px">\n' +
'              <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px">Foto 3</div>\n' +
'              <img id="mi-img-prev-3" src="" alt="" style="display:none;width:100%;max-height:110px;object-fit:contain;border-radius:6px;margin-bottom:6px;border:1px solid #eee"/>\n' +
'              <div style="display:flex;gap:4px;flex-wrap:wrap">\n' +
'                <input type="file" id="mi-img-file-3" accept="image/*" onchange="previewImgSlot(this,3)" style="flex:1;min-width:0;font-size:11px;padding:4px;border:1px solid #cdd8e3;border-radius:5px"/>\n' +
'                <button type="button" class="btn btn-secondary btn-sm" onclick="quitarImgSlot(3)">✕</button>\n' +
'              </div>\n' +
'            </div>\n' +
'          </div>';

const NEW_SLOTS =
'          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px">\n' +
'            <div class="img-drop-zone" id="mi-slot-1"\n' +
'                 ondragover="imgDragOver(event)" ondragenter="imgDragEnter(event,1)" ondragleave="imgDragLeave(event,1)" ondrop="imgDrop(event,1)">\n' +
'              <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px">Foto 1 (miniatura)</div>\n' +
'              <img id="mi-img-prev-1" src="" alt="" style="display:none;width:100%;max-height:110px;object-fit:contain;border-radius:6px;margin-bottom:6px;border:1px solid #eee"/>\n' +
'              <div style="display:flex;gap:4px;flex-wrap:wrap">\n' +
'                <input type="file" id="mi-img-file-1" accept="image/*" onchange="previewImgSlot(this,1)" style="flex:1;min-width:0;font-size:11px;padding:4px;border:1px solid #cdd8e3;border-radius:5px"/>\n' +
'                <button type="button" class="btn btn-secondary btn-sm" onclick="quitarImgSlot(1)">✕</button>\n' +
'              </div>\n' +
'              <div class="img-drop-hint">📎 o arrastra aquí</div>\n' +
'            </div>\n' +
'            <div class="img-drop-zone" id="mi-slot-2"\n' +
'                 ondragover="imgDragOver(event)" ondragenter="imgDragEnter(event,2)" ondragleave="imgDragLeave(event,2)" ondrop="imgDrop(event,2)">\n' +
'              <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px">Foto 2</div>\n' +
'              <img id="mi-img-prev-2" src="" alt="" style="display:none;width:100%;max-height:110px;object-fit:contain;border-radius:6px;margin-bottom:6px;border:1px solid #eee"/>\n' +
'              <div style="display:flex;gap:4px;flex-wrap:wrap">\n' +
'                <input type="file" id="mi-img-file-2" accept="image/*" onchange="previewImgSlot(this,2)" style="flex:1;min-width:0;font-size:11px;padding:4px;border:1px solid #cdd8e3;border-radius:5px"/>\n' +
'                <button type="button" class="btn btn-secondary btn-sm" onclick="quitarImgSlot(2)">✕</button>\n' +
'              </div>\n' +
'              <div class="img-drop-hint">📎 o arrastra aquí</div>\n' +
'            </div>\n' +
'            <div class="img-drop-zone" id="mi-slot-3"\n' +
'                 ondragover="imgDragOver(event)" ondragenter="imgDragEnter(event,3)" ondragleave="imgDragLeave(event,3)" ondrop="imgDrop(event,3)">\n' +
'              <div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px">Foto 3</div>\n' +
'              <img id="mi-img-prev-3" src="" alt="" style="display:none;width:100%;max-height:110px;object-fit:contain;border-radius:6px;margin-bottom:6px;border:1px solid #eee"/>\n' +
'              <div style="display:flex;gap:4px;flex-wrap:wrap">\n' +
'                <input type="file" id="mi-img-file-3" accept="image/*" onchange="previewImgSlot(this,3)" style="flex:1;min-width:0;font-size:11px;padding:4px;border:1px solid #cdd8e3;border-radius:5px"/>\n' +
'                <button type="button" class="btn btn-secondary btn-sm" onclick="quitarImgSlot(3)">✕</button>\n' +
'              </div>\n' +
'              <div class="img-drop-hint">📎 o arrastra aquí</div>\n' +
'            </div>\n' +
'          </div>';

if (!c.includes(OLD_SLOTS)) { console.error('ERROR: OLD_SLOTS no encontrado'); process.exit(1); }
c = c.replace(OLD_SLOTS, NEW_SLOTS);

// ── 3. Funciones JS drag-drop (insertar antes de subirImagen) ─────────────────
const JS_DRAG =
'// ── Drag-drop image slots ─────────────────────────────────────\n' +
'window._imgDropped = {};\n' +
'\n' +
'function imgDragOver(e) { e.preventDefault(); }\n' +
'\n' +
'function imgDragEnter(e, slot) {\n' +
'  e.preventDefault();\n' +
'  document.getElementById(\'mi-slot-\' + slot).classList.add(\'drag-over\');\n' +
'}\n' +
'\n' +
'function imgDragLeave(e, slot) {\n' +
'  var el = document.getElementById(\'mi-slot-\' + slot);\n' +
'  if (!el.contains(e.relatedTarget)) el.classList.remove(\'drag-over\');\n' +
'}\n' +
'\n' +
'function imgDrop(e, slot) {\n' +
'  e.preventDefault();\n' +
'  document.getElementById(\'mi-slot-\' + slot).classList.remove(\'drag-over\');\n' +
'\n' +
'  // Caso 1: archivo de sistema / Explorer\n' +
'  var file = e.dataTransfer.files && e.dataTransfer.files[0];\n' +
'  if (file && file.type.startsWith(\'image/\')) {\n' +
'    try {\n' +
'      var dt = new DataTransfer();\n' +
'      dt.items.add(file);\n' +
'      var inp = document.getElementById(\'mi-img-file-\' + slot);\n' +
'      inp.files = dt.files;           // Chrome/Firefox/Edge\n' +
'      previewImgSlot(inp, slot);\n' +
'    } catch (_) {\n' +
'      // Safari no permite asignar files — guardamos la referencia\n' +
'      window._imgDropped[slot] = file;\n' +
'      var pr = document.getElementById(\'mi-img-prev-\' + slot);\n' +
'      pr.src = URL.createObjectURL(file); pr.style.display = \'block\';\n' +
'    }\n' +
'    return;\n' +
'  }\n' +
'\n' +
'  // Caso 2: imagen arrastrada desde otra ventana/pestaña del navegador\n' +
'  var html = e.dataTransfer.getData(\'text/html\') || \'\';\n' +
'  var m    = html.match(/src=["\'\\s]([^"\'>\\s]+)["\']/i);\n' +
'  var url  = m ? m[1] : (e.dataTransfer.getData(\'text/uri-list\') || e.dataTransfer.getData(\'URL\') || \'\').trim();\n' +
'  if (url && /^https?:\\/\\//i.test(url)) {\n' +
'    var urlIds = [\'mi-img-url\', \'mi-img-url-2\', \'mi-img-url-3\'];\n' +
'    document.getElementById(urlIds[slot - 1]).value = url;\n' +
'    var pr2 = document.getElementById(\'mi-img-prev-\' + slot);\n' +
'    pr2.src = url; pr2.style.display = \'block\';\n' +
'  }\n' +
'}\n\n';

c = c.replace(
  '// ── Image ─────────────────────────────────────────────────────\n',
  JS_DRAG + '// ── Image ─────────────────────────────────────────────────────\n'
);

// ── 4. guardarItem: también leer window._imgDropped[slot] para Safari ─────────
c = c.replace(
  '  for (const [slot, key] of [[1,\'imagen_url\'],[2,\'imagen_url_2\'],[3,\'imagen_url_3\']]) {\n    const f = document.getElementById(\'mi-img-file-\'+slot)?.files[0];\n    if (f) {',
  '  for (const [slot, key] of [[1,\'imagen_url\'],[2,\'imagen_url_2\'],[3,\'imagen_url_3\']]) {\n    const f = document.getElementById(\'mi-img-file-\'+slot)?.files[0] || (window._imgDropped && window._imgDropped[slot]) || null;\n    if (f) {'
);

// ── 5. Limpiar _imgDropped al abrir el modal ───────────────────────────────────
c = c.replace(
  "  [1,2,3].forEach(n => { document.getElementById('mi-img-file-'+n).value = ''; });",
  "  [1,2,3].forEach(n => { document.getElementById('mi-img-file-'+n).value = ''; });\n  window._imgDropped = {};"
);

fs.writeFileSync(file, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('patch11 OK');
