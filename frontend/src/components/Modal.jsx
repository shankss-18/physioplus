export function Modal({ isOpen, onClose, title, description, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-teal-deep/50 flex items-center justify-center p-5 z-50"
      onClick={onClose} // clicking the dark overlay closes it
    >
      <div
        className="bg-white rounded-2xl p-7 max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // clicking INSIDE the box shouldn't close it
      >
        <h3 className="font-display text-xl text-teal-deep mb-1">{title}</h3>
        {description && <p className="text-sm text-ink/60 mb-5">{description}</p>}
        {children}
      </div>
    </div>
  );
}