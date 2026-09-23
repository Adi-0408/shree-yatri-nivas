import React from 'react';
import { PROPERTY_INFO } from '../services/seedData';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const whatsappUrl = `https://wa.me/${PROPERTY_INFO.whatsapp}?text=${encodeURIComponent(
    `Namaste! I would like to inquire about room availability and reservations at ${PROPERTY_INFO.name}, Kolhapur.`
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label={`Chat with ${PROPERTY_INFO.name} on WhatsApp`}
      title="Chat with Us on WhatsApp (24/7 Support)"
    >
      <MessageCircle size={32} />
    </a>
  );
};
