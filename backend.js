var SHEET_NAME = "Data";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(SHEET_NAME);
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action; 

    // === 1. INPUT BARU ===
    if (action == 'insert' || !action) {
      var dateValue = postData.tanggal ? new Date(postData.tanggal) : new Date();
      var formattedDate = Utilities.formatDate(dateValue, "GMT+7", "dd/MM/yyyy");
      
      var newRow = [
        formattedDate,
        Number(postData.ps_total) || 0, Number(postData.ps_cash) || 0, Number(postData.ps_qris) || 0,
        Number(postData.fnb_total) || 0, Number(postData.fnb_cash) || 0, Number(postData.fnb_qris) || 0,
        postData.username || "Anonim" // <--- INI TAMBAHANNYA (Kolom H)
      ];
      sheet.appendRow(newRow);
      return response('success', 'Data masuk');
    }

    // === 2. UPDATE (EDIT) ===
    else if (action == 'update') {
      var rowIndex = Number(postData.row_index);
      var dateValue = new Date(postData.tanggal);
      var formattedDate = Utilities.formatDate(dateValue, "GMT+7", "dd/MM/yyyy");
      
      // Saat edit, kita update angkanya saja, usernya biarkan tetap (atau bisa diupdate juga kalau mau)
      // Di sini saya buat agar Usernya TIDAK BERUBAH saat diedit, agar ketahuan siapa penginput aslinya.
      // Kita ambil data user lama dulu
      var oldUser = sheet.getRange(rowIndex, 8).getValue(); 

      var updatedRow = [[
        formattedDate,
        Number(postData.ps_total), Number(postData.ps_cash), Number(postData.ps_qris),
        Number(postData.fnb_total), Number(postData.fnb_cash), Number(postData.fnb_qris),
        oldUser // Tetap pakai user lama
      ]];

      sheet.getRange(rowIndex, 1, 1, 8).setValues(updatedRow);
      return response('success', 'Data diupdate');
    }

    // === 3. DELETE (HAPUS) ===
    else if (action == 'delete') {
      var rowIndex = Number(postData.row_index);
      sheet.deleteRow(rowIndex);
      return response('success', 'Data dihapus');
    }

  } catch (e) {
    return response('error', e.toString());
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    // Ambil sampai 8 Kolom (A sampai H)
    var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    
    var structuredData = data.map(function(row, index) {
      return {
        excel_row_index: index + 2,
        values: row
      };
    });
    
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'success', 'data': structuredData })).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'empty', 'data': [] })).setMimeType(ContentService.MimeType.JSON);
  }
}

function response(status, msg) {
  return ContentService.createTextOutput(JSON.stringify({ 'result': status, 'message': msg })).setMimeType(ContentService.MimeType.JSON);
}
