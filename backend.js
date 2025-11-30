var sheetName = 'Sheet1';
var scriptProp = PropertiesService.getScriptProperties();

function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', doc.getId());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    var sheet = doc.getSheetByName(sheetName);
    var action = e.parameter.action;
    
    // Ambil baris header (Baris 1)
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // --- CREATE ---
    if (action == 'create') {
      var nextRow = sheet.getLastRow() + 1;
      var newRow = headers.map(function(header) {
        if(header === 'Waktu Input') return new Date();
        if(header === 'Status') return 'Pending'; 
        return e.parameter[header];
      });
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
      return responseJSON('success', 'Data tersimpan');
    }

    // --- DELETE ---
    else if (action == 'delete') {
      var row = parseInt(e.parameter.row);
      sheet.deleteRow(row);
      return responseJSON('success', 'Data deleted');
    }

    // --- MARK DONE (LOGIKA PENCARIAN KOLOM) ---
    else if (action == 'markDone') {
      var row = parseInt(e.parameter.row);
      
      // Cari nomor kolom yang judulnya "Status"
      // headers.indexOf('Status') mulai dari 0, jadi di sheet harus +1
      var colIndex = headers.indexOf('Status'); 

      if (colIndex === -1) {
        return responseJSON('error', 'Kolom Status tidak ditemukan! Cek judul kolom di Excel.');
      }

      // Tulis "Selesai" di kolom yang benar
      sheet.getRange(row, colIndex + 1).setValue('Selesai');
      return responseJSON('success', 'Status updated');
    }

    // --- UPDATE ---
    else if (action == 'update') {
      var row = parseInt(e.parameter.row);
      // Update dinamis berdasarkan nama kolom
      updateCell(sheet, row, headers, 'Tanggal', e.parameter.Tanggal);
      updateCell(sheet, row, headers, 'Hari', e.parameter.Hari);
      updateCell(sheet, row, headers, 'Waktu', e.parameter.Waktu);
      updateCell(sheet, row, headers, 'Tim', e.parameter.Tim);
      updateCell(sheet, row, headers, 'Venue', e.parameter.Venue);
      
      return responseJSON('success', 'Data updated');
    }

  } catch (e) {
    return responseJSON('error', e.toString());
  } finally {
    lock.releaseLock();
  }
}

// Helper Update Cell
function updateCell(sheet, row, headers, colName, value) {
  var colIndex = headers.indexOf(colName);
  if (colIndex > -1) {
    sheet.getRange(row, colIndex + 1).setValue(value);
  }
}

function doGet(e) {
  var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
  var sheet = doc.getSheetByName(sheetName);
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var data = [];

  for (var i = 1; i < rows.length; i++) {
    var rowData = rows[i];
    var record = {};
    record['row'] = i + 1;
    for (var j = 0; j < headers.length; j++) {
      record[headers[j]] = rowData[j];
    }
    data.push(record);
  }
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function responseJSON(status, message) {
  return ContentService.createTextOutput(JSON.stringify({ 'result': status, 'message': message })).setMimeType(ContentService.MimeType.JSON);
}
