import React, { useMemo, useState, ChangeEvent, useRef } from 'react';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState('');

  const filteredEmojis = useMemo(() => {
    const q = emojiQuery.trim();
    if (!q) return EMOJIS;
    // Simple filter: allow pasting an emoji to quickly find it
    return EMOJIS.filter((e) => e.includes(q));
  }, [emojiQuery]);

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
    <div className="flex flex-col gap-3">
      {/* Avatar selecionado no topo */}
      {value && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">Selecionado:</span>
          {value.startsWith('data:image') ? (
            <img src={value} alt="avatar" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <span className="text-3xl">{value}</span>
          )}
          <button
            type="button"
            className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-red-400 hover:bg-spotify-hover"
            onClick={() => { setImageUrl(''); onChange(''); }}
          >
            Remover
          </button>
        </div>
      )}

      <div className="rounded-xl bg-spotify-card/40 p-3 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Emoji</p>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="rounded-full bg-spotify-hover px-3 py-2 text-xs font-semibold text-white"
          >
            {showEmojiPicker ? 'Ocultar' : 'Escolher'}
          </button>
        </div>

        {showEmojiPicker && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              value={emojiQuery}
              onChange={(e) => setEmojiQuery(e.target.value)}
              placeholder="Filtrar (cole um emoji)…"
              className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
            <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto pr-1 sm:grid-cols-10">
              {filteredEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`flex min-h-[40px] items-center justify-center rounded-lg text-xl hover:bg-spotify-hover active:scale-[0.99] ${value === emoji ? 'ring-2 ring-spotify-green' : ''}`}
                  onClick={() => { setImageUrl(''); onChange(emoji); }}
                  aria-label={`Escolher ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-spotify-text">Ou envie uma imagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-spotify-text file:mr-3 file:rounded-lg file:border-0 file:bg-spotify-hover file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-spotify-card"
        />
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
              className="min-h-[44px] w-full max-w-xs rounded-xl bg-spotify-green px-4 py-2.5 text-sm font-bold text-black"
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
