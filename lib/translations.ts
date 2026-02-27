/**
 * Translations
 * 
 * Contains all translated strings for the application in Spanish and English.
 * Organized by section for easy maintenance.
 * 
 * @module lib/translations
 */

export const translations = {
  es: {
    // Meta
    meta: {
      title: "Stephan Barker | Asesor Digital",
      description: "Interfaz de chat para conocer el perfil profesional de Stephan Barker.",
    },
    
    // Navigation & UI
    ui: {
      welcome: "¡Bienvenido!",
      welcomeMessage: "Escribe tu mensaje y presiona Enter. Tu historial de chat es limitado.",
      placeholder: "Escribe tu mensaje...",
      send: "Enviar mensaje",
      close: "Cerrar",
      save: "Guardar",
      download: "Descargar",
      downloadCV: "Descargar CV",
      bookAppointment: "Reservar una cita",
      contact: "Contacto por email",
      info: "Información",
      connected: "Conectado",
      connecting: "Conectando",
      error: "Error",
      idle: "En espera",
      noMessages: "No hay mensajes aún. Escribe algo para comenzar.",
      scrollDown: "Desplazar hacia abajo",
      closeWelcome: "Cerrar mensaje de bienvenida",
      loadingCalendar: "Cargando calendario...",
      bookingTitle: "Reservar una cita",
      projectsTitle: "Proyectos destacados",
      techStackTitle: "Stack tecnológico",
    },
    
    // Settings drawer
    settings: {
      title: "Configuración",
      theme: "Tema",
      themeLight: "Claro",
      themeDark: "Oscuro",
      language: "Idioma",
      languageEs: "Español",
      languageEn: "English",
      autoSave: "Los cambios se guardan automáticamente",
    },
    
    // Quick actions
    quickActions: {
      skills: "Habilidades",
      skillsPrompt: "¿Qué habilidades tienes?",
      technologies: "Tecnologías",
      technologiesPrompt: "¿Qué tecnologías usas?",
      experience: "Experiencia",
      experiencePrompt: "Cuéntame sobre tu experiencia",
      projects: "Proyectos",
      projectsPrompt: "¿Qué proyectos has realizado?",
      contact: "Contacto",
      contactPrompt: "¿Cómo puedo contactarte?",
      downloadCV: "Descargar CV",
      downloadCVPrompt: "¿Puedo descargar tu CV?",
      values: "Valores",
      valuesPrompt: "¿Cuáles son tus valores profesionales?",
      achievements: "Logros",
      achievementsPrompt: "¿Cuáles son tus logros destacados?",
      focus: "Enfoque",
      focusPrompt: "¿Cuál es tu enfoque de trabajo?",
      github: "GitHub",
      githubPrompt: "¿Puedo ver tu código en GitHub?",
      docker: "Docker",
      dockerPrompt: "¿Cómo usas Docker en tus proyectos?",
      nextjs: "Next.js",
      nextjsPrompt: "¿Por qué eliges Next.js?",
      supabase: "Supabase",
      supabasePrompt: "¿Cómo usas Supabase?",
      wordpress: "WordPress",
      wordpressPrompt: "¿Trabajas con WordPress?",
      stripe: "Stripe",
      stripePrompt: "¿Has integrado pagos con Stripe?",
    },
    
    // Errors
    errors: {
      emptyMessage: "Por favor, escribe un mensaje antes de enviar.",
      sendError: "Error al enviar el mensaje. Por favor, intenta de nuevo.",
      downloadError: "Error al descargar el CV. Por favor, intenta de nuevo.",
      quickActionError: "Error al procesar la acción rápida. Por favor, intenta de nuevo.",
      connectionError: "Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.",
      apiKeyError: "Error de configuración: La clave de API no está configurada correctamente.",
      rateLimitError: "Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.",
      timeoutError: "La solicitud tardó demasiado. Por favor, intenta de nuevo.",
      creditsError: "Error: El modelo requiere créditos. Por favor, verifica la configuración de OpenRouter.",
      processingError: "Error al procesar el mensaje. Por favor, intenta de nuevo.",
      genericError: "Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
    },
    
    // Profile - Professional
    profile: {
      name: "Stephan Barker",
      title: "DESARROLLADOR FULL STACK & ASESOR DIGITAL",
      summary: "Desarrollador web versátil con sólida base en gestión de servidores y arquitecturas modernas. Combino la agilidad del desarrollo No-Code/WordPress con la potencia del código a medida (Next.js, TypeScript).",
      heroDescription: "Más de 8 años transformando ideas en productos digitales. Especialista en la transición de sitios web informativos a aplicaciones web escalables utilizando Next.js, Supabase y Docker, sin descuidar el ecosistema WordPress & WooCommerce.",
      philosophy: "Creo en la simplicidad y la eficiencia. Cada proyecto que desarrollo busca resolver problemas reales con soluciones elegantes y escalables. Me apasiona encontrar el equilibrio perfecto entre la velocidad del desarrollo y la calidad del código.",
      focus: "Me especializo en ayudar a empresas a hacer la transición de sitios web estáticos a aplicaciones web modernas y funcionales. Trabajo tanto con startups que necesitan MVP rápidos como con empresas establecidas que buscan modernizar su infraestructura digital.",
      values: [
        "Transparencia en cada etapa del proyecto",
        "Comunicación clara y constante",
        "Código limpio y mantenible",
        "Soluciones escalables desde el día uno",
        "Aprendizaje continuo y adaptación",
      ],
      achievements: [
        "Desarrollé Tu Menú Digital, una plataforma completa que ayuda a restaurantes a digitalizar sus operaciones",
        "Lideré la transformación digital de múltiples empresas, aumentando su eficiencia operativa en más del 40%",
        "Implementé sistemas de pago integrados que procesan transacciones de forma segura y eficiente",
        "Creé arquitecturas escalables que soportan el crecimiento de startups desde MVP hasta productos maduros",
      ],
    },
    
    // Statistics
    stats: {
      yearsExperience: "+8",
      yearsExperienceLabel: "Años de experiencia",
      successfulProjects: "+20",
      successfulProjectsLabel: "Proyectos exitosos",
      satisfiedClients: "+15",
      satisfiedClientsLabel: "Clientes satisfechos",
    },
    
    // Services section
    services: {
      eyebrow: "SERVICIOS",
      title: "¿Qué hago?",
      description: "Combino estrategia, velocidad y habilidad para entregar soluciones digitales excepcionales — siempre.",
      fullStack: {
        title: "Desarrollo Full-Stack",
        description: "Aplicaciones web modernas y escalables con Next.js, TypeScript y Supabase — desde MVP hasta producto maduro.",
      },
      wordpress: {
        title: "WordPress & WooCommerce",
        description: "Sitios rápidos, optimizados para SEO y fáciles de administrar. Tiendas online listas para vender.",
      },
      integrations: {
        title: "Integraciones & Pagos",
        description: "Conecta tu negocio con Stripe, PayPal y APIs externas. Automatizaciones que ahorran tiempo y dinero.",
      },
    },
    
    // About section
    about: {
      eyebrow: "Acerca de",
      experienceTitle: "Experiencia",
      portrait: "Retrato Stephan Barker",
    },
    
    // Experience (using consistent keys for both languages)
    experience: [
      {
        role: "Desarrollador Full Stack & Freelancer",
        period: "Actualidad",
        company: "Independiente",
        description: "Desarrollo de aplicaciones web modernas y APIs. Administración de infraestructura en Linux y despliegue de contenedores con Docker. Integración de pasarelas de pago (Stripe/PayPal) para productos digitales y mantenimiento de repositorios en GitHub.",
      },
      {
        role: "Desarrollador Full Stack",
        period: "2021 - 2023",
        company: "Polygon CRM",
        description: "Trabajo enfocado en el desarrollo y la implementación de estrategias CRM, liderando equipos y optimizando procesos de ventas y marketing.",
      },
      {
        role: "Asesor de Transformación Digital",
        period: "2018 - 2021",
        company: "Consultoría Independiente",
        description: "Asesoramiento en procesos de transformación digital, implementando nuevas tecnologías para optimizar la presencia online.",
      },
    ],
    
    // Projects
    projects: {
      openSource: {
        name: "Proyectos Open Source / GitHub",
        category: "Desarrollo Full Stack",
        description: "Colección de repositorios con implementaciones de autenticación, CRUDs y arquitecturas escalables.",
      },
      tuMenuDigital: {
        name: "Tu Menú Digital",
        category: "Producto Digital",
        description: "Plataforma SaaS completa para restaurantes que permite crear menús digitales interactivos, gestionar pedidos en línea, reservas de mesas, comandas de cocina y sistema de pagos integrado.",
      },
      polygonCRM: {
        name: "Polygon CRM",
        category: "SaaS / CRM",
        description: "Plataforma completa de gestión de relaciones con clientes (CRM) con funcionalidades avanzadas de automatización, análisis de datos y gestión de ventas.",
      },
      doctorWise: {
        name: "Doctor Wise",
        category: "Salud / App",
        description: "Plataforma integral para el sector salud que conecta doctores y pacientes, facilitando la gestión de citas, historiales médicos digitales y comunicación segura.",
      },
    },
    
    // Contact
    contact: {
      callToAction: "POTENCIA TU PROYECTO",
      subtitle: "¿Necesitas una integración compleja o una app moderna? Hablemos de cómo Next.js y una infraestructura sólida pueden escalar tu negocio.",
      buttonText: "HABLEMOS DE CÓDIGO",
    },
    
    // CTA Section
    cta: {
      title: "¿Listo para llevar tu proyecto al siguiente nivel?",
      subtitle: "Transformemos tus ideas en soluciones digitales que impulsen tu negocio.",
      caption: "Agenda una llamada de 15 minutos",
      marqueeText: "Agenda una llamada ✦ Agenda una llamada",
      buttonText: "Agenda una llamada",
      buttonAriaLabel: "Abrir el calendario para agendar una llamada",
    },
    
    // Info modal
    infoModal: {
      projectName: "Portfolio de Stephan Barker",
      summary: "Código abierto, minimalista y listo para reutilizar. Usa Next.js + TypeScript con animaciones suaves, chat embebido y flujos listos para booking y descarga de CV.",
      highlights: [
        "Stack listo para producción: Next.js, TypeScript, diseño responsive.",
        "Componentes listos: chat minimalista, modal de booking y CV generado.",
        "Fácil de adaptar: textos y enlaces configurables desde props.",
      ],
    },
    
    // Initial chat message
    chat: {
      // Mensaje largo original (se mantiene para usos futuros)
      initialMessage: `¡Hola! 👋 Soy Stephan Barker.

Tengo más de 8 años transformando ideas en productos digitales que realmente funcionan. Me apasiona encontrar ese punto perfecto entre la velocidad del desarrollo y la calidad del código.

He trabajado en proyectos como Tu Menú Digital (una plataforma completa para restaurantes), Polygon CRM, y varios sitios corporativos. Mi stack favorito incluye Next.js, TypeScript y Supabase, pero también domino WordPress cuando la situación lo requiere.

Este es mi espacio personal donde puedes conocerme mejor. ¿Qué te gustaría saber? Puedes preguntarme sobre mis proyectos, tecnologías que uso, mi experiencia, o cualquier cosa que te interese. ¡Estoy aquí para conversar! 😊`,
      // Versiones cortas y rotativas del mensaje de bienvenida
      initialMessagesShort: [
        "¡Hola! Soy Stephan. He resumido 8 años de código y estrategia en este chat. Pregúntame lo que quieras sobre mi trayectoria o mis proyectos.",
        "Desde CRMs a medida hasta plataformas como Tu Menú Digital. Soy Stephan, y mi especialidad es el equilibrio entre velocidad y calidad. ¿En qué puedo ayudarte?",
        "¡Hola! Aquí es donde las ideas se convierten en productos reales. Soy Stephan, desarrollador y asesor digital. ¿Tienes un reto técnico o una estrategia que validar?",
        "Desde Tu Menú Digital hasta CRMs y sitios corporativos: aquí está mi trayectoria en formato chat. ¿Por dónde empezamos?",
      ],
    },
    
    // 404 Page
    notFound: {
      title: "404",
      subtitle: "Página no encontrada",
      description: "Lo sentimos, la página que buscas no existe o ha sido movida.",
      backHome: "Volver al inicio",
    },
  },
  
  en: {
    // Meta
    meta: {
      title: "Stephan Barker | Digital Advisor",
      description: "Chat interface to learn about Stephan Barker's professional profile.",
    },
    
    // Navigation & UI
    ui: {
      welcome: "Welcome!",
      welcomeMessage: "Type your message and press Enter. Your chat history is limited.",
      placeholder: "Type your message...",
      send: "Send message",
      close: "Close",
      save: "Save",
      download: "Download",
      downloadCV: "Download CV",
      bookAppointment: "Book an appointment",
      contact: "Email contact",
      info: "Information",
      connected: "Connected",
      connecting: "Connecting",
      error: "Error",
      idle: "Idle",
      noMessages: "No messages yet. Type something to start.",
      scrollDown: "Scroll down",
      closeWelcome: "Close welcome message",
      loadingCalendar: "Loading calendar...",
      bookingTitle: "Book an appointment",
      projectsTitle: "Featured projects",
      techStackTitle: "Tech stack",
    },
    
    // Settings drawer
    settings: {
      title: "Settings",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      language: "Language",
      languageEs: "Español",
      languageEn: "English",
      autoSave: "Changes are saved automatically",
    },
    
    // Quick actions
    quickActions: {
      skills: "Skills",
      skillsPrompt: "What skills do you have?",
      technologies: "Technologies",
      technologiesPrompt: "What technologies do you use?",
      experience: "Experience",
      experiencePrompt: "Tell me about your experience",
      projects: "Projects",
      projectsPrompt: "What projects have you done?",
      contact: "Contact",
      contactPrompt: "How can I contact you?",
      downloadCV: "Download CV",
      downloadCVPrompt: "Can I download your CV?",
      values: "Values",
      valuesPrompt: "What are your professional values?",
      achievements: "Achievements",
      achievementsPrompt: "What are your key achievements?",
      focus: "Focus",
      focusPrompt: "What is your work approach?",
      github: "GitHub",
      githubPrompt: "Can I see your code on GitHub?",
      docker: "Docker",
      dockerPrompt: "How do you use Docker in your projects?",
      nextjs: "Next.js",
      nextjsPrompt: "Why do you choose Next.js?",
      supabase: "Supabase",
      supabasePrompt: "How do you use Supabase?",
      wordpress: "WordPress",
      wordpressPrompt: "Do you work with WordPress?",
      stripe: "Stripe",
      stripePrompt: "Have you integrated payments with Stripe?",
    },
    
    // Errors
    errors: {
      emptyMessage: "Please type a message before sending.",
      sendError: "Error sending message. Please try again.",
      downloadError: "Error downloading CV. Please try again.",
      quickActionError: "Error processing quick action. Please try again.",
      connectionError: "Connection error. Please check your internet connection and try again.",
      apiKeyError: "Configuration error: API key is not configured correctly.",
      rateLimitError: "Too many requests. Please wait a moment and try again.",
      timeoutError: "Request timed out. Please try again.",
      creditsError: "Error: Model requires credits. Please verify OpenRouter configuration.",
      processingError: "Error processing message. Please try again.",
      genericError: "There was an error processing your message. Please try again.",
    },
    
    // Profile - Professional
    profile: {
      name: "Stephan Barker",
      title: "FULL STACK DEVELOPER & DIGITAL ADVISOR",
      summary: "Versatile web developer with a solid foundation in server management and modern architectures. I combine the agility of No-Code/WordPress development with the power of custom code (Next.js, TypeScript).",
      heroDescription: "Over 8 years transforming ideas into digital products. Specialist in transitioning informational websites to scalable web applications using Next.js, Supabase, and Docker, while maintaining expertise in the WordPress & WooCommerce ecosystem.",
      philosophy: "I believe in simplicity and efficiency. Every project I develop aims to solve real problems with elegant and scalable solutions. I'm passionate about finding the perfect balance between development speed and code quality.",
      focus: "I specialize in helping companies transition from static websites to modern, functional web applications. I work with startups needing quick MVPs as well as established companies looking to modernize their digital infrastructure.",
      values: [
        "Transparency at every stage of the project",
        "Clear and constant communication",
        "Clean and maintainable code",
        "Scalable solutions from day one",
        "Continuous learning and adaptation",
      ],
      achievements: [
        "Developed Tu Menú Digital, a complete platform helping restaurants digitize their operations",
        "Led digital transformation for multiple companies, increasing operational efficiency by over 40%",
        "Implemented integrated payment systems that process transactions securely and efficiently",
        "Created scalable architectures supporting startup growth from MVP to mature products",
      ],
    },
    
    // Statistics
    stats: {
      yearsExperience: "+8",
      yearsExperienceLabel: "Years of experience",
      successfulProjects: "+20",
      successfulProjectsLabel: "Successful projects",
      satisfiedClients: "+15",
      satisfiedClientsLabel: "Satisfied clients",
    },
    
    // Services section
    services: {
      eyebrow: "SERVICES",
      title: "What I do",
      description: "I combine strategy, speed, and skill to deliver exceptional digital solutions — always.",
      fullStack: {
        title: "Full-Stack Development",
        description: "Modern and scalable web applications with Next.js, TypeScript, and Supabase — from MVP to mature product.",
      },
      wordpress: {
        title: "WordPress & WooCommerce",
        description: "Fast sites, SEO-optimized and easy to manage. Online stores ready to sell.",
      },
      integrations: {
        title: "Integrations & Payments",
        description: "Connect your business with Stripe, PayPal, and external APIs. Automations that save time and money.",
      },
    },
    
    // About section
    about: {
      eyebrow: "About",
      experienceTitle: "Experience",
      portrait: "Stephan Barker Portrait",
    },
    
    // Experience (using consistent keys for both languages)
    experience: [
      {
        role: "Full Stack Developer & Freelancer",
        period: "Present",
        company: "Independent",
        description: "Development of modern web applications and APIs. Linux infrastructure administration and Docker container deployment. Payment gateway integration (Stripe/PayPal) for digital products and GitHub repository maintenance.",
      },
      {
        role: "Full Stack Developer",
        period: "2021 - 2023",
        company: "Polygon CRM",
        description: "Work focused on CRM strategy development and implementation, leading teams and optimizing sales and marketing processes.",
      },
      {
        role: "Digital Transformation Advisor",
        period: "2018 - 2021",
        company: "Independent Consulting",
        description: "Advisory in digital transformation processes, implementing new technologies to optimize online presence.",
      },
    ],
    
    // Projects
    projects: {
      openSource: {
        name: "Open Source Projects / GitHub",
        category: "Full Stack Development",
        description: "Collection of repositories with authentication implementations, CRUDs, and scalable architectures.",
      },
      tuMenuDigital: {
        name: "Tu Menú Digital",
        category: "Digital Product",
        description: "Complete SaaS platform for restaurants to create interactive digital menus, manage online orders, table reservations, kitchen orders, and integrated payment system.",
      },
      polygonCRM: {
        name: "Polygon CRM",
        category: "SaaS / CRM",
        description: "Complete customer relationship management (CRM) platform with advanced automation, data analysis, and sales management features.",
      },
      doctorWise: {
        name: "Doctor Wise",
        category: "Health / App",
        description: "Comprehensive health sector platform connecting doctors and patients, facilitating appointment management, digital medical records, and secure communication.",
      },
    },
    
    // Contact
    contact: {
      callToAction: "BOOST YOUR PROJECT",
      subtitle: "Need a complex integration or a modern app? Let's talk about how Next.js and solid infrastructure can scale your business.",
      buttonText: "LET'S TALK CODE",
    },
    
    // CTA Section
    cta: {
      title: "Ready to take your project to the next level?",
      subtitle: "Let's transform your ideas into digital solutions that drive your business forward.",
      caption: "Schedule a 15-minute call",
      marqueeText: "Schedule a call ✦ Schedule a call",
      buttonText: "Schedule a call",
      buttonAriaLabel: "Open calendar to schedule a call",
    },
    
    // Info modal
    infoModal: {
      projectName: "Stephan Barker's Portfolio",
      summary: "Open source, minimalist, and ready to reuse. Uses Next.js + TypeScript with smooth animations, embedded chat, and flows ready for booking and CV download.",
      highlights: [
        "Production-ready stack: Next.js, TypeScript, responsive design.",
        "Ready components: minimalist chat, booking modal, and generated CV.",
        "Easy to adapt: texts and links configurable from props.",
      ],
    },
    
    // Initial chat message
    chat: {
      // Original long message (kept for future uses)
      initialMessage: `Hello! 👋 I'm Stephan Barker.

I have over 8 years transforming ideas into digital products that actually work. I'm passionate about finding that perfect balance between development speed and code quality.

I've worked on projects like Tu Menú Digital (a complete platform for restaurants), Polygon CRM, and several corporate sites. My favorite stack includes Next.js, TypeScript, and Supabase, but I also master WordPress when the situation requires it.

This is my personal space where you can get to know me better. What would you like to know? You can ask me about my projects, technologies I use, my experience, or anything that interests you. I'm here to chat! 😊`,
      // Short, rotating welcome messages
      initialMessagesShort: [
        "Hi 👋 I'm Stephan. Over 8 years turning ideas into products that actually work — ask me anything.",
        "Welcome to the corner where code and strategy shake hands. I'm Stephan — what would you like to explore?",
        "Hey — Stephan here. Next.js, Supabase, and a bit of WordPress when it fits. What do you want to talk about?",
        "From Tu Menú Digital to CRMs and corporate sites: my track record in chat form. Where shall we start?",
      ],
    },
    
    // 404 Page
    notFound: {
      title: "404",
      subtitle: "Page not found",
      description: "Sorry, the page you're looking for doesn't exist or has been moved.",
      backHome: "Back to home",
    },
  },
} as const;

// Type for translation keys using dot notation
export type TranslationKey = string;

// Helper type to get nested keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Export typed translations for type safety
export type Translations = typeof translations;
export type TranslationsEs = typeof translations.es;
export type TranslationsEn = typeof translations.en;

