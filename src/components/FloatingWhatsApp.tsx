import { MessageSquare } from 'lucide-react';

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/2347068609404"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center animate-bounce"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageSquare size={28} className="fill-current" />
      <span className="absolute -top-3 -right-3 flex h-6 w-6">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-[10px] items-center justify-center font-bold">1</span>
      </span>
    </a>
  );
}
