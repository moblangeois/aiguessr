import { jsPDF } from 'jspdf';
import { pedagogicalContent } from '../data/pedagogicalContent';
import { categories } from '../data/questions';

// Couleurs de la palette
const COLORS = {
  earth900: '#0f1f1a',
  earth800: '#1a2f28',
  emerald: '#10b981',
  amber: '#f59e0b',
  white: '#ffffff',
  gray: '#9ca3af',
  link: '#3b82f6'
};

// Helper pour convertir hex en RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Footer sur chaque page
function addFooter(doc, showAuthor = false) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const footerText = showAuthor ? 'Morgan Blangeois, Université Clermont Auvergne' : 'AIGuessr';
  doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
}

// Fond sombre pour une page
function addDarkBackground(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 31, 26); // earth900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
}

// Header colore pour une section
function addSectionHeader(doc, title, color, yPos = 0) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const rgb = hexToRgb(color);

  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, yPos, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPos + 22);

  return yPos + 35;
}

// Genere le PDF complet
export async function generatePDF(gameData) {
  const { groups, scores, questions, answers } = gameData;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let yPos = margin;

  // ==================== PAGE 1 : COUVERTURE ====================
  addDarkBackground(doc);

  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');

  const title = pedagogicalContent.title;
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, pageWidth / 2, pageHeight / 3, { align: 'center' });

  // Sous-titre
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // emerald
  doc.setFont('helvetica', 'normal');
  const subtitle = pedagogicalContent.subtitle;
  doc.text(subtitle, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });

  // Date
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setFontSize(12);
  doc.setTextColor(156, 163, 175); // gray
  doc.text(`Atelier du ${date}`, pageWidth / 2, pageHeight - 50, { align: 'center' });

  // Credit UCA
  doc.setFontSize(10);
  doc.text('AIGuessr - Application éducative', pageWidth / 2, pageHeight - 40, { align: 'center' });

  addFooter(doc);

  // ==================== PAGE 2 : RESULTATS ====================
  doc.addPage();
  addDarkBackground(doc);

  // Header
  doc.setFillColor(26, 47, 40); // earth800
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Résultats de l\'atelier', margin, 28);

  yPos = 55;

  // Classement
  const ranking = Object.entries(scores)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);

  ranking.forEach((team, index) => {
    const isFirst = index === 0;
    const rowHeight = 15;

    if (isFirst) {
      doc.setFillColor(245, 158, 11, 0.3); // amber translucide
      doc.roundedRect(margin, yPos - 5, contentWidth, rowHeight + 5, 3, 3, 'F');
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isFirst ? 245 : 156, isFirst ? 158 : 163, isFirst ? 11 : 175);
    doc.text(`#${index + 1}`, margin + 5, yPos + 6);

    doc.setTextColor(255, 255, 255);
    doc.text(team.name, margin + 25, yPos + 6);

    doc.setTextColor(isFirst ? 245 : 16, isFirst ? 158 : 185, isFirst ? 11 : 129);
    doc.text(`${team.points} pts`, pageWidth - margin - 5, yPos + 6, { align: 'right' });

    yPos += rowHeight + 5;
  });

  // Statistiques
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('Statistiques', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);

  const totalAnswers = Object.values(answers).reduce((acc, q) => acc + Object.keys(q).length, 0);
  const questionsAnswered = Object.keys(answers).length;

  doc.text(`Questions traitées : ${questionsAnswered}/${questions.length}`, margin, yPos);
  yPos += 7;
  doc.text(`Total des réponses : ${totalAnswers}`, margin, yPos);
  yPos += 7;
  doc.text(`Nombre de groupes : ${groups.length}`, margin, yPos);

  addFooter(doc);

  // ==================== PAGE 3 : INTRODUCTION ====================
  doc.addPage();
  addDarkBackground(doc);

  yPos = addSectionHeader(doc, 'Le parcours de l\'IA', COLORS.emerald);
  yPos += 10;

  // Hook
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  const hookLines = doc.splitTextToSize(pedagogicalContent.introduction.hook, contentWidth);
  doc.text(hookLines, margin, yPos);
  yPos += hookLines.length * 5 + 10;

  // Journey description
  doc.setFont('helvetica', 'normal');
  const journeyLines = doc.splitTextToSize(pedagogicalContent.introduction.journey, contentWidth);
  doc.text(journeyLines, margin, yPos);
  yPos += journeyLines.length * 5 + 15;

  // Les 4 etapes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11); // amber
  doc.text('Les 4 étapes du cycle de vie', margin, yPos);
  yPos += 10;

  const stageColors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];
  pedagogicalContent.introduction.stages.forEach((stage, i) => {
    const rgb = hexToRgb(stageColors[i]);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.circle(margin + 5, yPos - 2, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const titleText = `${stage.num}. ${stage.title}`;
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, margin + 12, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text(` - ${stage.desc}`, margin + 12 + titleWidth + 2, yPos);

    yPos += 10;
  });

  addFooter(doc);

  // ==================== PAGES 4+ : SECTIONS THEMATIQUES ====================
  const sectionKeys = ['extraction', 'production', 'datacenter', 'dechets'];

  for (const sectionKey of sectionKeys) {
    const section = pedagogicalContent.sections[sectionKey];

    doc.addPage();
    addDarkBackground(doc);

    yPos = addSectionHeader(doc, section.title, section.color);
    yPos += 5;

    // Narrative
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(16, 185, 129);
    doc.text(`"${section.narrative}"`, margin, yPos);
    yPos += 10;

    // Introduction
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 220, 220);
    const introLines = doc.splitTextToSize(section.intro, contentWidth);
    doc.text(introLines, margin, yPos);
    yPos += introLines.length * 4.5 + 8;

    // Subsections
    for (const sub of section.subsections) {
      // Verification saut de page
      if (yPos > pageHeight - 50) {
        addFooter(doc);
        doc.addPage();
        addDarkBackground(doc);
        yPos = margin;
      }

      // Titre subsection
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11); // amber
      const subTitleWidth = doc.getTextWidth(sub.title);
      doc.text(sub.title, margin, yPos);

      // Location
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text(` - ${sub.location}`, margin + subTitleWidth + 3, yPos);
      yPos += 6;

      // Content
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      const contentLines = doc.splitTextToSize(sub.content, contentWidth - 5);
      doc.text(contentLines, margin + 3, yPos);
      yPos += contentLines.length * 4 + 6;
    }

    // Key Facts box
    if (yPos < pageHeight - 55) {
      yPos += 5;
      doc.setFillColor(26, 47, 40);
      const boxHeight = section.keyFacts.length * 5.5 + 12;
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      doc.text('À retenir', margin + 5, yPos + 7);

      yPos += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);

      section.keyFacts.forEach(fact => {
        doc.text('  ' + fact, margin + 5, yPos);
        yPos += 5;
      });
    }

    addFooter(doc);
  }

  // ==================== PAGE SOURCES ====================
  doc.addPage();
  addDarkBackground(doc);

  yPos = addSectionHeader(doc, 'Sources & Ressources', COLORS.emerald);
  yPos += 10;

  const sourceCategories = [
    { key: 'institutional', title: 'Rapports institutionnels' },
    { key: 'ngo', title: 'ONG & Watchdogs' },
    { key: 'academic', title: 'Études académiques' },
    { key: 'media', title: 'Médias & Think Tanks' },
    { key: 'books', title: 'Livres' }
  ];

  for (const cat of sourceCategories) {
    const sources = pedagogicalContent.sources[cat.key];
    if (!sources || sources.length === 0) continue;

    // Verification saut de page
    if (yPos > pageHeight - 40) {
      addFooter(doc);
      doc.addPage();
      addDarkBackground(doc);
      yPos = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(cat.title, margin, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    for (const source of sources) {
      if (source.url) {
        // Lien cliquable
        doc.setTextColor(59, 130, 246); // bleu lien
        doc.textWithLink('  ' + source.name, margin, yPos, { url: source.url });
      } else {
        // Texte simple
        doc.setTextColor(180, 180, 180);
        doc.text('  ' + source.name, margin, yPos);
      }
      yPos += 5;
    }

    yPos += 5;
  }

  addFooter(doc);

  // ==================== PAGE CONCLUSION ====================
  doc.addPage();
  addDarkBackground(doc);

  yPos = addSectionHeader(doc, 'Conclusion', COLORS.emerald);
  yPos += 15;

  // Message principal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const messageLines = doc.splitTextToSize(pedagogicalContent.conclusion.message, contentWidth);
  doc.text(messageLines, margin, yPos);
  yPos += messageLines.length * 6 + 15;

  // Actions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('Actions possibles :', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);

  pedagogicalContent.conclusion.actions.forEach(action => {
    doc.text('  ' + action, margin, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Reflection finale
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(16, 185, 129);
  const reflectionLines = doc.splitTextToSize(pedagogicalContent.conclusion.reflection, contentWidth);
  doc.text(reflectionLines, margin, yPos);

  // Credits complets
  yPos = pageHeight - 35;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(pedagogicalContent.credits.application, pageWidth / 2, yPos, { align: 'center' });
  doc.text(pedagogicalContent.credits.context, pageWidth / 2, yPos + 5, { align: 'center' });

  addFooter(doc, true);

  return doc;
}

// Telecharge le PDF
export function downloadPDF(doc, filename = 'aiguessr-bilan.pdf') {
  doc.save(filename);
}

// Retourne le PDF en base64 pour l'upload
export function getPDFBase64(doc) {
  return doc.output('datauristring').split(',')[1];
}

// Retourne le PDF en Blob
export function getPDFBlob(doc) {
  return doc.output('blob');
}
