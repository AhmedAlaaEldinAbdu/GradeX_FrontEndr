type ExamCreationCardProps = {
  icon: string;
  title: string;
  description: string;
  className: string;
  onClick?: () => void;
};

export default function ExamCreationCard({
  icon,
  title,
  description,
  className,
  onClick,
}: ExamCreationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`app-card-shadow flex flex-col items-start gap-4 rounded-3xl border border-[#DDE0E0] p-4 text-start transition-opacity hover:opacity-95 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F3FF]/25">
        <span
          aria-hidden
          className="h-6 w-6 bg-white"
          style={{
            maskImage: `url("${icon}")`,
            WebkitMaskImage: `url("${icon}")`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
          }}
        />
      </div>
      <span className="w-full text-base font-medium text-white">{title}</span>
      <span className="text-sm font-medium text-[#F8F8F8]">{description}</span>
    </button>
  );
}
