import { useRef, useState } from "react";
import { Upload, Loader2, X, AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";
import supabase from "../services/supabase";

/**
 * Componente para subir una imagen al Storage de Supabase.
 * Acepta drag & drop o click para seleccionar.
 * Comprime automáticamente la imagen antes de subir.
 *
 * Props:
 *  - value: URL actual de la imagen (string)
 *  - onChange: función que recibe la nueva URL
 *  - bucket: nombre del bucket (default "perfumsImages")
 */
export default function ImageUploader({
  value,
  onChange,
  bucket,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const generateFileName = (originalName, ext = "jpg") => {
    const cleaned = originalName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-");
    const base = cleaned.replace(/\.[^.]+$/, ""); // quita cualquier extensión
    const timestamp = Date.now();
    return `${base}-${timestamp}.${ext}`;
  };

  const compressImage = async (file) => {
    // Convertimos SIEMPRE a JPEG: un PNG fotográfico no se puede comprimir sin
    // perder resolución, y ahí venía el borroso. En JPEG, la misma foto pesa
    // ~170KB a plena resolución y se ve nítida.
    const options = {
      maxSizeMB: 0.5, // margen de sobra; una foto normal queda en ~150-250KB
      maxWidthOrHeight: 1600, // no encoge fotos de hasta 1600px
      useWebWorker: true,
      initialQuality: 0.85,
      fileType: "image/jpeg",
    };

    try {
      const compressed = await imageCompression(file, options);
      console.log(
        `Comprimida: ${(file.size / 1024).toFixed(0)}KB → ${(
          compressed.size / 1024
        ).toFixed(0)}KB`
      );
      return compressed;
    } catch (err) {
      console.warn("No se pudo comprimir, subiendo original:", err);
      return file;
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    // Validación inicial: máx 10MB antes de comprimir
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("La imagen es muy pesada (máx 10 MB).");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Comprimir/convertir a JPEG antes de subir
      const compressedFile = await compressImage(file);

      // El nombre y el content-type deben coincidir con el formato real de salida.
      const tipo = compressedFile.type || "image/jpeg";
      const ext = tipo === "image/png" ? "png" : "jpg";
      const fileName = generateFileName(file.name, ext);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedFile, {
          cacheControl: "2592000",
          upsert: false,
          contentType: tipo,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Error al subir la imagen.");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange?.(urlData.publicUrl);
    } catch (err) {
      console.error(err);
      setError("Error inesperado al subir.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClickArea = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    onChange?.("");
    setError(null);
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <img
          src={value}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-md border border-gray-300"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
          aria-label="Quitar imagen"
        >
          <X size={14} />
        </button>
        <button
          type="button"
          onClick={handleClickArea}
          disabled={uploading}
          className="block mt-2 text-xs text-[#A47E3B] hover:underline"
        >
          {uploading ? "Subiendo..." : "Reemplazar imagen"}
        </button>
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={handleClickArea}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors ${
          dragActive
            ? "border-[#A47E3B] bg-[#A47E3B]/10"
            : "border-gray-300 hover:border-[#A47E3B] bg-gray-50"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="text-[#A47E3B] animate-spin" size={32} />
            <p className="text-sm text-gray-600">Optimizando y subiendo...</p>
          </>
        ) : (
          <>
            <Upload className="text-[#A47E3B]" size={32} />
            <p className="text-sm text-gray-700 font-medium">
              Arrastra una imagen aquí o haz click
            </p>
            <p className="text-xs text-gray-500">
              Se comprime automáticamente. Máx 10 MB.
            </p>
          </>
        )}
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}