'use client';

export default function CockpitCat() {
  return (
    <div className="flex justify-center py-1">
      <img
        src="/cat.png"
        alt=""
        className="transition-all duration-300"
        style={{ width: 140, height: 140, objectFit: 'contain' }}
      />
    </div>
  );
}
