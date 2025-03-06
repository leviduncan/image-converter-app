import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import pica from "pica";

const ImageConverter = () => {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("jpeg");
  const [convertedImages, setConvertedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        size: (file.size / 1024).toFixed(2) // Convert size to KB
      }));
      setFiles(newFiles);
      setSelectedFiles(newFiles);
    },
  });

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedFiles(selectAll ? [] : files);
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles(selectedFiles.includes(file) 
      ? selectedFiles.filter(f => f !== file) 
      : [...selectedFiles, file]
    );
  };

  const convertImages = async () => {
    const picaInstance = pica();
    const newImages = [];

    for (const item of selectedFiles) {
      if (!item.file) continue;
      const { file } = item;
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      await picaInstance.resize(img, canvas);
      
      const convertedBlob = await picaInstance.toBlob(canvas, `image/${format}`, 0.5);
      const convertedUrl = URL.createObjectURL(convertedBlob);
      
      newImages.push({
        name: file.name,
        url: convertedUrl,
        originalSize: item.size,
        convertedSize: (convertedBlob.size / 1024).toFixed(2) // Convert size to KB
      });
    }
    
    setConvertedImages(newImages);
  };

  return (
    <div className={`${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'} min-vh-100 pt-4`}>
      <main className="container">
      <h2 className="text-center mb-4">Image Converter</h2>
      <button className="btn btn-warning mb-3" onClick={() => setDarkMode(!darkMode)}>
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
      <div {...getRootProps()} className="border border-secondary p-5 text-center mb-3 rounded-4 border-4" style={{ cursor: "pointer" }}>
        <input {...getInputProps()} />
        <p className="mb-0">Drag & Drop images here, or click to select files</p>
      </div>
      
      <div className="mb-3">
        <label className="form-label d-block">Select Format</label>
        <div className="btn-group w-100" role="group">
          {['jpeg', 'png', 'webp'].map(f => (
            <button key={f} className={`btn ${format === f ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setFormat(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-3">
        <button className="btn btn-warning mb-2" onClick={toggleSelectAll}>
          {selectAll ? "Deselect All" : "Select All"}
        </button>
        {files.map((item, index) => (
          item.file ? (
            <div key={index} className={`d-flex align-items-center border p-2 mb-2 ${selectedFiles.includes(item) ? 'bg-secondary' : ''}`} onClick={() => toggleFileSelection(item)} style={{ cursor: 'pointer' }}>
              <img src={item.preview} alt={item.file.name} className="me-3" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              <div class="d-flex justify-content-between align-items-start w-100">
                <strong>{item.file.name}</strong>
                <p className="mb-1">Format: {format.toUpperCase()}</p>
                <p className="mb-1">Original Size: {item.size} KB</p>
                <p className="mb-1">Estimated New Size: {(item.size * (format === 'jpeg' ? 0.8 : format === 'png' ? 1 : 0.6)).toFixed(2)} KB</p>
              </div>
            </div>
          ) : null
        ))}
      </div>
      
      <button className="btn btn-danger w-100 mb-3" onClick={convertImages} disabled={selectedFiles.length === 0}>
        Convert Selected
      </button>
      
      <div>
        {convertedImages.map((img, index) => (
          <div key={index} className="d-flex align-items-center border p-2 mb-2">
            <a className="btn btn-success w-100" href={img.url} download={img.name.replace(/\.[^.]+$/, `.${format}`)}>Download {img.name}</a>
            <p className="ms-3 mb-0">Converted Size: {img.convertedSize} KB</p>
          </div>
        ))}
      </div>
      </main>
    </div>
  );
};

export default ImageConverter;
