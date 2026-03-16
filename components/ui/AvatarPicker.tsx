import React, { useState, ChangeEvent, useRef } from 'react';

// Lista expandida de emojis populares e expressivos
const EMOJIS = [
  '🎵','🎶','🎼','🎤','🎧','🎷','🎸','🎹','🥁','🪕','🪗','🎺','🎻','🪘','🎚️','🎛️','🎙️',
  '🎬','🎨','🎭','🎮','🎲','🎯','🎳','🎰','🎱','🧩','🧸','🪁','🪀','🪃','🪅','🪆',
  '😎','🤩','😃','😁','😂','🤣','😊','😇','😍','😘','🥰','😜','🤪','😝','😛','🤑','🤠','🥳','😏','😌','😋','😺','😻','😸','😹','😼','😽','🙀','😿','😾',
  '🦄','🐱','🐶','🐵','🐸','🐼','🐻','🐯','🦁','🐮','🐷','🐭','🐹','🐰','🐔','🐧','🐦','🐤','🐣','🐥','🦉','🦜','🦢','🦩','🦚','🦆','🦅','🦇','🐺','🐗','🐴','🦓','🦌','🦘','🦥','🦦','🦨','🦡','🐾',
  '🔥','🌈','⭐','🌟','✨','⚡','💥','💫','💦','💧','🌊','🌪️','🌤️','⛅','☀️','🌞','🌙','🌚','🌝','🌛','🌜','🌎','🌍','🌏','🪐','💫','☁️','🌫️','🌬️','❄️','☃️','⛄','🌨️','🌩️','🌧️','🌦️','🌥️','🌡️',
  '💎','👑','🎩','🧢','👒','🎓','🕶️','🥽','🥼','🦺','👔','👕','👖','🧣','🧤','🧥','🧦','👗','👘','🥻','🩱','🩲','🩳','👙','👚','👛','👜','👝','🎒','🛍️','👞','👟','🥾','🥿','👠','👡','👢','👑','⛑️','🎒',
  '🍕','🍔','🍟','🌭','🍿','🥓','🥩','🍗','🍖','🦴','🥚','🍳','🧀','🥞','🧇','🥯','🥨','🥐','🍞','🥖','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🍲','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🧉','🧊'
];


type AvatarPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState<{ x: number; y: number; size: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          setImageUrl(ev.target.result);
          setCrop(null);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCropAndSave() {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    const size = crop?.size || Math.min(img.naturalWidth, img.naturalHeight);
    const x = crop?.x || (img.naturalWidth - size) / 2;
    const y = crop?.y || (img.naturalHeight - size) / 2;
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, x, y, size, size, 0, 0, 256, 256);
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);
      onChange(dataUrl);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Avatar selecionado no topo */}
      {value && (
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white">Selecionado:</span>
          {value.startsWith('data:image') ? (
            <img src={value} alt="avatar" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className="text-3xl">{value}</span>
          )}
          <button type="button" className="ml-2 text-xs text-red-400" onClick={() => { setImageUrl(''); onChange(''); }}>Remover</button>
        </div>
      )}
      <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={`text-2xl p-1 rounded hover:bg-spotify-hover ${value === emoji ? 'ring-2 ring-spotify-green' : ''}`}
            onClick={() => { setImageUrl(''); onChange(emoji); }}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <label className="text-xs text-spotify-text">Ou envie uma imagem</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imageUrl && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Pré-visualização"
              className="h-32 w-32 rounded-full object-cover border-2 border-spotify-green"
              style={{ objectFit: 'cover', maxWidth: 256, maxHeight: 256 }}
              onLoad={() => {
                // Centralizar crop ao carregar
                if (imgRef.current) {
                  const size = Math.min(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
                  setCrop({ x: (imgRef.current.naturalWidth - size) / 2, y: (imgRef.current.naturalHeight - size) / 2, size });
                }
              }}
            />
            <button
              type="button"
              className="px-4 py-1 rounded bg-spotify-green text-black font-bold"
              onClick={handleCropAndSave}
            >
              Usar esta imagem
            </button>
            <span className="text-xs text-spotify-text">A imagem será cortada e redimensionada para 256x256px</span>
          </div>
        )}
      </div>
    </div>

  );
}

export default AvatarPicker;
