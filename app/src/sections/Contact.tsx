import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ContactInfoProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  subContent?: string;
}

function ContactInfo({ icon, title, content, subContent }: ContactInfoProps) {
  return (
    <div className="flex items-start gap-4 min-h-[80px]">
      <div className="w-12 h-12 rounded-xl bg-engine-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="text-engine-blue">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h4>
        <p className="text-gray-600 text-sm break-words">{content}</p>
        {subContent && <p className="text-gray-500 text-xs mt-0.5">{subContent}</p>}
      </div>
    </div>
  );
}

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Endereço do Escritório',
      content: 'Av. Engenharia, 123, Sala 500',
      subContent: 'São Paulo, SP 01234-567',
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Telefone',
      content: '+55 (11) 1234-5678',
      subContent: 'Seg-Sex 8h-18h',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'E-mail',
      content: 'contato@gklengenharia.com',
      subContent: 'Respondemos em até 24h',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Horário de Funcionamento',
      content: 'Segunda - Sexta: 8h - 18h',
      subContent: 'Sábado: 9h - 14h',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-engine-light to-transparent" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-engine-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-engine-orange/5 rounded-full blur-3xl" />

      <div className="relative z-10 section-padding max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Section Label */}
          <div
            className={`inline-flex items-center gap-2 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-8 h-0.5 bg-engine-blue" />
            <span className="text-engine-blue font-semibold text-sm tracking-wider uppercase">
              Fale Conosco
            </span>
            <div className="w-8 h-0.5 bg-engine-blue" />
          </div>

          {/* Heading */}
          <h2
            className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Vamos Construir Algo
            <span className="text-engine-blue"> Incrível</span> Juntos
          </h2>

          {/* Description */}
          <p
            className={`text-gray-600 text-lg leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Tem um projeto em mente? Adoraríamos ouvir de você. Envie-nos uma mensagem 
            e responderemos o mais breve possível.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="bg-engine-light rounded-2xl p-8 lg:p-10">
              <h3 className="text-2xl font-bold text-gray-900 font-display mb-6">
                Envie uma Mensagem
              </h3>

              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Mensagem Enviada!
                  </h4>
                  <p className="text-gray-600">
                    Obrigado por entrar em contato. Retornaremos em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="João Silva"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        minLength={2}
                        maxLength={100}
                        className="bg-white border-gray-200 focus:border-engine-blue focus:ring-engine-blue/20 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="joao@exemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        maxLength={254}
                        className="bg-white border-gray-200 focus:border-engine-blue focus:ring-engine-blue/20 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+55 (11) 98765-4321"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      className="bg-white border-gray-200 focus:border-engine-blue focus:ring-engine-blue/20 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Sua Mensagem
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Conte-nos sobre seu projeto..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      className="bg-white border-gray-200 focus:border-engine-blue focus:ring-engine-blue/20 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-engine-blue hover:bg-engine-blue-dark text-white py-6 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-glow disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info & Image */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Contact Image */}
            <div className="relative mb-10 rounded-2xl overflow-hidden">
              <img
                src="/images/contact-image.jpg"
                alt="Nossa equipe"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h4 className="text-xl font-bold text-white font-display mb-1">
                  Nossa Equipe está Pronta para Ajudar
                </h4>
                <p className="text-white/80 text-sm">
                  Entre em contato com nossos engenheiros especialistas hoje
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              {contactInfo.map((info, index) => (
                <ContactInfo
                  key={index}
                  icon={info.icon}
                  title={info.title}
                  content={info.content}
                  subContent={info.subContent}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
