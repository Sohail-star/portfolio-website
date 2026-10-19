import { db } from '../server/db';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../server/auth';

async function runTests() {
  console.log('🧪 Starting Mohammad Sohail Portfolio Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  // 1. Password Hashing & Verification
  console.log('1. Authentication & Cryptography Tests:');
  const password = 'TestSecurePassword123!';
  const hash = hashPassword(password);
  assert(hash.includes(':'), 'Hash format includes salt and derived key');
  assert(verifyPassword(password, hash), 'Password verification succeeds with correct password');
  assert(!verifyPassword('WrongPassword', hash), 'Password verification fails with incorrect password');

  // 2. JWT Generation & Verification
  const token = generateToken({ id: 'admin-1', email: 'sohailsk7882261@gmail.com', role: 'admin' });
  const verified = verifyToken(token);
  assert(verified !== null && verified.role === 'admin', 'JWT token verifies valid admin payload');
  assert(verifyToken('invalid.token.here') === null, 'Invalid token returns null');

  // 3. Database Initial State & Persistence
  console.log('\n2. Database Model & Seeding Tests:');
  db.init();
  const profile = db.getProfile();
  assert(profile.name.includes('Sohail'), 'Initial profile has name with Sohail');
  assert(profile.email.toLowerCase() === 'sohailsk7882261@gmail.com', 'Profile matches configured email');
  assert(profile.education.includes('Software'), 'Profile includes Software Engineering');

  const skills = db.getSkills();
  assert(skills.length >= 8, 'Initial skills list is populated');
  assert(skills.some((s) => s.name === 'React'), 'React skill is present');
  assert(skills.some((s) => s.name === 'Tailwind CSS'), 'Tailwind CSS skill is present');

  // 4. Contact Message Creation & Status Management
  console.log('\n3. Contact Inquiry Flow Tests:');
  const testMsg = db.createMessage({
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+1 555-0199',
    subject: 'Full Stack Project Inquiry',
    message: 'Hello, I would like to inquire about building a modern React application.',
    ipAddress: '127.0.0.1',
    emailSent: true,
  });
  assert(testMsg.id.startsWith('msg-'), 'Message ID created correctly');
  assert(testMsg.status === 'new', 'Initial message status is "new"');

  const updatedMsg = db.updateMessageStatus(testMsg.id, 'read');
  assert(updatedMsg !== null && updatedMsg.status === 'read', 'Message status updated to "read"');

  const repliedMsg = db.updateMessageStatus(testMsg.id, 'replied');
  assert(repliedMsg !== null && repliedMsg.status === 'replied', 'Message status updated to "replied"');

  const deleted = db.deleteMessage(testMsg.id);
  assert(deleted, 'Message deletion succeeded');

  // 5. Admin Project Mutation
  console.log('\n4. Project Management Tests:');
  const newProj = db.createProject({
    title: 'Test AI Assistant',
    slug: 'test-ai-assistant',
    description: 'An AI assistant test project',
    imageUrl: '/images/project_portfolio.svg',
    technologies: ['React', 'TypeScript'],
    category: 'web',
    featured: false,
    published: true,
    sortOrder: 99,
  });
  assert(newProj.id.startsWith('proj-'), 'Project created with ID');
  const fetched = db.getProjectBySlug('test-ai-assistant');
  assert(fetched !== undefined && fetched.title === 'Test AI Assistant', 'Project fetched by slug');

  db.deleteProject(newProj.id);
  assert(db.getProjectBySlug('test-ai-assistant') === undefined, 'Project successfully deleted');

  // 6. CV PDF Generation Tests
  console.log('\n5. CV PDF Generation Tests:');
  const { generateResumePdf } = await import('../server/cv-generator');
  const pdfBytes = await generateResumePdf();
  assert(pdfBytes.length > 50000, 'CV PDF generated with size > 50KB');
  const magic = Buffer.from(pdfBytes.slice(0, 5)).toString('utf8');
  assert(magic === '%PDF-', 'CV PDF contains valid %PDF- magic header');

  // 7. Resend Email Notification Flow Tests
  console.log('\n6. Email Notification & Resend Integration Tests:');
  const { sendContactNotification } = await import('../server/email');

  const emailResult = await sendContactNotification({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 555-0144',
    subject: 'Web Application Development Inquiry',
    message: 'We are looking to hire a frontend engineer to rebuild our corporate dashboard.',
    createdAt: new Date().toISOString(),
    ipAddress: '127.0.0.1',
  });

  assert(typeof emailResult.success === 'boolean', 'Email notification returns boolean success state');
  assert(
    emailResult.provider === 'resend' || emailResult.provider === 'simulated_dev',
    'Email service returns valid provider identifier'
  );

  // 8. Mobile Responsiveness & Overflow Prevention Tests
  console.log('\n7. Mobile Responsiveness & Viewport Tests:');
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
  assert(indexHtml.includes('name="viewport"'), 'index.html has viewport meta tag');
  assert(indexHtml.includes('width=device-width'), 'viewport specifies width=device-width');
  assert(indexHtml.includes('initial-scale=1.0'), 'viewport specifies initial-scale=1.0');

  const indexCss = fs.readFileSync(path.join(process.cwd(), 'src/index.css'), 'utf-8');
  assert(indexCss.includes('box-sizing: border-box'), 'index.css applies global box-sizing: border-box reset');
  assert(indexCss.includes('overflow-x: clip'), 'index.css configures overflow-x clipping to prevent horizontal scrollbars');
  assert(indexCss.includes('max-width: 100%'), 'index.css constrains media elements from overflowing containers');

  const heroTsx = fs.readFileSync(path.join(process.cwd(), 'src/components/HeroSection.tsx'), 'utf-8');
  assert(heroTsx.includes('isolate'), 'HeroSection establishes isolated stacking context to contain blur glows');

  const aboutTsx = fs.readFileSync(path.join(process.cwd(), 'src/components/AboutSection.tsx'), 'utf-8');
  assert(aboutTsx.includes('flex-wrap'), 'AboutSection student badge row wraps on narrow viewports');

  const testmTsx = fs.readFileSync(path.join(process.cwd(), 'src/components/TestimonialsSection.tsx'), 'utf-8');
  assert(testmTsx.includes('min-w-0 flex-1'), 'TestimonialsSection applies min-w-0 flex-1 to prevent role/name overflow');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed}/${total} tests passed!`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
