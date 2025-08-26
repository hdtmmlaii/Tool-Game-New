
/*
  encoder.js
  Khi người dùng chọn file HTML (input[type=file]), file sẽ được đọc, mã hóa và
  tự động tải xuống một file encoded.html chứa đoạn mã ghi lại nội dung đã giải mã.
  Hàm encodeMode có thể là 'normal' (encodeURIComponent) hoặc 'full' (escape).
*/

(function(window){
  'use strict';

  // Các hàm tiện ích
  function encodeContent(content, mode){
    if(mode === 'full') return escape(content);
    return encodeURIComponent(content);
  }

  function makeWrappedHtml(encodedString){
    // Bọc vào file HTML dùng document.write(unescape(...))
    return '<!doctype html>\n<html><head><meta charset="utf-8"><title>Encoded</title></head><body>\n<script>document.write(unescape(\'' + encodedString + '\'))</script>\n</body></html>';
  }

  function downloadBlob(content, filename){
    const blob = new Blob([content], {type: 'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'encoded.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Hàm chính: nhận File object, chế độ mã hóa, rồi xử lý
  function encodeFileAndDownload(file, mode){
    if(!file) return Promise.reject(new Error('No file provided'));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e){
        try{
          const text = e.target.result;
          const encoded = encodeContent(text, mode || 'normal').replace(/'/g, '\\u0027');
          const wrapped = makeWrappedHtml(encoded);
          downloadBlob(wrapped, 'encoded-' + file.name);
          resolve(wrapped);
        } catch(err){
          reject(err);
        }
      };
      reader.onerror = function(err){ reject(err); };
      reader.readAsText(file, 'utf-8');
    });
  }

  // API công khai
  window.HTMLAutoEncoder = {
    encodeFileAndDownload,
    encodeContent, // exposed for testing
  };

})(window);
