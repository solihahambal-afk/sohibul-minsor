import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { adminAuth } from './src/lib/firebase-admin';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.get("/api/make-super-admin", async (req, res) => {
    try {
      const email = "solihahambal@gmail.com";

      const user = await adminAuth.getUserByEmail(email);

      await adminAuth.setCustomUserClaims(user.uid, {
        role: "super_admin",
      });

      res.json({
        success: true,
        message: `${email} is now Super Admin`,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({
        error: err.message,
      });
    }
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
        <p>123 Business Avenue, Suite 100, City, Country</p>
        <p><a href="https://sohibulminsorclassic.com">www.sohibulminsorclassic.com</a> | <a href="mailto:contact@sohibulminsorclassic.com">contact@sohibulminsorclassic.com</a></p>
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
          to = ['sohibulminsorhelpdesk@gmail.com'];
        } else {
          to = ['sohibulminsorhelpdesk@gmail.com'];
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
            <h1>${bodyPayload.title || bodyPayload.subject || 'New Update'}</h1>
            ${bodyPayload.image ? `<img src="${bodyPayload.image}" class="img-featured" alt="Featured Image" />` : ''}
            <div>${bodyPayload.html || bodyPayload.content || ''}</div>
            <center><a href="https://sohibulminsorclassic.com/news" class="btn">Read News & Updates</a></center>
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

          const gmailUser = process.env.GMAIL_USER || 'sohibulminsorhelpdesk@gmail.com';
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

        // Process sequentially to not overload SMTP
        for (const recipient of to) {
          try {
            // Personalize email if needed, or just send
            await sendIndividualEmail(recipient, finalHtml);
            console.log(`Successfully sent email to ${recipient}`);
            successes++;
          } catch (err) {
            console.error(`Failed to send email to ${recipient}:`, err);
            failures++;
          }
        }

        // Also send admin copy if newsletter
        if (type === 'newsletter' && !to.includes('sohibulminsorhelpdesk@gmail.com')) {
          try {
            await sendIndividualEmail('sohibulminsorhelpdesk@gmail.com', finalHtml);
            console.log('Successfully sent admin copy');
          } catch (err) {
            console.error('Failed to send admin copy:', err);
          }
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
