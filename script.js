let originalImage = null, originalWidth = 0, originalHeight = 0, ratio = 1;

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const editor = document.getElementById('editor');
const previewImg = document.getElementById('preview-img');
const imgWidth = document.getElementById('img-width');
const imgHeight = document.getElementById('img-height');
const keepRatio = document.getElementById('keep-ratio');
const format = document.getElementById('format');
const quality = document.getElementById('quality');
const qualityLabel = document.getElementById('quality-label');
const qualityValue = document.getElementById('quality-value');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');
const removeBtn = document.getElementById('remove-btn');
const resultImg = document.getElementById('result-img');
const resultLabel = document.getElementById('result-label');

// 拖拽上传
uploadArea.ondragover = e => { e.preventDefault(); uploadArea.classList.add('dragover'); };
uploadArea.ondragleave = e => { e.preventDefault(); uploadArea.classList.remove('dragover'); };
uploadArea.ondrop = e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
};
// 点击上传
selectBtn.onclick = () => fileInput.click();
fileInput.onchange = e => handleFile(e.target.files[0]);

// 处理图片文件
function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      originalImage = img;
      originalWidth = img.width;
      originalHeight = img.height;
      ratio = img.width / img.height;
      previewImg.src = img.src;
      imgWidth.value = img.width;
      imgHeight.value = img.height;
      editor.style.display = '';
      uploadArea.style.display = 'none';
      removeBtn.style.display = '';
      updatePreview();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

// 尺寸输入
imgWidth.oninput = () => {
  if (keepRatio.checked) {
    imgHeight.value = Math.round(imgWidth.value / ratio);
  }
  updatePreview();
};
imgHeight.oninput = () => {
  if (keepRatio.checked) {
    imgWidth.value = Math.round(imgHeight.value * ratio);
  }
  updatePreview();
};
keepRatio.onchange = () => {
  if (keepRatio.checked) {
    imgHeight.value = Math.round(imgWidth.value / ratio);
  }
  updatePreview();
};

// 格式和质量
format.onchange = () => {
  if (format.value === 'jpeg' || format.value === 'webp') {
    qualityLabel.style.display = '';
  } else {
    qualityLabel.style.display = 'none';
  }
  updatePreview();
};
quality.oninput = () => { qualityValue.textContent = quality.value; updatePreview(); };

// 重置
resetBtn.onclick = () => {
  imgWidth.value = originalWidth;
  imgHeight.value = originalHeight;
  updatePreview();
};

// 实时预览
function updatePreview() {
  previewImg.style.width = imgWidth.value + 'px';
  previewImg.style.height = imgHeight.value + 'px';
  // 生成修改后图片的预览
  if (!originalImage) return;
  const canvas = document.createElement('canvas');
  const width = parseInt(imgWidth.value);
  const height = parseInt(imgHeight.value);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0, width, height);
  let type = 'image/png';
  if (format.value === 'jpeg') type = 'image/jpeg';
  if (format.value === 'webp') type = 'image/webp';
  let q = 1;
  if (type !== 'image/png') q = quality.value / 100;
  canvas.toBlob(blob => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      resultImg.src = url;
      resultImg.style.display = '';
      resultLabel.style.display = 'none';
      // 释放旧的URL，防止内存泄漏
      if (resultImg._oldUrl) URL.revokeObjectURL(resultImg._oldUrl);
      resultImg._oldUrl = url;
    }
  }, type, q);
}

// 导出图片
exportBtn.onclick = () => {
  const canvas = document.createElement('canvas');
  canvas.width = imgWidth.value;
  canvas.height = imgHeight.value;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  let type = 'image/png';
  if (format.value === 'jpeg') type = 'image/jpeg';
  if (format.value === 'webp') type = 'image/webp';
  let q = 1;
  if (type !== 'image/png') q = quality.value / 100;
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resized.' + format.value;
    a.click();
  }, type, q);
};

// 快捷键支持
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
    e.preventDefault(); fileInput.click();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault(); exportBtn.click();
  }
  if (e.key === 'Escape') {
    resetBtn.click();
  }
});

removeBtn.onclick = () => {
  // 清空图片和输入框，恢复上传区
  previewImg.src = '';
  editor.style.display = 'none';
  uploadArea.style.display = '';
  removeBtn.style.display = 'none';
  fileInput.value = '';
  resultImg.style.display = 'none';
  resultLabel.style.display = '';
  if (resultImg._oldUrl) URL.revokeObjectURL(resultImg._oldUrl);
}; 