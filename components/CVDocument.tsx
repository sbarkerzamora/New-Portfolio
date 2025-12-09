import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import type { ProfileData } from "@/lib/profile";

/**
 * CV Document Component
 * 
 * Professional CV layout using @react-pdf/renderer.
 * Generates a clean, modern PDF from profile data.
 * 
 * @module components/CVDocument
 */

interface CVDocumentProps {
  profile: ProfileData;
}

// Define styles for the CV
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #1a1a1a",
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 10,
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
    borderBottom: "1 solid #e0e0e0",
    paddingBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 11,
    color: "#333",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  experienceRole: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  experienceCompany: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  experiencePeriod: {
    fontSize: 10,
    color: "#999",
  },
  experienceDescription: {
    fontSize: 10,
    color: "#444",
    lineHeight: 1.5,
    marginTop: 5,
  },
  list: {
    marginLeft: 15,
    marginTop: 5,
  },
  listItem: {
    fontSize: 10,
    color: "#444",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: "#f0f0f0",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    color: "#333",
  },
  projectItem: {
    marginBottom: 12,
  },
  projectName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 3,
  },
  projectCategory: {
    fontSize: 9,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 3,
  },
  projectDescription: {
    fontSize: 10,
    color: "#444",
    lineHeight: 1.4,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
    marginTop: 3,
  },
});

/**
 * Creates a CV Document from profile data
 * 
 * @param profile - Profile data from profile.json
 * @returns React PDF Document element
 */
export function createCVDocument(profile: ProfileData) {
  const { perfil_profesional, estadisticas, stack_tecnologico, experiencia_laboral, proyectos_destacados } = profile;

  // Flatten all technologies
  const allTechnologies = [
    ...(stack_tecnologico.frontend_moderno || []),
    ...(stack_tecnologico.backend_y_datos || []),
    ...(stack_tecnologico.devops_e_infraestructura || []),
    ...(stack_tecnologico.pagos_y_comercio || []),
    ...(stack_tecnologico.herramientas_y_flujo || []),
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{perfil_profesional.nombre}</Text>
          <Text style={styles.title}>{perfil_profesional.titulo_principal}</Text>
          <View style={styles.contactInfo}>
            <Text>Email: hi@stephanbarker.com</Text>
            <Text>•</Text>
            <Link src={perfil_profesional.enlaces.github} style={{ color: "#333" }}>
              GitHub
            </Link>
            <Text>•</Text>
            <Link src={perfil_profesional.enlaces.portfolio} style={{ color: "#333" }}>
              Portfolio
            </Link>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.anos_experiencia}</Text>
            <Text style={styles.statLabel}>Años de Experiencia</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.proyectos_exitosos}</Text>
            <Text style={styles.statLabel}>Proyectos Exitosos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.clientes_satisfechos}</Text>
            <Text style={styles.statLabel}>Clientes Satisfechos</Text>
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Profesional</Text>
          <Text style={styles.paragraph}>{perfil_profesional.resumen_perfil}</Text>
          <Text style={styles.paragraph}>{perfil_profesional.descripcion_hero}</Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
          {experiencia_laboral.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View>
                  <Text style={styles.experienceRole}>{exp.rol || "Desarrollador"}</Text>
                  <Text style={styles.experienceCompany}>{exp.empresa || "Independiente"}</Text>
                </View>
                {exp.periodo && (
                  <Text style={styles.experiencePeriod}>{exp.periodo}</Text>
                )}
              </View>
              <Text style={styles.experienceDescription}>{exp.descripcion}</Text>
              {exp.logros && exp.logros.length > 0 && (
                <View style={styles.list}>
                  {exp.logros.map((logro, i) => (
                    <Text key={i} style={styles.listItem}>• {logro}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Technologies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stack Tecnológico</Text>
          <View style={styles.skillsGrid}>
            {allTechnologies.map((tech, index) => (
              <View key={index} style={styles.skillTag}>
                <Text>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proyectos Destacados</Text>
          {proyectos_destacados.slice(0, 5).map((project, index) => (
            <View key={index} style={styles.projectItem}>
              <Text style={styles.projectName}>{project.nombre}</Text>
              <Text style={styles.projectCategory}>{project.categoria}</Text>
              <Text style={styles.projectDescription}>{project.descripcion}</Text>
              {project.tecnologias && project.tecnologias.length > 0 && (
                <View style={styles.skillsGrid}>
                  {project.tecnologias.map((tech, i) => (
                    <View key={i} style={styles.skillTag}>
                      <Text>{tech}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

/**
 * CV Document Component (for backward compatibility)
 * 
 * @deprecated Use createCVDocument instead
 */
export default function CVDocument({ profile }: CVDocumentProps) {
  return createCVDocument(profile);
}

