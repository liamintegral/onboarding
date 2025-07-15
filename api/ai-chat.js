// AI Chat support for onboarding assistance
export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { message, context, platform } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // For now, we'll use a rule-based AI assistant
    // In production, you'd integrate with OpenAI, Claude, or similar
    const response = await generateAIResponse(message, context, platform)
    
    return res.status(200).json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    })
  }
}

async function generateAIResponse(message, context = {}, platform = null) {
  const userMessage = message.toLowerCase()
  
  // WordPress specific responses
  if (platform === 'WordPress' || userMessage.includes('wordpress')) {
    if (userMessage.includes('admin') || userMessage.includes('user')) {
      return {
        message: `I'll help you create a WordPress admin user! Here's exactly what to do:

1. **Log in to your WordPress dashboard** (usually yoursite.com/wp-admin)
2. **Click "Users"** in the left sidebar
3. **Click "Add New"**
4. Fill in these EXACT details:
   - **Username:** integralmedia
   - **Email:** integralmediaau@gmail.com
   - **Password:** Click "Generate Password" for security
   - **Role:** Administrator (very important!)
5. **Click "Add New User"**
6. **Copy the generated password** and provide it to us securely

⚠️ **Important:** Use exactly "integralmedia" as the username - this helps us identify the correct account quickly.

Would you like me to walk you through any of these steps in more detail?`,
        suggestedActions: [
          'I need help finding the WordPress admin',
          'How do I make them an administrator?',
          'What if I don\'t see the Users menu?',
          'How do I share the password securely?'
        ]
      }
    }
    
    if (userMessage.includes('login') || userMessage.includes('admin')) {
      return {
        message: `To find your WordPress admin login:

1. **Try these common URLs:**
   - yoursite.com/wp-admin
   - yoursite.com/wp-login.php
   - yoursite.com/admin
   - yoursite.com/login

2. **If none work, check with your web developer** - they may have customized the login URL

3. **Password reset:** If you forgot your password, click "Lost your password?" on the login page

4. **Still stuck?** Your hosting provider (like GoDaddy, Bluehost, etc.) can help you reset admin access

Which step are you having trouble with?`,
        suggestedActions: [
          'None of those URLs work',
          'I forgot my password',
          'I need to contact my web developer',
          'How do I contact my hosting provider?'
        ]
      }
    }
  }

  // Shopify specific responses
  if (platform === 'Shopify' || userMessage.includes('shopify')) {
    if (userMessage.includes('access') || userMessage.includes('permission')) {
      return {
        message: `Perfect! Here's how to give us access to your Shopify store:

1. **Go to your Shopify admin panel**
2. **Click "Settings"** (bottom left)
3. **Click "Account and permissions"**
4. **Scroll to "Staff accounts"**
5. **Click "Give access to a user"**
6. Enter our email: **integralmediaau@gmail.com**
7. **Choose permissions** - we recommend "Staff" with access to:
   - Orders, products, customers
   - Online store, analytics
   - Marketing (if needed)
8. **Click "Send invite"**

We'll get an email and can access your store right away! Any questions about the permission levels?`,
        suggestedActions: [
          'What permissions should I give?',
          'I don\'t see "Account and permissions"',
          'What\'s the difference between Staff and Collaborator?',
          'Do you need app installation permissions?'
        ]
      }
    }
  }

  // Wix specific responses
  if (platform === 'Wix' || userMessage.includes('wix')) {
    return {
      message: `I'll guide you through giving us access to your Wix site:

1. **Go to your Wix Dashboard**
2. **Select your site**
3. **Click "Roles & Permissions"** (in site management)
4. **Click "Invite People"**
5. Enter our email: **integralmediaau@gmail.com**
6. **Choose role:**
   - **Admin**: Full access (recommended)
   - **Contributor**: Can edit but not publish
7. **Click "Send Invite"**

📝 **Important:** Some Wix plans limit collaborators. You might need to upgrade your plan if you get an error.

Need help finding any of these options?`,
      suggestedActions: [
        'I can\'t find "Roles & Permissions"',
        'What\'s the difference between Admin and Contributor?',
        'Do I need to upgrade my plan?',
        'The invite isn\'t working'
      ]
    }
  }

  // General hosting/technical responses
  if (userMessage.includes('hosting') || userMessage.includes('cpanel') || userMessage.includes('godaddy')) {
    return {
      message: `I can help with hosting access! Here are the most common scenarios:

**If you have cPanel (most common):**
1. Log in to your hosting provider's control panel
2. Look for "cPanel" or "File Manager"
3. Create a new user account or share existing credentials

**Popular hosting providers:**
- **GoDaddy**: Go to your GoDaddy account → My Products → Web Hosting → Manage
- **Bluehost**: Login → Hosting → cPanel
- **SiteGround**: Go to Site Tools
- **HostGator**: Access cPanel from your hosting dashboard

**What we need:**
- cPanel username/password OR
- FTP credentials OR  
- WordPress admin access (easier option)

Which hosting provider are you using? I can give you specific steps!`,
      suggestedActions: [
        'I use GoDaddy hosting',
        'I use Bluehost',
        'I\'m not sure who my hosting provider is',
        'I prefer to create WordPress admin access instead'
      ]
    }
  }

  // Domain registrar responses
  if (userMessage.includes('domain') || userMessage.includes('registrar') || userMessage.includes('dns')) {
    return {
      message: `For domain and DNS management, here's what we typically need:

**Domain Registrar Access:**
- This is where you bought your domain (GoDaddy, Namecheap, etc.)
- We may need to update DNS settings for proper tracking

**Common registrars and how to share access:**

1. **GoDaddy**: Go to Account Settings → Access Management → Invite someone
2. **Namecheap**: Dashboard → Manage → Sharing & Transfer → Authorization Code
3. **Cloudflare**: Dashboard → Manage Account → Members → Invite Member

**What we might need to change:**
- DNS records for verification codes
- Domain verification for Google Search Console
- Email authentication (SPF, DKIM records)

Do you know who your domain registrar is? Check your email for domain renewal notices - they'll show the company name.`,
      suggestedActions: [
        'How do I find my domain registrar?',
        'I use GoDaddy for domains',
        'What DNS changes will you make?',
        'Is this required or optional?'
      ]
    }
  }

  // General help and fallback responses
  if (userMessage.includes('help') || userMessage.includes('stuck') || userMessage.includes('confused')) {
    return {
      message: `I'm here to help! Let me know what specific step you're having trouble with:

**Most common issues:**
- Can't find login URLs or admin panels
- Forgot passwords or usernames  
- Don't know who hosts your website
- Unsure about permission levels to grant
- Need help with technical terms

**I can provide step-by-step guidance for:**
- WordPress, Shopify, Wix, Squarespace setup
- Hosting provider access (GoDaddy, Bluehost, etc.)
- Domain registrar management
- Google/Facebook account permissions

What specific platform or step do you need help with?`,
      suggestedActions: [
        'I don\'t know how to find my WordPress admin',
        'Help me give Shopify access',
        'I\'m confused about hosting vs domain registrar',
        'What permissions should I grant?'
      ]
    }
  }

  // Default response for unrecognized queries
  return {
    message: `I'd be happy to help you with that! Based on your website analysis, I can provide specific guidance for your ${platform || 'platform'}.

Here are some things I can help with:

🔧 **Technical Access**: WordPress admin, Shopify permissions, hosting access
📧 **Account Setup**: Creating user accounts, managing permissions
🌐 **Platform-Specific**: Step-by-step guides for your CMS
🔒 **Security**: Best practices for sharing access safely

What would you like help with specifically? You can ask me questions like:
- "How do I create a WordPress admin user?"
- "Where do I find my Shopify permissions?"
- "Help me give you hosting access"`,
    suggestedActions: [
      'Help with WordPress access',
      'Shopify store permissions',
      'Hosting/cPanel access',
      'Domain registrar access'
    ]
  }
}