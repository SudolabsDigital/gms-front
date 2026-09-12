"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  direccionCompleta,
  enlaceDeCorreo,
  enlaceDeLlamada,
  enlaceDeMapa,
  enlaceDeMapaIncrustado,
  enlaceDeWhatsApp,
  horarioVisible,
  siteConfig,
  telefonoVisible,
} from "@/config/site-config";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const schema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  telefono: z.string().min(9, "Ingresa un número de contacto válido"),
  tipo: z.string().min(1, "Selecciona un tipo de producto o sistema"),
  ubicacion: z.string().min(3, "Ingresa tu distrito o ciudad (ej. El Tambo, Huancayo)"),
  mensaje: z.string().min(10, "Describe brevemente las medidas o requerimiento (mín. 10 caracteres)"),
});

type ContactValues = z.infer<typeof schema>;

const contactInfo = [
  {
    icon: MapPin,
    label: "Sede y Taller Principal",
    value: direccionCompleta(),
    href: enlaceDeMapa(),
  },
  {
    icon: Phone,
    label: "Atención Telefónica & Taller",
    value: telefonoVisible(),
    href: enlaceDeLlamada(),
  },
  {
    icon: Mail,
    label: "Correo Electrónico Corporativo",
    value: siteConfig.correo,
    href: enlaceDeCorreo(),
  },
  {
    icon: Clock,
    label: "Horario de Atención en Taller",
    value: horarioVisible(),
  },
];

export function Contact() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      tipo: "",
      ubicacion: "Huancayo",
      mensaje: "",
    },
  });

  function onSubmit(values: ContactValues) {
    const message = `*SOLICITUD DE COTIZACIÓN WEB - GMS INTEGRA*
• *Nombre:* ${values.nombre}
• *Teléfono:* ${values.telefono}
• *Email:* ${values.email}
• *Producto / Serie:* ${values.tipo}
• *Ubicación:* ${values.ubicacion}
• *Detalles:* ${values.mensaje}

Hola GMS Integra, he completado el formulario web y deseo coordinar una cotización formal.`;

    const waUrl = enlaceDeWhatsApp(message);
    window.open(waUrl, "_blank");

    toast.success("¡Solicitud enviada a WhatsApp!", {
      description: "Se ha abierto WhatsApp con tus datos para atención inmediata por nuestro maestro de taller.",
    });
    form.reset();
  }

  return (
    <section id="contacto" className="relative overflow-hidden border-b bg-slate-50/60 py-16 sm:py-24">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Monumental */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-950 font-sans leading-[1.06]">
            Solicita tu Cotización Directa de Taller
          </h2>
          <p className="mt-4 text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl">
            Envíanos tus planos o requerimientos para recibir propuesta técnica formal y coordinar visita de medición sin costo.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Columna Izquierda: Información de Taller y Mapa (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-base font-bold uppercase tracking-wide text-slate-900 mb-5">
                Canales de Atención
              </h3>

              <div className="flex flex-col gap-4">
                {contactInfo.map((c) => {
                  const content = (
                    <div className="flex items-start gap-3.5 group">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                        <c.icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 group-hover:text-primary transition-colors">
                          {c.value}
                        </p>
                      </div>
                    </div>
                  );

                  if (c.href) {
                    return (
                      <a
                        key={c.label}
                        href={c.href}
                        target={c.label.includes("Sede") ? "_blank" : undefined}
                        rel={c.label.includes("Sede") ? "noopener noreferrer" : undefined}
                        className="transition-transform duration-200 hover:translate-x-1"
                      >
                        {content}
                      </a>
                    );
                  }

                  return <div key={c.label}>{content}</div>;
                })}
              </div>
            </div>

            {/* Mapa de Ubicación */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xs bg-white">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  Ubicación Taller GMS Integra
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Huancayo, Junín</span>
              </div>
              <iframe
                src={enlaceDeMapaIncrustado()}
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale contrast-[0.95] hover:grayscale-0 transition-all duration-500"
                title="Mapa de Taller GMS Integra"
              />
            </div>

          </div>

          {/* Columna Derecha: Formulario Estructurado (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                Formulario de Cotización de Obra
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-0.5">
                Recibe atención técnica personalizada directamente por nuestro equipo de taller.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Nombre o Razón Social</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan Pérez / Inmobiliaria XYZ" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Teléfono / WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 9XX XXX XXX" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@correo.com" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Distrito / Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. El Tambo / San Carlos" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Tipo de Producto o Sistema</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl w-full">
                            <SelectValue placeholder="Selecciona el sistema a cotizar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="Mamparas de Baño (Vidrio Templado 8-10mm)">Mamparas de Baño (Vidrio Templado 8-10mm)</SelectItem>
                          <SelectItem value="Ventanas Corredizas (Serie 20 / Serie 25)">Ventanas Corredizas (Serie 20 / Serie 25)</SelectItem>
                          <SelectItem value="Ventanas Batientes Acústicas (Serie 38 / Nova)">Ventanas Batientes Acústicas (Serie 38 / Nova)</SelectItem>
                          <SelectItem value="Mamparas de Gran Formato (Serie 80 DVH)">Mamparas de Gran Formato (Serie 80 DVH)</SelectItem>
                          <SelectItem value="Cerramiento de Terrazas / Balcones">Cerramiento de Terrazas / Balcones</SelectItem>
                          <SelectItem value="Divisiones de Oficina / Muro Cortina">Divisiones de Oficina / Muro Cortina</SelectItem>
                          <SelectItem value="Otro Requerimiento Especial">Otro Requerimiento Especial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mensaje"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Detalles de la Obra o Medidas</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Indica medidas aproximadas, cantidad de vanos, color de perfil preferido o si requieres visita técnica..."
                          className="rounded-xl resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="w-full h-12 text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md gap-2"
                  >
                    <MessageCircle className="size-5" />
                    <span>Enviar Cotización a WhatsApp</span>
                    <ArrowRight className="size-4" />
                  </Button>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Atención inmediata en &lt; 15 min
                    </span>
                    <span>Taller GMS Huancayo</span>
                  </div>
                </div>

              </form>
            </Form>
          </div>

        </div>

      </div>
    </section>
  );
}

