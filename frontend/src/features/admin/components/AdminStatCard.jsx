export default function AdminStatCard({ label, value, icon }) {
  return (
    <div className="border-border-subtle bg-surface-container-lowest min-w-0 border p-4 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <p className="font-label-caps text-text-muted truncate">{label}</p>

        {icon && (
          <span className="material-symbols-outlined text-text-muted shrink-0 !text-[18px] sm:!text-[20px]">
            {icon}
          </span>
        )}
      </div>

      {/* Ubah kelas ukuran teks agar responsif dan tidak terpotong kaku */}
      <p className="font-headline-lg text-primary mt-4 text-lg tracking-tight break-words sm:mt-5 sm:text-xl md:text-2xl">
        {value}
      </p>
    </div>
  );
}
