'use client';

import React from 'react';

export const WhatsAppFloat: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Background Pulse Animation Ring */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none"></span>

      <a
        id="global-whatsapp-float-btn"
        href="https://wa.me/221762312003?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20Lou%20Ame%20Tay%3F%20pour%20mon%20restaurant.%20Je%20veux%20une%20d%C3%A9mo."
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group focus:outline-none"
        title="Contacter le support commercial WhatsApp (+221 76 231 20 03)"
      >
        {/* WhatsApp Official Icon SVG */}
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          className="text-white shrink-0 group-hover:scale-105 transition-transform"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.154 4.217 4.237-1.111zm9.845-6.626c-.301-.15-1.785-.881-2.062-.982-.276-.101-.477-.15-.678.15-.2.301-.778.982-.954 1.183-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.798-1.501-1.784-1.677-2.085-.176-.301-.019-.464.131-.614.135-.134.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.678-1.635-.929-2.238-.244-.588-.492-.508-.678-.518-.175-.008-.376-.01-.577-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512 0 1.481 1.079 2.911 1.229 3.112.15.201 2.124 3.243 5.145 4.547.719.31 1.281.495 1.718.634.722.23 1.379.197 1.9.12.581-.087 1.785-.729 2.036-1.432.251-.703.251-1.304.175-1.432-.075-.128-.276-.201-.577-.352z" />
        </svg>
      </a>
    </div>
  );
};
