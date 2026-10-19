import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, PDFPage, PDFFont, PDFImage, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { db } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

interface TextWrapOptions {
  font: PDFFont;
  size: number;
  maxWidth: number;
}

function wrapText(text: string, { font, size, maxWidth }: TextWrapOptions): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateResumePdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Metadata
  pdfDoc.setTitle('Mohammad Sohail - Curriculum Vitae');
  pdfDoc.setAuthor('Mohammad Sohail');
  pdfDoc.setSubject('Web Developer & Software Engineering Resume');
  pdfDoc.setCreator('Mohammad Sohail Portfolio System');
  pdfDoc.setProducer('pdf-lib');
  pdfDoc.setCreationDate(new Date());

  // Load and embed real TrueType fonts (guarantees universal rendering on all devices)
  const fontPaths = [
    path.resolve(__dirname, 'fonts/LiberationSans-Regular.ttf'),
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  const boldFontPaths = [
    path.resolve(__dirname, 'fonts/LiberationSans-Bold.ttf'),
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  ];
  const italicFontPaths = [
    path.resolve(__dirname, 'fonts/LiberationSans-Italic.ttf'),
    '/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf',
  ];

  let fontRegular: PDFFont;
  let fontBold: PDFFont;
  let fontItalic: PDFFont;

  try {
    const regPath = fontPaths.find((p) => fs.existsSync(p)) || fontPaths[0];
    const bldPath = boldFontPaths.find((p) => fs.existsSync(p)) || boldFontPaths[0];
    const itlPath = italicFontPaths.find((p) => fs.existsSync(p)) || italicFontPaths[0];

    fontRegular = await pdfDoc.embedFont(fs.readFileSync(regPath));
    fontBold = await pdfDoc.embedFont(fs.readFileSync(bldPath));
    fontItalic = await pdfDoc.embedFont(fs.readFileSync(itlPath));
  } catch (err) {
    console.warn('[CV Generator] Could not load embedded TTF fonts, falling back to StandardFonts:', err);
    fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  }

  // Standard A4 Dimensions in points (72 points = 1 inch)
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 42;
  const MARGIN_RIGHT = 42;
  const MARGIN_TOP = 36;
  const MARGIN_BOTTOM = 40;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Harmonized professional executive color palette
  const COLOR_PRIMARY = rgb(0 / 255, 140 / 255, 255 / 255); // #008CFF
  const COLOR_SECONDARY = rgb(0 / 255, 170 / 255, 220 / 255);
  const COLOR_TEXT_DARK = rgb(15 / 255, 23 / 255, 42 / 255); // #0F172A
  const COLOR_TEXT_BODY = rgb(51 / 255, 65 / 255, 85 / 255); // #334155
  const COLOR_TEXT_MUTED = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B
  const COLOR_CARD_BG = rgb(246 / 255, 249 / 255, 255 / 255);
  const COLOR_CARD_BORDER = rgb(220 / 255, 232 / 255, 248 / 255);
  const COLOR_SUCCESS = rgb(16 / 255, 149 / 255, 93 / 255);

  // Load fresh database data
  const profile = db.getProfile();
  const allProjects = db.getProjects(true);

  // Load portrait photo
  let portraitImg: PDFImage | null = null;
  const candidateImagePaths = [
    path.resolve(ROOT_DIR, 'public/images/31.jpg'),
    path.resolve(ROOT_DIR, 'public/images/sohail_portrait.png'),
    path.resolve(ROOT_DIR, 'public/images/sohail.jpg'),
  ];
  for (const imgPath of candidateImagePaths) {
    if (fs.existsSync(imgPath)) {
      try {
        const bytes = fs.readFileSync(imgPath);
        if (imgPath.endsWith('.png')) {
          portraitImg = await pdfDoc.embedPng(bytes);
        } else {
          portraitImg = await pdfDoc.embedJpg(bytes);
        }
        break;
      } catch {
        // continue
      }
    }
  }

  // Page manager with auto-paging
  const pages: PDFPage[] = [];
  let currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(currentPage);
  let cursorY = PAGE_HEIGHT - MARGIN_TOP;

  const ensureSpace = (neededHeight: number): void => {
    if (cursorY - neededHeight < MARGIN_BOTTOM) {
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(currentPage);
      cursorY = PAGE_HEIGHT - MARGIN_TOP;
    }
  };

  const drawSectionHeader = (title: string) => {
    ensureSpace(30);
    // Vertical accent bar
    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - 13,
      width: 3.5,
      height: 13,
      color: COLOR_PRIMARY,
    });
    // Header title
    currentPage.drawText(title.toUpperCase(), {
      x: MARGIN_LEFT + 8,
      y: cursorY - 11,
      size: 10,
      font: fontBold,
      color: COLOR_PRIMARY,
    });
    // Horizontal divider
    const titleWidth = fontBold.widthOfTextAtSize(title.toUpperCase(), 10);
    currentPage.drawLine({
      start: { x: MARGIN_LEFT + 14 + titleWidth, y: cursorY - 6 },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: cursorY - 6 },
      thickness: 0.6,
      color: COLOR_CARD_BORDER,
    });
    cursorY -= 21;
  };

  // ==========================================
  // 1. TOP HEADER (Name, Contact, Photo)
  // ==========================================
  const headerHeight = 84;
  currentPage.drawRectangle({
    x: MARGIN_LEFT - 2,
    y: cursorY - headerHeight,
    width: CONTENT_WIDTH + 4,
    height: headerHeight + 4,
    color: COLOR_CARD_BG,
    borderColor: COLOR_CARD_BORDER,
    borderWidth: 1,
  });

  const photoSize = 68;
  const photoX = PAGE_WIDTH - MARGIN_RIGHT - photoSize - 6;
  const photoY = cursorY - headerHeight + 8;

  if (portraitImg) {
    try {
      currentPage.drawImage(portraitImg, {
        x: photoX,
        y: photoY,
        width: photoSize,
        height: photoSize,
      });
      currentPage.drawRectangle({
        x: photoX,
        y: photoY,
        width: photoSize,
        height: photoSize,
        borderColor: COLOR_PRIMARY,
        borderWidth: 1.5,
      });
    } catch {
      // ignore
    }
  }

  // Name & Subtitle
  currentPage.drawText(profile.name || 'Mohammad Sohail', {
    x: MARGIN_LEFT + 8,
    y: cursorY - 16,
    size: 18,
    font: fontBold,
    color: COLOR_TEXT_DARK,
  });

  currentPage.drawText(
    `${profile.title || 'Web Developer'}  •  ${profile.education || 'BS Software Engineering Student'}`,
    {
      x: MARGIN_LEFT + 8,
      y: cursorY - 30,
      size: 9.5,
      font: fontBold,
      color: COLOR_PRIMARY,
    }
  );

  // Contact line 1
  currentPage.drawText(
    `Email: ${profile.email || 'sohailsk7882261@gmail.com'}   •   Phone: ${profile.phone || '0328 5490043'}   •   Location: ${profile.location || 'Peshawar, Pakistan'}`,
    {
      x: MARGIN_LEFT + 8,
      y: cursorY - 45,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT_MUTED,
    }
  );

  // Contact line 2
  currentPage.drawText(
    `GitHub: github.com/Sohail-star   •   LinkedIn: linkedin.com/in/muhammad-sohail`,
    {
      x: MARGIN_LEFT + 8,
      y: cursorY - 57,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT_MUTED,
    }
  );

  cursorY -= headerHeight + 14;

  // ==========================================
  // 2. PROFESSIONAL SUMMARY
  // ==========================================
  drawSectionHeader('Professional Summary');
  const summaryText =
    profile.bio ||
    'Enthusiastic and motivated Software Engineering student with strong hands-on experience in modern frontend development, backend APIs, and UI/UX design. Proficient in HTML5, CSS3, JavaScript (ES6+), React 19, and Tailwind CSS with full-stack Node.js and PostgreSQL understanding. Passionate about writing clean, maintainable code, building responsive web applications, and leveraging modern AI workflows to solve real-world problems.';

  const summaryLines = wrapText(summaryText, {
    font: fontRegular,
    size: 8.5,
    maxWidth: CONTENT_WIDTH,
  });

  for (const line of summaryLines) {
    ensureSpace(12);
    currentPage.drawText(line, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8.5,
      font: fontRegular,
      color: COLOR_TEXT_BODY,
    });
    cursorY -= 11.5;
  }
  cursorY -= 6;

  // ==========================================
  // 3. EDUCATION
  // ==========================================
  drawSectionHeader('Education');
  ensureSpace(38);
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - 32,
    width: CONTENT_WIDTH,
    height: 34,
    color: COLOR_CARD_BG,
    borderColor: COLOR_CARD_BORDER,
    borderWidth: 0.8,
  });

  currentPage.drawText('Bachelor of Science in Software Engineering (BS SE)', {
    x: MARGIN_LEFT + 8,
    y: cursorY - 11,
    size: 9.5,
    font: fontBold,
    color: COLOR_TEXT_DARK,
  });

  currentPage.drawText('In Progress (Expected 2026)', {
    x: PAGE_WIDTH - MARGIN_RIGHT - 120,
    y: cursorY - 11,
    size: 8.5,
    font: fontBold,
    color: COLOR_PRIMARY,
  });

  currentPage.drawText(
    'Peshawar, Pakistan  •  Key Focus: Software Architecture, Algorithms, Web Technologies, Database Systems',
    {
      x: MARGIN_LEFT + 8,
      y: cursorY - 23,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT_MUTED,
    }
  );

  cursorY -= 40;

  // ==========================================
  // 4. TRAINING & CERTIFICATIONS
  // ==========================================
  drawSectionHeader('Training & Certifications');
  ensureSpace(44);
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: cursorY - 38,
    width: CONTENT_WIDTH,
    height: 40,
    color: COLOR_CARD_BG,
    borderColor: COLOR_CARD_BORDER,
    borderWidth: 0.8,
  });

  currentPage.drawText('Saylani Mass IT Training (SMIT) — Web Development', {
    x: MARGIN_LEFT + 8,
    y: cursorY - 11,
    size: 9.5,
    font: fontBold,
    color: COLOR_TEXT_DARK,
  });

  currentPage.drawText('Certified Graduate', {
    x: PAGE_WIDTH - MARGIN_RIGHT - 90,
    y: cursorY - 11,
    size: 8.5,
    font: fontBold,
    color: COLOR_SUCCESS,
  });

  const certLines = wrapText(
    'Comprehensive training covering frontend architecture, HTML5, CSS3, JavaScript ES6+, React.js components, responsive layout techniques, and modern version control workflows.',
    { font: fontRegular, size: 8, maxWidth: CONTENT_WIDTH - 16 }
  );

  let cYPos = cursorY - 22;
  for (const line of certLines) {
    currentPage.drawText(line, {
      x: MARGIN_LEFT + 8,
      y: cYPos,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT_BODY,
    });
    cYPos -= 10.5;
  }

  cursorY -= 46;

  // ==========================================
  // 5. TECHNICAL SKILLS
  // ==========================================
  drawSectionHeader('Technical Skills & Proficiencies');
  const skillCategories = [
    {
      category: 'Frontend Development',
      skills: 'HTML5 (95%), CSS3 (90%), JavaScript ES6+ (88%), React 19 (85%), Tailwind CSS (92%), Responsive Web Design, Component Architecture',
    },
    {
      category: 'Backend & Databases',
      skills: 'Node.js (80%), Express.js REST APIs, PostgreSQL (75%), JSON Database Persistence, JWT Authentication, API Security',
    },
    {
      category: 'UI/UX & Design',
      skills: 'Figma Prototyping (85%), Brand Identity, Monograms & Logo Design, Social Media Assets, Video Editing',
    },
    {
      category: 'Tools & Automation',
      skills: 'Git & GitHub (82%), Linux Shell, Vite, npm, Modern AI Tools & Prompt Engineering Workflows',
    },
  ];

  for (const item of skillCategories) {
    ensureSpace(20);
    currentPage.drawText(`•  ${item.category}:`, {
      x: MARGIN_LEFT + 4,
      y: cursorY,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT_DARK,
    });
    const catWidth = fontBold.widthOfTextAtSize(`•  ${item.category}:  `, 8.5);
    const skillLines = wrapText(item.skills, {
      font: fontRegular,
      size: 8,
      maxWidth: CONTENT_WIDTH - catWidth - 4,
    });

    if (skillLines.length > 0) {
      currentPage.drawText(skillLines[0], {
        x: MARGIN_LEFT + 4 + catWidth,
        y: cursorY,
        size: 8,
        font: fontRegular,
        color: COLOR_TEXT_BODY,
      });
      cursorY -= 10.5;
      for (let i = 1; i < skillLines.length; i++) {
        ensureSpace(11);
        currentPage.drawText(skillLines[i], {
          x: MARGIN_LEFT + 4 + catWidth,
          y: cursorY,
          size: 8,
          font: fontRegular,
          color: COLOR_TEXT_BODY,
        });
        cursorY -= 10.5;
      }
    } else {
      cursorY -= 10.5;
    }
    cursorY -= 1.5;
  }
  cursorY -= 4;

  // ==========================================
  // 6. FEATURED PROJECTS
  // ==========================================
  drawSectionHeader('Featured Projects');

  const defaultFeaturedProjects = [
    {
      title: 'Portfolio Website & Admin CMS',
      stack: 'React 19 • TypeScript • Tailwind CSS • Express • Node.js',
      description:
        'Full-stack responsive developer portfolio featuring dark neon aesthetic, authenticated admin management console, real-time inquiry processing, and customizable project showcase.',
    },
    {
      title: 'SkyCast Weather Application',
      stack: 'React • OpenWeather API • Tailwind CSS • Responsive UI',
      description:
        'Real-time atmospheric tracking application with live weather forecasts, location search, temperature analytics, and adaptive weather visualization.',
    },
    {
      title: 'TaskFlow Modern Todo App',
      stack: 'HTML5 • JavaScript ES6+ • CSS3 • LocalStorage',
      description:
        'Productivity management tool featuring category filtering, state persistence, clean task completion workflows, and intuitive modern interface.',
    },
  ];

  const projectsToRender = allProjects.length > 0 ? allProjects.slice(0, 3) : defaultFeaturedProjects;

  for (const proj of projectsToRender) {
    const title = proj.title;
    const stack = (proj as any).stack || (proj as any).technologies?.join(' • ') || 'React • Tailwind CSS • TypeScript';
    const desc = proj.description || '';

    const descLines = wrapText(desc, {
      font: fontRegular,
      size: 8,
      maxWidth: CONTENT_WIDTH - 16,
    });

    const boxHeight = 24 + descLines.length * 10.5;
    ensureSpace(boxHeight + 6);

    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - boxHeight + 4,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: COLOR_CARD_BG,
      borderColor: COLOR_CARD_BORDER,
      borderWidth: 0.8,
    });

    // Title
    currentPage.drawText(title, {
      x: MARGIN_LEFT + 8,
      y: cursorY - 7,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT_DARK,
    });

    // Tech Stack
    currentPage.drawText(stack, {
      x: PAGE_WIDTH - MARGIN_RIGHT - fontBold.widthOfTextAtSize(stack, 7.5) - 8,
      y: cursorY - 7,
      size: 7.5,
      font: fontBold,
      color: COLOR_PRIMARY,
    });

    // Description
    let pY = cursorY - 18;
    for (const line of descLines) {
      currentPage.drawText(line, {
        x: MARGIN_LEFT + 8,
        y: pY,
        size: 8,
        font: fontRegular,
        color: COLOR_TEXT_BODY,
      });
      pY -= 10.5;
    }

    cursorY -= boxHeight + 4;
  }

  // ==========================================
  // 7. LANGUAGES
  // ==========================================
  drawSectionHeader('Languages');
  ensureSpace(16);
  const langText = 'English: Professional Working Proficiency   |   Urdu: Native / Bilingual   |   Pashto: Native / Bilingual';
  currentPage.drawText(langText, {
    x: MARGIN_LEFT + 4,
    y: cursorY,
    size: 8.5,
    font: fontRegular,
    color: COLOR_TEXT_DARK,
  });
  cursorY -= 18;

  // ==========================================
  // FOOTER & PAGE NUMBERS (Applied to all pages)
  // ==========================================
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    page.drawLine({
      start: { x: MARGIN_LEFT, y: MARGIN_BOTTOM },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: MARGIN_BOTTOM },
      thickness: 0.6,
      color: COLOR_CARD_BORDER,
    });

    const footerText = `Mohammad Sohail  •  Curriculum Vitae  •  ${profile.email || 'sohailsk7882261@gmail.com'}`;
    page.drawText(footerText, {
      x: MARGIN_LEFT,
      y: MARGIN_BOTTOM - 12,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT_MUTED,
    });

    const pageNumberText = `Page ${i + 1} of ${totalPages}`;
    page.drawText(pageNumberText, {
      x: PAGE_WIDTH - MARGIN_RIGHT - fontRegular.widthOfTextAtSize(pageNumberText, 8),
      y: MARGIN_BOTTOM - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT_MUTED,
    });
  }

  return await pdfDoc.save();
}
