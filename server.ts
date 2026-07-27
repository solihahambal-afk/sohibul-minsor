import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'Firestore configured via Client SDK' });
  });


// Template generator for emails
const generateEmailTemplate = (title, contentHtml) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { background-color: #1a2332; padding: 30px 40px; text-align: center; }
      .header img { height: 60px; max-width: 100%; }
      .content { padding: 40px; color: #3f3f46; line-height: 1.6; font-size: 16px; }
      .content h1 { color: #1a2332; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: 600; }
      .content h2 { color: #cca352; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 500; }
      .footer { background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
      .footer p { color: #64748b; font-size: 14px; margin: 0 0 10px 0; }
      .footer a { color: #cca352; text-decoration: none; font-weight: 500; }
      .btn { display: inline-block; background-color: #cca352; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      table.data-table th, table.data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      table.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; width: 30%; }
      .img-featured { width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="color:#cca352; margin:0; font-size: 28px; letter-spacing: 1px;">Sohibul Minsor Classic</h1>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Sohibul Minsor Classic Ltd. All rights reserved.</p>
        <p>Shop B3, Emirate Plaza, Opposite Abanik Filling Station, Saw Mill Area, Ilorin, Kwara State, Nigeria.</p>
        <p><a href="https://sohibulminsorclassic.com">www.sohibulminsorclassic.com</a> | <a href="mailto:info@sohibulminsorclassic.com">info@sohibulminsorclassic.com</a></p>
        <p style="margin-top: 15px; font-size: 12px;">
          <a href="https://sohibulminsorclassic.com/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from our newsletter</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
};

  // Function Invocation Mock (Email Integration)
  app.post('/api/functions/:functionName', async (req, res) => {
    try {
      const { functionName } = req.params;
      const payload = req.body.body || req.body;
      
      console.log(`Invoked edge function: ${functionName}`);
      
      if (functionName === 'send-mail' || functionName === 'email-handler') {
        const bodyPayload = payload.payload || payload;
        
        const type = bodyPayload.type || payload.type;
        let subject = bodyPayload.subject || 'Notification from Sohibul Minsor Classic';
        
        let to = [];
        if (bodyPayload.subscribers && Array.isArray(bodyPayload.subscribers)) {
          to = bodyPayload.subscribers;
        } else if (bodyPayload.email) {
          to = [bodyPayload.email];
        } else if (type === 'contact') {
          to = ['info@sohibulminsorclassic.com'];
        } else {
           to = ['info@sohibulminsorclassic.com'];
        }
        
        if (to.length === 0) {
          return res.json({ success: false, message: 'No recipients provided' });
        }
        
        // Build responsive HTML based on type
        let finalHtml = '';
        if (type === 'contact') {
          finalHtml = generateEmailTemplate('New Contact Message', `
            <h1>New Contact Message</h1>
            <p>You have received a new message from the website contact form.</p>
            <table class="data-table">
              <tr><th>Name</th><td>${bodyPayload.name || 'N/A'}</td></tr>
              <tr><th>Email</th><td>${bodyPayload.email || 'N/A'}</td></tr>
              <tr><th>Phone</th><td>${bodyPayload.phone || 'N/A'}</td></tr>
              <tr><th>Service</th><td>${bodyPayload.subject || 'N/A'}</td></tr>
            </table>
            <h2>Message Content</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #cca352; margin-top:10px;">
              ${(bodyPayload.message || bodyPayload.html || '').replace(/<[^>]+>/g, '')}
            </div>
          `);
        } else if (type === 'welcome') {
          subject = 'Welcome to Sohibul Minsor Classic!';
          finalHtml = generateEmailTemplate(subject, `
            <h1>Welcome to Our Community!</h1>
            <p>Thank you for subscribing to the Sohibul Minsor Classic newsletter.</p>
            <p>We are thrilled to have you with us. You will now receive exclusive updates on our premium travel packages, Hajj & Umrah services, scholarships, and special offers.</p>
            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
            <center><a href="https://sohibulminsorclassic.com" class="btn">Explore Our Services</a></center>
          `);
        } else if (type === 'newsletter') {
          subject = bodyPayload.subject || 'Latest Updates from Sohibul Minsor Classic';
          finalHtml = generateEmailTemplate(subject, `
            <h1 class="title">${bodyPayload.title || bodyPayload.subject || 'New Update'}</h1>
            ${bodyPayload.image ? `<img src="${bodyPayload.image}" class="img-featured" alt="Featured Image" />` : ''}
            <div class="summary">${bodyPayload.content || ''}</div>
            <div class="btn-container">
              <a href="https://sohibulminsorclassic.com/news" class="btn">Read More</a>
            </div>
          `);
        } else {
           // Fallback to provided HTML but wrapped in template
           finalHtml = generateEmailTemplate(subject, bodyPayload.html || '<p>You have a new notification.</p>');
        }

        
        
        // Helper to send individual email
        const sendIndividualEmail = async (recipient, finalHtml) => {
          if (process.env.RESEND_API_KEY) {
             const { Resend } = await import('resend');
             const resend = new Resend(process.env.RESEND_API_KEY);
             const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
             await resend.emails.send({
               from: `Sohibul Minsor Classic <${fromEmail}>`,
               to: recipient,
               subject: subject,
               html: finalHtml
             });
             return true;
          }
          
          const gmailUser = process.env.GMAIL_USER || 'info@sohibulminsorclassic.com';
          const gmailPass = process.env.GMAIL_APP_PASSWORD;
          if (gmailUser && gmailPass) {
            const nodemailer = (await import('nodemailer')).default;
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user: gmailUser, pass: gmailPass }
            });
            await transporter.sendMail({
              from: `"Sohibul Minsor Classic" <${gmailUser}>`,
              to: recipient,
              subject: subject,
              html: finalHtml
            });
            return true;
          }
          
          console.log(`[MOCK] Email sent to ${recipient}`);
          return true;
        };

        let successes = 0;
        let failures = 0;
        
        try {
          if (process.env.RESEND_API_KEY) {
             const { Resend } = await import('resend');
             const resend = new Resend(process.env.RESEND_API_KEY);
             const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
             
             const chunkSize = 50;
             for (let i = 0; i < to.length; i += chunkSize) {
               const chunk = to.slice(i, i + chunkSize);
               await resend.emails.send({
                 from: `Sohibul Minsor Classic <${fromEmail}>`,
                 to: fromEmail,
                 bcc: chunk,
                 subject: subject,
                 html: finalHtml
               });
               successes += chunk.length;
             }
          } else {
            const gmailUser = process.env.GMAIL_USER || 'info@sohibulminsorclassic.com';
            const gmailPass = process.env.GMAIL_APP_PASSWORD;
            
            if (gmailUser && gmailPass) {
              const nodemailer = (await import('nodemailer')).default;
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
              });
              
              await transporter.sendMail({
                from: `"Sohibul Minsor Classic" <${gmailUser}>`,
                to: gmailUser,
                bcc: to,
                subject: subject,
                html: finalHtml
              });
              successes = to.length;
            } else {
              console.log(`[MOCK] Bulk email sent to ${to.length} recipients via bcc`);
              successes = to.length;
            }
          }
        } catch (err) {
          console.error('Failed bulk email send:', err);
          failures = to.length;
        }

        return res.json({ 
          success: true, 
          message: `Emails processed. Successes: ${successes}, Failures: ${failures}`
        });
      }

      res.json({ success: true, message: `Function ${functionName} executed` });

    } catch (error: any) {
      console.error('Function error:', error);
      res.status(500).json({ error: error.message });
    }
  });


  // Global error handler for API routes
  app.use('/api', (err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v5 syntax:
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
