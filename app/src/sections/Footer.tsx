import { HardHat, MapPin, Phone, Mail, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

const footerLinks = {
  services: [
    { label: 'Engenharia Civil', href: '#services' },
    { label: 'Consultoria', href: '#services' },
    { label: 'Gestão de Projetos', href: '#services' },
  ],
  company: [
    { label: 'Sobre Nós', href: '#about' },
    { label: 'Nossos Projetos', href: '#projects' },
    { label: 'Carreiras', href: '#' },
    { label: 'Notícias', href: '#' },
  ],
  support: [
    { label: 'Fale Conosco', href: '#contact' },
    { label: 'FAQ', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Termos de Serviço', href: '#' },
  ],
};

const socialLinks = [
  { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
  { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
  { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
  { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const scrollToSection = (href: string) => {
    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="section-padding py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <a href="#hero" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-engine-blue flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl">
                  GKL <span className="text-engine-blue">Engenharia</span>
                </span>
              </a>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Empresa líder em engenharia especializada em infraestrutura civil.
                Construindo o mundo do amanhã com precisão e inovação.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-engine-blue" />
                  <span className="text-sm">Av. Engenharia, 123, São Paulo</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-engine-blue" />
                  <span className="text-sm">+55 (11) 1234-5678</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-engine-blue" />
                  <span className="text-sm">contato@gklengenharia.com</span>
                </div>
              </div>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-6">Serviços</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-gray-400 hover:text-engine-blue transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-6">Empresa</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-gray-400 hover:text-engine-blue transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-6">Suporte</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-gray-400 hover:text-engine-blue transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="section-padding py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} GKL Engenharia. Todos os direitos reservados.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-engine-blue hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
