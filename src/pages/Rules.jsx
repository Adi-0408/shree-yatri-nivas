import React from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_INFO } from '../services/seedData';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  Sparkles, 
  PhoneCall, 
  FileText, 
  Info,
  CalendarCheck,
  CheckCircle2,
  Ban,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const Rules = () => {
  const propertyRules = [
    "Check In Time 3:00 pm",
    "Check Out Time 10:00 am",
    "Pets Are Not Allowed",
    "Smoking Not Allowed",
    "Govt. Id(s) Not Mandatory",
    "Local Id(s) Allowed",
    "Visitors Are Not Allowed",
    "Outside Food And Beverage Not Allowed",
    "Children Aged 0 to 4 Years Stay Free Of Charge",
    "Children Aged 5 to 17 Years are Chargeable"
  ];

  const ruleCards = [
    {
      title: "Timings & Access",
      icon: <Clock size={22} color="var(--primary)" />,
      badge: "Strict Schedule",
      items: [
        "Check-in begins at 3:00 PM",
        "Check-out time is sharp 10:00 AM",
        "24-Hour front desk assistance for late check-in",
        "Early check-in subject to room availability"
      ]
    },
    {
      title: "Child & Extra Guests",
      icon: <Users size={22} color="var(--gold-hover, #B45309)" />,
      badge: "Family Friendly",
      items: [
        "Children aged 0 to 4 years stay FREE of charge",
        "Children aged 5 to 17 years are chargeable",
        "Standard tariff covers up to 2 guests per room",
        "Maximum 4 persons allowed in any single room"
      ]
    },
    {
      title: "Guest & ID Policies",
      icon: <ShieldCheck size={22} color="#047857" />,
      badge: "Verified Stay",
      items: [
        "Local IDs are warmly allowed and accepted",
        "Govt. IDs are not mandatory for preliminary inquiries",
        "Visitors are not allowed in guest rooms",
        "100% Non-smoking & pet-free premises"
      ]
    }
  ];

  const faqs = [
    {
      q: "Can local Kolhapur residents book and check in?",
      a: "Yes, local ID(s) are allowed and accepted at HOTEL VIHANN INN. Guests must be of legal age (18+)."
    },
    {
      q: "Are outside guests or visitors allowed into the rooms?",
      a: "No, to ensure privacy, security, and tranquility for all residing guests and families, outside visitors are strictly not allowed into guest accommodation floors or rooms. Visitors may meet in the lobby area."
    },
    {
      q: "What is the policy regarding children?",
      a: "Children aged 0 to 4 years stay completely free of charge. Children aged 5 to 17 years are chargeable as extra guests with applicable nightly tariffs."
    },
    {
      q: "Is smoking or alcohol permitted on property?",
      a: "No, smoking and outside food or alcoholic beverages are strictly not allowed on hotel premises to maintain a pristine, spiritual, and family-friendly atmosphere."
    },
    {
      q: "What happens if we arrive before 3:00 PM?",
      a: "Standard check-in starts at 3:00 PM. If your room is vacant and prepared early, our front desk team will happily accommodate you. You are also welcome to securely store luggage at our front desk."
    }
  ];

  return (
    <div className="syn-main-content">
      {/* Header Banner */}
      <section className="hero-section" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="syn-container text-center">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#D4AF37' }}>
            <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF' }}>Property Rules</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            Property Rules &amp; House Policies
          </h1>
          <p className="hero-lead" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '1rem', color: '#E8DED1' }}>
            Kindly review our stay regulations and property guidelines to ensure a seamless, tranquil, and comfortable experience at {PROPERTY_INFO.name}.
          </p>
        </div>
      </section>

      {/* Main Rules Content */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FDFBF7' }}>
        <div className="syn-container">
          
          {/* Authentic Property Rule Card (Matching image specifications) */}
          <div style={{ maxWidth: '640px', margin: '0 auto 4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem', padding: '0.35rem 1rem', fontSize: '0.85rem' }}>
                House Policies
              </span>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Property Rule
              </h2>
            </div>

            <div style={{
              backgroundColor: '#F7EDC7',
              borderRadius: '18px',
              padding: '2.25rem 2.5rem',
              border: '2.5px solid #C49BDF',
              boxShadow: '0 10px 30px rgba(0,0,0,0.07)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {propertyRules.map((ruleText, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#6E1B00',
                    lineHeight: 1.35
                  }}>
                    <span style={{ fontSize: '1.3rem', color: '#6E1B00', fontWeight: 900, flexShrink: 0 }}>
                      ✔
                    </span>
                    <span>{ruleText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Policy Highlights Breakdown */}
          <div style={{ marginBottom: '4.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Detailed Guidelines</span>
              <h2 style={{ fontSize: '1.9rem', color: 'var(--text-main)' }}>Policy Breakdown</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Everything you need to know about check-in, occupancy, and house terms during your Kolhapur visit.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {ruleCards.map((card, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.icon}
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 700 }}>
                    {card.title}
                  </h3>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {card.items.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Policy FAQs */}
          <div style={{ maxWidth: '800px', margin: '0 auto 4.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Common Queries</span>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Policy Clarifications</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.4rem 1.6rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={18} color="var(--gold)" />
                    {faq.q}
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, paddingLeft: '26px' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #8E3200 0%, #6E2600 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2.5rem',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h2 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              Reserve Your Stay at {PROPERTY_INFO.name}
            </h2>
            <p style={{ fontSize: '1rem', color: '#F8D8A0', maxWidth: '620px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              Enjoy transparent tariffs, easy check-in, and genuine hospitality located right on Kolhapur-Rukadi-Sangli Highway, Tarabai Park.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/booking" className="btn btn-gold btn-lg">
                <CalendarCheck size={18} />
                <span>Book Room Online</span>
              </Link>
              <a href={`tel:${PROPERTY_INFO.phone}`} className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}>
                <PhoneCall size={18} />
                <span>Call {PROPERTY_INFO.phone}</span>
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
